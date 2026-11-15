/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#F6F4EE', // warm ivory
        card: '#FFFFFF',
        forest: {
          DEFAULT: '#244C3C',
          hover: '#1C3B2E',
          dark: '#142920',
          light: '#EDF2E9',
        },
        primary: {
          DEFAULT: '#244C3C',
          hover: '#1C3B2E',
          light: '#EDF2E9',
          dark: '#142920',
        },
        sage: {
          DEFAULT: '#DCE8D8',
          light: '#EDF2E9',
          dark: '#BCCFB7',
        },
        ivory: {
          DEFAULT: '#F6F4EE',
          dark: '#EBE7DC',
          warm: '#FBF9F4',
        },
        main: '#26352D',
        secondary: '#738078',
        border: '#E5E6DD',
        lavender: {
          DEFAULT: '#E8E1F3',
          light: '#F4F0FA',
          text: '#584B73',
        },
        amber: {
          DEFAULT: '#EBCB8B',
          light: '#FAF3E3',
          text: '#7A5B1D',
        },
        softred: {
          DEFAULT: '#F3DAD5',
          light: '#FAF1EF',
          text: '#8C3735',
        },
        success: {
          DEFAULT: '#3F7959',
          light: '#EDF2E9',
        },
        warning: {
          DEFAULT: '#B77B2D',
          light: '#FEF7EC',
        },
        danger: {
          DEFAULT: '#B94A48',
          light: '#FDF2F0',
        },
      },
      fontFamily: {
        serif: ['DM Serif Display', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['DM Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'warm-sm': '0 1px 2px 0 rgba(38, 53, 45, 0.05)',
        'warm': '0 2px 6px 0 rgba(38, 53, 45, 0.06)',
        'warm-md': '0 4px 12px 0 rgba(38, 53, 45, 0.08)',
        'warm-lg': '0 8px 24px -4px rgba(38, 53, 45, 0.1)',
      }
    },
  },
  plugins: [],
}
