import { CreatorHeaderSkeleton, PackGridSkeleton } from "@/components/Skeleton";

// クリエイターのプロフィールを、サーバーで生成している間の枠
export default function Loading() {
    return (
        <div className="w-full pb-24">
            <div className="container mx-auto px-6 pb-24 max-w-4xl">
                <CreatorHeaderSkeleton />
                <PackGridSkeleton count={3} />
            </div>
        </div>
    );
}
