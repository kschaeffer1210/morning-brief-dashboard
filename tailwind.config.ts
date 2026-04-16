import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg:       '#1c1a18',
        surface:  '#252320',
        border:   '#2e2b28',
        pink:     '#d4a5a0',
        'pink-dim':  '#a87d79',
        'pink-glow': 'rgba(212,165,160,0.12)',
        muted:    '#6b6560',
        'text-dim': '#9e9890',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
