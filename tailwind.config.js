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
        // Radar de convoy de la landing: flujo de datos por los vectores de telemetría (hacia afuera)…
        dataFlow: {
          to: { strokeDashoffset: '-16' },
        },
        // …onda única al detectar un piloto y halo continuo de los pilotos enlazados.
        radarPing: {
          '0%': { transform: 'scale(1)', opacity: 0.9 },
          '100%': { transform: 'scale(3.2)', opacity: 0 },
        },
      },
      animation: {
        pulseRing: 'pulseRing 1.6s cubic-bezier(0.4,0,0.6,1) infinite',
        blink: 'blink 1s ease-in-out infinite',
        dataFlow: 'dataFlow 0.8s linear infinite',
        radarPing: 'radarPing 1s ease-out forwards',
        radarHalo: 'radarPing 2.2s ease-out infinite',
      },
    },
  },
  plugins: [tailwindcssAnimate],
}
