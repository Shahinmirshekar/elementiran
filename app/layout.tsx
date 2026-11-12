import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import type { ReactNode } from "react";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import "./globals.css";

const vazir = Vazirmatn({ subsets: ["arabic", "latin"], variable: "--font-vazir", display: "swap" });

export const metadata: Metadata = {
  title: { default: "المنتیران | مهندسی گرما", template: "%s | المنتیران" },
  description: "کابل حرارتی، گرمایش از کف برقی، گرم‌کن ضد بخار آینه، حوله گرم‌کن برقی و المنت صنعتی.",
  // Design preview: keep it out of search engines so it cannot compete with the live site.
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fa" dir="rtl" className={vazir.variable}>
      <body>
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-heat focus:p-3 focus:text-coal">رفتن به محتوا</a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
