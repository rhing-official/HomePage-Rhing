import { describe, expect, it } from "vitest";
import { isAuthRedirectHost } from "./authRedirect";

describe("isAuthRedirectHost", () => {
    it("本番ドメインだけがリダイレクト方式", () => {
        expect(isAuthRedirectHost("rhing.jp")).toBe(true);
        expect(isAuthRedirectHost("www.rhing.jp")).toBe(true);
        expect(isAuthRedirectHost("localhost")).toBe(false);
        expect(isAuthRedirectHost("homepage-rhing-git-main.vercel.app")).toBe(false);
        expect(isAuthRedirectHost("evil-rhing.jp")).toBe(false);
    });
});
