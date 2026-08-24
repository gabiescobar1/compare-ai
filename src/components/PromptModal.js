'use client';

import { useEffect } from 'react';
import { IconX, IconTerminal2 } from '@tabler/icons-react';
import {
  SYSTEM_PROMPT,
  PROMPT_DISPLAY,
  PROMPT_TITLE_PLACEHOLDER,
  PROMPT_BODY_PLACEHOLDER,
} from '@/constants/AiPrompt';

// Destaca os placeholders (título/corpo) dentro do prompt para deixar claro
// quais trechos são preenchidos dinamicamente com os dados do artigo.
const HighlightedPrompt = ({ text }) => {
  const pattern = [PROMPT_TITLE_PLACEHOLDER, PROMPT_BODY_PLACEHOLDER]
    .map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|');
  const parts = text.split(new RegExp(`(${pattern})`, 'g'));

  return (
    <>
      {parts.map((part, i) =>
        part === PROMPT_TITLE_PLACEHOLDER || part === PROMPT_BODY_PLACEHOLDER ? (
          <span
            key={i}
            className="text-accent font-bold bg-accent/10 rounded px-1"
          >
            {part}
          </span>
        ) : (
          part
        )
      )}
    </>
  );
};

export default function PromptModal({ open, onClose }) {
  // Fecha com Esc e trava o scroll do fundo enquanto o modal está aberto.
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="prompt-modal-title"
    >
      <div
        className="absolute inset-0 bg-ink/50 dark:bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl max-h-[85vh] flex flex-col bg-cream dark:bg-paper-dark rounded-3xl shadow-2xl border border-stone-200 dark:border-white/8 overflow-hidden transition-colors duration-300">
        {/* Cabeçalho */}
        <div className="flex items-start justify-between gap-4 px-8 py-6 border-b border-stone-200 dark:border-white/8">
          <div>
            <h2
              id="prompt-modal-title"
              className="text-xl font-serif font-black text-ink dark:text-parchment flex items-center gap-2"
            >
              <IconTerminal2 className="w-5 h-5 text-accent" /> Prompt enviado às IAs
            </h2>
            <p className="text-sm text-stone-500 dark:text-[#9a8070] mt-1.5 leading-relaxed">
              Todas as IAs recebem exatamente estas instruções para gerar os
              resumos. O texto não é editável — está aqui apenas para deixar
              claras as condições sob as quais os abstracts são gerados.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="flex-shrink-0 p-2 rounded-full text-stone-400 dark:text-[#9a8070] hover:text-ink dark:hover:text-parchment hover:bg-stone-100 dark:hover:bg-white/8 transition-colors"
          >
            <IconX className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo */}
        <div className="overflow-y-auto custom-scrollbar px-8 py-6 space-y-6">
          <section>
            <h3 className="text-xs font-bold text-stone-500 dark:text-[#9a8070] uppercase tracking-widest mb-2">
              Instrução de sistema
            </h3>
            <pre className="bg-stone-50 dark:bg-[#1e1410] border border-stone-200 dark:border-white/8 rounded-2xl p-4 text-[13px] text-stone-700 dark:text-[#d4c4b0] whitespace-pre-wrap font-sans leading-relaxed">
              {SYSTEM_PROMPT}
            </pre>
            <p className="text-xs text-stone-500 dark:text-[#8a7058] mt-2">
              Aplicada à OpenAI e ao Claude. O Gemini não recebe instrução de
              sistema separada — apenas o prompt principal abaixo.
            </p>
          </section>

          <section>
            <h3 className="text-xs font-bold text-stone-500 dark:text-[#9a8070] uppercase tracking-widest mb-2">
              Prompt principal
            </h3>
            <pre className="bg-stone-50 dark:bg-[#1e1410] border border-stone-200 dark:border-white/8 rounded-2xl p-4 text-[13px] text-stone-700 dark:text-[#d4c4b0] whitespace-pre-wrap font-sans leading-relaxed">
              <HighlightedPrompt text={PROMPT_DISPLAY} />
            </pre>
            <p className="text-xs text-stone-500 dark:text-[#8a7058] mt-2">
              Os trechos destacados são preenchidos automaticamente com o título
              e o texto completo de cada artigo.
            </p>
          </section>
        </div>

        {/* Rodapé */}
        <div className="px-8 py-4 border-t border-stone-200 dark:border-white/8 bg-stone-50 dark:bg-paper-dark flex justify-end">
          <button
            onClick={onClose}
            className="text-sm font-serif font-bold py-2.5 px-6 rounded-2xl border border-stone-200 dark:border-white/10 bg-cream dark:bg-paper-dark hover:bg-stone-100 dark:hover:bg-white/5 text-stone-700 dark:text-[#c4b09a] shadow-sm transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
