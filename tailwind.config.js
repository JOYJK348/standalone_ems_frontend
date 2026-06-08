/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: "#0f172a",
                    foreground: "#f8fafc",
                },
                accent: {
                    DEFAULT: "#0ea5e9",
                    foreground: "#ffffff",
                },
                background: "#ffffff",
                foreground: "#0f172a",
                muted: {
                    DEFAULT: "#f1f5f9",
                    foreground: "#64748b",
                },
                border: "#e2e8f0",
            },
            borderRadius: {
                lg: "0.75rem",
            },
        },
    },
    plugins: [],
};
