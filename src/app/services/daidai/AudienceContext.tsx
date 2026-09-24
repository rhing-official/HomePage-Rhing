"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type Audience = "general" | "geek";

const AudienceContext = createContext<{
    audience: Audience;
    setAudience: (a: Audience) => void;
} | null>(null);

export function AudienceProvider({ children }: { children: ReactNode }) {
    const [audience, setAudience] = useState<Audience>("general");

    return (
        <AudienceContext.Provider value={{ audience, setAudience }}>
            {children}
        </AudienceContext.Provider>
    );
}

export function useAudience() {
    const ctx = useContext(AudienceContext);
    if (!ctx) throw new Error("useAudience must be used within AudienceProvider");
    return ctx;
}

export function AudienceToggle() {
    const { audience, setAudience } = useAudience();

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="inline-flex items-center gap-1 p-1 rounded-full border border-gray-200 bg-white/70">
                <button
                    type="button"
                    onClick={() => setAudience("general")}
                    className={`px-5 py-2 rounded-full text-sm font-bold tracking-wide transition-colors ${audience === "general" ? "bg-[#EE7800] text-white" : "text-gray-500 hover:text-gray-800"
                        }`}
                >
                    一般向け
                </button>
                <button
                    type="button"
                    onClick={() => setAudience("geek")}
                    className={`px-5 py-2 rounded-full text-sm font-bold tracking-wide transition-colors ${audience === "geek" ? "bg-[#EE7800] text-white" : "text-gray-500 hover:text-gray-800"
                        }`}
                >
                    ギーク向け
                </button>
            </div>
        </div>
    );
}
