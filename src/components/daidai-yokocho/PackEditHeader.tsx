import { Pencil } from "lucide-react";

// パックの編集画面の見出し。公開中か下書きかを、バッジと1行の説明で区別する（見出しは、どちらも「パックの編集」）
export default function PackEditHeader({ status }: { status: "published" | "draft" }) {
    const published = status === "published";
    return (
        <div className="mb-12">
            <h1 className="flex flex-wrap items-center gap-x-3 gap-y-2 text-3xl font-bold tracking-widest text-gray-900">
                <Pencil className="w-7 h-7 shrink-0" aria-hidden />
                パックの編集
                <span
                    className={`rounded-full px-3 py-1 text-xs font-bold tracking-wider ${
                        published
                            ? "bg-primary text-on-primary"
                            : "border border-dashed border-primary/60 bg-primary-container text-on-primary-container"
                    }`}
                >
                    {published ? "公開中" : "下書き"}
                </span>
            </h1>
            <p className="mt-3 text-sm text-gray-500">
                {published
                    ? "公開中のパックです。「公開する」を押すまで、販売ページは変わりません。"
                    : "まだ公開されていません。「公開する」を押すと、販売ページに並びます。"}
            </p>
        </div>
    );
}
