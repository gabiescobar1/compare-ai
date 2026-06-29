'use client';

import React, { useState, useRef, useMemo } from 'react';
import { useLexicalBundles } from '@/contexts/LexicalBundlesContext';
import { IconSettings, IconCheck, IconFileSpreadsheet, IconTrash, IconChevronDown, IconChevronUp, IconAlertTriangle } from '@tabler/icons-react';
import * as XLSX from 'xlsx';
import { DISCIPLINES } from '@/constants/Disciplines';

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

export default function LexicalBundlesSettings({ analyses }) {
  const { bundles, setBundles } = useLexicalBundles();
  const [saved, setSaved] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const fileInputRef = useRef(null);
  const [expandedDisciplines, setExpandedDisciplines] = useState({});

  const bundleStats = useMemo(() => {
    if (!bundles || Object.keys(bundles).length === 0 || !analyses) return null;

    const stats = {};
    Object.keys(bundles).forEach(disc => {
      stats[disc] = {};
      bundles[disc].forEach(b => {
        const bundleStr = typeof b === 'string' ? b : b.bundle;
        stats[disc][bundleStr] = { original: 0, ai: 0 };
      });
    });

    analyses.forEach(analysis => {
      const discLabel = DISCIPLINES.find(d => d.id === analysis.discipline)?.label || analysis.discipline;
      
      const matchingKey = Object.keys(bundles).find(
        k => k.toLowerCase() === (discLabel || '').toLowerCase()
      );

      if (matchingKey && stats[matchingKey]) {
        bundles[matchingKey].forEach(bItem => {
          const bundle = typeof bItem === 'string' ? bItem : bItem.bundle;
          const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const regex = new RegExp(`\\b(${escapeRegExp(bundle)})\\b`, 'gi');

          // Count only in AI-generated summaries
          if (analysis.summaries) {
            analysis.summaries.forEach(summary => {
              if (summary.content && !summary.content.includes('ERRO')) {
                const matches = summary.content.match(regex);
                if (matches) {
                  stats[matchingKey][bundle].ai += matches.length;
                }
              }
            });
          }
        });
      }
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
            const bundleData = {
              bundle: String(row[headerMap.bundle] || '').trim(),
              frequencia: toNumber(row[headerMap.frequencia]),
              pmw: toNumber(row[headerMap.pmw]),
              docFreq: toNumber(row[headerMap.docFreq]),
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
              if (b.frequencia !== a.frequencia) {
                return b.frequencia - a.frequencia;
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
              <td className="py-2 text-right">{b.frequencia}</td>
              <td className="py-2 text-right">{b.pmw}</td>
              <td className="py-2 text-right">{b.docFreq}</td>
              <td className="py-2 text-right font-bold text-accent">{bundleStats?.[disc]?.[b.bundle]?.ai || 0}</td>
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
