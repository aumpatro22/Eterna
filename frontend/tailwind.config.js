/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: '#fdfbf7',
        ink: '#2d2d2d',
        erased: '#e5e0d8',
        marker: '#ff4d4d',
        pen: '#2d5da1',
        postit: '#fff9c4'
      },
      fontFamily: {
        kalam: ['Kalam', 'cursive'],
        patrick: ['Patrick Hand', 'cursive'],
      },
      boxShadow: {
        'hard': '4px 4px 0px 0px #2d2d2d',
        'hard-hover': '2px 2px 0px 0px #2d2d2d',
        'hard-lg': '8px 8px 0px 0px #2d2d2d',
      }
    },
  },
  plugins: [],
}
