'use client';

import React, { useMemo } from 'react';
import { IconChartBar, IconInfoCircle, IconFileText } from '@tabler/icons-react';

export default function AnalyticsClient({ analyses }) {
  const stats = useMemo(() => {
    const providerData = {};

    analyses.forEach(analysis => {
      analysis.summaries.forEach(summary => {
        const provider = summary.provider;
        const content = summary.content || '';
        const wordCount = content.trim().split(/\s+/).filter(Boolean).length;

        if (!providerData[provider]) {
          providerData[provider] = {
            totalWords: 0,
            count: 0,
            label: provider.charAt(0).toUpperCase() + provider.slice(1)
          };
        }

        if (wordCount > 0 && !content.includes('ERRO')) {
            providerData[provider].totalWords += wordCount;
            providerData[provider].count += 1;
        }
      });
    });

    const results = Object.keys(providerData).map(key => ({
      provider: key,
      label: providerData[key].label,
      average: providerData[key].count > 0 
        ? Math.round(providerData[key].totalWords / providerData[key].count) 
        : 0,
      totalCount: providerData[key].count
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
            Visualize o comportamento dos diferentes modelos de IA. O gráfico abaixo apresenta a média de palavras 
            geradas em cada abstract, permitindo comparar a concisão e detalhamento de cada provider.
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
            <div className="space-y-8">
              {stats.map((item) => {
                const percentage = (item.average / maxAverage) * 100;
                return (
                  <div key={item.provider} className="group">
                    <div className="flex justify-between items-end mb-2">
                      <div>
                        <span className="text-sm font-black text-[#1C1008] dark:text-[#f0e4d4] uppercase tracking-wider">
                          {item.label}
                        </span>
                        <span className="ml-2 text-[10px] text-stone-400 dark:text-[#6a5040] font-bold">
                          {item.totalCount} resumos analisados
                        </span>
                      </div>
                      <span className="text-lg font-serif font-black text-[#ff6b00]">
                        {item.average} <span className="text-xs uppercase font-sans text-stone-400 dark:text-[#6a5040]">palavras</span>
                      </span>
                    </div>
                    
                    {/* Bar Track */}
                    <div className="h-4 bg-stone-100 dark:bg-white/5 rounded-full overflow-hidden">
                      {/* Bar Fill */}
                      <div 
                        className="h-full bg-gradient-to-r from-[#ff6b00] to-[#ff9100] rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(255,107,0,0.3)]"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
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
    </div>
  );
}
