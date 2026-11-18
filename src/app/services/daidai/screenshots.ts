// DaiDaiページのスクリーンショット。ページの並び順のまま、拡大表示の1つの組になる（ScreenshotViewer）。
export const screenshots = {
    home: { src: "/screenshots/daidai/home-desktop.webp", alt: "デスクトップのホーム画面。左に一対と広場の一覧、右に会話の画面が並んでいる" },
    suggest: { src: "/screenshots/daidai/suggest-desktop.webp", alt: "チャット画面の入力欄の上に、入力中のメッセージに合わせたぺったんが2つ提案されている" },
    call: { src: "/screenshots/daidai/call-desktop.webp", alt: "ビデオ通話の画面。画面共有とカメラの映像が4つのタイルに並び、下に操作ボタンが有る" },
    style: { src: "/screenshots/daidai/style-desktop.webp", alt: "使い心地の設定画面。外観・UIスタイル・アクセントカラー・フォント・言語などを選べる" },
    mobileTalks: { src: "/screenshots/daidai/mobile-talks.webp", alt: "スマホの画面。左に一対・広場のタブと一覧、右に広場のチャンネル、下にナビゲーションが有る" },
    mobileChat: { src: "/screenshots/daidai/mobile-chat.webp", alt: "スマホのチャット画面。ぺったんの画像と、通話が終了したお知らせが並んでいる" },
    mobileKura: { src: "/screenshots/daidai/mobile-kura.webp", alt: "スマホのプロフィール管理画面。プロフィールカードが1枚表示され、3枚中の1枚目と分かる" },
    mobileEnmusubi: { src: "/screenshots/daidai/mobile-enmusubi.webp", alt: "スマホの縁結びの画面。招待リンクとQRコードが表示されている" },
    login: { src: "/screenshots/daidai/login.webp", alt: "ログイン画面。Google・Apple・パスキー・QRコードのログインが選べる" },
} as const;

export const screenshotList = Object.values(screenshots).map((s) => ({ url: s.src, name: s.alt }));
