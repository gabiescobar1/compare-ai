'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { IconListDetails, IconAlignLeft, IconInfoCircle, IconBook2, IconChevronDown, IconChevronRight } from '@tabler/icons-react';
import { DISCIPLINES } from '@/constants/Disciplines';
import { classifyAbstractFormat, isAnalyzableAbstract } from '@/utils/abstractFormat';

const PROVIDER_LABELS = { openai: 'OpenAI', gemini: 'Google Gemini', claude: 'Anthropic Claude' };
const PROVIDER_ORDER = ['openai', 'gemini', 'claude'];

const pct = (n, total) => (total > 0 ? Math.round((n / total) * 100) : 0);

// Link para abrir o texto no histórico: para IA, foca o card do modelo; para
// originais, foca o registro (o box do Abstract Original fica dentro dele).
const hrefFor = (it) =>
  it.provider
    ? `/resultados?focus=${it.id}&p=${encodeURIComponent(it.provider)}&m=${encodeURIComponent(it.model_id || '')}`
    : `/resultados?focus=${it.id}`;

// Barra empilhada: parte estruturada (accent) + parte block (slate).
function FormatBar({ structured, block }) {
  const total = structured + block;
  const sPct = pct(structured, total);
  return (
    <div className="h-3 w-full flex rounded-full overflow-hidden bg-stone-100 dark:bg-white/5">
      <div className="h-full bg-accent transition-all duration-700" style={{ width: `${sPct}%` }} />
      <div className="h-full bg-slate-400 dark:bg-slate-500 transition-all duration-700" style={{ width: `${100 - sPct}%` }} />
    </div>
  );
}

function SourceCard({ label, structured, block, items }) {
  const [open, setOpen] = useState(false);
  const total = structured + block;

  return (
    <div className="bg-stone-50/50 dark:bg-white/2 border border-stone-200 dark:border-white/5 p-5 rounded-2xl flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h4 className="font-bold text-ink dark:text-parchment text-sm truncate" title={label}>{label}</h4>
        <span className="text-[10px] font-black uppercase tracking-widest text-ink/40 dark:text-[#c4b09a]/40">
          {total} abstract{total !== 1 ? 's' : ''}
        </span>
      </div>

      {total === 0 ? (
        <p className="text-sm text-stone-400 dark:text-[#8a7058]">Sem dados.</p>
      ) : (
        <>
          <FormatBar structured={structured} block={block} />
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-stone-600 dark:text-[#c4b09a]">
                <span className="w-3 h-3 rounded-sm bg-accent flex-shrink-0" /> Estruturados
              </span>
              <span className="font-black text-ink dark:text-parchment">{structured} <span className="text-xs font-bold text-stone-400 dark:text-[#8a7058]">({pct(structured, total)}%)</span></span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-stone-600 dark:text-[#c4b09a]">
                <span className="w-3 h-3 rounded-sm bg-slate-400 dark:bg-slate-500 flex-shrink-0" /> Block (bloco único)
              </span>
              <span className="font-black text-ink dark:text-parchment">{block} <span className="text-xs font-bold text-stone-400 dark:text-[#8a7058]">({pct(block, total)}%)</span></span>
            </div>
          </div>

          {structured > 0 && (
            <div className="border-t border-stone-100 dark:border-white/5 pt-3">
              <button
                type="button"
                onClick={() => setOpen(o => !o)}
                aria-expanded={open}
                className="w-full flex items-center justify-between gap-2 text-xs font-bold text-stone-600 dark:text-[#c4b09a] hover:text-accent transition-colors"
              >
                <span>Ver quais são estruturados ({structured})</span>
                <IconChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
              </button>
              {open && (
                <div className="flex flex-col gap-1.5 max-h-64 overflow-y-auto custom-scrollbar mt-3">
                  {items.map((it, i) => (
                    <Link
                      key={i}
                      href={hrefFor(it)}
                      scroll={false}
                      title="Abrir no histórico"
                      className="group bg-cream dark:bg-[#1e1410] border border-stone-100 dark:border-white/5 rounded-lg px-3 py-2 flex flex-col gap-1.5 hover:border-accent/40 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-1.5 text-[11px] font-bold text-stone-500 dark:text-[#8a7058] min-w-0">
                          <IconBook2 className="w-3 h-3 flex-shrink-0" />
                          <span className="flex-shrink-0">{it.discipline}</span>
                          <span className="text-stone-300 dark:text-[#5a4a3a]">·</span>
                          <span className="truncate" title={it.doi}>{it.doi}</span>
                        </span>
                        <IconChevronRight className="w-3.5 h-3.5 flex-shrink-0 text-stone-300 dark:text-[#8a7058] group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {it.headings.map(h => (
                          <span key={h} className="text-[10px] font-bold text-accent bg-accent/10 px-1.5 py-0.5 rounded capitalize">{h}</span>
                        ))}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function FormatAnalysis({ analyses }) {
  const { sources, headingRanking, originalPct, aiPct } = useMemo(() => {
    const acc = {}; // key -> { label, structured, block, items }
    const headingCounts = {};
    let aiStructured = 0, aiTotal = 0;

    const bump = (key, label, meta, text, isAI) => {
      if (!isAnalyzableAbstract(text)) return;
      const { format, headings } = classifyAbstractFormat(text);
      if (!acc[key]) acc[key] = { label, structured: 0, block: 0, items: [] };
      if (format === 'structured') {
        acc[key].structured += 1;
        acc[key].items.push({ ...meta, headings });
        headings.forEach(h => { headingCounts[h] = (headingCounts[h] || 0) + 1; });
      } else {
        acc[key].block += 1;
      }
      if (isAI) { aiTotal += 1; if (format === 'structured') aiStructured += 1; }
    };

    (analyses || []).forEach(a => {
      const discipline = DISCIPLINES.find(d => d.id === a.discipline)?.label || a.discipline || 'Desconhecida';
      bump('original', 'Originais (DOIs)', { id: a.id, doi: a.doi, title: a.title, discipline, provider: null, model_id: null }, a.originalAbstract, false);
      (a.summaries || []).forEach(s => {
        bump(s.provider, PROVIDER_LABELS[s.provider] || s.provider, { id: a.id, doi: a.doi, title: a.title, discipline, provider: s.provider, model_id: s.model_id }, s.content, true);
      });
    });

    const ordered = [];
    if (acc.original) ordered.push({ key: 'original', ...acc.original });
    PROVIDER_ORDER.forEach(p => { if (acc[p]) ordered.push({ key: p, ...acc[p] }); });
    Object.keys(acc).forEach(k => {
      if (k !== 'original' && !PROVIDER_ORDER.includes(k)) ordered.push({ key: k, ...acc[k] });
    });

    const ranking = Object.entries(headingCounts).sort((a, b) => b[1] - a[1]).slice(0, 8);
    const orig = acc.original || { structured: 0, block: 0 };
    const origTotal = orig.structured + orig.block;

    return {
      sources: ordered,
      headingRanking: ranking,
      originalPct: pct(orig.structured, origTotal),
      aiPct: pct(aiStructured, aiTotal),
    };
  }, [analyses]);

  const hasData = sources.some(s => s.structured + s.block > 0);

  return (
    <div className="space-y-8">
      <div className="bg-cream dark:bg-paper-dark rounded-3xl border border-stone-200 dark:border-white/8 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-stone-100 dark:border-white/5">
          <h3 className="font-serif font-black text-ink dark:text-parchment flex items-center gap-2">
            <IconListDetails className="w-5 h-5 text-accent" />
            Formato dos Abstracts: Estruturados vs. Block
          </h3>
          <p className="text-xs text-stone-500 dark:text-[#9a8070] mt-2 max-w-3xl">
            Abstracts <strong>estruturados</strong> trazem rótulos de seção antes de cada movimento retórico
            (ex.: <em>Background:</em>, <em>Methods:</em>, <em>Results:</em>, <em>Conclusions:</em>).
            Abstracts <strong>block</strong> são escritos em um único bloco corrido, sem rótulos.
            Clique em <em>“Ver quais são estruturados”</em> para listar os abstracts e os rótulos detectados.
          </p>
        </div>

        <div className="p-8">
          {!hasData ? (
            <div className="py-10 text-center">
              <IconInfoCircle className="w-12 h-12 mx-auto mb-4 text-stone-300 dark:text-white/10" />
              <p className="text-stone-500 dark:text-[#9a8070] font-medium">Sem abstracts para analisar no momento.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sources.map(s => (
                <SourceCard key={s.key} label={s.label} structured={s.structured} block={s.block} items={s.items} />
              ))}
            </div>
          )}
        </div>

        {hasData && (
          <div className="px-8 py-5 bg-stone-50 dark:bg-[#1e1410] border-t border-stone-100 dark:border-white/5">
            <p className="text-sm text-stone-600 dark:text-[#c4b09a] flex items-center gap-2 flex-wrap">
              <IconInfoCircle className="w-4 h-4 text-accent flex-shrink-0" />
              <span>
                <strong className="text-accent">{originalPct}%</strong> dos abstracts originais são estruturados, contra{' '}
                <strong className="text-blue-600 dark:text-blue-400">{aiPct}%</strong> dos gerados por IA.
              </span>
            </p>
          </div>
        )}
      </div>

      {headingRanking.length > 0 && (
        <div className="bg-cream dark:bg-paper-dark rounded-3xl border border-stone-200 dark:border-white/8 shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-stone-100 dark:border-white/5">
            <h3 className="font-serif font-black text-ink dark:text-parchment flex items-center gap-2">
              <IconAlignLeft className="w-5 h-5 text-accent" />
              Rótulos de seção mais comuns (nos estruturados)
            </h3>
          </div>
          <div className="p-8 flex flex-wrap gap-3">
            {headingRanking.map(([label, count]) => (
              <span key={label} className="flex items-center gap-2 bg-stone-50 dark:bg-white/2 border border-stone-200 dark:border-white/5 rounded-xl px-3 py-2">
                <span className="text-sm font-bold text-ink dark:text-parchment capitalize">{label}</span>
                <span className="text-[11px] font-black text-accent bg-accent/10 px-2 py-0.5 rounded-full">{count}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
