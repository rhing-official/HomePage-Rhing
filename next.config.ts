import type { NextConfig } from "next";
import path from "path"; // 追加

const nextConfig: NextConfig = {
  turbopack: {
    // path.resolve(__dirname) を使うことで現在のディレクトリを絶対パスに変換します
    root: path.resolve(__dirname),
  },
  // Firebaseの認証画面を、このドメイン経由にする（Googleログインを、同じタブのリダイレクトで行うため。
  // DaiDaiのcloudflare/worker.jsの`proxyFirebaseAuth`と同じ。src/lib/authRedirect.ts参照）
  async rewrites() {
    return [
      { source: "/__/auth/:path*", destination: "https://daidai-rhing.firebaseapp.com/__/auth/:path*" },
      { source: "/__/firebase/:path*", destination: "https://daidai-rhing.firebaseapp.com/__/firebase/:path*" },
    ];
  },
  async redirects() {
    return [
      // 受託開発をHP制作・アプリ制作に分けたため、旧URLは一覧の受託タブへ
      { source: "/services/contract", destination: "/services?tab=contract", permanent: true },
    ];
  },
};

export default nextConfig;