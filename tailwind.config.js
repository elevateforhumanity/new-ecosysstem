/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html","./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    container: { center: true, padding: "1rem", screens: { lg: "1120px", "2xl": "1280px" } },
    extend: {
      fontFamily: { sans: ["Inter","ui-sans-serif","system-ui","sans-serif"] },
      colors: {
        brand: { 50:"#f4f8ff",100:"#e8f0ff",200:"#cfe0ff",300:"#a9c6ff",400:"#7ea6ff",500:"#4f82ff",600:"#2f64f0",700:"#224dd1",800:"#1d3da6",900:"#1a3588" },
        accent: { 500:"#19c39c" }
      },
      boxShadow: { soft: "0 6px 30px -10px rgba(0,0,0,0.12)" },
      borderRadius: { xl2: "1rem" }
    }
  },
  plugins: [require("@tailwindcss/typography"), require("@tailwindcss/forms")]
}
