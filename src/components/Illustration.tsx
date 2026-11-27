// ページ脇のイラスト。ダークモードでは、白や薄い灰色の面を暗く、暗い線や服を明るく反転した版に差し替える。
// 反転版は、scripts/make-dark-illustrations.py が、public/illustrations/dark/ に作る。
// 位置と大きさのクラスは、外側の枠に付ける（中の画像は、枠いっぱいに広げる）
export default function Illustration({ name, className = "" }: { name: string; className?: string }) {
    return (
        <div className={className}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/illustrations/${name}.svg`} alt="" className="block w-full h-auto dark:hidden" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/illustrations/dark/${name}.svg`} alt="" className="hidden w-full h-auto dark:block" />
        </div>
    );
}
