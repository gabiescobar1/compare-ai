import { Inter, Merriweather } from "next/font/google";
import Navigation from "@/components/Navigation";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const merriweather = Merriweather({ weight: ['300', '400', '700', '900'], subsets: ["latin"], variable: "--font-merriweather" });

export const metadata = {
  title: "CompareAI - Resumos Acadêmicos",
  description: "Análise avançada e acadêmica de artigos Plos One.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${merriweather.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 font-sans">
        <Navigation />
        {children}
      </body>
    </html>
  );
}
