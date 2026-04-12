/** @type {import('tailwindcss').Config} */
module.exports = {
  // 👇 1. Wajib tambahkan ini agar fitur Dark Mode (.dark) aktif!
  darkMode: "class",

  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // 👇 2. Daftarkan variabel CSS Anda di sini
      colors: {
        primary: "var(--bg-primary)",
        hover: "var(--text-hover)",
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  plugins: [],
};
