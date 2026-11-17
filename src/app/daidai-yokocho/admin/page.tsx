import type { Metadata } from "next";
import AdminClient from "./AdminClient";

export const metadata: Metadata = {
    title: "管理画面 | daidai横丁 | Rhing",
    // 運営だけが使う画面なので、検索には出さない
    robots: { index: false, follow: false },
};

export default function DaidaiYokochoAdminPage() {
    return <AdminClient />;
}
