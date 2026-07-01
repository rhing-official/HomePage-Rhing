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
            {/* ロゴエリア*/}
            <div className="absolute top-0 left-0 p-6 md:p-8 z-50">
                <div className="pointer-events-auto">
                    <Link href="/" className="inline-block">
                        <Image
                            src="/Rhing.svg"
                            alt="Rhing Logo"
                            width={240}
                            height={80}
                            priority
                            className="h-10 md:h-20 w-auto"
                        />
                    </Link>
                </div>
            </div>

            {/* ナビゲーションエリア */}
            <header className="fixed top-6 right-6 md:right-8 z-50 pointer-events-none">
                <nav className="pointer-events-auto hidden md:flex bg-white/90 backdrop-blur-sm shadow-lg shadow-blue-300/20 rounded-full px-6 py-2 border border-green-200">
                    <NavLink href="/">TOP</NavLink>
                    <NavLink href="/about">ABOUT</NavLink>
                    <NavLink href="/services">SERVICES</NavLink>
                    <NavLink href="/financial">FINANCIAL</NavLink>
                    <NavLink href="/community">COMM</NavLink>
                    <NavLink href="https://note.com/rhing_official/all">NEWS</NavLink>
                </nav>

                {/* スマホ用ボタン */}
                <button className="md:hidden pointer-events-auto p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg border border-gray-100" onClick={() => setIsOpen(true)}>
                    <div className="space-y-1">
                        <span className="block w-5 h-0.5 bg-gray-800"></span>
                        <span className="block w-5 h-0.5 bg-gray-800"></span>
                        <span className="block w-5 h-0.5 bg-gray-800"></span>
                    </div>
                </button>
            </header>

            {/* ドロワーメニューはそのまま... */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsOpen(false)} className="fixed inset-0 bg-black/20 z-[70] pointer-events-auto" />
                        <motion.nav
                            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25 }}
                            className="fixed top-0 right-0 w-64 h-full bg-white z-[80] p-10 flex flex-col justify-center gap-6 pointer-events-auto shadow-2xl"
                        >
                            <button className="absolute top-8 right-8 text-2xl font-bold" onClick={() => setIsOpen(false)}>×</button>
                            <NavLink href="/" onClick={() => setIsOpen(false)}>TOP</NavLink>
                            <NavLink href="/about" onClick={() => setIsOpen(false)}>ABOUT</NavLink>
                            <NavLink href="/services" onClick={() => setIsOpen(false)}>SERVICES</NavLink>
                            <NavLink href="/financial" onClick={() => setIsOpen(false)}>FINANCIAL</NavLink>
                            <NavLink href="/community" onClick={() => setIsOpen(false)}>COMM</NavLink>
                            <NavLink href="/news" onClick={() => setIsOpen(false)}>NEWS</NavLink>
                        </motion.nav>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}