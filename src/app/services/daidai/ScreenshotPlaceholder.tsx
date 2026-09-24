type ScreenshotPlaceholderProps = {
    label: string;
    aspect?: "video" | "portrait";
    className?: string;
};

export default function ScreenshotPlaceholder({ label, aspect = "video", className = "" }: ScreenshotPlaceholderProps) {
    const aspectClass = aspect === "portrait" ? "aspect-[9/16]" : "aspect-[16/9]";

    return (
        // ▼ 実機スクリーンショットが用意できたら、この div を <Image /> コンポーネントに差し替える
        <div
            className={`${aspectClass} w-full rounded-2xl border-2 border-dashed border-gray-300 bg-gray-100/60 flex items-center justify-center p-6 ${className}`}
        >
            <span className="text-gray-400 text-sm text-center leading-relaxed tracking-wide">{label}</span>
        </div>
    );
}
