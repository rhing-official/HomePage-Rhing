import type { Metadata } from "next";
import NoticesClient from "./NoticesClient";

export const metadata: Metadata = {
    title: "お知らせ | daidai横丁",
    robots: { index: false, follow: false },
};

export default function NoticesPage() {
    return <NoticesClient />;
}
