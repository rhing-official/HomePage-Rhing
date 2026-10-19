import { getFinancialData } from "@/lib/financial";
import FinancialClient from "./FinancialClient";

export const dynamic = "force-dynamic";

export default async function FinancialPage() {
    const years = await getFinancialData();

    return (
        <div className="container mx-auto px-6 pb-24 max-w-5xl">
            {/* ページタイトル */}
            <div className="mb-12 text-center">
                <h1 className="text-4xl md:text-5xl font-bold tracking-widest text-gray-900 mb-4">FINANCIAL</h1>
                <p className="text-gray-500 tracking-wider text-sm">収支報告</p>
            </div>

            <FinancialClient years={years} />
        </div>
    );
}
