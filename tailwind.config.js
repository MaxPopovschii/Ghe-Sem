/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Cyberpunk Milano palette
        'milano-yellow': '#FFD700',
        'milano-red': '#E30613',
        'cyber-dark': '#0a0a0f',
        'cyber-slate': '#1a1a2e',
        'cyber-gray': '#16213e',
        'cyber-accent': '#0f3460',
      },
      backgroundImage: {
        'glass': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
      },
      backdropBlur: {
        'glass': '10px',
      },
      boxShadow: {
        'cyber': '0 0 20px rgba(255, 215, 0, 0.3)',
        'cyber-red': '0 0 20px rgba(227, 6, 19, 0.3)',
      },
    },
  },
  plugins: [],
}
