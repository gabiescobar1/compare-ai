'use client';
import React, { useState } from 'react';
import { IconCoin, IconFileText, IconBulb, IconDownload, IconTrash, IconChevronDown, IconBook2, IconPackage } from '@tabler/icons-react';
import { PROVIDERS } from '@/constants/AiModels';
import { DISCIPLINES } from '@/constants/Disciplines';
import JSZip from 'jszip';

const PROVIDER_STYLES = {
  openai: { headerBg: 'bg-[#e8f8c1]', label: 'OpenAI' },
  gemini: { headerBg: 'bg-[#d0d1ff]', label: 'Google Gemini' },
  claude: { headerBg: 'bg-[#f9dcc4]', label: 'Anthropic Claude' },
};

const ModelCard = ({ summary }) => {
  const isError = summary?.content?.includes('ERRO');
  const wordCount = summary?.content ? summary.content.trim().split(/\s+/).filter(Boolean).length : 0;
  const style = PROVIDER_STYLES[summary?.provider] || { headerBg: 'bg-slate-50', label: summary?.provider || 'Desconhecido' };

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
    <div className="bg-white flex flex-col h-full rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
      <div className={`px-5 py-4 border-b border-slate-200 flex items-center justify-between ${style.headerBg}`}>
        <div className="flex flex-col">
          <h3 className="text-base font-bold text-[#291f1b] tracking-tight">{style.label}</h3>
          <span className="text-xs text-slate-500 mt-0.5 tracking-wider">{summary?.model_id || 'Desconhecido'}</span>
        </div>
      </div>

      <div className="px-5 py-3 border-b border-slate-100 flex items-start justify-between gap-4 bg-slate-50/50 text-xs font-mono text-slate-600">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center" title="Tokens de Entrada (Submetidos)">
            <IconFileText className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
            <span>{summary?.input_tokens || 0} tks entrada</span>
          </div>
          <div className="flex items-center" title="Tokens de Saída (Abstract Gerado)">
            <IconFileText className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
            <span>{summary?.output_tokens || 0} tks saída</span>
          </div>
          <div className="flex items-center" title="Palavras">
            <IconFileText className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
            <span>{wordCount} palavras</span>
          </div>
        </div>
        <div className="flex items-center text-slate-600 font-bold mt-0.5" title="Custo Estimado">
          <IconCoin className="w-3.5 h-3.5 mr-1" />
          <span>${summary?.cost?.toFixed(4) || "0.0000"}</span>
        </div>
      </div>

      <div className={`p-5 flex-1 relative ${isError ? 'bg-red-50 text-red-700' : 'bg-white'}`}>
        <div className="prose text-[13px] prose-slate max-w-none overflow-y-auto max-h-[350px] pr-2 custom-scrollbar text-slate-700 text-justify leading-relaxed whitespace-pre-wrap">
          {summary?.content || "Nenhum conteúdo gerado."}
        </div>
      </div>
      <div className="p-4 border-t border-slate-100 bg-slate-50">
         <button 
            onClick={handleDownload}
            disabled={isError || !summary?.content}
            className={`w-full flex items-center justify-center gap-2 text-xs font-bold py-2 px-4 rounded-xl shadow-sm border border-slate-200 transition-colors ${
               isError || !summary?.content
               ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
               : 'bg-white hover:bg-slate-100 text-slate-700'
            }`}
         >
            <IconDownload className="w-4 h-4" /> Baixar .txt
         </button>
      </div>
    </div>
  );
};

export default function ResultsComparison({ data, onDelete, defaultExpanded = true }) {
  if (!data) return null;

  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
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
    <div className="mt-12 bg-white rounded-3xl shadow-sm border border-slate-200 relative group overflow-hidden">
      {/* Header colapsável — sempre visível */}
      <div
        className="flex items-center justify-between gap-4 px-8 py-6 cursor-pointer select-none hover:bg-slate-50/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
            <h2 className="text-xl font-serif font-black text-[#291f1b] shrink-0">
              <span className="text-[#ff6b00] bg-[#ff6b00]/10 px-2 py-0.5 rounded">{data.doi}</span>
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-slate-500">
            <span className="font-bold text-slate-600" title={data.title}>{data.title}</span>
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-slate-500 mt-2">
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
              className="p-2 bg-white rounded-full shadow-sm border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
            >
              <IconTrash className="w-5 h-5" />
            </button>
          )}
          <div className={`p-1.5 rounded-full text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
            <IconChevronDown className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Conteúdo expansível */}
      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-8 pb-8 pt-2 border-t border-slate-100">
          {data.error ? (
            <div className="bg-red-50 border border-red-200 p-6 rounded text-red-800 font-medium">
              Erro no Processamento: {data.error}
            </div>
          ) : (
            <div className="space-y-8">
              {/* Box do Abstract Original */}
              <div className="bg-slate-50 border border-slate-200 rounded-3xl flex flex-col shadow-inner overflow-hidden max-w-5xl mx-auto">
                <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                  <h3 className="text-base font-bold text-[#291f1b] tracking-tight flex items-center gap-2">
                    <IconBulb className="w-4 h-4 text-slate-600"/> Abstract Original
                  </h3>
                </div>
                <div className="px-5 py-3 border-b border-slate-200 bg-slate-100/50 flex flex-col gap-2">
                   <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest" title={data.title}>{data.title}</h4>
                   <div className="flex items-center gap-4 text-xs font-mono text-slate-600">
                      <span className="flex items-center" title="Disciplina">
                        <IconBook2 className="w-3.5 h-3.5 mr-1 text-slate-400" />
                        {disciplineLabel}
                      </span>
                      <span className="flex items-center" title="Quantidade de palavras">
                        <IconFileText className="w-3.5 h-3.5 mr-1 text-slate-400" />
                        {wordCount} palavras
                      </span>
                   </div>
                </div>
                <div className="p-5 flex-1 relative">
                  <div className="prose text-[13px] prose-slate max-w-none overflow-y-auto max-h-[350px] pr-2 custom-scrollbar text-slate-700 text-justify leading-relaxed whitespace-pre-wrap">
                    {data.originalAbstract}
                  </div>
                </div>
                <div className="p-4 border-t border-slate-100 bg-slate-50">
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
                      className={`w-full flex items-center justify-center gap-2 text-xs font-bold py-2 px-4 rounded-xl shadow-sm border border-slate-200 transition-colors ${
                         !data.originalAbstract
                         ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                         : 'bg-white hover:bg-slate-100 text-slate-700'
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
                      <ModelCard summary={summary} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto custom-scrollbar-h pb-3">
                  <div className="flex gap-6" style={{ minWidth: 'max-content' }}>
                    {summaries.map((summary, idx) => (
                      <div key={idx} className="w-[320px] flex-shrink-0">
                        <ModelCard summary={summary} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Botão de baixar todos os resumos da IA em ZIP */}
              {summaries.some(s => s?.content && !s.content.includes('ERRO')) && (
                <div className="flex justify-center pt-2">
                  <button
                    onClick={handleDownloadZip}
                    className="flex items-center gap-2 text-sm font-bold py-2.5 px-6 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-sm transition-colors"
                  >
                    <IconPackage className="w-4 h-4 text-[#ff6b00]" />
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
