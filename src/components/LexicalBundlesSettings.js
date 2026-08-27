'use client';

import React, { useState, useRef, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useLexicalBundles } from '@/contexts/LexicalBundlesContext';
import { IconSettings, IconCheck, IconFileSpreadsheet, IconTrash, IconChevronDown, IconChevronUp, IconAlertTriangle, IconX, IconBook2, IconRobot, IconChevronRight } from '@tabler/icons-react';
import * as XLSX from 'xlsx';
import { DISCIPLINES } from '@/constants/Disciplines';

const PROVIDER_LABELS = { openai: 'OpenAI', gemini: 'Google Gemini', claude: 'Anthropic Claude' };
const providerLabel = (p) => PROVIDER_LABELS[p] || (p ? p.charAt(0).toUpperCase() + p.slice(1) : 'Desconhecido');

// Célula da coluna "Ocorrências (IA)": número clicável que abre uma caixinha
// (portal, posição fixa) listando onde o bundle apareceu — DOI, título,
// disciplina e a IA responsável. Rola por dentro quando há muitos textos.
const OccurrencesCell = ({ count, sources }) => {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    const closeOnScroll = (e) => {
      if (e.target?.closest?.('[data-occ-popover]')) return;
      setOpen(false);
    };
    document.addEventListener('click', close);
    window.addEventListener('scroll', closeOnScroll, true);
    window.addEventListener('resize', close);
    return () => {
      document.removeEventListener('click', close);
      window.removeEventListener('scroll', closeOnScroll, true);
      window.removeEventListener('resize', close);
    };
  }, [open]);

  if (!count) return <span className="text-stone-400 dark:text-[#8a7058]">0</span>;

  const toggle = (e) => {
    e.stopPropagation();
    if (open) { setOpen(false); return; }
    const r = e.currentTarget.getBoundingClientRect();
    const width = 300;
    const left = Math.max(12, Math.min(r.right - width, window.innerWidth - width - 12));
    const top = Math.max(12, Math.min(r.bottom + 6, window.innerHeight - 320));
    setPos({ top, left });
    setOpen(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={toggle}
        title="Ver onde ocorre"
        className="font-bold text-accent hover:underline cursor-pointer"
      >
        {count}
      </button>
      {open && createPortal(
        <div
          data-occ-popover
          onClick={(e) => e.stopPropagation()}
          style={{ position: 'fixed', top: pos.top, left: pos.left, width: 300 }}
          className="z-[100] bg-cream dark:bg-paper-dark border border-stone-200 dark:border-white/10 rounded-2xl shadow-xl p-4 text-left"
        >
          <div className="flex items-start justify-between gap-2 mb-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-ink/40 dark:text-[#c4b09a]/40">
              {count} ocorrência{count !== 1 ? 's' : ''} · {sources.length} texto{sources.length !== 1 ? 's' : ''}
            </p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              title="Fechar"
              className="flex-shrink-0 text-stone-400 hover:text-stone-700 dark:hover:text-parchment transition-colors p-0.5"
            >
              <IconX className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-col gap-2 max-h-60 overflow-y-auto custom-scrollbar">
            {sources.map((s, i) => (
              <Link
                key={i}
                href={`/resultados?focus=${s.id}&p=${encodeURIComponent(s.provider || '')}&m=${encodeURIComponent(s.model_id || '')}`}
                scroll={false}
                onClick={() => setOpen(false)}
                title="Abrir este texto no histórico"
                className="group bg-stone-50 dark:bg-white/2 border border-stone-100 dark:border-white/5 rounded-lg px-3 py-2 flex flex-col gap-1 hover:border-accent/40 hover:bg-accent/5 transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-stone-700 dark:text-[#c4b09a] min-w-0">
                    <IconRobot className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                    <span className="truncate">{providerLabel(s.provider)}</span>
                  </span>
                  <span className="flex items-center gap-1 flex-shrink-0">
                    {s.count > 1 && (
                      <span className="text-[10px] font-black text-accent bg-accent/10 px-1.5 py-0.5 rounded-full">{s.count}×</span>
                    )}
                    <IconChevronRight className="w-3.5 h-3.5 text-stone-300 dark:text-[#8a7058] group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
                  </span>
                </div>
                {s.title && (
                  <p className="text-xs font-medium text-ink dark:text-parchment leading-snug line-clamp-2" title={s.title}>{s.title}</p>
                )}
                <div className="flex items-center gap-1.5 text-[10px] text-stone-500 dark:text-[#8a7058]">
                  <IconBook2 className="w-3 h-3 flex-shrink-0" />
                  <span className="flex-shrink-0">{s.discipline}</span>
                  <span>·</span>
                  <span className="truncate" title={s.doi}>{s.doi}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

// Converte valores de célula em número, tolerando vírgula decimal (pt-BR),
// separadores de milhar e espaços. Retorna 0 quando não há número válido.
const toNumber = (val) => {
  if (typeof val === 'number') return Number.isFinite(val) ? val : 0;
  if (val === undefined || val === null) return 0;
  let s = String(val).trim().replace(/\s/g, '');
  if (!s) return 0;
  if (s.includes(',') && s.includes('.')) {
    // O último separador é o decimal (ex.: "1.234,56" pt-BR ou "1,234.56" en).
    s = s.lastIndexOf(',') > s.lastIndexOf('.')
      ? s.replace(/\./g, '').replace(',', '.')
      : s.replace(/,/g, '');
  } else if (s.includes(',')) {
    s = s.replace(',', '.'); // "45,2" -> "45.2"
  }
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
};

// Igual a toNumber, mas retorna null (valor em branco) quando a célula está
// vazia — usado para não preencher valores que não vieram da planilha.
const toNumberOrNull = (val) => {
  if (val === undefined || val === null || String(val).trim() === '') return null;
  return toNumber(val);
};

export default function LexicalBundlesSettings({ analyses }) {
  const { bundles, setBundles } = useLexicalBundles();
  const [saved, setSaved] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const fileInputRef = useRef(null);
  const [expandedDisciplines, setExpandedDisciplines] = useState({});

  // Conta ocorrências de cada bundle em TODOS os textos gerados por IA do
  // histórico (independente da disciplina do texto), como o destaque amarelo faz.
  // Guarda também as fontes (DOI + IA + modelo) de cada ocorrência.
  const bundleStats = useMemo(() => {
    if (!bundles || Object.keys(bundles).length === 0 || !analyses) return null;

    // 1. Todos os textos gerados por IA (sem erros), uma vez só.
    const aiTexts = [];
    analyses.forEach(analysis => {
      const discLabel = DISCIPLINES.find(d => d.id === analysis.discipline)?.label || analysis.discipline || 'Desconhecida';
      (analysis.summaries || []).forEach(summary => {
        if (summary.content && !summary.content.includes('ERRO')) {
          aiTexts.push({
            id: analysis.id,
            doi: analysis.doi,
            title: analysis.title,
            discipline: discLabel,
            provider: summary.provider,
            model_id: summary.model_id,
            content: summary.content,
          });
        }
      });
    });

    // 2. Bundles únicos (a mesma expressão em disciplinas diferentes conta igual).
    const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const uniqueBundles = new Map(); // chave minúscula -> string original
    Object.keys(bundles).forEach(disc => {
      bundles[disc].forEach(b => {
        const str = typeof b === 'string' ? b : b.bundle;
        if (str && !uniqueBundles.has(str.toLowerCase())) uniqueBundles.set(str.toLowerCase(), str);
      });
    });

    // 3. Conta ocorrências (e fontes) de cada bundle em todos os textos.
    const byBundle = {}; // chave minúscula -> { ai, sources: [{doi, provider, model_id, count}] }
    uniqueBundles.forEach((str, lowerKey) => {
      const regex = new RegExp(`\\b(${escapeRegExp(str)})\\b`, 'gi');
      let ai = 0;
      const sources = [];
      aiTexts.forEach(t => {
        const matches = t.content.match(regex);
        if (matches && matches.length > 0) {
          ai += matches.length;
          sources.push({ id: t.id, doi: t.doi, title: t.title, discipline: t.discipline, provider: t.provider, model_id: t.model_id, count: matches.length });
        }
      });
      byBundle[lowerKey] = { ai, sources };
    });

    // 4. Redistribui para a estrutura por disciplina esperada pela tabela.
    const stats = {};
    Object.keys(bundles).forEach(disc => {
      stats[disc] = {};
      bundles[disc].forEach(b => {
        const str = typeof b === 'string' ? b : b.bundle;
        if (!str) return;
        stats[disc][str] = byBundle[str.toLowerCase()] || { ai: 0, sources: [] };
      });
    });

    return stats;
  }, [analyses, bundles]);

  const toggleDiscipline = (disc) => {
    setExpandedDisciplines(prev => ({
      ...prev,
      [disc]: !prev[disc]
    }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        
        const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });
        
        const newBundles = {};
        let currentDiscipline = null;
        let headerMap = {};

        for (const row of rows) {
          if (row.length === 0) continue;

          if (row.length === 1 && typeof row[0] === 'string' && row[0].trim().length > 0) {
            currentDiscipline = row[0].trim();
            if (!newBundles[currentDiscipline]) {
              newBundles[currentDiscipline] = [];
            }
            headerMap = {};
            continue;
          }

          if (!currentDiscipline) continue;

          const isHeaderRow = ['bundle', 'palavra', 'frequencia', 'freq', 'pmw', 'docfreq'].some(
            keyword => row.some(cell => String(cell).toLowerCase().includes(keyword))
          );

          if (isHeaderRow && Object.keys(headerMap).length === 0) {
            // Ordem importa: "Freq (pmw)" e "DOCFreq" também contêm "freq",
            // então classificamos pmw e docFreq ANTES da frequência genérica.
            row.forEach((header, index) => {
              const h = String(header).toLowerCase().trim();
              if (!h) return;
              if (headerMap.bundle === undefined && (h.includes('bundle') || h.includes('palavra') || h.includes('express'))) {
                headerMap.bundle = index;
              } else if (headerMap.pmw === undefined && (h.includes('pmw') || h.includes('milh') || h.includes('million') || h.includes('normaliz'))) {
                headerMap.pmw = index;
              } else if (headerMap.docFreq === undefined && h.includes('doc')) {
                headerMap.docFreq = index;
              } else if (headerMap.frequencia === undefined && (h.includes('frequencia') || h.includes('frequência') || h.includes('freq'))) {
                headerMap.frequencia = index;
              }
            });
            continue;
          }
          
          if (Object.keys(headerMap).length > 0) {
            // Só carrega o valor quando a coluna existe na planilha E a célula
            // tem conteúdo; caso contrário fica em branco (null).
            const bundleData = {
              bundle: String(row[headerMap.bundle] || '').trim(),
              frequencia: headerMap.frequencia !== undefined ? toNumberOrNull(row[headerMap.frequencia]) : null,
              pmw: headerMap.pmw !== undefined ? toNumberOrNull(row[headerMap.pmw]) : null,
              docFreq: headerMap.docFreq !== undefined ? toNumberOrNull(row[headerMap.docFreq]) : null,
            };

            if (bundleData.bundle) {
              newBundles[currentDiscipline].push(bundleData);
            }
          }
        }

        for (const key in newBundles) {
          if (newBundles[key].length === 0) {
            delete newBundles[key];
          } else {
            newBundles[key].sort((a, b) => {
              // Bundles sem frequência (null) vão para o fim da lista.
              const fa = a.frequencia ?? -Infinity;
              const fb = b.frequencia ?? -Infinity;
              if (fb !== fa) {
                return fb - fa;
              }
              return a.bundle.localeCompare(b.bundle);
            });
          }
        }

        setBundles(newBundles);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);

      } catch (err) {
        console.error("Erro ao ler arquivo excel", err);
        setUploadError("Erro ao ler o arquivo Excel. Verifique se o formato está correto.");
      }
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    reader.readAsBinaryString(file);
  };

  const clearBundles = () => {
    setBundles({});
    setConfirmClear(false);
  };

  const disciplines = Object.keys(bundles || {});
  const totalBundles = disciplines.reduce((acc, curr) => acc + bundles[curr].length, 0);

  const renderTable = (items, disc) => (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse mt-2 text-xs">
        <thead>
          <tr className="border-b border-stone-200 dark:border-white/10 text-stone-500 dark:text-[#9a8070]">
            <th className="py-2 font-bold">Lexical Bundle</th>
            <th className="py-2 font-bold text-right">Freq</th>
            <th className="py-2 font-bold text-right">PMW</th>
            <th className="py-2 font-bold text-right">DOCFreq</th>
            <th className="py-2 font-bold text-right">Ocorrências (IA)</th>
          </tr>
        </thead>
        <tbody>
          {items.map((b, idx) => (
            <tr key={idx} className="border-b border-stone-100 dark:border-white/5 last:border-0 text-stone-700 dark:text-[#c4b09a]">
              <td className="py-2 font-medium">{b.bundle}</td>
              <td className="py-2 text-right">{b.frequencia ?? ''}</td>
              <td className="py-2 text-right">{b.pmw ?? ''}</td>
              <td className="py-2 text-right">{b.docFreq ?? ''}</td>
              <td className="py-2 text-right">
                <OccurrencesCell
                  count={bundleStats?.[disc]?.[b.bundle]?.ai || 0}
                  sources={bundleStats?.[disc]?.[b.bundle]?.sources || []}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div>
      <h2 className="text-xs font-black uppercase tracking-widest text-ink/60 dark:text-[#c4b09a]/60 mb-4 flex items-center gap-2">
        <IconSettings className="w-4 h-4" /> Lexical Bundles
      </h2>
      <div className="bg-cream/80 dark:bg-paper-dark/90 backdrop-blur-sm rounded-2xl border border-stone-200 dark:border-white/8 shadow-sm p-6 flex flex-col gap-5">
        <div>
          <p className="text-sm font-serif font-black text-ink dark:text-parchment">Importar Lexical Bundles (Excel)</p>
          <p className="text-xs text-ink/60 dark:text-[#9a8070] mt-1">
            Envie um arquivo Excel com seções separadas por um título de disciplina. As colunas devem ser <strong>bundle</strong>, <strong>frequencia</strong>, <strong>pmw</strong>, e <strong>docfreq</strong>.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <input 
            type="file" 
            accept=".xlsx, .xls, .csv" 
            onChange={handleFileUpload} 
            className="hidden" 
            ref={fileInputRef}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 w-full sm:w-auto flex items-center justify-center gap-2 text-sm font-bold py-3 px-6 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-[#3a2a1e] dark:hover:bg-[#4a3a2e] text-ink dark:text-parchment transition-colors border border-stone-200 dark:border-white/10"
          >
            <IconFileSpreadsheet className="w-5 h-5 text-green-600 dark:text-green-400" />
            Escolher arquivo Excel
          </button>
          
          {saved && (
             <span className="flex items-center gap-1.5 text-xs font-bold text-green-600 dark:text-green-400">
               <IconCheck className="w-4 h-4" /> Importado!
             </span>
          )}
        </div>

        {uploadError && (
          <div className="flex items-center gap-2 text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 rounded-xl px-4 py-3">
            <IconAlertTriangle className="w-4 h-4 flex-shrink-0" />
            {uploadError}
          </div>
        )}

        {totalBundles > 0 && (
          <div className="mt-2 border-t border-stone-100 dark:border-white/5 pt-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black uppercase tracking-widest text-ink/40 dark:text-[#c4b09a]/40">
                Bundles Carregados ({totalBundles})
              </span>
              {confirmClear ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-stone-500 dark:text-[#9a8070]">Limpar tudo?</span>
                  <button onClick={clearBundles} className="text-xs font-black text-red-500 hover:text-red-600">Sim</button>
                  <button onClick={() => setConfirmClear(false)} className="text-xs font-black text-stone-400 hover:text-stone-700 dark:hover:text-parchment">Não</button>
                </div>
              ) : (
                <button onClick={() => setConfirmClear(true)} className="text-red-500 hover:text-red-600 p-1" title="Limpar tudo">
                  <IconTrash className="w-4 h-4" />
                </button>
              )}
            </div>
            
            <div className="space-y-3">
              {disciplines.map(disc => {
                const discBundles = bundles[disc];
                const top5 = discBundles.slice(0, 5);
                const hasMore = discBundles.length > 5;
                const isExpanded = expandedDisciplines[disc];

                const visibleBundles = isExpanded ? discBundles : top5;

                return (
                  <div key={disc} className="bg-stone-50 dark:bg-[#1a0e08] border border-stone-100 dark:border-white/5 p-4 rounded-xl">
                    <button
                      type="button"
                      onClick={() => hasMore && toggleDiscipline(disc)}
                      aria-expanded={hasMore ? isExpanded : undefined}
                      title={hasMore ? (isExpanded ? 'Recolher lista' : `Ver todos os ${discBundles.length} bundles`) : undefined}
                      className={`group w-full flex items-center gap-2 mb-2 text-left ${hasMore ? 'cursor-pointer' : 'cursor-default'}`}
                    >
                      <span className="text-sm font-bold text-stone-800 dark:text-parchment truncate min-w-0">{disc}</span>
                      <span className="text-[10px] font-black bg-accent/10 text-accent px-2 py-1 rounded-full whitespace-nowrap flex-shrink-0">
                        {discBundles.length} itens
                      </span>
                      {hasMore && (
                        <span className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-full bg-accent text-white shadow-sm group-hover:bg-[#e05f00] transition-colors">
                          {isExpanded
                            ? <IconChevronUp className="w-4 h-4" stroke={2.5} />
                            : <IconChevronDown className="w-4 h-4" stroke={2.5} />}
                        </span>
                      )}
                    </button>

                    {renderTable(visibleBundles, disc)}
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
