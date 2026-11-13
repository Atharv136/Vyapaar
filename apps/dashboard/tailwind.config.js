/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#FBFBF8',
        surface: '#FFFFFF',
        tinted: '#F3F6F1',
        mint: {
          light: '#EEF7F2',
          DEFAULT: '#E8F5EE',
          dark: '#D1FAE5',
          border: '#B7E4CC'
        },
        forest: {
          DEFAULT: '#0A3622',
          card: '#11472E',
          deep: '#062818',
          hover: '#124D32'
        },
        emerald: {
          DEFAULT: '#10B981',
          dark: '#059669',
          light: '#A7F3D0'
        },
        amber: {
          DEFAULT: '#F59E0B',
          soft: '#FEF3C7',
          dark: '#78350F'
        },
        coral: {
          DEFAULT: '#E11D48',
          soft: '#FFE4E6',
          dark: '#9F1239'
        },
        ink: {
          primary: '#13221B',
          secondary: '#475950',
          muted: '#6C7D74'
        },
        sketch: '#13221B'
      },
      fontFamily: {
        display: ['"Instrument Serif"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace']
      },
      boxShadow: {
        sketch: '4px 4px 0px #13221B',
        sketchSm: '2px 2px 0px #13221B',
        sketchLg: '6px 6px 0px #13221B',
        sketchMint: '4px 4px 0px #0A3622',
        soft: '0 10px 30px -10px rgba(10, 54, 34, 0.08)'
      },
      borderRadius: {
        card: '14px',
        panel: '20px'
      }
    },
  },
  plugins: [],
}

