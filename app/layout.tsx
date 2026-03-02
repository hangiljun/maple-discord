import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./components/Navbar";

export const metadata: Metadata = {
  title: "메이플 디스코드",
  description: "메이플랜드 실시간 거래 커뮤니티",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="bg-[#121212] text-white antialiased min-h-screen">
        <Navbar />
        {children}
      </body>
    </html>
  );
}