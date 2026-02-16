/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#1e1b4b', // indigo-950
                    light: '#312e81',   // indigo-900
                    dark: '#0f172a',    // slate-900
                },
                accent: {
                    DEFAULT: '#10b981', // emerald-500
                    light: '#34d399',   // emerald-400
                    dark: '#059669',    // emerald-600
                },
            },
        },
    },
    plugins: [],
}
