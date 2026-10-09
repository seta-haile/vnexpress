import type { Metadata } from "next";
import { Inter, Merriweather } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const merriweather = Merriweather({
  variable: "--font-serif",
  weight: ["300", "400", "700", "900"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VnE Reader - Học Tiếng Anh Qua Báo VnExpress International",
  description: "Trải nghiệm học tiếng Anh qua tin tức báo chí thực tế từ VnExpress: tra từ điển 1-chạm, nghe audio Text-to-Speech chuẩn bản ngữ, phân tích CEFR và ôn tập Flashcard.",
  keywords: ["học tiếng anh", "vnexpress international", "ielts", "toeic", "flashcards", "reading english news"]
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={`${inter.variable} ${merriweather.variable} antialiased`}>
      <body className="min-h-screen bg-background text-foreground flex flex-col font-sans">
        <TooltipProvider>
          {children}
          <Toaster position="bottom-right" richColors />
        </TooltipProvider>
      </body>
    </html>
  );
}
