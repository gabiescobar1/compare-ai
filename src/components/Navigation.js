'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  IconHome,
  IconListDetails,
  IconBook,
  IconInfoCircle,
  IconChartBar,
  IconMenu2,
  IconX,
} from '@tabler/icons-react';
import ThemeToggle from '@/components/ThemeToggle';

const LINKS = [
  { href: '/', label: 'Home', icon: IconHome },
  { href: '/resultados', label: 'Histórico', icon: IconListDetails },
  { href: '/analytics', label: 'Analytics', icon: IconChartBar },
  { href: '/instrucoes', label: 'Como Usar', icon: IconInfoCircle },
];

export default function Navigation() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  const linkClass = (href, base) =>
    `${base} ${
      isActive(href)
        ? 'text-accent'
        : 'text-ink dark:text-parchment hover:opacity-80'
    }`;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-cream/95 dark:bg-[#251605]/97 backdrop-blur-sm border-b border-stone-200 dark:border-white/8 shadow-sm px-6 py-4 transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-ink dark:text-parchment font-serif font-black text-xl tracking-tight hover:opacity-80 transition-opacity"
          onClick={() => setOpen(false)}
        >
          <IconBook className="w-6 h-6" />
          <span>Compare AI</span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6">
          {LINKS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              aria-current={isActive(href) ? 'page' : undefined}
              className={linkClass(
                href,
                'flex items-center gap-2 text-sm font-semibold uppercase tracking-wider transition-opacity'
              )}
            >
              <Icon className="w-4 h-4" /> {label}
            </Link>
          ))}
          <div className="w-[1px] h-4 bg-stone-300 dark:bg-white/15" />
          <ThemeToggle />
        </div>

        {/* Mobile controls */}
        <div className="flex md:hidden items-center gap-3">
          <ThemeToggle />
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={open}
            className="p-1.5 rounded-lg text-ink dark:text-parchment hover:bg-ink/5 dark:hover:bg-white/8 transition-colors"
          >
            {open ? <IconX className="w-6 h-6" /> : <IconMenu2 className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="md:hidden mt-4 pt-4 border-t border-stone-200 dark:border-white/8 flex flex-col gap-1">
          {LINKS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              aria-current={isActive(href) ? 'page' : undefined}
              className={linkClass(
                href,
                'flex items-center gap-3 text-sm font-semibold uppercase tracking-wider px-2 py-3 rounded-lg hover:bg-ink/5 dark:hover:bg-white/8 transition-colors'
              )}
            >
              <Icon className="w-5 h-5" /> {label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
