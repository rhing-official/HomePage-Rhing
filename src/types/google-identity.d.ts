export {};

// Google Identity Services (GIS)の型定義。npmパッケージが無いため必要最小限を自前で宣言する。
// https://developers.google.com/identity/gsi/web/reference/js-reference
declare global {
    interface Window {
        google?: {
            accounts: {
                id: {
                    initialize(config: {
                        client_id: string;
                        callback: (response: { credential: string }) => void;
                    }): void;
                    renderButton(
                        parent: HTMLElement,
                        options: {
                            type?: "standard" | "icon";
                            theme?: "outline" | "filled_blue" | "filled_black";
                            size?: "large" | "medium" | "small";
                            text?: "signin_with" | "signup_with" | "continue_with" | "signin";
                            shape?: "rectangular" | "pill" | "circle" | "square";
                            locale?: string;
                            width?: number;
                        },
                    ): void;
                };
            };
        };
    }
}
