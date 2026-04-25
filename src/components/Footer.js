import { IconMail, IconBrandGithub, IconBrandInstagram, IconCode } from '@tabler/icons-react';

export default function Footer() {
  return (
    <footer
      style={{ backgroundColor: '#f9dcc4' }}
      className="w-full border-t border-[#e5c9b0] mt-auto py-5 px-6"
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm font-bold text-[#291f1b]">
        <span className="flex items-center gap-1.5">
          <IconCode className="w-4 h-4 flex-shrink-0" />
          Desenvolvido por Gabriela C. Escobar
        </span>

        <span className="hidden sm:block w-[1px] h-4 bg-[#c4a98a]" />

        <a
          href="mailto:gabrielacarvalhoescobar@gmail.com"
          className="flex items-center gap-1.5 hover:opacity-70 transition-opacity"
        >
          <IconMail className="w-4 h-4 flex-shrink-0" />
          gabrielacarvalhoescobar@gmail.com
        </a>

        <span className="hidden sm:block w-[1px] h-4 bg-[#c4a98a]" />

        <a
          href="https://github.com/gabiescobar1"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 hover:opacity-70 transition-opacity"
        >
          <IconBrandGithub className="w-4 h-4 flex-shrink-0" />
          gabiescobar1
        </a>

        <span className="hidden sm:block w-[1px] h-4 bg-[#c4a98a]" />

        <a
          href="https://instagram.com/profegabiesc"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 hover:opacity-70 transition-opacity"
        >
          <IconBrandInstagram className="w-4 h-4 flex-shrink-0" />
          profegabiesc
        </a>
      </div>
    </footer>
  );
}
