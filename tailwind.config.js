/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gov: {
          dark: '#0f172a',      // Slate 900 for dark navy trust header
          primary: '#1e3a8a',   // Blue 900 for main brand accent
          secondary: '#3b82f6', // Blue 500 for interactive elements
          light: '#f8fafc',     // Slate 50 for background
          card: '#ffffff',
          accent: '#f59e0b',    // Amber 500 for warnings/pending consents
          success: '#10b981',   // Emerald 500 for successful workflows
          failure: '#ef4444',   // Red 500 for errors/retry queues
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Open Sans', 'Helvetica Neue', 'sans-serif'],
      },
      boxShadow: {
        'gov-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'gov-md': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'gov-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.03)',
      }
    },
  },
  plugins: [],
}
