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
        w-9 h-9 rounded-full
        flex items-center justify-center
        border transition-all duration-200
        ${dark
          ? 'border-[#f0e4d4]/20 text-[#f0e4d4]/70 hover:bg-[#f0e4d4]/10 hover:text-[#f0e4d4]'
          : 'border-[#1C1008]/15 text-[#1C1008]/50 hover:bg-[#1C1008]/6 hover:text-[#1C1008]'
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
