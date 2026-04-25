import Link from 'next/link';
import { IconHome, IconListDetails, IconBook } from '@tabler/icons-react';

export default function Navigation() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-[#291f1b] font-serif font-black text-xl tracking-tight hover:opacity-80 transition-opacity">
          <IconBook className="w-6 h-6" />
          <span>Compare AI</span>
        </Link>
        
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-[#291f1b] hover:opacity-80 transition-opacity uppercase tracking-wider">
            <IconHome className="w-4 h-4" /> Home
          </Link>
          <div className="w-[1px] h-4 bg-slate-300"></div>
          <Link href="/resultados" className="flex items-center gap-2 text-sm font-semibold text-[#291f1b] hover:opacity-80 transition-opacity uppercase tracking-wider">
            <IconListDetails className="w-4 h-4" /> Histórico
          </Link>
        </div>
      </div>
    </nav>
  );
}
