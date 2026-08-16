import DaidaiYokochoMenu from "@/components/daidai-yokocho/DaidaiYokochoMenu";

export default function DaidaiYokochoLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            {children}
            <DaidaiYokochoMenu />
        </>
    );
}
