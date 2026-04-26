import { Inter, Montserrat } from "next/font/google";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ThemeProvider from "@/components/ThemeProvider";
import ThemeToggle from "@/components/ThemeToggle";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-montserrat" });

export const metadata = {
  title: "CompareAI - Resumos Acadêmicos",
  description: "Análise avançada e acadêmica de artigos Plos One.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${montserrat.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col text-slate-900 font-sans">
        <ThemeProvider>
          <Navigation />
          <ThemeToggle />
          {children}
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
