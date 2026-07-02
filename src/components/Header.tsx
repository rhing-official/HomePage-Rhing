"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

const NavLink = ({ href, children, onClick }: { href: string; children: React.ReactNode; onClick?: () => void }) => (
    <Link href={href} onClick={onClick} className="group relative block py-3 px-4 font-bold text-gray-800 hover:text-blue-600 transition-colors">
        {children}
        <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
    </Link>
);

export default function Header() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* ロゴエリア */}
            <div className="absolute top-0 left-0 p-6 lg:p-8 z-50">
                <div className="pointer-events-auto">
                    <Link href="/" className="inline-block">
                        <Image
                            src="/Rhing.svg"
                            alt="Rhing Logo"
                            width={240}
                            height={80}
                            priority
                            className="h-10 lg:h-20 w-auto aspect-[3/1] object-contain"
                        />
                    </Link>
                </div>
            </div>

            {/* ナビゲーションエリア */}
            <header className="fixed top-6 right-6 lg:right-8 z-50 pointer-events-none">
                {/* 
                  🌟 変更：PC用のナビゲーションバーを美しい半透明のガラスデザインに変更
                  - bg-white/80, backdrop-blur-md, border-white/80
                */}
                <nav className="pointer-events-auto hidden lg:flex bg-white/80 backdrop-blur-md shadow-lg shadow-blue-300/10 rounded-full px-6 py-2 border border-white/80">
                    <NavLink href="/">TOP</NavLink>
                    <NavLink href="/about">ABOUT</NavLink>
                    <NavLink href="/services">SERVICES</NavLink>
                    <NavLink href="https://note.com/rhing_official/all">NEWS</NavLink>
                </nav>

                {/* 
                  🌟 変更：ハンバーガーボタンもガラス風デザインに変更 
                  - bg-white/80, backdrop-blur-sm, border-white/60, shadow-blue-300/10
                */}
                <button
                    className="lg:hidden pointer-events-auto p-3 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-white/60 shadow-blue-300/10 hover:bg-white/90 transition-all duration-300"
                    onClick={() => setIsOpen(true)}
                >
                    <div className="space-y-1">
                        <span className="block w-5 h-0.5 bg-gray-800"></span>
                        <span className="block w-5 h-0.5 bg-gray-800"></span>
                        <span className="block w-5 h-0.5 bg-gray-800"></span>
                    </div>
                </button>
            </header>

            {/* ドロワーメニュー */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsOpen(false)} className="fixed inset-0 bg-black/20 z-[70] pointer-events-auto" />
                        {/* 
                          🌟 変更1：メニュー本体を半透明の磨りガラスデザインに変更
                          - bg-white/80, backdrop-blur-md, border-l border-white/40
                          
                          🌟 変更2：右スワイプで閉じる高機能ドラッグ処理を追加
                          - drag="x" で横方向のみドラッグ可能に。
                          - 右側（画面外）へのみ最大256pxスライドできるように制限。
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
                            className="fixed top-0 right-0 w-64 h-full bg-white/80 backdrop-blur-md z-[80] p-10 flex flex-col justify-center gap-6 pointer-events-auto shadow-2xl border-l border-white/40 cursor-grab active:cursor-grabbing select-none"
                        >
                            <button className="absolute top-8 right-8 text-2xl font-bold" onClick={() => setIsOpen(false)}>×</button>
                            <NavLink href="/" onClick={() => setIsOpen(false)}>TOP</NavLink>
                            <NavLink href="/about" onClick={() => setIsOpen(false)}>ABOUT</NavLink>
                            <NavLink href="/services" onClick={() => setIsOpen(false)}>SERVICES</NavLink>
                            {/* 🌟 リンク先をPC版と合わせて公式noteに統一しました */}
                            <NavLink href="https://note.com/rhing_official/all" onClick={() => setIsOpen(false)}>NEWS</NavLink>
                        </motion.nav>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}