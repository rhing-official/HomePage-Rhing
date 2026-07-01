import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
    title: "メンバー募集 | Rhing",
    description: "Rhingのコミュニティメンバー募集要項と、募集中の職種・業務内容について",
};

// 募集職種のデータ（マークダウンの内容を反映）
const positions = [
    {
        title: "エンジニア",
        en: "ENGINEER",
        criteria: [
            "Flutterを用いたアプリ開発",
            "バグや脆弱性の発見と修正",
            "何よりも募集しています"
        ],
    },
    {
        title: "法務",
        en: "LEGAL",
        criteria: [
            "団体運営に関わる法務業務全般",
            "規約の作成・レビュー等",
        ],
    },
    {
        title: "広報",
        en: "PUBLIC RELATIONS",
        criteria: [
            "団体の活動やサービスの広報活動",
            "ホームページ更新",
        ],
    },
    {
        title: "経理",
        en: "ACCOUNTING",
        criteria: [
            "収支管理および月次・年次の財務報告作成",
        ],
    },
    {
        title: "ユーザーサポーター",
        en: "COMMUNITY MANAGER",
        criteria: [
            "アプリのユーザーサポート",
        ],
    },
    {
        title: "デザイナー",
        en: "DESIGNER",
        criteria: [
            "ロゴ制作",
            "アプリUI/UXデザイン",
        ],
    },
];

export default function RecruitPage() {
    return (
        <div className="w-full pb-24">
            {/* ページタイトル */}
            <div className="container mx-auto px-6 py-24 max-w-4xl">
                <div className="mb-16 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-widest text-gray-900 mb-4">COMM</h1>
                    <p className="text-gray-500 tracking-wider text-sm">コミュニティメンバー募集</p>
                </div>
            </div>

            {/* 要項セクション */}
            <section className="container mx-auto px-6 max-w-4xl pt-0 pb-16 mb-24">
                <h2 className="text-2xl font-bold mb-10 tracking-widest border-b border-gray-200 pb-4 text-gray-900">
                    REQUIREMENTS
                    <span className="block text-sm text-gray-500 font-normal mt-2 tracking-normal">求める人物像・要項</span>
                </h2>

                <div className="space-y-10">
                    <h3 className="text-2xl md:text-3xl font-bold leading-relaxed tracking-wide text-gray-900">
                        豊かな発想力・<br className="md:hidden" />多角的な視点・問題解決能力
                    </h3>

                    <div className="space-y-8 text-gray-700 leading-loose text-lg font-medium">
                        <p>
                            一つの正解に縛られず、社会をより良くする為に何が最善かを考え抜ける力。<br />
                            自分が実現したいと思った事の問題点を洗い出し、それにどのような対策を打てば良いのか考え抜く<strong className="text-gray-900">思考力と集中力</strong>を兼ね備える方を募集します。
                        </p>

                        <p>
                            そうは言っても現在は夢がでかいだけの学生1人の運営ですので、実力をお持ちの方・理念に共感してくださる方の協力を随時受け付けております。利益が出るようになれば、コミュニティメンバー方には相応の対価を支払いたいと考えています。
                        </p>
                    </div>
                </div>
            </section>

            {/* 募集職種セクション */}
            {/* 🌟 max-w-5xl を max-w-4xl に変更して左位置を揃えました */}
            <section className="container mx-auto px-6 max-w-4xl mb-32">
                <h2 className="text-2xl font-bold mb-12 tracking-widest border-b border-gray-200 pb-4 text-gray-900">
                    ROLES
                    <span className="block text-sm text-gray-500 font-normal mt-2 tracking-normal">主な業務内容と採用基準</span>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {positions.map((pos, index) => (
                        <div key={index} className="bg-[#f8f8f8] p-8 rounded-xl border border-gray-100 hover:shadow-md transition-shadow duration-300">
                            <div className="mb-6">
                                <span className="text-xs font-bold tracking-widest text-gray-400 block mb-1">{pos.en}</span>
                                <h3 className="text-xl font-bold text-gray-900 tracking-wide">{pos.title}</h3>
                            </div>

                            <ul className="space-y-3">
                                {pos.criteria.map((item, i) => (
                                    <li key={i} className="flex items-start text-gray-700 text-sm md:text-base leading-relaxed">
                                        <span className="mr-3 text-[#111] mt-1">■</span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </section>

            {/* === 応募フォームセクション === */}
            <section className="container mx-auto px-6 max-w-3xl" id="apply-form">
                <div className="mt-48 max-w-3xl mx-auto px-6" id="apply-form">

                    {/* タイトルエリア：mb-12 を mb-16 にしてフォームとの間隔を確保 */}
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold tracking-[0.2em] text-gray-900 mb-6">
                            APPLICATION FORM
                        </h2>
                        <p className="text-gray-500 tracking-widest text-sm">
                            メンバー応募フォーム
                        </p>
                    </div>

                    {/* 注意書き：セクション全体の中で少し独立させるために margin を調整 */}
                    <div className="bg-blue-50/50 border border-blue-100 p-8 mb-16 rounded-2xl">
                        <ul className="text-sm text-blue-900 space-y-4 leading-relaxed font-medium">
                            <li className="flex items-start">
                                <span className="mr-3 mt-0.5">※</span>
                                ご入力いただいた本名は、コミュニティ内での個人の把握以外には一切使用いたしません。
                            </li>
                            <li className="flex items-start">
                                <span className="mr-3 mt-0.5">※</span>
                                加入が決定した方には、専用のDiscordサーバーへご案内いたします。
                            </li>
                        </ul>
                    </div>

                    {/* 
                      Web3Formsへの送信フォーム
                      action="https://api.web3forms.com/submit" にPOST送信するだけでメールが届きます。
                    */}
                    <form action="https://api.web3forms.com/submit" method="POST" className="space-y-8 bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100">

                        {/* アクセスキー */}
                        <input type="hidden" name="access_key" value="5747097d-158d-472e-aefb-f71257e24039" />

                        {/* メールの件名を固定（ProtonMailでこの件名でフィルタ・ラベル付けします） */}
                        <input type="hidden" name="subject" value="【加入希望】コミュニティメンバー応募" />
                        {/* スパム対策用の隠しフィールド */}
                        <input type="checkbox" name="botcheck" className="hidden" style={{ display: 'none' }} />

                        {/* ハンドルネーム（必須） */}
                        <div>
                            <label htmlFor="handleName" className="block text-sm font-bold text-gray-700 mb-2">ハンドルネーム <span className="text-red-500 ml-1 text-xs font-normal">必須</span></label>
                            <input type="text" id="handleName" name="ハンドルネーム" required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors" placeholder="例：Rhing太郎" />
                        </div>

                        {/* メールアドレス（必須） */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2">メールアドレス <span className="text-red-500 ml-1 text-xs font-normal">必須</span></label>
                            <input type="email" id="email" name="メールアドレス" required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors" placeholder="例：your-email@example.com" />
                        </div>

                        {/* 学習中・得意な技術（記述式・必須） */}
                        <div>
                            <label htmlFor="skills" className="block text-sm font-bold text-gray-700 mb-2">現在学習中、または得意な技術 <span className="text-red-500 ml-1 text-xs font-normal">必須</span></label>
                            <textarea id="skills" name="得意な技術・学習中の技術" required rows={3} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors resize-none" placeholder="例：Flutterを半年間学習中。Reactでのフロントエンド開発が得意です。"></textarea>
                        </div>

                        {/* 活動可能な時間（選択式・任意） */}
                        <div>
                            <label htmlFor="activeTime" className="block text-sm font-bold text-gray-700 mb-2">活動可能な時間 <span className="text-gray-400 ml-1 text-xs font-normal">任意</span></label>
                            <select id="activeTime" name="活動可能な時間" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors appearance-none cursor-pointer">
                                <option value="未選択">選択してください</option>
                                <option value="週1〜2時間程度">週1〜2時間程度</option>
                                <option value="週3〜5時間程度">週3〜5時間程度</option>
                                <option value="週6時間以上">週6時間以上</option>
                                <option value="平日夜メイン">平日夜メイン</option>
                                <option value="土日メイン">土日メイン</option>
                            </select>
                        </div>

                        {/* 加入理由・成し遂げたいこと（記述式・必須） */}
                        <div>
                            <label htmlFor="reason" className="block text-sm font-bold text-gray-700 mb-2">加入理由・このコミュニティで成し遂げたいこと <span className="text-red-500 ml-1 text-xs font-normal">必須</span></label>
                            <textarea id="reason" name="加入理由・成し遂げたいこと" required rows={5} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors resize-none" placeholder="例：Rhingの理念である「結」の精神に共感し..."></textarea>
                        </div>

                        {/* GitHubやポートフォリオのURL（任意） */}
                        <div>
                            <label htmlFor="portfolio" className="block text-sm font-bold text-gray-700 mb-2">GitHubやポートフォリオのURL <span className="text-gray-400 ml-1 text-xs font-normal">任意</span></label>
                            <input type="url" id="portfolio" name="ポートフォリオURL" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors" placeholder="https://github.com/..." />
                        </div>

                        {/* 本名（任意） */}
                        <div>
                            <label htmlFor="realName" className="block text-sm font-bold text-gray-700 mb-2">本名 <span className="text-gray-400 ml-1 text-xs font-normal">任意</span></label>
                            <input type="text" id="realName" name="本名" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors" placeholder="例：山田 太郎" />
                        </div>

                        {/* 送信ボタン */}
                        <div className="pt-6 text-center">
                            <button type="submit" className="w-full md:w-auto px-12 py-4 bg-[#111] hover:bg-gray-800 text-white font-bold rounded-full transition-colors tracking-widest">
                                応募内容を送信する
                            </button>
                        </div>
                    </form>
                </div>
            </section>
        </div>
    );
}