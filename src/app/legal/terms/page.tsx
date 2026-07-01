import { Metadata } from "next";

export const metadata: Metadata = {
    title: "利用規約 | Rhing",
    description: "Rhingをご利用いただく際の利用規約です。",
};

const terms = [
    { title: "第1条：定義", content: "「Rhing」とは、本サービスを運営する事業主を指します。「ユーザー」とは、本サービスを利用するすべてのユーザーを指します。「語らい」とは、ユーザー同士のメッセージのやり取りを指します。" },
    { title: "第2条：利用資格", content: "ユーザーは、自己の責任において本サービスを利用するものとします。13歳未満の方は、保護者の同意を得た上でご利用ください。" },
    { title: "第3条：アカウント管理", content: "ユーザーは、Rhing IDとパスワードを厳重に管理する責任を負います。第三者による不正利用が判明した場合、速やかにRhingに報告してください。" },
    { title: "第4条：禁止事項", content: "以下の行為を禁止します：1.法令に違反する行為、2.犯罪行為に関連する行為、3.他者の権利を侵害する行為、4.誹謗中傷、ハラスメント、5.スパム送信、迷惑行為、6.虚偽の情報を流布する行為、7.本サービスの運営を妨害する行為。" },
    { title: "第5条：コンテンツの権利", content: "ユーザーが投稿したコンテンツの著作権は、ユーザーに帰属します。Rhingは、サービス提供のために必要な範囲でコンテンツを利用できるものとします。" },
    { title: "第6条：画面公開について", content: "ユーザーは、以下の条件を満たす場合、本サービスの画面を公開できます：1.対話相手（クリエイター含む）の事前同意を得ること、2.個人を特定できる情報にマスキング処理を施すこと、3.誹謗中傷や悪意ある編集をしないこと。" },
    { title: "第7条：AI監視とアカウント停止", content: "Rhingは、スパムや違法コンテンツを検出するためにAI監視を行います。違反が確認された場合、警告なしにアカウントを停止・削除することがあります。誤検知と思われる場合、異議申し立て機能をご利用ください。" },
    { title: "第8条：免責事項", content: "Rhingは、本サービスの完全性、正確性、有用性を保証しません。ユーザー間のトラブルについて、Rhingは一切の責任を負いません。天災、戦争、通信障害等によるサービス停止について、Rhingは責任を負いません。" },
    { title: "第9条：規約の変更", content: "Rhingは、必要に応じて本規約を変更することができます。重要な変更については、運営メッセージを通じて事前にユーザーに通知します。" },
    { title: "第10条：準拠法・管轄裁判所", content: "本規約は、日本国法に準拠します。本サービスに関する紛争は、長野地方裁判所を専属的合意管轄裁判所とします。" },
];

export default function TermsPage() {
    return (
        <div className="container mx-auto px-6 py-32 max-w-4xl">
            {/* ページタイトル */}
            <div className="mb-24 text-center">
                <h1 className="text-4xl md:text-5xl font-bold tracking-widest text-gray-900 mb-4">TERMS OF SERVICE</h1>
                <p className="text-gray-500 tracking-wider text-sm">利用規約</p>
            </div>

            {/* 条文リスト */}
            <div className="space-y-12">
                {terms.map((term, index) => (
                    <section
                        key={index}
                        className="bg-white p-8 md:p-10 border-l-4 border-gray-900 shadow-sm rounded-r-2xl"
                    >
                        <h3 className="text-xl font-bold text-gray-900 mb-6 tracking-wide border-b border-gray-100 pb-4">
                            {term.title}
                        </h3>
                        <p className="text-gray-700 leading-relaxed text-lg font-medium">
                            {term.content}
                        </p>
                    </section>
                ))}
            </div>
        </div>
    );
}