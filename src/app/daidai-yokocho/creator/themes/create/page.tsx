import { Suspense } from "react";
import type { Metadata } from "next";
import ThemePackCreateForm from "./ThemePackCreateForm";

export const metadata: Metadata = {
    title: "意匠を作る | daidai横丁",
    robots: { index: false, follow: false },
};

export default function CreateThemePackPage() {
    return (
        <Suspense>
            <ThemePackCreateForm />
        </Suspense>
    );
}
