// Googleログインを、ポップアップではなく同じタブのリダイレクトで行う本番ドメイン（2026-11-17）。
// Linuxのブラウザで、ポップアップがブラウザ本体の背面に出てしまうことがあり、ページ側から
// 前面に出す方法が無いため。DaiDaiのWeb版（lib/utils/web_redirect_sign_in.dart）と同じ方式。
// Firebaseの認証画面（/__/auth/*）は、next.config.tsのrewritesで、このドメイン経由にしている
// （別ドメインの認証画面から戻ると、ブラウザのストレージ分離でログイン状態を取れないため）。
// 他のドメイン（localhost・Vercelのプレビュー）は、中継が通らないので、従来のGISのボタンのまま。
export const AUTH_REDIRECT_HOSTS = ["rhing.jp", "www.rhing.jp"];

export function isAuthRedirectHost(hostname: string): boolean {
    return AUTH_REDIRECT_HOSTS.includes(hostname);
}
