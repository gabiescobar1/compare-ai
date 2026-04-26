'use client';

import { IconMoon, IconSun } from '@tabler/icons-react';
import { useTheme } from '@/components/ThemeProvider';

export default function ThemeToggle() {
  const { dark, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      title={dark ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
      aria-label={dark ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
      className={`
        fixed left-4 top-1/2 -translate-y-1/2 z-50
        w-9 h-9 rounded-full
        flex items-center justify-center
        border transition-all duration-200
        ${dark
          ? 'border-[#f0e4d4]/20 text-[#f0e4d4]/70 hover:bg-[#f0e4d4]/10 hover:text-[#f0e4d4]'
          : 'border-[#291f1b]/15 text-[#291f1b]/50 hover:bg-[#291f1b]/6 hover:text-[#291f1b]'
        }
      `}
    >
      {dark
        ? <IconSun className="w-4 h-4" />
        : <IconMoon className="w-4 h-4" />
      }
    </button>
  );
}
