'use client';
import React from 'react';
import { IconCoin, IconFileText, IconBulb, IconDownload, IconTrash } from '@tabler/icons-react';

const ModelCard = ({ title, aiData, headerBgClass }) => {
  const isError = aiData?.content?.includes('ERRO');
  const wordCount = aiData?.content ? aiData.content.trim().split(/\s+/).filter(Boolean).length : 0;
  
  const handleDownload = () => {
    if (!aiData?.content) return;
    const blob = new Blob([aiData.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resumo_${title.toLowerCase().replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  return (
    <div className="bg-white flex flex-col h-full rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
      <div className={`px-5 py-4 border-b border-slate-200 flex items-center justify-between ${headerBgClass}`}>
        <div className="flex flex-col">
          <h3 className="text-base font-bold text-[#291f1b] tracking-tight">{title}</h3>
          <span className="text-xs text-slate-500 mt-0.5 tracking-wider">{aiData?.model || 'Desconhecido'}</span>
        </div>
      </div>

      <div className="px-5 py-3 border-b border-slate-100 flex items-start justify-between gap-4 bg-slate-50/50 text-xs font-mono text-slate-600">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center" title="Tokens Totais (Entrada + Saída)">
            <IconFileText className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
            <span>{(aiData?.inputTokens || 0) + (aiData?.outputTokens || 0)} tks</span>
          </div>
          <div className="flex items-center" title="Palavras">
            <IconFileText className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
            <span>{wordCount} palavras</span>
          </div>
        </div>
        <div className="flex items-center text-slate-600 font-bold mt-0.5" title="Custo Estimado">
          <IconCoin className="w-3.5 h-3.5 mr-1" />
          <span>${aiData?.cost?.toFixed(4) || "0.0000"}</span>
        </div>
      </div>

      <div className={`p-5 flex-1 relative ${isError ? 'bg-red-50 text-red-700' : 'bg-white'}`}>
        <div className="prose text-[13px] prose-slate max-w-none overflow-y-auto max-h-[350px] pr-2 custom-scrollbar text-slate-700 text-justify leading-relaxed whitespace-pre-wrap">
          {aiData?.content || "Nenhum conteúdo gerado."}
        </div>
      </div>
      <div className="p-4 border-t border-slate-100 bg-slate-50">
         <button 
            onClick={handleDownload}
            disabled={isError || !aiData?.content}
            className={`w-full flex items-center justify-center gap-2 text-xs font-bold py-2 px-4 rounded-xl shadow-sm border border-slate-200 transition-colors ${
               isError || !aiData?.content
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

export default function ResultsComparison({ data, onDelete }) {
  if (!data) return null;

  return (
    <div className="mt-12 bg-white rounded-3xl shadow-sm border border-slate-200 p-8 relative group">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-slate-200 pb-6">
        <h2 className="text-2xl font-serif font-black text-[#291f1b]">
          Resultados: <span className="font-mono text-[#ff6b00] bg-[#ff6b00]/10 px-2 py-0.5 rounded text-xl align-middle ml-2">{data.doi}</span>
        </h2>
        {onDelete && (
           <button 
             onClick={() => onDelete(data.id)}
             title="Excluir este registro"
             className="p-2 bg-white rounded-full shadow-sm border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
           >
             <IconTrash className="w-5 h-5" />
           </button>
        )}
      </div>

      {data.error ? (
         <div className="bg-red-50 border border-red-200 p-6 rounded text-red-800 font-medium">
           Erro no Processamento: {data.error}
         </div>
      ) : (
         <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-stretch">
            {/* Box do Original */}
            <div className="bg-slate-50 border border-slate-200 rounded-3xl flex flex-col h-full shadow-inner overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-base font-bold text-[#291f1b] tracking-tight flex items-center gap-2">
                  <IconBulb className="w-4 h-4 text-slate-600"/> Abstract Original
                </h3>
              </div>
              <div className="px-5 py-3 border-b border-slate-200 bg-slate-100/50 flex flex-col gap-2">
                 <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest truncate" title={data.title}>{data.title}</h4>
                 <div className="flex items-center text-xs font-mono text-slate-600" title="Quantidade de palavras">
                    <IconFileText className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    <span>{data.originalAbstract ? data.originalAbstract.trim().split(/\s+/).filter(Boolean).length : 0} palavras</span>
                 </div>
              </div>
              <div className="p-5 flex-1 relative">
                <div className="prose text-[13px] prose-slate max-w-none overflow-y-auto max-h-[350px] pr-2 custom-scrollbar text-slate-700 text-justify leading-relaxed whitespace-pre-wrap">
                  {data.originalAbstract}
                </div>
              </div>
            </div>

            <ModelCard title="OpenAI" aiData={data.openaiSummary} headerBgClass="bg-blue-50/50" />
            <ModelCard title="Google Gemini" aiData={data.geminiSummary} headerBgClass="bg-purple-50/50" />
            <ModelCard title="Anthropic Claude" aiData={data.claudeSummary} headerBgClass="bg-orange-50/50" />
         </div>
      )}
    </div>
  );
}
