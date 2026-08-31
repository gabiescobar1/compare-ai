'use client';

import React, { useMemo, useState } from 'react';
import { IconInfoCircle, IconFileText, IconChevronDown, IconBook2, IconLayoutDashboard, IconListDetails } from '@tabler/icons-react';
import { useLexicalBundles } from '@/contexts/LexicalBundlesContext';
import { DISCIPLINES } from '@/constants/Disciplines';
import * as XLSX from 'xlsx';
import LexicalBundlesSettings from './LexicalBundlesSettings';
import DisciplineAnalysis from './DisciplineAnalysis';
import FormatAnalysis from './FormatAnalysis';
import BundleCoverage from './BundleCoverage';

export default function AnalyticsClient({ analyses }) {
  const { bundles } = useLexicalBundles();
  const [activeTab, setActiveTab] = useState('palavras');
  // Seções de visão geral recolhidas por padrão, para a análise por disciplina
  // (interativa) aparecer mais acima na página.
  const [showOverview, setShowOverview] = useState(false);
  const [showAverages, setShowAverages] = useState(false);

  const wordStats = useMemo(() => {
    const stats = {};
    analyses.forEach(a => {
      const discLabel = DISCIPLINES.find(d => d.id === a.discipline)?.label || a.discipline || 'Desconhecida';
      if (!stats[discLabel]) {
        stats[discLabel] = {
          originalWords: 0,
          originalCount: 0,
          aiProviders: {},
        };
      }
      
      if (a.originalAbstract) {
        const wCount = a.originalAbstract.trim().split(/\s+/).filter(Boolean).length;
        if (wCount > 0) {
          stats[discLabel].originalWords += wCount;
          stats[discLabel].originalCount += 1;
        }
      }

      if (a.summaries) {
        a.summaries.forEach(s => {
          if (s.content && !s.content.includes('ERRO')) {
            const cCount = s.content.trim().split(/\s+/).filter(Boolean).length;
            if (cCount > 0) {
              const provider = s.provider || 'Desconhecido';
              if (!stats[discLabel].aiProviders[provider]) {
                stats[discLabel].aiProviders[provider] = { words: 0, count: 0 };
              }
              stats[discLabel].aiProviders[provider].words += cCount;
              stats[discLabel].aiProviders[provider].count += 1;
            }
          }
        });
      }
    });

    return Object.entries(stats).map(([disc, data]) => {
      const providerEntries = Object.entries(data.aiProviders);
      const providerAverages = Object.fromEntries(
        providerEntries.map(([p, pData]) => [p, Math.round(pData.words / pData.count)])
      );
      const aiWords = providerEntries.reduce((s, [, pd]) => s + pd.words, 0);
      const aiCount = providerEntries.reduce((s, [, pd]) => s + pd.count, 0);
      const totalWords = data.originalWords + aiWords;
      const totalCount = data.originalCount + aiCount;
      return {
        discipline: disc,
        avgOriginal: data.originalCount > 0 ? Math.round(data.originalWords / data.originalCount) : 0,
        avgOverall: totalCount > 0 ? Math.round(totalWords / totalCount) : 0,
        providerAverages,
      };
    }).sort((a, b) => b.avgOriginal - a.avgOriginal);
  }, [analyses]);

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
    <div className="max-w-7xl mx-auto space-y-12">
      {/* Tabs Navigation */}
      <div className="flex justify-center">
        <div className="inline-flex bg-cream dark:bg-paper-dark p-1.5 rounded-2xl border border-stone-200 dark:border-white/8 shadow-sm">
          <button 
            onClick={() => setActiveTab('palavras')}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'palavras' ? 'bg-accent text-white shadow-md' : 'text-stone-500 hover:text-stone-800 dark:text-[#9a8070] dark:hover:text-parchment'}`}
          >
            <IconFileText className="w-4 h-4" /> Comparativo de Palavras
          </button>
          <button
            onClick={() => setActiveTab('formato')}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'formato' ? 'bg-accent text-white shadow-md' : 'text-stone-500 hover:text-stone-800 dark:text-[#9a8070] dark:hover:text-parchment'}`}
          >
            <IconListDetails className="w-4 h-4" /> Formato
          </button>
          <button
            onClick={() => setActiveTab('bundles')}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'bundles' ? 'bg-accent text-white shadow-md' : 'text-stone-500 hover:text-stone-800 dark:text-[#9a8070] dark:hover:text-parchment'}`}
          >
            <IconBook2 className="w-4 h-4" /> Lexical Bundles
          </button>
        </div>
      </div>

      {/* Tab: Palavras */}
      {activeTab === 'palavras' && (
        <div className="space-y-8">
          {/* Média de Palavras Original vs AI por Disciplina */}
          <div className="bg-cream dark:bg-paper-dark rounded-3xl border border-stone-200 dark:border-white/8 shadow-sm overflow-hidden">
            <button
              type="button"
              onClick={() => setShowOverview(v => !v)}
              aria-expanded={showOverview}
              className="w-full px-8 py-6 flex items-center justify-between gap-3 text-left hover:bg-stone-50/50 dark:hover:bg-white/3 transition-colors"
            >
              <h3 className="font-serif font-black text-ink dark:text-parchment flex items-center gap-2">
                <IconLayoutDashboard className="w-5 h-5 text-accent" />
                Visão Geral: Tamanho dos Abstracts por Disciplina
              </h3>
              <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-accent/10 text-accent">
                <IconChevronDown className={`w-5 h-5 transition-transform duration-300 ${showOverview ? 'rotate-180' : ''}`} stroke={2.5} />
              </span>
            </button>
            {showOverview && (
            <div className="p-8 border-t border-stone-100 dark:border-white/5">
              {wordStats.length === 0 ? (
                <div className="py-10 text-center">
                  <p className="text-stone-500 dark:text-[#9a8070] font-medium">Sem dados de comparação no momento.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {wordStats.map((stat, idx) => (
                    <div key={idx} className="bg-stone-50/50 dark:bg-white/2 border border-stone-200 dark:border-white/5 p-5 rounded-2xl flex flex-col gap-4">
                      <h4 className="font-bold text-ink dark:text-parchment text-sm truncate" title={stat.discipline}>{stat.discipline}</h4>
                      <div className="flex flex-col gap-2 text-sm text-stone-600 dark:text-[#c4b09a]">
                        <div className="flex items-center justify-between bg-cream dark:bg-[#1e1410] px-3 py-2 rounded-xl shadow-sm border border-stone-100 dark:border-white/5">
                          <span>Originais (Média)</span>
                          <span className="font-black text-accent">{stat.avgOriginal}</span>
                        </div>
                        {Object.entries(stat.providerAverages).map(([provider, avg]) => (
                          <div key={provider} className="flex items-center justify-between bg-cream dark:bg-[#1e1410] px-3 py-2 rounded-xl shadow-sm border border-stone-100 dark:border-white/5">
                            <span className="capitalize">{provider === 'gemini' ? 'Google Gemini' : provider === 'claude' ? 'Anthropic Claude' : provider === 'openai' ? 'OpenAI' : provider} (Média)</span>
                            <span className="font-black text-blue-600 dark:text-blue-400">{avg}</span>
                          </div>
                        ))}
                        <div className="flex items-center justify-between bg-cream dark:bg-[#1e1410] px-3 py-2 rounded-xl shadow-sm border border-stone-100 dark:border-white/5" title="Média de palavras de todos os abstracts (original + IAs) desta disciplina">
                          <span>Média Geral</span>
                          <span className="font-black text-ink dark:text-parchment">{stat.avgOverall}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            )}
          </div>

          {/* Main Chart Card (Existente) */}
      <div className="bg-cream dark:bg-paper-dark rounded-3xl border border-stone-200 dark:border-white/8 shadow-sm overflow-hidden">
        <button
          type="button"
          onClick={() => setShowAverages(v => !v)}
          aria-expanded={showAverages}
          className="w-full px-8 py-6 flex items-center justify-between gap-3 text-left hover:bg-stone-50/50 dark:hover:bg-white/3 transition-colors"
        >
          <h3 className="font-serif font-black text-ink dark:text-parchment flex items-center gap-2">
            <IconFileText className="w-5 h-5 text-accent" />
            Média de Palavras por Abstract
          </h3>
          <div className="flex items-center gap-3 flex-shrink-0">
            <span className="text-[10px] font-black uppercase tracking-widest text-ink/40 dark:text-[#c4b09a]/40 bg-stone-100 dark:bg-white/5 px-3 py-1 rounded-full">
              Total de {analyses.length} análises
            </span>
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-accent/10 text-accent">
              <IconChevronDown className={`w-5 h-5 transition-transform duration-300 ${showAverages ? 'rotate-180' : ''}`} stroke={2.5} />
            </span>
          </div>
        </button>

        {showAverages && (<>
        <div className="p-8 border-t border-stone-100 dark:border-white/5">
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
                            <span className="text-sm font-black text-ink dark:text-parchment uppercase tracking-wider">
                              {item.label}
                            </span>
                            <IconChevronDown className="w-3.5 h-3.5 text-accent transition-transform group-open:rotate-180" />
                          </div>
                          <span className="text-[10px] text-stone-400 dark:text-[#8a7058] font-bold">
                            Média Geral: {item.totalCount} resumos
                          </span>
                        </div>
                        <span className="text-lg font-serif font-black text-accent">
                          {item.average} <span className="text-xs uppercase font-sans text-stone-400 dark:text-[#8a7058]">palavras</span>
                        </span>
                      </div>
                      
                      <div className="h-2.5 bg-stone-100 dark:bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-accent to-accent-2 rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </summary>

                    {/* Breakdown by Model */}
                    <div className="px-4 pb-4 pt-2 bg-stone-50/50 dark:bg-white/2 space-y-4">
                       <div className="text-[10px] font-black uppercase tracking-widest text-ink/40 dark:text-[#c4b09a]/40 mb-2 px-1">
                          Detalhamento por Modelo
                       </div>
                       {item.models.map(model => (
                         <div key={model.id} className="flex items-center justify-between bg-cream dark:bg-ink/40 p-3 rounded-xl border border-stone-100 dark:border-white/5">
                            <div className="flex flex-col">
                               <span className="text-xs font-bold text-ink dark:text-parchment">{model.id}</span>
                               <span className="text-[9px] text-stone-400 dark:text-[#8a7058] uppercase tracking-tighter">{model.count} ocorrências</span>
                            </div>
                            <div className="flex items-center gap-2">
                               <div className="h-1.5 w-24 bg-stone-100 dark:bg-white/5 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-accent/60 rounded-full"
                                    style={{ width: `${(model.average / maxAverage) * 100}%` }}
                                  />
                               </div>
                               <span className="text-xs font-black text-accent min-w-[30px] text-right">{model.average}</span>
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
           <p className="text-[10px] text-stone-400 dark:text-[#8a7058] flex items-center gap-1.5 uppercase font-bold tracking-wider">
              <IconInfoCircle className="w-3.5 h-3.5" />
              Os dados são calculados em tempo real com base no seu histórico de submissões.
           </p>
        </div>
        </>)}
      </div>

          {/* Análise por Disciplina */}
          <DisciplineAnalysis analyses={analyses} />
      </div>
      )}

      {/* Tab: Formato */}
      {activeTab === 'formato' && (
        <FormatAnalysis analyses={analyses} />
      )}

      {/* Tab: Lexical Bundles */}
      {activeTab === 'bundles' && (
        <div className="space-y-6">
          <LexicalBundlesSettings analyses={analyses} />
          <BundleCoverage analyses={analyses} />
        </div>
      )}
    </div>
  );
}
