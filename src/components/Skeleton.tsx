// スケルトンスクリーン（読み込み中の、灰色の仮の枠）の共通部品（2026-11-17）。
// VPN・海外・Firestoreの応答待ちで、画面が空白になる・「読み込み中...」の文字だけになるのを避け、
// 読み込み後に近いレイアウトを先に出す。動きを減らす設定（prefers-reduced-motion）の人には、
// パルスを止める（motion-safe）。

// 灰色の角丸の枠。幅・高さ・形は、classNameで渡す（例: "h-4 w-24 rounded-full"）
export function Skeleton({ className = "" }: { className?: string }) {
    return <div aria-hidden="true" className={`bg-gray-200/70 motion-safe:animate-pulse ${className}`} />;
}

// スクリーンリーダー用の「読み込み中」の案内と、読み込み中であることを伝える外枠
export function SkeletonRegion({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return (
        <div role="status" aria-busy="true" className={className}>
            <span className="sr-only">読み込み中</span>
            {children}
        </div>
    );
}

// StickerPackCardと同じ大きさのカード（画像の枠・価格・パック名・出品者）
export function PackCardSkeleton() {
    return (
        <div aria-hidden="true" className="flex flex-col bg-white border border-gray-100 shadow-sm overflow-hidden rounded-2xl">
            <Skeleton className="w-full aspect-[4/3] rounded-none" />
            <div className="px-6 pt-3 flex flex-col gap-2">
                <Skeleton className="h-3.5 w-12 rounded-full" />
                <Skeleton className="h-4 w-3/4 rounded-full" />
            </div>
            <div className="px-6 pt-3 pb-6 flex items-center gap-2">
                <Skeleton className="w-5 h-5 rounded-full" />
                <Skeleton className="h-3 w-16 rounded-full" />
            </div>
        </div>
    );
}

// パックのカードのグリッド（カタログ・購入済み・お気に入りなどと同じ列数）
export function PackGridSkeleton({ count = 6, wide = false }: { count?: number; wide?: boolean }) {
    return (
        <SkeletonRegion>
            <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 ${wide ? "xl:grid-cols-5" : ""} gap-6`}>
                {Array.from({ length: count }, (_, i) => (
                    <PackCardSkeleton key={i} />
                ))}
            </div>
        </SkeletonRegion>
    );
}

// 一覧の行（アイコン＋2行の文字）。フォロー中のクリエイター・管理画面の申請など
export function ListRowSkeleton({ count = 3 }: { count?: number }) {
    return (
        <SkeletonRegion className="flex flex-col gap-4">
            {Array.from({ length: count }, (_, i) => (
                <div key={i} aria-hidden="true" className="flex items-center gap-4 rounded-m3-xl border border-white/80 bg-white/40 p-5">
                    <Skeleton className="w-12 h-12 rounded-full shrink-0" />
                    <div className="flex-1 flex flex-col gap-2">
                        <Skeleton className="h-4 w-1/3 rounded-full" />
                        <Skeleton className="h-3 w-2/3 rounded-full" />
                    </div>
                </div>
            ))}
        </SkeletonRegion>
    );
}

// 購入済みのように、パックごとに1枚のパネル（名前の行＋ぺったんの小さな正方形の並び）で出す一覧
export function PackPanelListSkeleton({ count = 2 }: { count?: number }) {
    return (
        <SkeletonRegion className="flex flex-col gap-6">
            {Array.from({ length: count }, (_, i) => (
                <div key={i} aria-hidden="true" className="bg-white/40 border border-white/80 shadow-sm rounded-2xl p-6 flex flex-col gap-4">
                    <div className="flex items-center justify-between gap-4">
                        <Skeleton className="h-5 w-40 rounded-full" />
                        <Skeleton className="h-3 w-12 rounded-full" />
                    </div>
                    <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
                        {Array.from({ length: 8 }, (_, j) => (
                            <Skeleton key={j} className="aspect-square rounded-lg" />
                        ))}
                    </div>
                </div>
            ))}
        </SkeletonRegion>
    );
}

// 横長の行（画像＋2行の文字）。作成と管理・カートの一覧
export function ThumbRowSkeleton({ count = 3 }: { count?: number }) {
    return (
        <SkeletonRegion className="flex flex-col gap-3">
            {Array.from({ length: count }, (_, i) => (
                <div key={i} aria-hidden="true" className="flex items-center gap-4 bg-white/60 border border-gray-100 shadow-sm rounded-2xl p-4">
                    <Skeleton className="w-16 h-16 rounded-xl shrink-0" />
                    <div className="flex-1 flex flex-col gap-2">
                        <Skeleton className="h-4 w-1/2 rounded-full" />
                        <Skeleton className="h-3 w-1/4 rounded-full" />
                    </div>
                </div>
            ))}
        </SkeletonRegion>
    );
}

// 編集画面（パック・下書き）の枠: ぺったんの並び＋入力欄2つ＋ボタン
export function EditorSkeleton() {
    return (
        <SkeletonRegion>
            <div aria-hidden="true" className="bg-white/40 border border-white/80 shadow-sm rounded-2xl p-6 flex flex-col gap-6">
                <div className="flex flex-wrap gap-3">
                    {Array.from({ length: 6 }, (_, i) => (
                        <Skeleton key={i} className="w-16 h-16 rounded-lg" />
                    ))}
                </div>
                <Skeleton className="h-10 w-full rounded-lg" />
                <Skeleton className="h-10 w-48 rounded-lg" />
                <div className="flex gap-3">
                    <Skeleton className="h-11 w-32 rounded-full" />
                    <Skeleton className="h-11 w-32 rounded-full" />
                </div>
            </div>
        </SkeletonRegion>
    );
}

// クリエイターのプロフィールのカード（アイコン・名前・ステータス）
export function CreatorHeaderSkeleton() {
    return (
        <div aria-hidden="true" className="bg-white/40 border border-white/80 shadow-md shadow-gray-200/30 rounded-3xl p-8 md:p-12 mb-12 flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <Skeleton className="w-24 h-24 rounded-full shrink-0" />
            <div className="flex-1 flex flex-col gap-3 items-center sm:items-start w-full">
                <Skeleton className="h-7 w-48 rounded-full" />
                <Skeleton className="h-4 w-24 rounded-full" />
                <Skeleton className="h-4 w-2/3 rounded-full" />
                <Skeleton className="h-10 w-32 rounded-full mt-4" />
            </div>
        </div>
    );
}
