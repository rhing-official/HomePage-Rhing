"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "@/components/ThemeToggle";

const NavLink = ({ href, children, onClick }: { href: string; children: React.ReactNode; onClick?: () => void }) => (
    <Link href={href} onClick={onClick} className="group relative block py-3 px-4 font-bold text-on-surface hover:text-primary transition-colors">
        {children}
        <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-primary transition-all duration-300 ease-m3-standard group-hover:w-full"></span>
    </Link>
);

const navItems = [
    { href: "/", label: "TOP" },
    { href: "/about", label: "ABOUT" },
    { href: "/services", label: "SERVICES" },
    { href: "/daidai-yokocho", label: "daidai横丁" },
    { href: "/donate", label: "DONATE" },
    { href: "/financial", label: "FINANCIAL" },
    { href: "https://note.com/rhing_official/all", label: "NEWS" },
];

// 折りたたみ端末を広げた時（foldバリアント、globals.css）の、左に常時表示するサイドメニュー。
// この時は、右上のハンバーガー・ドロワー・左上のロゴは出さず、ロゴもここに入れる。
function FoldSideMenu() {
    const pathname = usePathname();
    return (
        <nav
            aria-label="サイドメニュー"
            className="hidden fold:flex fixed top-0 left-0 z-50 h-full w-[var(--fold-menu-width)] flex-col gap-2 overflow-y-auto bg-surface/80 backdrop-blur-md border-r border-outline-variant/60 shadow-elevation-3 px-4 py-8"
        >
            <Link href="/" className="mb-6 block px-2">
                <Image src="/Rhing logo.svg" alt="Rhing" width={240} height={80} className="h-12 w-auto aspect-[3/1] object-contain" />
            </Link>
            {navItems.map((item) => {
                const current = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        aria-current={current ? "page" : undefined}
                        className={`rounded-full px-4 py-3 font-bold transition-colors ${
                            current ? "bg-primary-container text-on-primary-container" : "text-on-surface hover:bg-primary-container/60 hover:text-primary"
                        }`}
                    >
                        {item.label}
                    </Link>
                );
            })}
            <ThemeToggle className="mt-auto self-start" menuAlign="left" />
        </nav>
    );
}

export default function Header() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* 折りたたみ端末を広げた時の、左のサイドメニュー */}
            <FoldSideMenu />

            {/* ロゴエリア */}
            <div className="absolute top-0 left-0 p-6 lg:p-8 z-50 fold:hidden">
                <div className="pointer-events-auto">
                    <Link href="/" className="inline-block">
                        <Image
                            src="/Rhing logo.svg"
                            alt="Rhing"
                            width={240}
                            height={80}
                            priority
                            className="h-10 lg:h-20 w-auto aspect-[3/1] object-contain"
                        />
                    </Link>
                </div>
            </div>

            {/* ナビゲーションエリア */}
            <header className="fixed top-6 right-6 lg:right-8 z-50 pointer-events-none fold:hidden">
                {/*
                  🌟 変更：PC用のナビゲーションバーを美しい半透明のガラスデザインに変更
                  - bg-surface-container-lowest/80, backdrop-blur-md, border-glass-edge/80
                */}
                <nav className="pointer-events-auto hidden lg:flex items-center bg-surface/80 backdrop-blur-md shadow-elevation-3 rounded-full px-6 py-2 border border-outline-variant/60">
                    <NavLink href="/">TOP</NavLink>
                    <NavLink href="/about">ABOUT</NavLink>
                    <NavLink href="/services">SERVICES</NavLink>
                    <NavLink href="/donate">DONATE</NavLink>
                    <NavLink href="/financial">FINANCIAL</NavLink>
                    <NavLink href="/daidai-yokocho">daidai横丁</NavLink>
                    <NavLink href="https://note.com/rhing_official/all">NEWS</NavLink>
                    <ThemeToggle className="ml-2" />
                </nav>

                {/*
                  🌟 変更：ハンバーガーボタンもガラス風デザインに変更
                  - bg-surface-container-lowest/80, backdrop-blur-sm, border-glass-edge/60, shadow-blue-300/10
                */}
                <div className="lg:hidden pointer-events-auto flex items-center gap-2">
                    <div className="rounded-full bg-surface/80 backdrop-blur-sm shadow-elevation-2 border border-outline-variant/60">
                        <ThemeToggle />
                    </div>
                    <button
                        aria-label="メニューを開く"
                        className="p-3 bg-surface/80 backdrop-blur-sm rounded-full shadow-elevation-2 border border-outline-variant/60 hover:bg-surface/90 transition-all duration-300 ease-m3-standard"
                        onClick={() => setIsOpen(true)}
                    >
                        <div className="space-y-1">
                            <span className="block w-5 h-0.5 bg-on-surface"></span>
                            <span className="block w-5 h-0.5 bg-on-surface"></span>
                            <span className="block w-5 h-0.5 bg-on-surface"></span>
                        </div>
                    </button>
                </div>
            </header>

            {/* ドロワーメニュー */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsOpen(false)} className="fixed inset-0 bg-black/20 z-[70] pointer-events-auto" />
                        {/*
                          🌟 変更1：メニュー本体を半透明の磨りガラスデザインに変更
                          - bg-surface-container-lowest/80, backdrop-blur-md, border-l border-glass-edge/40

                          🌟 変更2：右スワイプで閉じる高機能ドラッグ処理を追加
                          - drag="x" で横方向のみドラッグ可能に。
                          - 右側（画面外）へのみ最大256pxスライド出来るように制限。
                          - 80px以上右へスワイプされたら自動的にメニューを閉じます（onDragEnd）。
                        */}
                        <motion.nav
                            drag="x"
                            dragConstraints={{ left: 0, right: 256 }} // メニュー幅分のみ右ドラッグを許可
                            dragElastic={{ left: 0, right: 0.15 }}    // 引っ張ったときの心地よい弾力
                            onDragEnd={(event, info) => {
                                // 右に80px以上スワイプ（ドラッグ）されたらドロワーを閉じます
                                if (info.offset.x > 80) {
                                    setIsOpen(false);
                                }
                            }}
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25 }}
                            /* 掴んでスライドできることが感覚的にわかるよう、カーソル表現を追加しています */
                            className="fixed top-0 right-0 w-64 h-full bg-surface/80 backdrop-blur-md z-[80] p-10 flex flex-col justify-center gap-6 pointer-events-auto shadow-elevation-3 border-l border-outline-variant/60 text-on-surface cursor-grab active:cursor-grabbing select-none"
                        >
                            <button className="absolute top-8 right-8 text-2xl font-bold" onClick={() => setIsOpen(false)}>×</button>
                            <NavLink href="/" onClick={() => setIsOpen(false)}>TOP</NavLink>
                            <NavLink href="/about" onClick={() => setIsOpen(false)}>ABOUT</NavLink>
                            <NavLink href="/services" onClick={() => setIsOpen(false)}>SERVICES</NavLink>
                            <NavLink href="/daidai-yokocho" onClick={() => setIsOpen(false)}>daidai横丁</NavLink>
                            <NavLink href="/donate" onClick={() => setIsOpen(false)}>DONATE</NavLink>
                            <NavLink href="/financial" onClick={() => setIsOpen(false)}>FINANCIAL</NavLink>
                            {/* 🌟 リンク先をPC版と合わせて公式noteに統一しました */}
                            <NavLink href="https://note.com/rhing_official/all" onClick={() => setIsOpen(false)}>NEWS</NavLink>
                        </motion.nav>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
