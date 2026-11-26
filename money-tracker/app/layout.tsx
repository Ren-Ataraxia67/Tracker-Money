import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Moneta Catat Cuan",
  description: "Aplikasi pencatat pemasukan dan pengeluaran",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-screen bg-gray-50 text-gray-900 overflow-x-hidden">
        <div className="min-h-screen flex flex-col lg:flex-row">
          <Sidebar />
          <main className="flex-1 lg:ml-64 min-w-0 pb-20 md:pb-0">
            <div className="max-w-5xl mx-auto px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-8">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
