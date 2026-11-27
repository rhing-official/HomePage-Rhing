import CtaCard from "@/components/ui/CtaCard";

// 一覧が空の時に出す「daidai横丁で探す」。サイト共通の大きなカード（CTA）にする
export default function FindInYokochoLink({ href = "/daidai-yokocho" }: { href?: string }) {
    return <CtaCard href={href} label="STORE" title="daidai横丁で探す" caption="ぺったんと意匠を見に行く" />;
}
