import { SkeletonRegion, Skeleton } from "@/components/Skeleton";

// 販売ページを、サーバーで生成している間の枠（左に大きな画像、右に名前・価格・購入ボタン）
export default function Loading() {
    return (
        <div className="w-full pb-24">
            <div className="container mx-auto px-6 max-w-6xl">
                <SkeletonRegion>
                    <div aria-hidden="true" className="grid grid-cols-1 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] gap-8 lg:gap-14 items-start">
                        <div className="flex flex-col gap-4">
                            <Skeleton className="aspect-square w-full rounded-m3-lg" />
                            <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
                                {Array.from({ length: 6 }, (_, i) => (
                                    <Skeleton key={i} className="aspect-square rounded-m3-md" />
                                ))}
                            </div>
                        </div>
                        <div className="flex flex-col gap-6">
                            <div className="flex flex-col gap-3">
                                <Skeleton className="h-3 w-16 rounded-full" />
                                <Skeleton className="h-9 w-3/4 rounded-full" />
                                <div className="flex items-center gap-2 mt-2">
                                    <Skeleton className="w-7 h-7 rounded-full" />
                                    <Skeleton className="h-4 w-24 rounded-full" />
                                </div>
                            </div>
                            <Skeleton className="h-10 w-32 rounded-full" />
                            <Skeleton className="h-12 w-full rounded-full" />
                            <div className="flex flex-col gap-3 pt-4 border-t border-gray-200">
                                {Array.from({ length: 3 }, (_, i) => (
                                    <Skeleton key={i} className="h-4 w-full rounded-full" />
                                ))}
                            </div>
                        </div>
                    </div>
                </SkeletonRegion>
            </div>
        </div>
    );
}
