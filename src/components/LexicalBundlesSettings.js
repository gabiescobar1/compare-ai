'use client';

import React, { useState, useRef, useMemo } from 'react';
import { useLexicalBundles } from '@/contexts/LexicalBundlesContext';
import { IconSettings, IconCheck, IconFileSpreadsheet, IconTrash, IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import * as XLSX from 'xlsx';
import { DISCIPLINES } from '@/constants/Disciplines';

export default function LexicalBundlesSettings({ analyses }) {
  const { bundles, setBundles } = useLexicalBundles();
  const [saved, setSaved] = useState(false);
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
          const regex = new RegExp(`\b(${escapeRegExp(bundle)})\b`, 'gi');

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
            row.forEach((header, index) => {
              const lowerHeader = String(header).toLowerCase();
              if (lowerHeader.includes('bundle') || lowerHeader.includes('palavra')) {
                headerMap.bundle = index;
              }
              if (lowerHeader.includes('frequencia') || lowerHeader.includes('freq')) {
                headerMap.frequencia = index;
              }
              if (lowerHeader.includes('pmw')) {
                headerMap.pmw = index;
              }
              if (lowerHeader.includes('docfreq')) {
                headerMap.docFreq = index;
              }
            });
            continue;
          }
          
          if (Object.keys(headerMap).length > 0) {
            const bundleData = {
              bundle: String(row[headerMap.bundle] || '').trim(),
              frequencia: Number(row[headerMap.frequencia] || 0),
              pmw: Number(row[headerMap.pmw] || 0),
              docFreq: Number(row[headerMap.docFreq] || 0),
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
        alert("Erro ao ler o arquivo Excel. Verifique se o formato está correto.");
      }
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    reader.readAsBinaryString(file);
  };

  const clearBundles = () => {
    if (confirm("Tem certeza que deseja limpar todos os Lexical Bundles?")) {
      setBundles({});
    }
  };

  const disciplines = Object.keys(bundles || {});
  const totalBundles = disciplines.reduce((acc, curr) => acc + bundles[curr].length, 0);

  const renderTable = (items, disc) => (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse mt-2 text-xs">
        <thead>
          <tr className="border-b border-stone-200 dark:border-white/10 text-stone-500 dark:text-[#9a8070]">
            <th className="py-2 font-bold">Bundle</th>
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
              <td className="py-2 text-right font-bold text-[#ff6b00]">{bundleStats?.[disc]?.[b.bundle]?.ai || 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div>
      <h2 className="text-xs font-black uppercase tracking-widest text-[#1C1008]/60 dark:text-[#c4b09a]/60 mb-4 flex items-center gap-2">
        <IconSettings className="w-4 h-4" /> Lexical Bundles
      </h2>
      <div className="bg-white/80 dark:bg-[#211307]/90 backdrop-blur-sm rounded-2xl border border-stone-200 dark:border-white/8 shadow-sm p-6 flex flex-col gap-5">
        <div>
          <p className="text-sm font-serif font-black text-[#1C1008] dark:text-[#f0e4d4]">Importar Lexical Bundles (Excel)</p>
          <p className="text-xs text-[#1C1008]/60 dark:text-[#9a8070] mt-1">
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
            className="flex-1 w-full sm:w-auto flex items-center justify-center gap-2 text-sm font-bold py-3 px-6 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-[#3a2a1e] dark:hover:bg-[#4a3a2e] text-[#1C1008] dark:text-[#f0e4d4] transition-colors border border-stone-200 dark:border-white/10"
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

        {totalBundles > 0 && (
          <div className="mt-2 border-t border-stone-100 dark:border-white/5 pt-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black uppercase tracking-widest text-[#1C1008]/40 dark:text-[#c4b09a]/40">
                Bundles Carregados ({totalBundles})
              </span>
              <button onClick={clearBundles} className="text-red-500 hover:text-red-600 p-1" title="Limpar tudo">
                <IconTrash className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-3">
              {disciplines.map(disc => {
                const discBundles = bundles[disc];
                const top5 = discBundles.slice(0, 5);
                const hasMore = discBundles.length > 5;
                const isExpanded = expandedDisciplines[disc];

                return (
                  <div key={disc} className="bg-stone-50 dark:bg-[#1a0e08] border border-stone-100 dark:border-white/5 p-4 rounded-xl">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-bold text-stone-800 dark:text-[#f0e4d4] truncate pr-2">{disc}</span>
                      <span className="text-[10px] font-black bg-[#ff6b00]/10 text-[#ff6b00] px-2 py-1 rounded-full whitespace-nowrap">
                        {discBundles.length} itens
                      </span>
                    </div>
                    
                    {renderTable(top5, disc)}

                    {hasMore && (
                      <div className="mt-2">
                        {isExpanded && renderTable(discBundles.slice(5), disc)}
                        <button
                          onClick={() => toggleDiscipline(disc)}
                          className="w-full mt-2 flex items-center justify-center gap-1 py-1.5 text-xs font-bold text-[#ff6b00] hover:bg-[#ff6b00]/10 rounded-lg transition-colors"
                        >
                          {isExpanded ? (
                            <>Ver menos <IconChevronUp className="w-3 h-3" /></>
                          ) : (
                            <>Ver mais {discBundles.length - 5} bundles <IconChevronDown className="w-3 h-3" /></>
                          )}
                        </button>
                      </div>
                    )}
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
