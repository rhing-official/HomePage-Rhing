"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { motion } from "framer-motion";

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
        <div className="relative grid grid-cols-2 w-64 border-b border-outline-variant">
            <motion.div
                className="absolute bottom-0 left-0 h-0.5 w-1/2 bg-tertiary"
                animate={{ x: audience === "general" ? 0 : "100%" }}
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
            />
            <button
                type="button"
                onClick={() => setAudience("general")}
                className={`relative z-10 pb-2 text-sm font-bold tracking-wide text-center transition-colors ${audience === "general" ? "text-on-surface" : "text-outline hover:text-on-surface-variant"
                    }`}
            >
                一般向け
            </button>
            <button
                type="button"
                onClick={() => setAudience("geek")}
                className={`relative z-10 pb-2 text-sm font-bold tracking-wide text-center transition-colors ${audience === "geek" ? "text-on-surface" : "text-outline hover:text-on-surface-variant"
                    }`}
            >
                ギーク向け
            </button>
        </div>
    );
}
