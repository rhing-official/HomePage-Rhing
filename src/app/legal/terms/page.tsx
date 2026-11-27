import { Metadata } from "next";
import Illustration from "@/components/Illustration";

export const metadata: Metadata = {
    title: "利用規約 | Rhing",
    description: "Rhingをご利用いただく際の利用規約です。",
};

const terms: { title: string; content: string; items?: string[] }[] = [
    { title: "第1条：定義", content: "「Rhing」とは、本サービスおよびこれを運営する事業主を指します。「ユーザー」とは、本サービスを利用する全ての人を指します。" },
    { title: "第2条：利用資格", content: "ユーザーは、自己の責任において本サービスを利用するものとします。13歳未満の方は、保護者の同意を得た上でご利用ください。また、18歳未満の方が有料のサービスを購入する場合は、事前に保護者（親権者）の同意を得てください。" },
    {
        title: "第3条：未成年者の購入について",
        content: "18歳未満の方が保護者（親権者）の同意なく有料のサービスを購入した場合、法律に基づき、本人または保護者が契約を取り消せる場合が有ります。",
        items: [
            "取消や返金のご相談は、お問い合わせフォームからご連絡ください。内容を確認のうえ、個別に対応します。",
            "カードをお持ちでない方向けの決済手段を利用する場合も、保護者の同意を得た上でご購入ください。",
            "Rhingは、購入時に年齢の確認や収集を行いません。そのため、18歳未満の方は、購入前に保護者へご確認ください。",
        ],
    },
    { title: "第4条：アカウント管理", content: "ユーザーは、Rhing Seedとそれに関連するログイン情報を厳重に管理する責任を負います。第三者による不正利用が判明した場合、速やかにRhingに報告してください。" },
    {
        title: "第5条：禁止事項",
        content: "以下の行為を禁止します。",
        items: [
            "法令に違反する行為",
            "犯罪行為に関連する行為",
            "他者の権利を侵害する行為",
            "誹謗中傷、ハラスメント",
            "スパム送信、迷惑行為",
            "虚偽の情報を流布する行為",
            "本サービスの運営を妨害する行為",
        ],
    },
    { title: "第6条：コンテンツの権利", content: "ユーザーが投稿したコンテンツの著作権は、ユーザーに帰属します。Rhingは、ユーザー自身の指示に基づく保存・表示以外の目的でコンテンツを使用することは無く、宣伝・二次利用・販売・第三者への提供・AI学習等、Rhing自身の目的の為に利用することは一切有りません。" },
    {
        title: "第7条：画面公開について",
        content: "ユーザーは、以下の条件を満たす場合、本サービスの画面を公開出来ます。",
        items: [
            "対話相手の事前同意を得ること",
            "相手の希望が有る場合、個人を特定出来る情報にマスキング処理を施すこと",
            "誹謗中傷や悪意有る編集をしないこと",
        ],
    },
    {
        title: "第8条：他社のサービス名・ロゴについて",
        content: "本サービス内に表示される他社のサービス名やロゴ、例えばユーザーが登録したリンクの横に表示されるものは、各社の商標または登録商標であり、各権利者に帰属します。",
        items: [
            "Rhingは、各社と、提携・協力・後援・推奨のいずれの関係にも有りません。ロゴの表示は、ユーザーが登録したリンク先を分かりやすくする目的に限ります。",
            "権利者から求めが有った場合、Rhingは、該当するロゴの表示を変更または停止することが有ります。",
        ],
    },
    {
        title: "第9条：意匠の投稿と配信",
        content: "意匠は、DaiDaiの色・形・背景を着せ替える、デザインです。ユーザーは、次の条件で、意匠を投稿出来ます。",
        items: [
            "自分で作った素材であるか、投稿に必要な許諾を得た素材であること。",
            "素材の著作権は、投稿者に帰属します。Rhingには、配信と表示の為の許諾だけを与えるものとします。",
            "公開は、Rhingの審査の後に行います。基準に合わない意匠は、公開しないことが有ります。差し戻した場合は、理由をお知らせで伝えます。",
            "投稿者は、公開した意匠を、いつでも取り下げられます。取り下げた後も、既に取得した人は、使い続けられます。",
            "権利の侵害が確認された場合、Rhingは、意匠の配信を停止し、取得した人の表示を標準に戻すことが有ります。",
            "アカウントを削除すると、投稿した意匠は、公開中のものを含めて削除されます。取得していた人の表示は、標準に戻ります。",
            "最初の公開は、無料の意匠に限ります。有料の配信は、別に定めます。",
        ],
    },
    { title: "第10条：免責事項", content: "Rhingは、本サービスの完全性、正確性、有用性を保証しません。ユーザー間のトラブルについて、Rhingは一切の責任を負いません。天災、戦争、通信障害等によるサービス停止について、Rhingは責任を負いません。詳細は別途免責事項に記載とする。" },
    { title: "第11条：規約の変更", content: "Rhingは、必要に応じて本規約を変更することができます。変更する際には、運営メッセージ・公式Discordサーバーを通じて事前にユーザーに通知します。" },
    { title: "第12条：準拠法・管轄裁判所", content: "本規約は、日本国法に準拠します。本サービスに関する紛争は、長野地方裁判所を専属的合意管轄裁判所とします。" },
];

export default function TermsPage() {
    return (
        <div className="container mx-auto px-6 pb-32 max-w-4xl">
            {/* ページタイトル。ブロックは付けない（概要ページに揃える）。題が長いので、イラストは、題と重ならない大きさにして、lg以上だけに出す */}
            <div className="mb-16 relative flex flex-col items-center justify-center text-center md:min-h-40 lg:min-h-48">
                <Illustration name="terms" className="hidden lg:block absolute left-0 top-1/2 -translate-y-1/2 w-32 h-auto" />
                <h1 className="text-4xl md:text-5xl font-bold tracking-widest text-on-surface mb-4">TERMS OF SERVICE</h1>
                <p className="text-on-surface-subtle tracking-wider text-sm">利用規約</p>
            </div>

            {/* 条文リスト */}
            <div className="space-y-12">
                {terms.map((term, index) => (
                    /* 
                      🌟 修正ポイント2: 条文カードをガラスデザイン仕様に変更 
                      - 黒の太い左境界線（border-l-4 border-l-gray-900）は維持しています。
                      - bg-surface-container-lowest/40 (半透明), backdrop-blur-md, border-glass-edge/80 (他3辺の境界線) を設定しています。
                      - ホバー時には、明るいガラス（hover:bg-surface-container-lowest/60）とほのかなブルーの影（hover:shadow-blue-300/10）へ滑らかに遷移します。
                    */
                    <section
                        key={index}
                        className="bg-surface-container-lowest/40 backdrop-blur-md p-8 md:p-10 border border-glass-edge/80 border-l-4 border-l-gray-900 shadow-elevation-1 rounded-r-m3-lg hover:bg-surface-container-lowest/60 hover:shadow-elevation-3 transition-all duration-500"
                    >
                        {/* 🌟 区切り線をガラスの透過率に合うように微調整 */}
                        <h3 className="text-xl font-bold text-on-surface mb-6 tracking-wide border-b border-on-surface/10 pb-4">
                            {term.title}
                        </h3>
                        <p className="text-on-surface-variant leading-relaxed text-lg font-medium">
                            {term.content}
                        </p>
                        {term.items && (
                            <ol className="list-decimal pl-6 mt-4 space-y-2 text-on-surface-variant leading-relaxed text-lg font-medium">
                                {term.items.map((item, i) => (
                                    <li key={i}>{item}</li>
                                ))}
                            </ol>
                        )}
                    </section>
                ))}
            </div>
        </div>
    );
}