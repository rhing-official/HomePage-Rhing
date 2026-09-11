export {};

// reCAPTCHA v3の型定義。npmパッケージが無いため必要最小限を自前で宣言する。
// https://developers.google.com/recaptcha/docs/v3
declare global {
    interface Window {
        grecaptcha?: {
            ready(callback: () => void): void;
            execute(siteKey: string, options: { action: string }): Promise<string>;
        };
    }
}
