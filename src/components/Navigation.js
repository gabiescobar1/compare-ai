import Link from 'next/link';
import { IconHome, IconListDetails, IconBook, IconInfoCircle } from '@tabler/icons-react';

export default function Navigation() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-[#1c1008]/97 backdrop-blur-sm border-b border-slate-200 dark:border-white/8 shadow-sm px-6 py-4 transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-[#291f1b] dark:text-[#f0e4d4] font-serif font-black text-xl tracking-tight hover:opacity-80 transition-opacity">
          <IconBook className="w-6 h-6" />
          <span>Compare AI</span>
        </Link>

        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-[#291f1b] dark:text-[#f0e4d4] hover:opacity-80 transition-opacity uppercase tracking-wider">
            <IconHome className="w-4 h-4" /> Home
          </Link>
          <div className="w-[1px] h-4 bg-slate-300 dark:bg-white/15"></div>
          <Link href="/resultados" className="flex items-center gap-2 text-sm font-semibold text-[#291f1b] dark:text-[#f0e4d4] hover:opacity-80 transition-opacity uppercase tracking-wider">
            <IconListDetails className="w-4 h-4" /> Histórico
          </Link>
          <div className="w-[1px] h-4 bg-slate-300 dark:bg-white/15"></div>
          <Link href="/instrucoes" className="flex items-center gap-2 text-sm font-semibold text-[#291f1b] dark:text-[#f0e4d4] hover:opacity-80 transition-opacity uppercase tracking-wider">
            <IconInfoCircle className="w-4 h-4" /> Como Usar
          </Link>
          <div className="w-[1px] h-4 bg-slate-300 dark:bg-white/15"></div>
          <Link
            href="/minha-conta"
            className="flex items-center gap-2 text-sm font-semibold text-[#291f1b] dark:text-[#f0e4d4] border border-[#291f1b]/30 dark:border-[#f0e4d4]/25 rounded-full pl-1.5 pr-3 py-1 hover:bg-[#291f1b]/5 dark:hover:bg-white/8 transition-colors"
          >
            <span className="w-6 h-6 rounded-full bg-[#ff6b00] flex items-center justify-center text-white text-[10px] font-black leading-none select-none">
              GE
            </span>
            <span className="uppercase tracking-wider">Minha Conta</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
