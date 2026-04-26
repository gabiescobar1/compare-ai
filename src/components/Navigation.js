import Link from 'next/link';
import { 
  IconHome, 
  IconListDetails, 
  IconBook, 
  IconInfoCircle, 
  IconChevronDown, 
  IconChartBar, 
  IconHistory 
} from '@tabler/icons-react';
import ThemeToggle from '@/components/ThemeToggle';

export default function Navigation() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-[#251605]/97 backdrop-blur-sm border-b border-stone-200 dark:border-white/8 shadow-sm px-6 py-4 transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-[#1C1008] dark:text-[#f0e4d4] font-serif font-black text-xl tracking-tight hover:opacity-80 transition-opacity">
          <IconBook className="w-6 h-6" />
          <span>Compare AI</span>
        </Link>

        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-[#1C1008] dark:text-[#f0e4d4] hover:opacity-80 transition-opacity uppercase tracking-wider">
            <IconHome className="w-4 h-4" /> Home
          </Link>
          <div className="w-[1px] h-4 bg-stone-300 dark:bg-white/15"></div>
          
          {/* Dropdown Histórico */}
          <div className="relative group">
            <div className="flex items-center gap-1.5 cursor-pointer text-sm font-semibold text-[#1C1008] dark:text-[#f0e4d4] hover:opacity-80 transition-opacity uppercase tracking-wider py-1">
              <IconListDetails className="w-4 h-4" /> Histórico
              <IconChevronDown className="w-3.5 h-3.5 transition-transform group-hover:rotate-180" />
            </div>
            
            {/* Soft Dropdown Menu */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-1">
              <div className="bg-white/95 dark:bg-[#211307]/98 backdrop-blur-md border border-stone-200 dark:border-white/10 rounded-2xl shadow-xl p-2 min-w-[180px]">
                <Link 
                  href="/resultados" 
                  className="flex items-center gap-2.5 px-4 py-3 text-xs font-black text-[#1C1008] dark:text-[#f0e4d4] hover:bg-[#1C1008]/5 dark:hover:bg-white/5 rounded-xl transition-colors uppercase tracking-widest"
                >
                  <IconHistory className="w-4 h-4" /> Histórico
                </Link>
                <Link 
                  href="/analytics" 
                  className="flex items-center gap-2.5 px-4 py-3 text-xs font-black text-[#1C1008] dark:text-[#f0e4d4] hover:bg-[#1C1008]/5 dark:hover:bg-white/5 rounded-xl transition-colors uppercase tracking-widest"
                >
                  <IconChartBar className="w-4 h-4 text-[#ff6b00]" /> Analytics
                </Link>
              </div>
            </div>
          </div>

          <div className="w-[1px] h-4 bg-stone-300 dark:bg-white/15"></div>
          <Link href="/instrucoes" className="flex items-center gap-2 text-sm font-semibold text-[#1C1008] dark:text-[#f0e4d4] hover:opacity-80 transition-opacity uppercase tracking-wider">
            <IconInfoCircle className="w-4 h-4" /> Como Usar
          </Link>
          <div className="w-[1px] h-4 bg-stone-300 dark:bg-white/15"></div>
          <Link
            href="/minha-conta"
            className="flex items-center gap-2 text-sm font-semibold text-[#1C1008] dark:text-[#f0e4d4] border border-[#1C1008]/30 dark:border-[#f0e4d4]/25 rounded-full pl-1.5 pr-3 py-1 hover:bg-[#1C1008]/5 dark:hover:bg-white/8 transition-colors"
          >
            <span className="w-6 h-6 rounded-full bg-[#ff6b00] flex items-center justify-center text-white text-[10px] font-black leading-none select-none">
              GE
            </span>
            <span className="uppercase tracking-wider">Minha Conta</span>
          </Link>

          <div className="w-[1px] h-4 bg-stone-300 dark:bg-white/15"></div>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
