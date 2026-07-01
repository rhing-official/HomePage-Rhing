import { Github } from "lucide-react";

export const siteConfig = {
    // ページごとのヘッダーカラー設定（一時的にすべて #333333）
    headerColors: {
        home: "#333333",
        about: "#333333",
        services: "#333333",
        financial: "#333333",
        recruit: "#333333",
        store: "#333333",
        contact: "#333333",
        legal: "#333333",
    },
    // Formspree等のエンドポイントURL（後で取得して入れ替えます）
    formEndpoint: "https://formspree.io/f/your_endpoint_here",
    // SNSリンク
    socialLinks: {
        note: "https://note.com/rhing_official",
        youtube: "https://www.youtube.com/@rhing_official",
        instagram: "https://www.instagram.com/rhing_official/",
        x: "https://x.com/rhing_official",
        github: "https://github.com/rhing-official"
    }
};