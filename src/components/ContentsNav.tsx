import { ArrowRight } from "lucide-react";

export type ContentsItem = { href: string; label: string };

// サービスページ共通の目次（CONTENTS）
export default function ContentsNav({ items }: { items: ContentsItem[] }) {
    return (
        <div className="w-full max-w-md text-left">
            <p className="text-xs tracking-[0.3em] text-outline mb-3">CONTENTS</p>
            <div className="flex flex-col divide-y divide-outline-variant border-t border-b border-outline-variant">
                {items.map((c, i) => (
                    <a
                        key={c.href}
                        href={c.href}
                        className="group flex items-center justify-between py-4 text-on-surface-variant hover:text-on-surface transition-colors"
                    >
                        <span className="flex items-center gap-4">
                            <span className="text-xs text-outline tracking-widest">
                                {String(i + 1).padStart(2, "0")}
                            </span>
                            {c.label}
                        </span>
                        <ArrowRight className="w-4 h-4 text-outline group-hover:translate-x-1 group-hover:text-on-surface-variant transition-transform" strokeWidth={1.5} />
                    </a>
                ))}
            </div>
        </div>
    );
}
