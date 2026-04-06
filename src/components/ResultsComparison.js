import React from 'react';
import { IconCoin, IconFileText, IconBulb } from '@tabler/icons-react';

const ModelCard = ({ title, aiData, headerBgClass }) => {
  const isError = aiData?.content?.includes('ERRO');
  
  return (
    <div className="bg-white flex flex-col h-full rounded shadow-sm border border-slate-200 overflow-hidden">
      <div className={`px-5 py-4 border-b border-slate-200 flex items-center justify-between ${headerBgClass}`}>
        <div className="flex flex-col">
          <h3 className="text-base font-bold text-slate-800 tracking-tight">{title}</h3>
          <span className="text-xs text-slate-500 mt-0.5 tracking-wider">{aiData?.model || 'Desconhecido'}</span>
        </div>
      </div>

      <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-4 bg-slate-50/50 text-xs font-mono text-slate-600">
        <div className="flex items-center" title="Tokens Totais (Entrada + Saída)">
          <IconFileText className="w-3.5 h-3.5 mr-1 text-slate-400" />
          <span>{(aiData?.inputTokens || 0) + (aiData?.outputTokens || 0)} tks</span>
        </div>
        <div className="flex items-center text-slate-600 font-bold" title="Custo Estimado">
          <IconCoin className="w-3.5 h-3.5 mr-1" />
          <span>${aiData?.cost?.toFixed(4) || "0.0000"}</span>
        </div>
      </div>

      <div className={`p-5 flex-1 relative ${isError ? 'bg-red-50 text-red-700' : 'bg-white'}`}>
        <div className="prose prose-sm prose-slate max-w-none overflow-y-auto max-h-[350px] pr-2 custom-scrollbar text-slate-700 text-justify leading-relaxed">
          {aiData?.content || "Nenhum conteúdo gerado."}
        </div>
      </div>
    </div>
  );
};

export default function ResultsComparison({ data }) {
  if (!data) return null;

  return (
    <div className="mt-12 bg-white rounded shadow-sm border border-slate-200 p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-slate-200 pb-6">
        <h2 className="text-2xl font-serif font-black text-slate-800">
          Resultados: <span className="font-mono text-blue-800 bg-blue-50 px-2 py-0.5 rounded text-xl align-middle ml-2">{data.doi}</span>
        </h2>
        {data.savedToDb && (
          <span className="text-xs border border-green-200 bg-green-50 text-green-700 px-3 py-1.5 rounded font-bold uppercase tracking-widest shadow-sm">
            Persistido no DB
          </span>
        )}
      </div>

      {data.error ? (
         <div className="bg-red-50 border border-red-200 p-6 rounded text-red-800 font-medium">
           Erro no Processamento: {data.error}
         </div>
      ) : (
         <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-stretch">
            {/* Box do Original */}
            <div className="bg-slate-50 border border-slate-200 rounded flex flex-col h-full shadow-inner overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-800 tracking-tight flex items-center gap-2">
                  <IconBulb className="w-4 h-4 text-slate-600"/> Base Original
                </h3>
              </div>
              <div className="px-5 py-3 border-b border-slate-200 bg-slate-100/50">
                 <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest truncate" title={data.title}>{data.title}</h4>
              </div>
              <div className="p-5 flex-1 relative">
                <div className="prose prose-sm font-serif max-w-none overflow-y-auto max-h-[350px] pr-2 custom-scrollbar text-slate-700 italic text-justify leading-relaxed">
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
