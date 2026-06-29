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
          ? 'border-parchment/20 text-parchment/70 hover:bg-parchment/10 hover:text-parchment'
          : 'border-ink/15 text-ink/50 hover:bg-ink/6 hover:text-ink'
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
