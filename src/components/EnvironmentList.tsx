type EnvironmentItem = { os: string; detail?: string };

type Props = {
    items: EnvironmentItem[];
    checkedAt: string;
    note?: string;
    className?: string;
};

// サービスページ共通の「動作確認環境」表示。実際に試した環境だけを渡す
export default function EnvironmentList({ items, checkedAt, note, className = "" }: Props) {
    return (
        <div className={className}>
            <h3 className="text-sm font-bold tracking-widest text-gray-900 mb-3">動作確認環境</h3>
            <ul className="space-y-1 text-sm text-gray-700">
                {items.map((item) => (
                    <li key={item.os}>
                        <span className="font-bold">{item.os}</span>
                        {item.detail && <span className="text-gray-500">（{item.detail}）</span>}
                    </li>
                ))}
            </ul>
            <p className="mt-3 text-xs text-gray-400 leading-relaxed">
                {note && <>{note}<br /></>}
                {checkedAt}時点の確認結果です。記載のない環境でも動作する場合がありますが、動作を保証するものではありません。
            </p>
        </div>
    );
}
