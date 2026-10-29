import CartProvider from "@/components/CartProvider";
import DaidaiYokochoMenu from "@/components/daidai-yokocho/DaidaiYokochoMenu";

export default function DaidaiYokochoLayout({ children }: { children: React.ReactNode }) {
    return (
        // カート（Firestoreの監視）は、トップとdaidai横丁の中だけで読み込む
        <CartProvider>
            {children}
            <DaidaiYokochoMenu />
        </CartProvider>
    );
}
