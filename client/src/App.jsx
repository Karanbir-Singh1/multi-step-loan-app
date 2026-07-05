import { Navigate, Route, Routes } from 'react-router-dom';
import LoanApplication from './pages/LoanApplication.jsx';

const App = () => (
  <Routes>
    <Route path="/" element={<LoanApplication />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default App;
