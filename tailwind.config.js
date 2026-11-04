import tailwindcssAnimate from 'tailwindcss-animate'

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bike: {
          bg: '#F1F5F9',
          surface: '#F8FAFC',
          panel: '#FFFFFF',
          border: '#E2E8F0',
          ink: '#0F172A',
          muted: '#475569',
          orange: '#F97316',
          orangeDark: '#EA580C',
          blue: '#0284C7',
          gold: '#D4AF37',
        },
        status: {
          ok: '#16A34A',
          warning: '#F59E0B',
          danger: '#DC2626',
          offline: '#94A3B8',
        },
        route: {
          cyan: '#00C2E8',
          blue: '#0066FF',
        },
      },
      fontFamily: {
        sans: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Orbitron"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px 0 rgba(15,23,42,0.04), 0 2px 8px 0 rgba(15,23,42,0.06)',
        soft: '0 4px 20px -2px rgba(15,23,42,0.08)',
        'glow-orange': '0 8px 20px -6px rgba(249,115,22,0.55)',
        'glow-blue': '0 8px 20px -6px rgba(2,132,199,0.45)',
        'glow-red': '0 8px 22px -4px rgba(220,38,38,0.55)',
      },
      keyframes: {
        pulseRing: {
          '0%': { boxShadow: '0 0 0 0 rgba(220,38,38,0.55)' },
          '70%': { boxShadow: '0 0 0 14px rgba(220,38,38,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(220,38,38,0)' },
        },
        blink: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.35 },
        },
        // Encendido del faro del Hero (2 s): 0–0.4 s penumbra con DRL tenue, 0.4–0.8 s destello del LED
        // principal, 0.8–2 s el haz se abre sobre el asfalto.
        headlightDrl: {
          '0%': { opacity: '0.15' },
          '20%': { opacity: '0.3' },
          '28%': { opacity: '1' },
          '34%': { opacity: '0.7' },
          '40%, 100%': { opacity: '1' },
        },
        headlightFlash: {
          '0%, 20%': { opacity: '0', transform: 'scale(0.6)' },
          '26%': { opacity: '1', transform: 'scale(1.25)' },
          '32%': { opacity: '0.45', transform: 'scale(1)' },
          '40%, 100%': { opacity: '1', transform: 'scale(1)' },
        },
        headlightBeam: {
          '0%, 40%': { opacity: '0', transform: 'scaleY(0.25)' },
          '100%': { opacity: '1', transform: 'scaleY(1)' },
        },
      },
      animation: {
        pulseRing: 'pulseRing 1.6s cubic-bezier(0.4,0,0.6,1) infinite',
        blink: 'blink 1s ease-in-out infinite',
        headlightDrl: 'headlightDrl 2s ease-out both',
        headlightFlash: 'headlightFlash 2s ease-out both',
        headlightBeam: 'headlightBeam 2s cubic-bezier(0.22,1,0.36,1) both',
      },
    },
  },
  plugins: [tailwindcssAnimate],
}
