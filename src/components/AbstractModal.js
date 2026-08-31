'use client';

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { IconBook2, IconX } from '@tabler/icons-react';

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Destaca no texto os termos informados (rótulos de seção ou um lexical bundle).
// withColon: destaca "termo:" (rótulos de seção); caso contrário, só o termo.
function renderHighlighted(content, terms, withColon) {
  if (!content) return content;
  const list = (terms || []).filter(Boolean);
  if (list.length === 0) return content;
  const alt = list.map(escapeRegExp).sort((a, b) => b.length - a.length).join('|');
  const re = withColon
    ? new RegExp(`(\\*\\*)?\\b(${alt})\\b(\\*\\*)?\\s*:`, 'gi')
    : new RegExp(`(\\*\\*)?\\b(${alt})\\b(\\*\\*)?`, 'gi');
  const out = [];
  let last = 0;
  let m;
  while ((m = re.exec(content)) !== null) {
    if (m.index > last) out.push(content.slice(last, m.index));
    out.push(
      <mark key={m.index} className="bg-accent/15 text-accent font-bold rounded px-0.5">
        {m[0].replace(/\*\*/g, '')}
      </mark>
    );
    last = m.index + m[0].length;
    if (m.index === re.lastIndex) re.lastIndex += 1; // segurança contra loop
  }
  if (last < content.length) out.push(content.slice(last));
  return out;
}

/**
 * Modal (pop-up) que exibe o texto de um abstract, com termos destacados.
 * @param {{ title?: string, discipline?: string, doi?: string, content: string,
 *           highlight?: string[], withColon?: boolean, chips?: string[], onClose: Function }} props
 */
export default function AbstractModal({ title, discipline, doi, content, highlight = [], withColon = false, chips = [], onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-cream dark:bg-paper-dark rounded-3xl border border-stone-200 dark:border-white/10 shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-stone-100 dark:border-white/5 flex items-start justify-between gap-3">
          <div className="min-w-0">
            {title && <p className="text-sm font-black text-ink dark:text-parchment">{title}</p>}
            <div className="flex items-center gap-1.5 text-[11px] text-stone-500 dark:text-[#8a7058] mt-0.5">
              <IconBook2 className="w-3 h-3 flex-shrink-0" />
              {discipline && <><span className="flex-shrink-0">{discipline}</span><span>·</span></>}
              <span className="truncate" title={doi}>{doi}</span>
            </div>
          </div>
          <button type="button" onClick={onClose} title="Fechar" className="flex-shrink-0 text-stone-400 hover:text-stone-700 dark:hover:text-parchment transition-colors p-1">
            <IconX className="w-5 h-5" />
          </button>
        </div>

        {chips.length > 0 && (
          <div className="px-6 py-3 border-b border-stone-100 dark:border-white/5 flex flex-wrap gap-1.5 bg-stone-50/50 dark:bg-white/2">
            {chips.map(c => (
              <span key={c} className="text-[10px] font-bold text-accent bg-accent/10 px-1.5 py-0.5 rounded capitalize">{c}</span>
            ))}
          </div>
        )}

        <div className="px-6 py-5 overflow-y-auto custom-scrollbar">
          <p className="text-[13px] text-stone-700 dark:text-[#d4c4b0] text-justify leading-relaxed whitespace-pre-wrap">
            {renderHighlighted(content, highlight, withColon)}
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
}
