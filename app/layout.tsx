import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { StickyCartSummary } from '@/components/cart/StickyCartSummary';
import { BottomNav } from '@/components/layout/BottomNav';

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
    title: "Natura DirectSales",
    description: "Plataforma para consultoras de venta directa",
    manifest: "/manifest.webmanifest",
    appleWebApp: {
        capable: true,
        statusBarStyle: "default",
        title: "Natura DirectSales",
    },
};

export const viewport: Viewport = {
    themeColor: "#F48221",
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false, // App-like feel
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={inter.className}>
                {children}
                <StickyCartSummary />
                <BottomNav />
            </body>
        </html>
    );
}
