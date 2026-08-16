// 「肩から上の人形」のシンプルなアイコン。daidai横丁メニューの開閉ボタンに使う。
export default function PersonIcon({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            aria-hidden="true"
        >
            <circle cx="12" cy="8" r="4.25" fill="currentColor" />
            <path
                d="M4 20.5c0-4.14 3.58-7.5 8-7.5s8 3.36 8 7.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
            />
        </svg>
    );
}
