"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence, useDragControls, useMotionValue } from "framer-motion";
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
    { href: "/donate", label: "DONATE" },
    { href: "/financial", label: "FINANCIAL" },
    { href: "/daidai-yokocho", label: "daidai横丁" },
    { href: "https://note.com/rhing_official/all", label: "NEWS" },
];

// 画面がヒンジで左右2つに分かれる端末（foldバリアント、globals.css）の、左に常時表示するサイドメニュー。
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
// ドロワーの幅（w-64）。右端から引き出す操作で、指に追従させる距離に使う
const DRAWER_WIDTH = 256;
const EASE_M3 = [0.2, 0, 0, 1] as const;

// ドロワーの項目。縦の線路の上に、選ばれた項目の横へ黒い棒を付け、選び直すと、棒が項目の間を滑って移る。
// 選ばれた項目は濃く、他は薄くする。押した項目の文字の上には、二重の輪が広がる。
// 動きを減らす設定の時は、棒を即座に移し、輪は出さない。
function DrawerLink({
    href,
    selected,
    onSelect,
    children,
}: {
    href: string;
    selected: boolean;
    onSelect: () => void;
    children: React.ReactNode;
}) {
    const [ripple, setRipple] = useState(0);
    return (
        <Link
            href={href}
            data-drawer-href={href}
            draggable={false}
            onClick={() => {
                setRipple((n) => n + 1);
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
                    transition={{ type: "spring", stiffness: 520, damping: 38 }}
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
// drag: 右端から引き出している間。傾けず、指の位置（--recede-progress、0 が水平、1 が全開）に合わせて、毎コマ傾ける。離した時に、tilt か flat へ移る。
function startRecede(scrollY: number, mode: "tilt" | "drag" = "tilt") {
    const html = document.documentElement;
    // 枠が固定になると、文書の高さが縮む。スクロール位置を保つため、元の高さを body に持たせる。
    document.body.style.minHeight = `${html.scrollHeight}px`;
    html.style.overflow = "hidden";
    html.style.setProperty("--recede-offset", `${scrollY}px`);
    if (mode === "drag") {
        html.style.setProperty("--recede-progress", "0");
        html.dataset.recede = "drag";
        return;
    }
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
    html.style.removeProperty("--recede-progress");
    document.body.style.minHeight = "";
    window.scrollTo(0, scrollY);
}

export default function Header() {
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState<string | null>(null);
    const pathname = usePathname();
    const router = useRouter();
    const dragControls = useDragControls();
    // 画面の右端から引き出している間の、ドロワーの横位置（DRAWER_WIDTH で隠れ、0 で全開）。指に追従させる
    const drawerX = useMotionValue(DRAWER_WIDTH);
    const [edgeDragging, setEdgeDragging] = useState(false);
    // 指を押したまま滑らせて、項目を選ぶ操作の状態。axis は、最初の数ピクセルの動きで、縦（項目を選ぶ）か横（閉じる）かを決める
    const scrubRef = useRef<{ x: number; y: number; axis: "none" | "scrub" | "close"; start: string | null; from: string | null; last: string | null } | null>(null);
    const phonePortrait = usePhonePortrait();
    // ページを傾ける動きは、スマホの縦画面だけ。動きを減らす設定は、見ない（2026-11-28、ユーザー指示）。
    const recede = phonePortrait;

    // 傾いている間の、元のスクロール位置と、ページ移動の有無。
    const recedeRef = useRef<{ scrollY: number; pathname: string; active: boolean; timer?: number }>({ scrollY: 0, pathname, active: false });

    // 傾いている間に、別のページへ移ったら、新しいページの先頭を、傾いた紙に映す。
    useEffect(() => {
        const state = recedeRef.current;
        if (state.active && pathname !== state.pathname) {
            setRecedePhase("offset0");
        }
    }, [pathname]);

    const selectCurrent = () => {
        const current = navItems.find((item) => (item.href === "/" ? pathname === "/" : item.href.startsWith("/") && pathname.startsWith(item.href)));
        setSelected(current ? current.href : null);
    };

    // ページを傾けて退かせる動きを始める（スマホ・タブレットの縦画面など）
    const beginRecede = () => {
        const state = recedeRef.current;
        if (!recede) return;
        window.clearTimeout(state.timer);
        if (!state.active) {
            state.scrollY = window.scrollY;
            state.pathname = pathname;
            state.active = true;
            startRecede(state.scrollY);
        } else {
            setRecedePhase("tilt");
        }
    };

    const openDrawer = () => {
        selectCurrent();
        beginRecede();
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

    // ドロワーを指で動かしている間（右端から引き出す時と、開いたドロワーを横へ引いて収納する時）の印。
    const draggingRef = useRef(false);
    // ドロワーの位置に合わせて、ページの傾き（--recede-progress）を、毎コマ更新する。引き出す時も、収納する時も、同じ作り。
    // 指を離して、閉じずに元へ戻る時は、ドロワーが全開の位置へ戻ったところで、傾きの動きを tilt に戻す
    useEffect(
        () =>
            drawerX.on("change", (v) => {
                const html = document.documentElement;
                if (html.dataset.recede !== "drag") return;
                const x = Math.min(Math.max(v, 0), DRAWER_WIDTH);
                html.style.setProperty("--recede-progress", String(1 - x / DRAWER_WIDTH));
                if (!draggingRef.current && x <= 0.5) setRecedePhase("tilt");
            }),
        [drawerX],
    );

    // 画面の右端から左へ引いて、ドロワーを開く。ドロワーは指に追従して出てくる（勝手に最後まで伸びない）。
    // 途中で指を戻せば、そのまま指に追従して収納される。離した時に、半分を超えていたら開き、手前なら閉じる。速く払った時は、その向きに従う。
    // ハンバーガーが見えている幅だけで効く（PC用のナビバーや、画面が左右に分かれる端末では、ボタンが見えないので効かない）。
    // ページを傾ける動きは、離して開くと決まってから始める（傾きは時間で動くので、指には追従させない）。
    const edgeRef = useRef<{ opened: boolean; begin: () => void; settle: (open: boolean) => void }>({ opened: false, begin: () => {}, settle: () => {} });
    useEffect(() => {
        edgeRef.current = {
            opened: isOpen,
            begin: () => {
                drawerX.set(DRAWER_WIDTH);
                selectCurrent();
                // ページも、指に合わせて傾ける（globals.css の data-recede="drag"）
                const state = recedeRef.current;
                if (recede && !state.active) {
                    window.clearTimeout(state.timer);
                    state.scrollY = window.scrollY;
                    state.pathname = pathname;
                    state.active = true;
                    startRecede(state.scrollY, "drag");
                }
                draggingRef.current = true;
                setEdgeDragging(true);
                setIsOpen(true);
            },
            settle: (open) => {
                draggingRef.current = false;
                if (open) {
                    if (recedeRef.current.active) setRecedePhase("tilt"); // 指の位置から、全開の傾きまで動く
                    setEdgeDragging(false); // animate={{ x: 0 }} が、今の位置から全開まで動かす
                } else {
                    closeDrawer(); // 傾きは、指の位置から水平まで戻り、ドロワーは、今の位置から隠れる。edgeDragging は、退場が終わってから戻す
                }
            },
        };
    });
    useEffect(() => {
        const EDGE_PX = 24; // 右端からこの幅の中で始まった指だけを対象にする
        const INTENT_PX = 8; // この距離以上、横へ動いたら、引き出す操作と見なす
        const FLICK_PX_PER_S = 600; // これ以上の速さで払ったら、位置に関わらず、その向きに従う
        let start: { x: number; y: number } | null = null;
        let dragging = false;
        let last = { x: 0, t: 0 };
        let velocity = 0; // 右向きが正
        const hamburgerVisible = () =>
            (document.querySelector<HTMLElement>('button[aria-label^="メニューを"]')?.getClientRects().length ?? 0) > 0;
        const fingerToX = (clientX: number) => Math.min(Math.max(clientX - (window.innerWidth - DRAWER_WIDTH), 0), DRAWER_WIDTH);
        const finish = () => {
            if (dragging) {
                dragging = false;
                const x = drawerX.get();
                const open = Math.abs(velocity) > FLICK_PX_PER_S ? velocity < 0 : x < DRAWER_WIDTH / 2;
                edgeRef.current.settle(open);
            }
            start = null;
        };
        const onStart = (e: TouchEvent) => {
            start = null;
            dragging = false;
            if (e.touches.length !== 1 || edgeRef.current.opened) return;
            const t = e.touches[0];
            if (t.clientX < window.innerWidth - EDGE_PX) return;
            if (!hamburgerVisible()) return;
            start = { x: t.clientX, y: t.clientY };
            last = { x: t.clientX, t: performance.now() };
            velocity = 0;
        };
        const onMove = (e: TouchEvent) => {
            if (!start) return;
            const t = e.touches[0];
            if (!dragging) {
                const dx = t.clientX - start.x;
                const dy = t.clientY - start.y;
                // 縦に動いた時は、ページのスクロールなので、見送る
                if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 10) {
                    start = null;
                    return;
                }
                if (dx > -INTENT_PX) return;
                dragging = true;
                edgeRef.current.begin();
            }
            // ページが横に動かないよう、引き出している間は、ブラウザの既定の動きを止める
            if (e.cancelable) e.preventDefault();
            const now = performance.now();
            const dt = now - last.t;
            if (dt > 0) velocity = ((t.clientX - last.x) / dt) * 1000;
            last = { x: t.clientX, t: now };
            const x = fingerToX(t.clientX);
            drawerX.set(x);
            document.documentElement.style.setProperty("--recede-progress", String(1 - x / DRAWER_WIDTH));
        };
        window.addEventListener("touchstart", onStart, { passive: true });
        window.addEventListener("touchmove", onMove, { passive: false });
        window.addEventListener("touchend", finish, { passive: true });
        window.addEventListener("touchcancel", finish, { passive: true });
        return () => {
            window.removeEventListener("touchstart", onStart);
            window.removeEventListener("touchmove", onMove);
            window.removeEventListener("touchend", finish);
            window.removeEventListener("touchcancel", finish);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // 項目を選ぶと、縦棒と輪の動きを見せてから、ドロワーを閉じる。
    const selectItem = (href: string) => {
        setSelected(href);
        window.setTimeout(closeDrawer, DRAWER_SELECT_MS);
    };

    // 項目の上を指でなぞる間、棒が指に付いて動く。離した所の項目へ移る
    const hrefAt = (x: number, y: number) =>
        document.elementFromPoint(x, y)?.closest<HTMLElement>("[data-drawer-href]")?.dataset.drawerHref ?? null;
    const onScrubDown = (e: React.PointerEvent) => {
        scrubRef.current = { x: e.clientX, y: e.clientY, axis: "none", start: hrefAt(e.clientX, e.clientY), from: selected, last: null };
    };
    const onScrubMove = (e: React.PointerEvent) => {
        const s = scrubRef.current;
        if (!s) return;
        if (s.axis === "none") {
            const dx = e.clientX - s.x;
            const dy = e.clientY - s.y;
            // 項目の外（余白）は、少し動いただけで、閉じる動きに入る。項目の上は、縦の項目移動を優先して、少し長く見る
            if (Math.hypot(dx, dy) < (s.start ? 8 : 3)) return;
            if (Math.abs(dx) > Math.abs(dy) && dx > 0) {
                s.axis = "close";
                dragControls.start(e);
                return;
            }
            s.axis = "scrub";
        }
        if (s.axis !== "scrub") return;
        const href = hrefAt(e.clientX, e.clientY);
        if (href && href !== s.last) {
            s.last = href;
            setSelected(href);
        }
    };
    const onScrubUp = (e: React.PointerEvent) => {
        const s = scrubRef.current;
        scrubRef.current = null;
        if (!s || s.axis !== "scrub") return;
        const href = hrefAt(e.clientX, e.clientY);
        if (!href || href === s.start) {
            // 元の項目の上で離した時は、そのまま押した扱い（click が移動を担う）。項目の外なら、選びを戻す
            if (!href) setSelected(s.from);
            return;
        }
        setSelected(href);
        if (href.startsWith("/")) router.push(href);
        else window.open(href, "_self");
        window.setTimeout(closeDrawer, DRAWER_SELECT_MS);
    };

    return (
        <>
            {/* 画面が左右2つに分かれる端末の、左のサイドメニュー */}
            <FoldSideMenu />

            {/* ナビゲーションエリア */}
            {/* ドロワーを開いている間は、背景の押す範囲（z-70）とドロワー（z-80）より手前に出して、モード切り替えなどを押せるようにする */}
            <header className={`fixed top-6 right-6 lg:right-8 ${isOpen ? "z-[90]" : "z-50"} pointer-events-none fold:hidden`}>
                {/*
                  🌟 変更：PC用のナビゲーションバーを美しい半透明のガラスデザインに変更
                  - bg-surface-container-lowest/80, backdrop-blur-md, border-glass-edge/80
                */}
                <nav className="pointer-events-auto hidden hb:flex items-center bg-surface/80 backdrop-blur-md shadow-elevation-3 rounded-full px-6 py-2 border border-outline-variant/60">
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
                {/* 幅1500px未満（縦画面も横画面も）では、モード切り替えとハンバーガーを、1つのバーにする（daidai横丁のメニューと同じ作り）。
                    daidai横丁のページでは、メニューのボタンが、左の場所に入る（DaidaiYokochoMenu.tsx） */}
                <div className="relative hb:hidden pointer-events-auto flex items-center rounded-full bg-surface/80 backdrop-blur-md shadow-elevation-3 border border-outline-variant/60">
                    <div id={HEADER_BAR_SLOT_ID} className="flex items-center" />
                    <div className="">
                        <ThemeToggle className="h-12 w-12" />
                    </div>
                    <span aria-hidden className="block h-6 w-px bg-outline/80" />
                    <button
                        aria-label={isOpen ? "メニューを閉じる" : "メニューを開く"}
                        className="flex h-12 w-12 items-center justify-center rounded-full hover:bg-surface-container-lowest/90 transition-colors duration-300 ease-m3-standard"
                        onClick={isOpen ? closeDrawer : openDrawer}
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
            <AnimatePresence onExitComplete={() => setEdgeDragging(false)}>
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
                            dragControls={dragControls}
                            dragListener={false}
                            dragSnapToOrigin // 離した時に、閉じる条件を満たさなければ、元の位置へ戻る。閉じる時は、exit が後から上書きする
                            onPointerDown={onScrubDown}
                            onPointerMove={onScrubMove}
                            onPointerUp={onScrubUp}
                            onPointerCancel={() => { scrubRef.current = null; }}
                            style={{ x: drawerX, y: "-50%", touchAction: "none" }} // 縦は、テキストの範囲だけの高さにして、画面の中央に置く
                            dragConstraints={{ left: 0, right: 256 }} // メニュー幅分のみ右ドラッグを許可
                            dragElastic={{ left: 0, right: 0.15 }}    // 引っ張ったときの心地よい弾力
                            onDragStart={() => {
                                // 収納する間も、ページを指に追従させる。全開の傾きと同じ値から始まるので、見た目は跳ねない
                                draggingRef.current = true;
                                const html = document.documentElement;
                                if (recedeRef.current.active && html.dataset.recede === "tilt") {
                                    html.style.setProperty("--recede-progress", String(1 - Math.min(Math.max(drawerX.get(), 0), DRAWER_WIDTH) / DRAWER_WIDTH));
                                    html.dataset.recede = "drag";
                                }
                            }}
                            onDragEnd={(event, info) => {
                                draggingRef.current = false;
                                // ゆっくりでも、右へ40px以上引いたら閉じる。速く払う動きなら、短くても閉じる
                                if (info.offset.x > 40 || info.velocity.x > 500) {
                                    closeDrawer();
                                    return;
                                }
                                // 閉じずに戻る時は、ドロワーが戻りきるまで追従させる。念の為、戻りきった通知が無くても、tilt に戻す
                                window.setTimeout(() => {
                                    if (!draggingRef.current && document.documentElement.dataset.recede === "drag") setRecedePhase("tilt");
                                }, 700);
                            }}
                            initial={{ x: DRAWER_WIDTH }}
                            animate={edgeDragging ? undefined : { x: 0 }} // 右端から引き出している間は、指が位置を決める
                            exit={{ x: DRAWER_WIDTH }}
                            transition={{ type: "spring", damping: 25 }}
                            /* 掴んでスライドできることが感覚的にわかるよう、カーソル表現を追加しています */
                            className="fixed top-1/2 right-0 w-64 bg-surface/80 backdrop-blur-md z-[80] p-10 flex flex-col gap-6 pointer-events-auto shadow-elevation-3 rounded-l-3xl border-y border-l border-outline-variant/60 text-on-surface cursor-grab active:cursor-grabbing select-none"
                        >
                            {/* 左端の細い縦線が、棒の通る線路。項目は、時間差を付けて、薄い状態から現れる */}
                            <div className="relative flex flex-col gap-6">
                                <span aria-hidden className="absolute left-0 inset-y-0 w-px bg-outline-variant" />
                                {navItems.map((item, index) => (
                                    <motion.div
                                        key={item.href}
                                        initial={{ opacity: 0, x: 14 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.3, delay: 0.1 + index * 0.04, ease: EASE_M3 }}
                                    >
                                        <DrawerLink
                                            href={item.href}
                                            selected={selected === item.href}
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
