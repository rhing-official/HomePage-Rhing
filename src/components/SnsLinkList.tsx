"use client";

import { useState } from "react";
import { Link2 } from "lucide-react";

// http(s)以外（javascript:など）は、リンクにしない
function parseHttpUrl(raw: string): URL | null {
    try {
        const url = new URL(raw);
        return url.protocol === "https:" || url.protocol === "http:" ? url : null;
    } catch {
        return null;
    }
}

function ServiceIcon({ origin }: { origin: string }) {
    const [failed, setFailed] = useState(false);
    if (failed) return <Link2 className="w-4 h-4 text-gray-400 shrink-0" aria-hidden />;
    return (
        // リンク先のサービスのfavicon。取得できなければ汎用のリンクアイコンにする
        // eslint-disable-next-line @next/next/no-img-element
        <img
            src={`${origin}/favicon.ico`}
            alt=""
            width={16}
            height={16}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setFailed(true)}
            className="w-4 h-4 shrink-0 rounded-sm object-contain"
        />
    );
}

// SNS等のURLを、1つずつ行を分けて表示する。サービスのアイコンを取得できれば添える
export default function SnsLinkList({ urls }: { urls: string[] }) {
    const items = urls.flatMap((raw) => {
        const url = parseHttpUrl(raw);
        return url ? [{ raw, url }] : [];
    });
    if (items.length === 0) return null;

    return (
        <ul className="flex flex-col items-start gap-2 mt-4 w-fit max-w-full mx-auto sm:mx-0">
            {items.map(({ raw, url }) => (
                <li key={raw} className="min-w-0 max-w-full">
                    <a
                        href={url.href}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="inline-flex items-center gap-2 text-xs text-blue-600 hover:text-blue-700 underline decoration-dotted break-all"
                    >
                        <ServiceIcon origin={url.origin} />
                        <span>{raw}</span>
                    </a>
                </li>
            ))}
        </ul>
    );
}
