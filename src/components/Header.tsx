"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import ThemeToggle from "@/components/ThemeToggle";
import { HEADER_BAR_SLOT_ID, usePhonePortrait } from "@/lib/usePhonePortrait";

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
            <ThemeToggle className="mt-auto self-start" />
        </nav>
    );
}

// 選んだ項目を見せてから、ドロワーを閉じ始めるまでの時間。縦棒が移り、輪が広がるのを見せる。
const DRAWER_SELECT_MS = 300;
// ページが、傾きから水平へ戻る時間。globals.css の .page-frame の transition と同じ値にする。
const RECEDE_RETURN_MS = 450;
const EASE_M3 = [0.2, 0, 0, 1] as const;

// ドロワーの項目。縦の線路の上に、選ばれた項目の横へ黒い棒を付け、選び直すと、棒が項目の間を滑って移る。
// 選ばれた項目は濃く、他は薄くする。押した項目の文字の上には、二重の輪が広がる。
// 動きを減らす設定の時は、棒を即座に移し、輪は出さない。
function DrawerLink({
    href,
    selected,
    reduceMotion,
    onSelect,
    children,
}: {
    href: string;
    selected: boolean;
    reduceMotion: boolean;
    onSelect: () => void;
    children: React.ReactNode;
}) {
    const [ripple, setRipple] = useState(0);
    return (
        <Link
            href={href}
            onClick={() => {
                if (!reduceMotion) setRipple((n) => n + 1);
                onSelect();
            }}
            className={`relative block py-3 px-5 font-bold tracking-[0.16em] transition-colors duration-300 ease-m3-standard ${
                selected ? "text-on-surface" : "text-on-surface-variant/70"
            }`}
        >
            {selected && (
                <motion.span
                    layoutId="drawer-marker"
                    aria-hidden
                    className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-on-surface"
                    transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 520, damping: 38 }}
                />
            )}
            {ripple > 0 &&
                [0, 0.12].map((delay) => (
                    <motion.span
                        key={`${ripple}-${delay}`}
                        aria-hidden
                        className="pointer-events-none absolute left-3 top-1/2 h-10 w-10 -translate-y-1/2 rounded-full border border-on-surface/40"
                        initial={{ scale: 0.4, opacity: 0.7 }}
                        animate={{ scale: 1.7, opacity: 0 }}
                        transition={{ duration: 0.5, delay, ease: EASE_M3 }}
                    />
                ))}
            {children}
        </Link>
    );
}

// ページを傾けて奥へ退かせる動きの、html への印と、スクロール位置の固定と復元。見た目は globals.css の data-recede が決める。
function startRecede(scrollY: number) {
    const html = document.documentElement;
    // 枠が固定になると、文書の高さが縮む。スクロール位置を保つため、元の高さを body に持たせる。
    document.body.style.minHeight = `${html.scrollHeight}px`;
    html.style.overflow = "hidden";
    html.style.setProperty("--recede-offset", `${scrollY}px`);
    html.dataset.recede = "flat";
    // flat の描画を確定させてから tilt にして、transition を働かせる。
    void html.getBoundingClientRect();
    html.dataset.recede = "tilt";
}

function setRecedePhase(phase: "flat" | "tilt" | "offset0") {
    const html = document.documentElement;
    if (phase === "offset0") html.style.setProperty("--recede-offset", "0px");
    else html.dataset.recede = phase;
}

function endRecede(scrollY: number) {
    const html = document.documentElement;
    delete html.dataset.recede;
    html.style.overflow = "";
    html.style.removeProperty("--recede-offset");
    document.body.style.minHeight = "";
    window.scrollTo(0, scrollY);
}

export default function Header() {
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState<string | null>(null);
    const pathname = usePathname();
    const reduceMotion = useReducedMotion();
    const phonePortrait = usePhonePortrait();
    // ページを傾ける動きは、スマホの縦画面で、動きを減らす設定でない時だけ。
    const recede = phonePortrait && !reduceMotion;

    // 傾いている間の、元のスクロール位置と、ページ移動の有無。
    const recedeRef = useRef<{ scrollY: number; pathname: string; active: boolean; timer?: number }>({ scrollY: 0, pathname, active: false });

    // 傾いている間に、別のページへ移ったら、新しいページの先頭を、傾いた紙に映す。
    useEffect(() => {
        const state = recedeRef.current;
        if (state.active && pathname !== state.pathname) {
            setRecedePhase("offset0");
        }
    }, [pathname]);

    const openDrawer = () => {
        const current = navItems.find((item) => (item.href === "/" ? pathname === "/" : item.href.startsWith("/") && pathname.startsWith(item.href)));
        setSelected(current ? current.href : null);
        const state = recedeRef.current;
        if (recede) {
            window.clearTimeout(state.timer);
            if (!state.active) {
                state.scrollY = window.scrollY;
                state.pathname = pathname;
                state.active = true;
                startRecede(state.scrollY);
            } else {
                setRecedePhase("tilt");
            }
        }
        setIsOpen(true);
    };

    // 閉じる全ての経路が通る。ページは水平に戻りながら全面に広がり、戻りきったら、通常の配置とスクロール位置に戻す。
    const closeDrawer = () => {
        setIsOpen(false);
        const state = recedeRef.current;
        if (!state.active) return;
        setRecedePhase("flat");
        window.clearTimeout(state.timer);
        state.timer = window.setTimeout(() => {
            state.active = false;
            endRecede(pathname === state.pathname ? state.scrollY : 0);
        }, RECEDE_RETURN_MS);
    };

    // 項目を選ぶと、縦棒と輪の動きを見せてから、ドロワーを閉じる。
    const selectItem = (href: string) => {
        setSelected(href);
        window.setTimeout(closeDrawer, reduceMotion ? 0 : DRAWER_SELECT_MS);
    };

    return (
        <>
            {/* 折りたたみ端末を広げた時の、左のサイドメニュー */}
            <FoldSideMenu />

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
                {/* 縦画面では、モード切り替えとハンバーガーを、1つのバーにする（daidai横丁のメニューと同じ作り）。
                    daidai横丁のページでは、メニューのボタンが、左の場所に入る（DaidaiYokochoMenu.tsx）。横画面は、別々のボタンのまま */}
                <div className="relative lg:hidden pointer-events-auto flex items-center gap-2 portrait:gap-0 portrait:rounded-full portrait:bg-surface/80 portrait:backdrop-blur-md portrait:shadow-elevation-3 portrait:border portrait:border-outline-variant/60">
                    <div id={HEADER_BAR_SLOT_ID} className="hidden portrait:flex items-center" />
                    <div className="rounded-full bg-surface/80 backdrop-blur-sm shadow-elevation-2 border border-outline-variant/60 portrait:rounded-none portrait:bg-transparent portrait:backdrop-blur-none portrait:shadow-none portrait:border-0">
                        <ThemeToggle className="portrait:h-12 portrait:w-12" />
                    </div>
                    <span aria-hidden className="hidden portrait:block h-6 w-px bg-outline/80" />
                    <button
                        aria-label="メニューを開く"
                        className="p-3 bg-surface/80 backdrop-blur-sm rounded-full shadow-elevation-2 border border-outline-variant/60 hover:bg-surface/90 transition-all duration-300 ease-m3-standard portrait:flex portrait:h-12 portrait:w-12 portrait:items-center portrait:justify-center portrait:p-0 portrait:bg-transparent portrait:backdrop-blur-none portrait:shadow-none portrait:border-0 portrait:hover:bg-surface-container-lowest/90"
                        onClick={openDrawer}
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
                        {/* スマホの縦画面では、傾いたページが背景になるので、暗幕は付けない。押すと閉じる範囲だけ残す */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={closeDrawer}
                            className={`fixed inset-0 z-[70] pointer-events-auto ${recede ? "" : "bg-black/20"}`}
                        />
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
                            style={{ y: "-50%" }} // 縦は、テキストの範囲だけの高さにして、画面の中央に置く
                            dragConstraints={{ left: 0, right: 256 }} // メニュー幅分のみ右ドラッグを許可
                            dragElastic={{ left: 0, right: 0.15 }}    // 引っ張ったときの心地よい弾力
                            onDragEnd={(event, info) => {
                                // 右に80px以上スワイプ（ドラッグ）されたらドロワーを閉じます
                                if (info.offset.x > 80) {
                                    closeDrawer();
                                }
                            }}
                            initial={reduceMotion ? { opacity: 0 } : { x: "100%" }}
                            animate={reduceMotion ? { opacity: 1 } : { x: 0 }}
                            exit={reduceMotion ? { opacity: 0 } : { x: "100%" }}
                            transition={reduceMotion ? { duration: 0.15 } : { type: "spring", damping: 25 }}
                            /* 掴んでスライドできることが感覚的にわかるよう、カーソル表現を追加しています */
                            className="fixed top-1/2 right-0 w-64 bg-surface/80 backdrop-blur-md z-[80] p-10 flex flex-col gap-6 pointer-events-auto shadow-elevation-3 rounded-l-3xl border-y border-l border-outline-variant/60 text-on-surface cursor-grab active:cursor-grabbing select-none"
                        >
                            {/* 左端の細い縦線が、棒の通る線路。項目は、時間差を付けて、薄い状態から現れる */}
                            <div className="relative flex flex-col gap-6">
                                <span aria-hidden className="absolute left-0 inset-y-0 w-px bg-outline-variant" />
                                {navItems.map((item, index) => (
                                    <motion.div
                                        key={item.href}
                                        initial={reduceMotion ? false : { opacity: 0, x: 14 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.3, delay: 0.1 + index * 0.04, ease: EASE_M3 }}
                                    >
                                        <DrawerLink
                                            href={item.href}
                                            selected={selected === item.href}
                                            reduceMotion={!!reduceMotion}
                                            onSelect={() => selectItem(item.href)}
                                        >
                                            {item.label}
                                        </DrawerLink>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.nav>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
