'use client';

import React, { useMemo } from 'react';
import { IconChartBar, IconInfoCircle, IconFileText, IconChevronDown, IconBook2 } from '@tabler/icons-react';
import { useLexicalBundles } from '@/contexts/LexicalBundlesContext';
import { DISCIPLINES } from '@/constants/Disciplines';
import * as XLSX from 'xlsx';

export default function AnalyticsClient({ analyses }) {
  const { bundles } = useLexicalBundles();

  const bundleStats = useMemo(() => {
    if (!bundles || Object.keys(bundles).length === 0) return null;

    const stats = {};
    Object.keys(bundles).forEach(disc => {
      stats[disc] = {};
      bundles[disc].forEach(b => {
        stats[disc][b] = { original: 0, ai: 0 };
      });
    });

    analyses.forEach(analysis => {
      const discLabel = DISCIPLINES.find(d => d.id === analysis.discipline)?.label || analysis.discipline;
      
      const matchingKey = Object.keys(bundles).find(
        k => k.toLowerCase() === (discLabel || '').toLowerCase()
      );

      if (matchingKey && stats[matchingKey]) {
        bundles[matchingKey].forEach(bundle => {
          const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const regex = new RegExp(`\\b(${escapeRegExp(bundle)})\\b`, 'gi');
          
          if (analysis.originalAbstract) {
            const matches = analysis.originalAbstract.match(regex);
            if (matches) stats[matchingKey][bundle].original += matches.length;
          }

          if (analysis.summaries) {
            analysis.summaries.forEach(summary => {
              if (summary.content && !summary.content.includes('ERRO')) {
                const matches = summary.content.match(regex);
                if (matches) stats[matchingKey][bundle].ai += matches.length;
              }
            });
          }
        });
      }
    });

    return stats;
  }, [analyses, bundles]);

  const handleExportExcel = () => {
    if (!bundleStats) return;

    const exportData = [];

    Object.entries(bundleStats).forEach(([disc, bStats]) => {
      Object.entries(bStats).forEach(([bundle, counts]) => {
        exportData.push({
          'Disciplina': disc,
          'Lexical Bundle': bundle,
          'Frequência (Originais)': counts.original,
          'Frequência (Gerados por IA)': counts.ai
        });
      });
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Frequência de Bundles');

    // Auto-adjust column widths
    const wscols = [
      {wch: 25},
      {wch: 40},
      {wch: 25},
      {wch: 30}
    ];
    worksheet['!cols'] = wscols;

    XLSX.writeFile(workbook, 'frequencia_lexical_bundles.xlsx');
  };

  const stats = useMemo(() => {
    const providerData = {};

    analyses.forEach(analysis => {
      analysis.summaries.forEach(summary => {
        const provider = summary.provider;
        const modelId = summary.model_id;
        const content = summary.content || '';
        const wordCount = content.trim().split(/\s+/).filter(Boolean).length;

        if (!providerData[provider]) {
          providerData[provider] = {
            totalWords: 0,
            count: 0,
            label: provider.charAt(0).toUpperCase() + provider.slice(1),
            models: {}
          };
        }

        if (wordCount > 0 && !content.includes('ERRO')) {
            providerData[provider].totalWords += wordCount;
            providerData[provider].count += 1;

            if (!providerData[provider].models[modelId]) {
              providerData[provider].models[modelId] = {
                totalWords: 0,
                count: 0
              };
            }
            providerData[provider].models[modelId].totalWords += wordCount;
            providerData[provider].models[modelId].count += 1;
        }
      });
    });

    const results = Object.keys(providerData).map(key => ({
      provider: key,
      label: providerData[key].label,
      average: providerData[key].count > 0 
        ? Math.round(providerData[key].totalWords / providerData[key].count) 
        : 0,
      totalCount: providerData[key].count,
      models: Object.keys(providerData[key].models).map(mId => ({
        id: mId,
        average: Math.round(providerData[key].models[mId].totalWords / providerData[key].models[mId].count),
        count: providerData[key].models[mId].count
      })).sort((a, b) => b.average - a.average)
    })).sort((a, b) => b.average - a.average);

    return results;
  }, [analyses]);

  const maxAverage = Math.max(...stats.map(s => s.average), 1);

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {/* Header Info */}
      <div className="bg-[#1C1008] dark:bg-[#211307] text-white rounded-3xl p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <IconChartBar className="w-32 h-32" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
             <div className="w-10 h-10 rounded-xl bg-[#ff6b00] flex items-center justify-center">
                <IconChartBar className="w-6 h-6 text-white" />
             </div>
             <h2 className="text-2xl font-serif font-black">Performance & Métricas</h2>
          </div>
          <p className="text-white/70 text-sm max-w-2xl leading-relaxed">
            Visualize o comportamento dos diferentes modelos de IA. Clique em cada provedor para ver o detalhamento 
            por modelo específico e comparar a concisão de cada versão.
          </p>
        </div>
      </div>

      {/* Main Chart Card */}
      <div className="bg-white dark:bg-[#211307] rounded-3xl border border-stone-200 dark:border-white/8 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-stone-100 dark:border-white/5 flex items-center justify-between">
          <h3 className="font-serif font-black text-[#1C1008] dark:text-[#f0e4d4] flex items-center gap-2">
            <IconFileText className="w-5 h-5 text-[#ff6b00]" />
            Média de Palavras por Abstract
          </h3>
          <span className="text-[10px] font-black uppercase tracking-widest text-[#1C1008]/40 dark:text-[#c4b09a]/40 bg-stone-100 dark:bg-white/5 px-3 py-1 rounded-full">
            Total de {analyses.length} análises
          </span>
        </div>

        <div className="p-8">
          {stats.length === 0 ? (
            <div className="py-20 text-center">
              <IconInfoCircle className="w-12 h-12 mx-auto mb-4 text-stone-300 dark:text-white/10" />
              <p className="text-stone-500 dark:text-[#9a8070] font-medium">Não há dados suficientes para gerar métricas.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {stats.map((item) => {
                const percentage = (item.average / maxAverage) * 100;
                return (
                  <details key={item.provider} className="group overflow-hidden border border-transparent hover:border-stone-100 dark:hover:border-white/5 rounded-2xl transition-all">
                    <summary className="list-none cursor-pointer p-4">
                      <div className="flex justify-between items-end mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-[#1C1008] dark:text-[#f0e4d4] uppercase tracking-wider">
                              {item.label}
                            </span>
                            <IconChevronDown className="w-3.5 h-3.5 text-[#ff6b00] transition-transform group-open:rotate-180" />
                          </div>
                          <span className="text-[10px] text-stone-400 dark:text-[#6a5040] font-bold">
                            Média Geral: {item.totalCount} resumos
                          </span>
                        </div>
                        <span className="text-lg font-serif font-black text-[#ff6b00]">
                          {item.average} <span className="text-xs uppercase font-sans text-stone-400 dark:text-[#6a5040]">palavras</span>
                        </span>
                      </div>
                      
                      <div className="h-2.5 bg-stone-100 dark:bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-[#ff6b00] to-[#ff9100] rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </summary>

                    {/* Breakdown by Model */}
                    <div className="px-4 pb-4 pt-2 bg-stone-50/50 dark:bg-white/2 space-y-4">
                       <div className="text-[10px] font-black uppercase tracking-widest text-[#1C1008]/40 dark:text-[#c4b09a]/40 mb-2 px-1">
                          Detalhamento por Modelo
                       </div>
                       {item.models.map(model => (
                         <div key={model.id} className="flex items-center justify-between bg-white dark:bg-[#1C1008]/40 p-3 rounded-xl border border-stone-100 dark:border-white/5">
                            <div className="flex flex-col">
                               <span className="text-xs font-bold text-[#1C1008] dark:text-[#f0e4d4]">{model.id}</span>
                               <span className="text-[9px] text-stone-400 dark:text-[#6a5040] uppercase tracking-tighter">{model.count} ocorrências</span>
                            </div>
                            <div className="flex items-center gap-2">
                               <div className="h-1.5 w-24 bg-stone-100 dark:bg-white/5 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-[#ff6b00]/60 rounded-full"
                                    style={{ width: `${(model.average / maxAverage) * 100}%` }}
                                  />
                               </div>
                               <span className="text-xs font-black text-[#ff6b00] min-w-[30px] text-right">{model.average}</span>
                            </div>
                         </div>
                       ))}
                    </div>
                  </details>
                );
              })}
            </div>
          )}
        </div>

        <div className="px-8 py-5 bg-stone-50 dark:bg-[#1e1410] border-t border-stone-100 dark:border-white/5">
           <p className="text-[10px] text-stone-400 dark:text-[#6a5040] flex items-center gap-1.5 uppercase font-bold tracking-wider">
              <IconInfoCircle className="w-3.5 h-3.5" />
              Os dados são calculados em tempo real com base no seu histórico de submissões.
           </p>
        </div>
      </div>

      {/* Lexical Bundles Analytics Card */}
      {bundleStats && Object.keys(bundleStats).length > 0 && (
        <div className="bg-white dark:bg-[#211307] rounded-3xl border border-stone-200 dark:border-white/8 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-stone-100 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-serif font-black text-[#1C1008] dark:text-[#f0e4d4] flex items-center gap-2">
                <IconBook2 className="w-5 h-5 text-[#ff6b00]" />
                Análise de Lexical Bundles
              </h3>
              <p className="text-xs text-stone-500 dark:text-[#9a8070] mt-1">
                Frequência de aparição dos seus bundles por disciplina.
              </p>
            </div>
            <div className="flex items-center gap-4">
               <button 
                  onClick={handleExportExcel}
                  className="flex items-center gap-1.5 text-xs font-bold py-1.5 px-3 rounded-lg border border-stone-200 dark:border-white/10 bg-stone-50 hover:bg-stone-100 dark:bg-[#3a2a1e] dark:hover:bg-[#4a3a2e] text-stone-700 dark:text-[#c4b09a] transition-colors"
               >
                  <IconFileText className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                  Exportar XLSX
               </button>
               <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest hidden md:flex">
                 <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-stone-300 dark:bg-stone-600"></span>
                    <span className="text-stone-500 dark:text-[#9a8070]">Original</span>
                 </div>
                 <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ff6b00]"></span>
                    <span className="text-[#ff6b00]">AI Generated</span>
                 </div>
               </div>
            </div>
          </div>

          <div className="p-6 space-y-4">
            {Object.entries(bundleStats).map(([disc, bStats]) => {
              const bundlesArray = Object.entries(bStats).sort((a, b) => (b[1].original + b[1].ai) - (a[1].original + a[1].ai));
              if (bundlesArray.length === 0) return null;

              return (
                <details key={disc} className="group overflow-hidden border border-transparent hover:border-stone-100 dark:hover:border-white/5 rounded-xl transition-all" open>
                  <summary className="list-none cursor-pointer p-3 bg-stone-50/50 dark:bg-[#1C1008]/40 rounded-lg mb-1 flex items-center justify-between border border-transparent group-open:border-stone-100 dark:group-open:border-white/5">
                    <span className="text-xs font-black text-[#1C1008] dark:text-[#f0e4d4] uppercase tracking-wider flex items-center gap-1.5">
                      <IconChevronDown className="w-3.5 h-3.5 text-[#ff6b00] transition-transform group-open:rotate-180" />
                      {disc}
                    </span>
                    <span className="text-[9px] font-bold text-stone-400 dark:text-[#6a5040] uppercase bg-white dark:bg-[#211307] px-1.5 py-0.5 rounded-md shadow-sm border border-stone-100 dark:border-white/5">
                      {bundlesArray.length} bundles
                    </span>
                  </summary>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 px-1 pb-3 pt-1">
                    {bundlesArray.map(([bundle, counts]) => (
                      <div key={bundle} className="bg-white dark:bg-[#211307] border border-stone-200 dark:border-white/5 p-2 rounded-lg flex items-center justify-between gap-2 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                        <span className="text-[11px] font-medium text-stone-700 dark:text-[#d4c4b0] truncate" title={bundle}>
                          {bundle}
                        </span>
                        <div className="flex items-center gap-1 shrink-0">
                          <div className="flex items-center justify-center min-w-[20px] h-5 px-1 bg-stone-100 dark:bg-stone-800 rounded text-[9px] font-bold text-stone-600 dark:text-stone-400" title="Originais">
                            {counts.original}
                          </div>
                          <div className="flex items-center justify-center min-w-[20px] h-5 px-1 bg-[#ff6b00]/10 rounded text-[9px] font-bold text-[#ff6b00]" title="IA">
                            {counts.ai}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </details>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
