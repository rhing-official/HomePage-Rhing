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
                sans: ['var(--font-kiwi-maru)', 'sans-serif'],
                serif: ['var(--font-kiwi-maru)', 'serif'],
            },
            fontWeight: {
                // キウイ丸は300/400/500のみのため、太字系は最大値の500に丸める
                DEFAULT: '300',
                bold: '500',
                extrabold: '500',
                black: '500',
            },
        },
    },
    plugins: [],
};
export default config;