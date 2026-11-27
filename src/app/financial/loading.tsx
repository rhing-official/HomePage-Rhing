import { SkeletonRegion, Skeleton } from "@/components/Skeleton";

// 収支報告を、サーバーで生成している間の枠（タイトル・切り替え・グラフ・表）
export default function Loading() {
    return (
        <div className="container mx-auto px-6 pb-24 max-w-5xl">
            <div className="mb-12 text-center">
                <h1 className="text-4xl md:text-5xl font-bold tracking-widest text-on-surface mb-4">FINANCIAL</h1>
                <p className="text-on-surface-subtle tracking-wider text-sm">収支報告</p>
            </div>
            <SkeletonRegion className="flex flex-col gap-8">
                <div aria-hidden="true" className="flex gap-3">
                    <Skeleton className="h-10 w-32 rounded-full" />
                    <Skeleton className="h-10 w-40 rounded-full" />
                </div>
                <Skeleton className="h-72 w-full rounded-m3-xl" />
                <div aria-hidden="true" className="flex flex-col gap-3">
                    {Array.from({ length: 6 }, (_, i) => (
                        <Skeleton key={i} className="h-5 w-full rounded-full" />
                    ))}
                </div>
            </SkeletonRegion>
        </div>
    );
}
