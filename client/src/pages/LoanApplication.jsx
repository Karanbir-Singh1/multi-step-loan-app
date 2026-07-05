import { useEffect, useMemo, useRef, useState } from 'react';
import {
  BadgeCheck,
  Banknote,
  BriefcaseBusiness,
  Building2,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  CircleCheck,
  Download,
  FileText,
  Home,
  IdCard,
  Loader2,
  PenLine,
  RefreshCcw,
  ShieldCheck,
  Upload,
  User
} from 'lucide-react';

const STORAGE_KEY = 'loan-application-draft-v1';

const loanTypes = [
  {
    id: 'personal',
    label: 'Personal',
    icon: User,
    range: 'INR 50k - 25L',
    tenure: '12 - 72 months',
    copy: 'Fast eligibility checks for salaried or self-employed applicants.'
  },
  {
    id: 'home',
    label: 'Home',
    icon: Home,
    range: 'INR 10L - 5Cr',
    tenure: '5 - 30 years',
    copy: 'Property-linked checks with co-applicant and valuation details.'
  },
  {
    id: 'business',
    label: 'Business',
    icon: BriefcaseBusiness,
    range: 'INR 2L - 2Cr',
    tenure: '12 - 120 months',
    copy: 'Cash-flow based review for proprietors, partnerships, and companies.'
  }
];

const steps = [
  { id: 'loanType', title: 'Loan Type', icon: Banknote },
  { id: 'identity', title: 'Applicant', icon: User },
  { id: 'kyc', title: 'KYC', icon: IdCard },
  { id: 'address', title: 'Address', icon: Building2 },
  { id: 'income', title: 'Income', icon: Banknote },
  { id: 'loanDetails', title: 'Loan Details', icon: FileText },
  { id: 'documents', title: 'Documents', icon: Upload },
  { id: 'signature', title: 'E-Sign', icon: PenLine },
  { id: 'review', title: 'Summary', icon: ShieldCheck }
];

const emptyForm = {
  loanType: 'personal',
  fullName: '',
  email: '',
  phone: '',
  dob: '',
  employmentType: 'salaried',
  pan: '',
  aadhaar: '',
  panVerified: false,
  aadhaarVerified: false,
  addressLine: '',
  city: '',
  state: '',
  pincode: '',
  residenceType: 'rented',
  monthlyIncome: '',
  monthlyObligations: '',
  creditScore: '',
  requestedAmount: '',
  tenureMonths: '',
  purpose: '',
  employerName: '',
  propertyValue: '',
  downPayment: '',
  propertyCity: '',
  coApplicantIncome: '',
  businessName: '',
  businessVintage: '',
  annualTurnover: '',
  gstin: '',
  documents: [],
  signature: '',
  consent: false
};

const addressBook = [
  { line: '221 Residency Road', city: 'Bengaluru', state: 'Karnataka', pincode: '560025' },
  { line: '14 Marine Drive', city: 'Mumbai', state: 'Maharashtra', pincode: '400020' },
  { line: '7 Park Street', city: 'Kolkata', state: 'West Bengal', pincode: '700016' },
  { line: '88 Anna Salai', city: 'Chennai', state: 'Tamil Nadu', pincode: '600002' },
  { line: '35 Connaught Place', city: 'New Delhi', state: 'Delhi', pincode: '110001' },
  { line: '19 Gachibowli Main Road', city: 'Hyderabad', state: 'Telangana', pincode: '500032' }
];

const requiredDocs = {
  personal: ['PAN card', 'Aadhaar card', 'Income proof'],
  home: ['PAN card', 'Aadhaar card', 'Income proof', 'Property papers', 'Bank statement'],
  business: ['PAN card', 'Aadhaar card', 'GST certificate', 'Bank statement', 'Financial statement']
};

const toNumber = (value) => Number(value || 0);
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const formatInr = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(Number(value || 0));

const getAge = (dob) => {
  if (!dob) return 0;
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDelta = today.getMonth() - birth.getMonth();
  if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < birth.getDate())) age -= 1;
  return age;
};

const simulatePan = (pan) => /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan);
const simulateAadhaar = (aadhaar) => /^\d{12}$/.test(aadhaar) && !/^(\d)\1{11}$/.test(aadhaar);

const getEligibility = (form) => {
  const income = toNumber(form.monthlyIncome) + toNumber(form.coApplicantIncome);
  const obligations = toNumber(form.monthlyObligations);
  const amount = toNumber(form.requestedAmount);
  const tenure = Math.max(toNumber(form.tenureMonths), 1);
  const creditScore = toNumber(form.creditScore);
  const age = getAge(form.dob);
  const emi = amount ? Math.round((amount * 0.0115 * Math.pow(1.0115, tenure)) / (Math.pow(1.0115, tenure) - 1)) : 0;
  const foir = income ? Math.round(((emi + obligations) / income) * 100) : 100;
  const ltv =
    form.loanType === 'home' && toNumber(form.propertyValue)
      ? Math.round((amount / toNumber(form.propertyValue)) * 100)
      : null;
  const vintageScore = form.loanType === 'business' ? clamp(toNumber(form.businessVintage) * 5, 0, 20) : 15;
  const score = clamp(
    (creditScore >= 760 ? 30 : creditScore >= 700 ? 22 : creditScore >= 650 ? 14 : 4) +
      (foir <= 40 ? 25 : foir <= 55 ? 15 : 3) +
      (age >= 23 && age <= 60 ? 15 : 6) +
      (form.panVerified ? 10 : 0) +
      (form.aadhaarVerified ? 10 : 0) +
      vintageScore -
      (ltv && ltv > 85 ? 12 : 0),
    0,
    100
  );
  const approved = score >= 72;
  const maxEligible = Math.max(0, Math.round((income * 0.45 - obligations) * tenure * 0.68));

  return {
    score,
    approved,
    emi,
    foir,
    ltv,
    maxEligible,
    rate: score >= 82 ? 10.9 : score >= 72 ? 12.4 : 14.2,
    status: approved ? 'Pre-approved' : score >= 58 ? 'Manual review' : 'Not eligible yet'
  };
};

const validateStep = (stepId, form) => {
  const errors = {};
  const required = (key, message) => {
    if (!String(form[key] ?? '').trim()) errors[key] = message;
  };

  if (stepId === 'loanType') required('loanType', 'Choose a loan type.');

  if (stepId === 'identity') {
    required('fullName', 'Full name is required.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Enter a valid email.';
    if (!/^[6-9]\d{9}$/.test(form.phone)) errors.phone = 'Enter a valid 10 digit mobile number.';
    if (getAge(form.dob) < 21) errors.dob = 'Applicant must be at least 21.';
  }

  if (stepId === 'kyc') {
    if (!simulatePan(form.pan)) errors.pan = 'PAN must match AAAAA9999A.';
    if (!simulateAadhaar(form.aadhaar)) errors.aadhaar = 'Aadhaar must be a valid 12 digit number.';
    if (!form.panVerified) errors.panVerified = 'Run PAN verification.';
    if (!form.aadhaarVerified) errors.aadhaarVerified = 'Run Aadhaar verification.';
  }

  if (stepId === 'address') {
    ['addressLine', 'city', 'state'].forEach((key) => required(key, 'Required.'));
    if (!/^\d{6}$/.test(form.pincode)) errors.pincode = 'Enter a valid 6 digit PIN.';
  }

  if (stepId === 'income') {
    if (toNumber(form.monthlyIncome) < 15000) errors.monthlyIncome = 'Minimum monthly income is INR 15,000.';
    if (toNumber(form.monthlyObligations) < 0) errors.monthlyObligations = 'Obligations cannot be negative.';
    if (toNumber(form.creditScore) < 300 || toNumber(form.creditScore) > 900) errors.creditScore = 'Score must be 300-900.';
    if (form.loanType === 'personal') required('employerName', 'Employer or business name is required.');
  }

  if (stepId === 'loanDetails') {
    const amount = toNumber(form.requestedAmount);
    const tenure = toNumber(form.tenureMonths);
    const limits = {
      personal: [50000, 2500000, 12, 72],
      home: [1000000, 50000000, 60, 360],
      business: [200000, 20000000, 12, 120]
    }[form.loanType];
    if (amount < limits[0] || amount > limits[1]) errors.requestedAmount = `Amount must be ${formatInr(limits[0])} - ${formatInr(limits[1])}.`;
    if (tenure < limits[2] || tenure > limits[3]) errors.tenureMonths = `Tenure must be ${limits[2]} - ${limits[3]} months.`;
    required('purpose', 'Purpose is required.');
    if (form.loanType === 'home') {
      if (toNumber(form.propertyValue) <= amount) errors.propertyValue = 'Property value must exceed requested amount.';
      if (toNumber(form.downPayment) < toNumber(form.propertyValue) * 0.1) errors.downPayment = 'Down payment must be at least 10%.';
      required('propertyCity', 'Property city is required.');
    }
    if (form.loanType === 'business') {
      required('businessName', 'Business name is required.');
      if (toNumber(form.businessVintage) < 2) errors.businessVintage = 'Business vintage must be at least 2 years.';
      if (toNumber(form.annualTurnover) < amount) errors.annualTurnover = 'Turnover must be at least the requested amount.';
      if (!/^\d{2}[A-Z]{5}\d{4}[A-Z][A-Z\d]Z[A-Z\d]$/.test(form.gstin)) errors.gstin = 'Enter a valid GSTIN.';
    }
  }

  if (stepId === 'documents') {
    const uploaded = new Set(form.documents.map((doc) => doc.kind));
    requiredDocs[form.loanType].forEach((kind) => {
      if (!uploaded.has(kind)) errors.documents = `Upload all required documents: ${requiredDocs[form.loanType].join(', ')}.`;
    });
  }

  if (stepId === 'signature') {
    if (!form.signature) errors.signature = 'Signature is required.';
    if (!form.consent) errors.consent = 'Consent is required.';
  }

  if (stepId === 'review') {
    steps.slice(0, -1).forEach((step) => Object.assign(errors, validateStep(step.id, form)));
  }

  return errors;
};

const fieldId = (label) => `field-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

const Field = ({ label, error, children, inputId }) => (
  <div className="space-y-1.5">
    <label htmlFor={inputId}>{label}</label>
    {children}
    {error ? <p className="text-xs font-medium text-red-600">{error}</p> : null}
  </div>
);

const TextInput = ({ label, error, id, ...props }) => {
  const inputId = id || fieldId(label);
  return (
  <Field label={label} error={error} inputId={inputId}>
    <input id={inputId} {...props} />
  </Field>
  );
};

const SelectInput = ({ label, error, children, id, ...props }) => {
  const inputId = id || fieldId(label);
  return (
  <Field label={label} error={error} inputId={inputId}>
    <select id={inputId} {...props}>{children}</select>
  </Field>
  );
};

const Stat = ({ label, value }) => (
  <div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950">
    <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
    <p className="mt-1 text-lg font-bold text-slate-950 dark:text-white">{value}</p>
  </div>
);

const compressImage = (file) =>
  new Promise((resolve) => {
    if (!file.type.startsWith('image/')) {
      resolve({ dataUrl: '', size: file.size, compressed: false });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const maxWidth = 1200;
        const scale = Math.min(1, maxWidth / image.width);
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(image.width * scale);
        canvas.height = Math.round(image.height * scale);
        const context = canvas.getContext('2d');
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.72);
        resolve({ dataUrl, size: Math.round((dataUrl.length * 3) / 4), compressed: true });
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });

const SignaturePad = ({ value, onChange, error }) => {
  const canvasRef = useRef(null);
  const drawing = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    context.lineWidth = 2.5;
    context.lineCap = 'round';
    context.strokeStyle = '#0f172a';
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    if (value) {
      const image = new Image();
      image.onload = () => context.drawImage(image, 0, 0, canvas.width, canvas.height);
      image.src = value;
    }
  }, [value]);

  const point = (event) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const source = event.touches?.[0] || event;
    return {
      x: ((source.clientX - rect.left) / rect.width) * canvasRef.current.width,
      y: ((source.clientY - rect.top) / rect.height) * canvasRef.current.height
    };
  };

  const start = (event) => {
    event.preventDefault();
    drawing.current = true;
    const context = canvasRef.current.getContext('2d');
    const p = point(event);
    context.beginPath();
    context.moveTo(p.x, p.y);
  };

  const move = (event) => {
    if (!drawing.current) return;
    event.preventDefault();
    const context = canvasRef.current.getContext('2d');
    const p = point(event);
    context.lineTo(p.x, p.y);
    context.stroke();
  };

  const end = () => {
    if (!drawing.current) return;
    drawing.current = false;
    onChange(canvasRef.current.toDataURL('image/png'));
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    onChange('');
  };

  return (
    <Field label="Signature" error={error} inputId="signature-pad">
      <div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800">
        <canvas
          ref={canvasRef}
          id="signature-pad"
          width="760"
          height="220"
          className="h-44 w-full touch-none rounded-md border border-dashed border-slate-300 bg-white"
          onMouseDown={start}
          onMouseMove={move}
          onMouseUp={end}
          onMouseLeave={end}
          onTouchStart={start}
          onTouchMove={move}
          onTouchEnd={end}
          aria-label="Signature pad"
        />
        <button type="button" className="btn-secondary mt-3" onClick={clear}>
          <RefreshCcw size={16} /> Clear
        </button>
      </div>
    </Field>
  );
};

export default function LoanApplication() {
  const [form, setForm] = useState(() => {
    try {
      return { ...emptyForm, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') };
    } catch {
      return emptyForm;
    }
  });
  const [activeStep, setActiveStep] = useState(() => Number(localStorage.getItem(`${STORAGE_KEY}:step`) || 0));
  const [errors, setErrors] = useState({});
  const [verifying, setVerifying] = useState('');
  const [lastSaved, setLastSaved] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const step = steps[activeStep];
  const eligibility = useMemo(() => getEligibility(form), [form]);
  const completion = useMemo(() => {
    const passed = steps.filter((item) => Object.keys(validateStep(item.id, form)).length === 0).length;
    return Math.round((passed / steps.length) * 100);
  }, [form]);

  const suggestions = useMemo(() => {
    if (!form.addressLine || form.addressLine.length < 2) return [];
    const query = form.addressLine.toLowerCase();
    return addressBook.filter((item) => `${item.line} ${item.city} ${item.state}`.toLowerCase().includes(query)).slice(0, 4);
  }, [form.addressLine]);

  useEffect(() => {
    const id = window.setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
      localStorage.setItem(`${STORAGE_KEY}:step`, String(activeStep));
      setLastSaved(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 350);
    return () => window.clearTimeout(id);
  }, [form, activeStep]);

  const update = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const verify = (type) => {
    setVerifying(type);
    window.setTimeout(() => {
      const ok = type === 'pan' ? simulatePan(form.pan) : simulateAadhaar(form.aadhaar);
      update(type === 'pan' ? 'panVerified' : 'aadhaarVerified', ok);
      setErrors((current) => ({ ...current, [type]: ok ? undefined : current[type] || `Invalid ${type.toUpperCase()}.` }));
      setVerifying('');
    }, 700);
  };

  const goNext = () => {
    const nextErrors = validateStep(step.id, form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) setActiveStep((current) => Math.min(current + 1, steps.length - 1));
  };

  const goBack = () => setActiveStep((current) => Math.max(current - 1, 0));

  const resetDraft = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(`${STORAGE_KEY}:step`);
    setForm(emptyForm);
    setActiveStep(0);
    setErrors({});
    setSubmitted(false);
  };

  const handleUpload = async (event, kind) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const processed = await compressImage(file);
    const doc = {
      id: crypto.randomUUID(),
      kind,
      name: file.name,
      type: file.type || 'application/octet-stream',
      originalSize: file.size,
      size: processed.size,
      preview: processed.dataUrl,
      compressed: processed.compressed
    };
    setForm((current) => ({
      ...current,
      documents: [...current.documents.filter((item) => item.kind !== kind), doc]
    }));
    setErrors((current) => ({ ...current, documents: undefined }));
    event.target.value = '';
  };

  const submit = () => {
    const nextErrors = validateStep('review', form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) {
      setSubmitted(true);
      localStorage.setItem(`${STORAGE_KEY}:submitted`, new Date().toISOString());
    }
  };

  const renderStep = () => {
    if (step.id === 'loanType') {
      return (
        <div className="grid gap-4 lg:grid-cols-3">
          {loanTypes.map((type) => {
            const Icon = type.icon;
            const selected = form.loanType === type.id;
            return (
              <button
                key={type.id}
                type="button"
                className={`rounded-lg border p-5 text-left transition ${
                  selected
                    ? 'border-emerald-500 bg-emerald-50 shadow-sm dark:bg-emerald-950/30'
                    : 'border-slate-200 bg-white hover:border-slate-400 dark:border-slate-800 dark:bg-slate-950'
                }`}
                onClick={() => update('loanType', type.id)}
              >
                <span className="flex items-center justify-between">
                  <Icon size={24} className={selected ? 'text-emerald-600' : 'text-slate-500'} />
                  {selected ? <CircleCheck size={20} className="text-emerald-600" /> : null}
                </span>
                <span className="mt-5 block text-xl font-bold text-slate-950 dark:text-white">{type.label}</span>
                <span className="mt-2 block text-sm text-slate-600 dark:text-slate-300">{type.copy}</span>
                <span className="mt-5 grid grid-cols-2 gap-2 text-sm">
                  <span className="rounded-md bg-slate-100 p-2 font-semibold text-slate-700 dark:bg-slate-900 dark:text-slate-200">{type.range}</span>
                  <span className="rounded-md bg-slate-100 p-2 font-semibold text-slate-700 dark:bg-slate-900 dark:text-slate-200">{type.tenure}</span>
                </span>
              </button>
            );
          })}
        </div>
      );
    }

    if (step.id === 'identity') {
      return (
        <div className="grid gap-4 md:grid-cols-2">
          <TextInput label="Full name" value={form.fullName} onChange={(e) => update('fullName', e.target.value)} error={errors.fullName} />
          <TextInput label="Date of birth" type="date" value={form.dob} onChange={(e) => update('dob', e.target.value)} error={errors.dob} />
          <TextInput label="Email" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} error={errors.email} />
          <TextInput label="Mobile number" value={form.phone} maxLength="10" onChange={(e) => update('phone', e.target.value.replace(/\D/g, ''))} error={errors.phone} />
          <SelectInput label="Employment type" value={form.employmentType} onChange={(e) => update('employmentType', e.target.value)}>
            <option value="salaried">Salaried</option>
            <option value="self-employed">Self-employed</option>
            <option value="professional">Professional</option>
          </SelectInput>
        </div>
      );
    }

    if (step.id === 'kyc') {
      return (
        <div className="grid gap-4 lg:grid-cols-2">
          <Field label="PAN" error={errors.pan || errors.panVerified} inputId="pan">
            <div className="flex gap-2">
              <input id="pan" value={form.pan} maxLength="10" onChange={(e) => update('pan', e.target.value.toUpperCase())} />
              <button type="button" className="btn-secondary whitespace-nowrap" onClick={() => verify('pan')} disabled={verifying === 'pan'}>
                {verifying === 'pan' ? <Loader2 className="animate-spin" size={16} /> : <BadgeCheck size={16} />} Verify
              </button>
            </div>
            {form.panVerified ? <p className="text-xs font-semibold text-emerald-600">PAN verified</p> : null}
          </Field>
          <Field label="Aadhaar" error={errors.aadhaar || errors.aadhaarVerified} inputId="aadhaar">
            <div className="flex gap-2">
              <input id="aadhaar" value={form.aadhaar} maxLength="12" onChange={(e) => update('aadhaar', e.target.value.replace(/\D/g, ''))} />
              <button type="button" className="btn-secondary whitespace-nowrap" onClick={() => verify('aadhaar')} disabled={verifying === 'aadhaar'}>
                {verifying === 'aadhaar' ? <Loader2 className="animate-spin" size={16} /> : <BadgeCheck size={16} />} Verify
              </button>
            </div>
            {form.aadhaarVerified ? <p className="text-xs font-semibold text-emerald-600">Aadhaar verified</p> : null}
          </Field>
        </div>
      );
    }

    if (step.id === 'address') {
      return (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="relative md:col-span-2">
            <TextInput label="Address line" value={form.addressLine} onChange={(e) => update('addressLine', e.target.value)} error={errors.addressLine} />
            {suggestions.length ? (
              <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-950">
                {suggestions.map((item) => (
                  <button
                    type="button"
                    key={item.line}
                    className="block w-full px-3 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-900"
                    onClick={() => setForm((current) => ({ ...current, addressLine: item.line, city: item.city, state: item.state, pincode: item.pincode }))}
                  >
                    {item.line}, {item.city}, {item.state} {item.pincode}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          <TextInput label="City" value={form.city} onChange={(e) => update('city', e.target.value)} error={errors.city} />
          <TextInput label="State" value={form.state} onChange={(e) => update('state', e.target.value)} error={errors.state} />
          <TextInput label="PIN code" value={form.pincode} maxLength="6" onChange={(e) => update('pincode', e.target.value.replace(/\D/g, ''))} error={errors.pincode} />
          <SelectInput label="Residence type" value={form.residenceType} onChange={(e) => update('residenceType', e.target.value)}>
            <option value="rented">Rented</option>
            <option value="owned">Owned</option>
            <option value="family-owned">Family owned</option>
          </SelectInput>
        </div>
      );
    }

    if (step.id === 'income') {
      return (
        <div className="grid gap-4 md:grid-cols-2">
          <TextInput label="Monthly income" type="number" value={form.monthlyIncome} onChange={(e) => update('monthlyIncome', e.target.value)} error={errors.monthlyIncome} />
          <TextInput label="Monthly obligations" type="number" value={form.monthlyObligations} onChange={(e) => update('monthlyObligations', e.target.value)} error={errors.monthlyObligations} />
          <TextInput label="Credit score" type="number" value={form.creditScore} onChange={(e) => update('creditScore', e.target.value)} error={errors.creditScore} />
          {form.loanType === 'personal' ? (
            <TextInput label="Employer or business" value={form.employerName} onChange={(e) => update('employerName', e.target.value)} error={errors.employerName} />
          ) : null}
          {form.loanType === 'home' ? (
            <TextInput label="Co-applicant income" type="number" value={form.coApplicantIncome} onChange={(e) => update('coApplicantIncome', e.target.value)} />
          ) : null}
        </div>
      );
    }

    if (step.id === 'loanDetails') {
      return (
        <div className="grid gap-4 md:grid-cols-2">
          <TextInput label="Requested amount" type="number" value={form.requestedAmount} onChange={(e) => update('requestedAmount', e.target.value)} error={errors.requestedAmount} />
          <TextInput label="Tenure in months" type="number" value={form.tenureMonths} onChange={(e) => update('tenureMonths', e.target.value)} error={errors.tenureMonths} />
          <TextInput label="Loan purpose" value={form.purpose} onChange={(e) => update('purpose', e.target.value)} error={errors.purpose} />
          {form.loanType === 'home' ? (
            <>
              <TextInput label="Property value" type="number" value={form.propertyValue} onChange={(e) => update('propertyValue', e.target.value)} error={errors.propertyValue} />
              <TextInput label="Down payment" type="number" value={form.downPayment} onChange={(e) => update('downPayment', e.target.value)} error={errors.downPayment} />
              <TextInput label="Property city" value={form.propertyCity} onChange={(e) => update('propertyCity', e.target.value)} error={errors.propertyCity} />
            </>
          ) : null}
          {form.loanType === 'business' ? (
            <>
              <TextInput label="Business name" value={form.businessName} onChange={(e) => update('businessName', e.target.value)} error={errors.businessName} />
              <TextInput label="Business vintage years" type="number" value={form.businessVintage} onChange={(e) => update('businessVintage', e.target.value)} error={errors.businessVintage} />
              <TextInput label="Annual turnover" type="number" value={form.annualTurnover} onChange={(e) => update('annualTurnover', e.target.value)} error={errors.annualTurnover} />
              <TextInput label="GSTIN" value={form.gstin} maxLength="15" onChange={(e) => update('gstin', e.target.value.toUpperCase())} error={errors.gstin} />
            </>
          ) : null}
        </div>
      );
    }

    if (step.id === 'documents') {
      return (
        <div className="space-y-4">
          {errors.documents ? <p className="rounded-md bg-red-50 p-3 text-sm font-semibold text-red-700">{errors.documents}</p> : null}
          <div className="grid gap-4 lg:grid-cols-2">
            {requiredDocs[form.loanType].map((kind) => {
              const doc = form.documents.find((item) => item.kind === kind);
              return (
                <div key={kind} className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-950 dark:text-white">{kind}</p>
                      {doc ? <p className="text-xs text-slate-500">{doc.name} - {Math.round(doc.size / 1024)} KB</p> : null}
                    </div>
                    {doc ? <CircleCheck className="text-emerald-600" size={20} /> : <CircleAlert className="text-amber-500" size={20} />}
                  </div>
                  {doc?.preview ? <img src={doc.preview} alt={`${kind} preview`} className="mt-3 h-28 w-full rounded-md object-cover" /> : null}
                  <label className="btn-secondary mt-3 cursor-pointer normal-case tracking-normal" data-testid={`upload-${kind}`}>
                    <Upload size={16} /> Upload
                    <input className="hidden" type="file" accept="image/*,.pdf" onChange={(event) => handleUpload(event, kind)} />
                  </label>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    if (step.id === 'signature') {
      return (
        <div className="space-y-4">
          <SignaturePad value={form.signature} onChange={(value) => update('signature', value)} error={errors.signature} />
          <label className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-4 text-sm normal-case tracking-normal dark:border-slate-800 dark:bg-slate-950">
            <input type="checkbox" className="mt-1 h-4 w-4" checked={form.consent} onChange={(e) => update('consent', e.target.checked)} />
            <span>I consent to KYC verification, credit bureau checks, document processing, and electronic submission of this application.</span>
          </label>
          {errors.consent ? <p className="text-xs font-medium text-red-600">{errors.consent}</p> : null}
        </div>
      );
    }

    return (
      <div className="space-y-5">
        {submitted ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
            <p className="flex items-center gap-2 font-bold"><Check size={18} /> Application submitted</p>
          </div>
        ) : null}
        <div className="grid gap-4 md:grid-cols-4">
          <Stat label="Decision" value={eligibility.status} />
          <Stat label="Eligibility score" value={`${eligibility.score}/100`} />
          <Stat label="Estimated EMI" value={formatInr(eligibility.emi)} />
          <Stat label="Max eligible" value={formatInr(eligibility.maxEligible)} />
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
            <h3 className="font-bold text-slate-950 dark:text-white">Applicant summary</h3>
            <dl className="mt-4 grid gap-3 text-sm">
              {[
                ['Name', form.fullName || '-'],
                ['Loan type', loanTypes.find((item) => item.id === form.loanType)?.label],
                ['Amount', formatInr(form.requestedAmount)],
                ['Tenure', `${form.tenureMonths || 0} months`],
                ['FOIR', `${eligibility.foir}%`],
                ['Interest rate', `${eligibility.rate}% p.a.`],
                ['Documents', `${form.documents.length}/${requiredDocs[form.loanType].length}`]
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4 border-b border-slate-100 pb-2 dark:border-slate-800">
                  <dt className="text-slate-500">{label}</dt>
                  <dd className="font-semibold text-slate-900 dark:text-slate-100">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
            <h3 className="font-bold text-slate-950 dark:text-white">Pre-approval conditions</h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex gap-2"><CircleCheck size={18} className="text-emerald-600" /> KYC simulation must remain verified at final underwriting.</li>
              <li className="flex gap-2"><CircleCheck size={18} className="text-emerald-600" /> Bank statement and income documents are subject to manual review.</li>
              <li className="flex gap-2"><CircleCheck size={18} className="text-emerald-600" /> Final offer may change after bureau pull and document audit.</li>
              {eligibility.ltv ? <li className="flex gap-2"><CircleCheck size={18} className="text-emerald-600" /> Current LTV is {eligibility.ltv}%.</li> : null}
            </ul>
          </div>
        </div>
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-white">
      <section className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-emerald-600">CreditBridge</p>
              <h1 className="mt-1 text-3xl font-bold tracking-normal text-slate-950 dark:text-white">Multi-step loan application</h1>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <span className="rounded-md border border-slate-200 px-3 py-2 dark:border-slate-800">Auto-saved {lastSaved || 'pending'}</span>
              <button type="button" className="btn-secondary" onClick={resetDraft}><RefreshCcw size={16} /> Reset</button>
            </div>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
            <div className="h-full bg-emerald-500 transition-all" style={{ width: `${completion}%` }} />
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[280px_1fr] lg:px-8">
        <aside className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
          <nav className="grid gap-1">
            {steps.map((item, index) => {
              const Icon = item.icon;
              const done = Object.keys(validateStep(item.id, form)).length === 0;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`flex items-center gap-3 rounded-md px-3 py-3 text-left text-sm font-semibold transition ${
                    index === activeStep ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                  onClick={() => setActiveStep(index)}
                >
                  <Icon size={18} />
                  <span className="min-w-0 flex-1">{index + 1}. {item.title}</span>
                  {done ? <Check size={16} className={index === activeStep ? '' : 'text-emerald-600'} /> : null}
                </button>
              );
            })}
          </nav>
        </aside>

        <div className="space-y-5">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-5 flex flex-col gap-3 border-b border-slate-200 pb-4 dark:border-slate-800 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500">Step {activeStep + 1} of {steps.length}</p>
                <h2 className="text-2xl font-bold text-slate-950 dark:text-white">{step.title}</h2>
              </div>
              <div className="rounded-md bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                {eligibility.status}
              </div>
            </div>
            {renderStep()}
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button type="button" className="btn-secondary" onClick={goBack} disabled={activeStep === 0}>
              <ChevronLeft size={16} /> Back
            </button>
            <div className="flex gap-3">
              {activeStep === steps.length - 1 ? (
                <>
                  <button type="button" className="btn-secondary" onClick={() => window.print()}>
                    <Download size={16} /> Export
                  </button>
                  <button type="button" className="btn-primary" onClick={submit}>
                    <ShieldCheck size={16} /> Submit application
                  </button>
                </>
              ) : (
                <button type="button" className="btn-primary" onClick={goNext}>
                  Continue <ChevronRight size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
