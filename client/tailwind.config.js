/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: "#14532D",
        evergreen: "#0E3E23",
        leaf: "#2F8F4E",
        mint: "#E6F4EA",
        mist: "#F3FAF4",
        paper: "#FFFFFF",
        ink: "#132A1D",
        sage: "#5F7568",
        limeChip: "#DFF5D8",
        gold: "#F5A623",
        alert: "#DC2626",
        aiGlow: "#FF6B5B",
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'neumorph': '-8px -8px 24px rgba(255, 255, 255, 0.95), 8px 8px 26px rgba(20, 83, 45, 0.08)',
        'neumorph-sm': '-4px -4px 14px rgba(255, 255, 255, 0.9), 4px 4px 16px rgba(20, 83, 45, 0.07)',
        'neumorph-lg': '-12px -12px 32px rgba(255, 255, 255, 0.95), 12px 12px 36px rgba(20, 83, 45, 0.12)',
        'neumorph-inset': 'inset 2px 2px 5px rgba(20, 83, 45, 0.07), inset -2px -2px 5px rgba(255, 255, 255, 0.95)',
        'glow-ai': '0 0 25px rgba(255, 107, 91, 0.35)',
      },
      borderRadius: {
        'clinic': '22px',
        'clinic-lg': '28px',
      },
      animation: {
        'pulse-subtle': 'pulseSubtle 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float-orb': 'floatOrb 6s ease-in-out infinite',
      },
      keyframes: {
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.75' },
        },
        floatOrb: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
    },
  },
  plugins: [],
}

