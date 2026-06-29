'use client';
import React, { useState } from 'react';
import { IconCoin, IconFileText, IconBulb, IconDownload, IconTrash, IconChevronDown, IconBook2, IconPackage, IconCopy, IconCheck } from '@tabler/icons-react';
import { PROVIDERS } from '@/constants/AiModels';
import { DISCIPLINES } from '@/constants/Disciplines';
import JSZip from 'jszip';
import { useLexicalBundles } from '@/contexts/LexicalBundlesContext';

const PROVIDER_STYLES = {
  openai: { headerBg: 'bg-[#e8f8c1] dark:bg-[#2a3a10]', label: 'OpenAI' },
  gemini: { headerBg: 'bg-[#d0d1ff] dark:bg-[#1e1e40]', label: 'Google Gemini' },
  claude: { headerBg: 'bg-[#f9dcc4] dark:bg-[#3a2010]', label: 'Anthropic Claude' },
};

const HighlightedText = ({ text, disciplineLabel }) => {
  const { bundles } = useLexicalBundles();
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted || !text || !bundles || Object.keys(bundles).length === 0) return <>{text}</>;
  
  let activeBundles = [];
  if (Array.isArray(bundles)) {
    activeBundles = bundles;
  } else {
    // Busca a disciplina com o nome exato (case insensitive) ou usa 'Geral'
    const matchingKey = Object.keys(bundles).find(
      k => k.toLowerCase() === (disciplineLabel || '').toLowerCase()
    );
    if (matchingKey) {
      activeBundles = bundles[matchingKey];
    } else if (bundles['Geral']) {
      activeBundles = bundles['Geral'];
    }
  }

  if (activeBundles.length === 0) return <>{text}</>;

  const sortedBundles = [...activeBundles].sort((a, b) => b.length - a.length);
  const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = sortedBundles.map(escapeRegExp).join('|');
  const regex = new RegExp(`\\b(${pattern})\\b`, 'gi');

  const parts = text.split(regex);
  
  return (
    <>
      {parts.map((part, i) => {
        if (sortedBundles.some(b => b.toLowerCase() === part.toLowerCase())) {
          return (
            <mark key={i} className="bg-yellow-200 dark:bg-yellow-500/30 text-inherit px-0.5 rounded font-medium">
              {part}
            </mark>
          );
        }
        return part;
      })}
    </>
  );
};

const ModelCard = ({ summary, disciplineLabel }) => {
  const isError = summary?.content?.includes('ERRO');
  const wordCount = summary?.content ? summary.content.trim().split(/\s+/).filter(Boolean).length : 0;
  const style = PROVIDER_STYLES[summary?.provider] || { headerBg: 'bg-stone-50', label: summary?.provider || 'Desconhecido' };

  const handleDownload = () => {
    if (!summary?.content) return;
    const blob = new Blob([summary.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resumo_${style.label.toLowerCase().replace(/\s+/g, '_')}_${summary.model_id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-cream dark:bg-paper-dark flex flex-col h-full rounded-3xl shadow-sm border border-stone-200 dark:border-white/8 overflow-hidden transition-colors duration-300">
      <div className={`px-5 py-4 border-b border-stone-200 dark:border-white/8 flex items-center justify-between ${style.headerBg}`}>
        <div className="flex flex-col">
          <h3 className="text-base font-bold text-ink dark:text-parchment tracking-tight">{style.label}</h3>
          <span className="text-xs text-stone-500 dark:text-[#9a8070] mt-0.5 tracking-wider">{summary?.model_id || 'Desconhecido'}</span>
        </div>
      </div>

      <div className="px-5 py-3 border-b border-stone-100 dark:border-white/5 flex items-start justify-between gap-4 bg-stone-50/50 dark:bg-[#1e1410]/50 text-xs text-stone-600 dark:text-[#9a8070]">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center" title="Tokens de Entrada (Submetidos)">
            <IconFileText className="w-3.5 h-3.5 mr-1.5 text-stone-400 dark:text-[#8a7058]" />
            <span>{summary?.input_tokens || 0} tks entrada</span>
          </div>
          <div className="flex items-center" title="Tokens de Saída (Abstract Gerado)">
            <IconFileText className="w-3.5 h-3.5 mr-1.5 text-stone-400 dark:text-[#8a7058]" />
            <span>{summary?.output_tokens || 0} tks saída</span>
          </div>
          <div className="flex items-center" title="Palavras">
            <IconFileText className="w-3.5 h-3.5 mr-1.5 text-stone-400 dark:text-[#8a7058]" />
            <span>{wordCount} palavras</span>
          </div>
        </div>
        <div className="flex items-center text-stone-600 dark:text-[#c4b09a] font-bold mt-0.5" title="Custo Estimado">
          <IconCoin className="w-3.5 h-3.5 mr-1" />
          <span>${summary?.cost?.toFixed(4) || "0.0000"}</span>
        </div>
      </div>

      <div className={`p-5 flex-1 relative ${isError ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400' : 'bg-cream dark:bg-paper-dark'}`}>
        <div className="prose text-[13px] prose-stone max-w-none overflow-y-auto max-h-[350px] pr-2 custom-scrollbar text-stone-700 dark:text-[#d4c4b0] text-justify leading-relaxed whitespace-pre-wrap">
          {summary?.content ? <HighlightedText text={summary.content} disciplineLabel={disciplineLabel} /> : "Nenhum conteúdo gerado."}
        </div>
      </div>
      <div className="p-4 border-t border-stone-100 dark:border-white/5 bg-stone-50 dark:bg-paper-dark">
         <button 
            onClick={handleDownload}
            disabled={isError || !summary?.content}
            className={`w-full flex items-center justify-center gap-2 text-xs font-bold py-2 px-4 rounded-xl shadow-sm border transition-colors ${
               isError || !summary?.content
               ? 'bg-stone-100 dark:bg-paper-dark border-stone-200 dark:border-white/8 text-stone-400 dark:text-[#8a7058] cursor-not-allowed'
               : 'bg-cream dark:bg-paper-dark border-stone-200 dark:border-white/10 hover:bg-stone-100 dark:hover:bg-paper-dark text-stone-700 dark:text-[#c4b09a]'
            }`}
         >
            <IconDownload className="w-4 h-4" /> Baixar .txt
         </button>
      </div>
    </div>
  );
};

export default function ResultsComparison({ data, onDelete, defaultExpanded = true, disciplineAvg = null }) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [copiedDoi, setCopiedDoi] = useState(false);

  if (!data) return null;

  const summaries = data.summaries || [];
  const wordCount = data.originalAbstract ? data.originalAbstract.trim().split(/\s+/).filter(Boolean).length : 0;
  const disciplineLabel = DISCIPLINES.find(d => d.id === data.discipline)?.label || data.discipline || '—';

  const handleDownloadZip = async () => {
    const zip = new JSZip();
    const doiSlug = data.doi?.replace(/[^a-z0-9]/gi, '_') || 'doi';
    summaries.forEach((summary, idx) => {
      if (!summary?.content || summary.content.includes('ERRO')) return;
      const providerLabel = PROVIDER_STYLES[summary.provider]?.label || summary.provider;
      const fileName = `${idx + 1}_${providerLabel.replace(/\s+/g, '_')}_${summary.model_id}.txt`;
      zip.file(fileName, summary.content);
    });
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resumos_IA_${doiSlug}.zip`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mt-12 bg-cream dark:bg-paper-dark rounded-3xl shadow-sm border border-stone-200 dark:border-white/8 relative group overflow-hidden transition-colors duration-300">
      {/* Header colapsável — sempre visível */}
      <div
        className="flex items-center justify-between gap-4 px-8 py-6 cursor-pointer select-none hover:bg-stone-50/50 dark:hover:bg-white/3 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-serif font-black text-ink shrink-0">
                <span 
                  className="text-accent bg-accent/10 px-2 py-0.5 rounded select-text cursor-text"
                  onClick={(e) => e.stopPropagation()}
                >
                  {data.doi}
                </span>
              </h2>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  navigator.clipboard.writeText(data.doi);
                  setCopiedDoi(true);
                  setTimeout(() => setCopiedDoi(false), 2000);
                }}
                className="p-1.5 bg-white/50 dark:bg-white/5 hover:bg-stone-200 dark:hover:bg-white/10 rounded-md transition-colors text-stone-400 hover:text-stone-700 dark:hover:text-parchment border border-stone-200 dark:border-white/10"
                title="Copiar DOI"
              >
                {copiedDoi ? <IconCheck className="w-4 h-4 text-green-500" /> : <IconCopy className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-stone-500 dark:text-[#9a8070]">
            <span className="font-bold text-stone-600 dark:text-[#c4b09a]" title={data.title}>{data.title}</span>
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-stone-500 dark:text-[#9a8070] mt-2">
            <span className="flex items-center gap-1">
              <IconBook2 className="w-3.5 h-3.5" /> {disciplineLabel}
            </span>
            <span className="flex items-center gap-1">
              <IconFileText className="w-3.5 h-3.5" /> {wordCount} palavras
            </span>
            <span className="flex items-center gap-1">
              {summaries.length} modelo{summaries.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onDelete && (
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(data.id); }}
              title="Excluir este registro"
              className="p-2 bg-cream dark:bg-paper-dark rounded-full shadow-sm border border-stone-200 dark:border-white/8 text-stone-400 dark:text-[#9a8070] hover:text-red-500 hover:border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
            >
              <IconTrash className="w-5 h-5" />
            </button>
          )}
          <div className={`p-1.5 rounded-full text-stone-400 dark:text-[#9a8070] transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
            <IconChevronDown className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Conteúdo expansível */}
      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-8 pb-8 pt-2 border-t border-stone-100 dark:border-white/5">
          {data.error ? (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 p-6 rounded text-red-800 dark:text-red-400 font-medium">
              Erro no Processamento: {data.error}
            </div>
          ) : (
            <div className="space-y-8">
              {/* Box do Abstract Original */}
               <div className="bg-stone-50 dark:bg-paper-dark border border-stone-200 dark:border-white/8 rounded-3xl flex flex-col shadow-inner overflow-hidden max-w-5xl mx-auto">
                <div className="px-5 py-4 border-b border-stone-200 dark:border-white/8 flex items-center justify-between">
                  <h3 className="text-base font-bold text-ink dark:text-parchment tracking-tight flex items-center gap-2">
                    <IconBulb className="w-4 h-4 text-stone-600 dark:text-[#9a8070]"/> Abstract Original
                  </h3>
                </div>
                 <div className="px-5 py-3 border-b border-stone-200 dark:border-white/8 bg-stone-100/50 dark:bg-paper-dark/50 flex flex-col gap-2">
                   <h4 className="text-xs font-bold text-stone-500 dark:text-[#9a8070] uppercase tracking-widest" title={data.title}>{data.title}</h4>
                   <div className="flex items-center gap-4 text-xs text-stone-600 dark:text-[#9a8070]">
                      <span className="flex items-center" title="Disciplina">
                        <IconBook2 className="w-3.5 h-3.5 mr-1 text-stone-400 dark:text-[#8a7058]" />
                        {disciplineLabel}
                      </span>
                      <span className="flex items-center" title="Quantidade de palavras">
                        <IconFileText className="w-3.5 h-3.5 mr-1 text-stone-400 dark:text-[#8a7058]" />
                        {wordCount} palavras
                      </span>
                   </div>
                </div>
                <div className="p-5 flex-1 relative">
                   <div className="prose text-[13px] prose-stone max-w-none overflow-y-auto max-h-[350px] pr-2 custom-scrollbar text-stone-700 dark:text-[#d4c4b0] text-justify leading-relaxed whitespace-pre-wrap">
                    <HighlightedText text={data.originalAbstract} disciplineLabel={disciplineLabel} />
                  </div>
                </div>
                 <div className="p-4 border-t border-stone-100 dark:border-white/5 bg-stone-50 dark:bg-paper-dark">
                   <button 
                      onClick={() => {
                        if (!data.originalAbstract) return;
                        const blob = new Blob([data.originalAbstract], { type: 'text/plain;charset=utf-8' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `abstract_original_${data.doi?.replace(/\//g, '_')}.txt`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      disabled={!data.originalAbstract}
                      className={`w-full flex items-center justify-center gap-2 text-xs font-bold py-2 px-4 rounded-xl shadow-sm border transition-colors ${
                         !data.originalAbstract
                          ? 'bg-stone-100 dark:bg-paper-dark border-stone-200 dark:border-white/8 text-stone-400 dark:text-[#8a7058] cursor-not-allowed'
                          : 'bg-cream dark:bg-paper-dark border-stone-200 dark:border-white/10 hover:bg-stone-100 dark:hover:bg-paper-dark text-stone-700 dark:text-[#c4b09a]'
                      }`}
                   >
                      <IconDownload className="w-4 h-4" /> Baixar .txt
                   </button>
                </div>
              </div>

              {/* Model cards dinâmicos */}
              {summaries.length <= 3 ? (
                <div className="flex flex-wrap justify-center gap-6">
                  {summaries.map((summary, idx) => (
                    <div key={idx} className="w-full sm:w-[calc(50%-12px)] xl:w-[calc(33.333%-16px)]">
                      <ModelCard summary={summary} disciplineLabel={disciplineLabel} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto custom-scrollbar-h pb-3">
                  <div className="flex gap-6" style={{ minWidth: 'max-content' }}>
                    {summaries.map((summary, idx) => (
                      <div key={idx} className="w-[320px] flex-shrink-0">
                        <ModelCard summary={summary} disciplineLabel={disciplineLabel} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Box de Comparação de Palavras */}
              <div className="bg-stone-50 dark:bg-[#1e1410] border border-stone-200 dark:border-white/8 rounded-xl p-4 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <IconFileText className="w-5 h-5 text-stone-400 dark:text-[#8a7058]" />
                  <span className="text-sm font-bold text-stone-700 dark:text-[#c4b09a]">Comparativo de Palavras</span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-stone-600 dark:text-[#9a8070]">
                  <div className="flex items-center gap-1.5 bg-cream dark:bg-paper-dark px-2.5 py-1.5 rounded-lg border border-stone-200 dark:border-white/5 shadow-sm" title="Abstract Original">
                    <span className="font-bold">Original:</span>
                    <span className={wordCount > 0 ? "text-accent" : ""}>{wordCount}</span>
                  </div>
                  {summaries.map((summary, idx) => {
                    if (!summary?.content || summary.content.includes('ERRO')) return null;
                    const cWordCount = summary.content.trim().split(/\s+/).filter(Boolean).length;
                    const providerLabel = PROVIDER_STYLES[summary.provider]?.label || summary.provider;
                    return (
                      <div key={idx} className="flex items-center gap-1.5 bg-cream dark:bg-paper-dark px-2.5 py-1.5 rounded-lg border border-stone-200 dark:border-white/5 shadow-sm">
                        <span className="font-bold">{providerLabel}:</span>
                        <span className={cWordCount > wordCount ? "text-red-500" : "text-green-600 dark:text-green-400"}>{cWordCount}</span>
                      </div>
                    );
                  })}
                  {disciplineAvg > 0 && (
                    <div className="flex items-center gap-1.5 bg-cream dark:bg-paper-dark px-2.5 py-1.5 rounded-lg border border-stone-200 dark:border-white/5 shadow-sm" title="Média de palavras dos abstracts desta disciplina no histórico">
                      <span className="font-bold">Média da Disciplina:</span>
                      <span className="text-stone-600 dark:text-[#c4b09a]">{disciplineAvg}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Botão de baixar todos os resumos da IA em ZIP */}
              {summaries.some(s => s?.content && !s.content.includes('ERRO')) && (
                <div className="flex justify-center pt-2">
                  <button
                    onClick={handleDownloadZip}
                     className="flex items-center gap-2 text-sm font-bold py-2.5 px-6 rounded-2xl border border-stone-200 dark:border-white/10 bg-cream dark:bg-paper-dark hover:bg-stone-50 dark:hover:bg-paper-dark text-stone-700 dark:text-[#c4b09a] shadow-sm transition-colors"
                  >
                    <IconPackage className="w-4 h-4 text-accent" />
                    Baixar resumos das IAs (.zip)
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
