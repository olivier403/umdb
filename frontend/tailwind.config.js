export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        brand: ['Manrope', 'system-ui', 'sans-serif'],
        display: ['Manrope', 'system-ui', 'sans-serif'],
        body: ['Manrope', 'system-ui', 'sans-serif']
      },
      colors: {
        ink: '#050507',
        surface: 'rgba(16, 18, 24, 0.92)',
        surfaceStrong: 'rgba(18, 21, 28, 0.96)',
        accent: '#1d4ed8',
        accent2: '#60a5fa',
        muted: '#c2c8d2',
        muted2: '#8d96a6'
      },
      backgroundImage: {
        atmosphere: 'linear-gradient(180deg, #0b0d10 0%, #0e1218 100%)'
      }
    }
  },
  plugins: []
}
