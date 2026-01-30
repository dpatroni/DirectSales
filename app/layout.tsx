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
        <html lang="es" className="light">
            <head>
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
                <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />
            </head>
            <body className={inter.className}>
                {children}
                <StickyCartSummary />
                <BottomNav />
            </body>
        </html>
    );
}
