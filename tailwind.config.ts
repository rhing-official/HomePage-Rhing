import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                // layout.tsxで設定した変数を利用できるようにします
                sans: ['var(--font-noto-sans)', 'sans-serif'],
                serif: ['var(--font-shippori-mincho)', 'serif'],
            },
            fontWeight: {
                DEFAULT: '300',
                bold: '600',
            },
        },
    },
    plugins: [],
};
export default config;