// tailwind.config.cjs
// Note the .cjs extension and module.exports syntax
/** @type {import('tailwindcss').Config} */ // This JSDoc is fine for type hints
module.exports = {
  content: [
    "./index.html",
    // This path is correct for scanning your source files
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}