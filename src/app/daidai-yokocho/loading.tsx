import { PackGridSkeleton, Skeleton } from "@/components/Skeleton";

// daidai横丁のカタログを、サーバーで生成している間の枠（タイトル・検索欄・ぺったんのグリッド）
export default function Loading() {
    return (
        <div className="w-full pb-24">
            <div className="container mx-auto px-6 pb-24 max-w-4xl">
                <div className="flex flex-col items-center justify-center text-center md:min-h-56 lg:min-h-64">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-widest text-on-surface mb-4">daidai横丁</h1>
                </div>
            </div>
            <div className="container mx-auto px-6 max-w-6xl">
                <div className="max-w-2xl mx-auto mb-10">
                    <Skeleton className="h-12 w-full rounded-full" />
                </div>
                <PackGridSkeleton count={6} />
            </div>
        </div>
    );
}
