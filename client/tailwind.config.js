export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#f8fafc',
        brand: '#3b82f6',
        'brand-dark': '#2563eb',
        mint: '#14b8a6',
        coral: '#f97316'
      },
      boxShadow: {
        soft: '0 10px 30px rgba(0, 0, 0, 0.3)'
      }
    }
  },
  plugins: []
};
