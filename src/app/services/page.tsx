import { Metadata } from "next";
import { Suspense } from "react";
import ServicesTabs from "./ServicesTabs";

export const metadata: Metadata = {
    title: "サービス紹介 | Rhing",
    description: "Rhingが提供するサービスについて",
};

export default function ServicesPage() {
    return (
        <div className="w-full pb-24">
            {/* ページタイトル */}
            <div className="container mx-auto px-6 pb-24 max-w-4xl">
                <div className="mb-16 relative flex flex-col items-center justify-center text-center md:min-h-40 lg:min-h-48">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/illustrations/mobile-app.svg" alt="" className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 w-48 lg:w-56 h-auto" />
                    <h1 className="text-4xl md:text-5xl font-bold tracking-widest text-gray-900 mb-4">SERVICES</h1>
                    <p className="text-gray-500 tracking-wider text-sm">サービス紹介</p>
                </div>
            </div>

            <Suspense>
                <ServicesTabs />
            </Suspense>
        </div>
    );
}
