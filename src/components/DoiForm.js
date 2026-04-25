'use client'

import { useState } from 'react';
import { processSingleDoi } from '@/app/actions';
import { IconLoader2, IconSend, IconAlertCircle } from '@tabler/icons-react';
import ModelSelector from '@/components/ModelSelector';
import { AI_MODELS } from '@/constants/AiModels';
import { DISCIPLINES } from '@/constants/Disciplines';

export default function DoiForm({ onResult, onProcessStart }) {
  const [doisInput, setDoisInput] = useState("");
  const [selectedDiscipline, setSelectedDiscipline] = useState(DISCIPLINES[0].id);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentDoiIndex, setCurrentDoiIndex] = useState(0);
  const [totalDois, setTotalDois] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [errorText, setErrorText] = useState("");
  
  const [selectedModels, setSelectedModels] = useState([
    { provider: 'openai', modelId: AI_MODELS.OPENAI[0].id },
  ]);

  const handleProcess = async () => {
    if (!doisInput.trim()) { setErrorText("Por favor, insira ao menos um DOI."); return; }
    setErrorText("");
    const dois = doisInput.split(',').map(d => d.trim()).filter(d => d.length > 0);
    if (dois.length === 0) { setErrorText("DOIs inválidos."); return; }

    setIsProcessing(true);
    setTotalDois(dois.length);
    setCurrentDoiIndex(0);
    onProcessStart();

    for (let i = 0; i < dois.length; i++) {
        setCurrentDoiIndex(i + 1);
        const res = await processSingleDoi(dois[i], selectedModels, selectedDiscipline);
        if (res.success) { onResult(res); } else { onResult({ id: Date.now() + i, doi: dois[i], error: res.error }); }

        if (i < dois.length - 1) {
            let timeLeft = 60;
            setCountdown(timeLeft);
            while (timeLeft > 0) { await new Promise(r => setTimeout(r, 1000)); timeLeft--; setCountdown(timeLeft); }
        }
    }
    setIsProcessing(false);
    setCountdown(0);
  };

  return (
    <div className="bg-white rounded-3xl p-8 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] border border-slate-200">
      <ModelSelector selectedModels={selectedModels} onChange={setSelectedModels} disabled={isProcessing} />

      <label className="block text-slate-700 text-sm font-bold mb-3">
        Insira os identificadores (DOIs) separados por vírgula
      </label>
      <textarea
        className="w-full bg-slate-50 text-slate-800 border border-slate-300 rounded-2xl p-4 focus:ring-2 focus:ring-[#ff6b00] focus:outline-none transition min-h-[140px] custom-scrollbar font-mono text-sm leading-relaxed"
        placeholder={"Ex: 10.1371/journal.pone.0210340,\n10.1371/journal.pone.0202277"}
        value={doisInput}
        onChange={(e) => setDoisInput(e.target.value)}
        disabled={isProcessing}
      />

      <label className="block text-slate-700 text-sm font-bold mt-6 mb-3">
        Selecione a Disciplina do Artigo
      </label>
      <div className="relative mb-6">
        <select 
          className="w-full bg-slate-50 text-slate-800 border border-slate-300 rounded-2xl p-4 focus:ring-2 focus:ring-[#ff6b00] focus:outline-none transition appearance-none cursor-pointer disabled:opacity-50"
          value={selectedDiscipline}
          onChange={(e) => setSelectedDiscipline(e.target.value)}
          disabled={isProcessing}
        >
          {DISCIPLINES.map(d => (
            <option key={d.id} value={d.id}>{d.label}</option>
          ))}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
           <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
        </div>
      </div>
      
      {errorText && (
        <div className="flex items-center text-red-700 mt-4 text-sm bg-red-50 border border-red-200 p-3 rounded">
          <IconAlertCircle className="w-5 h-5 mr-2" /> {errorText}
        </div>
      )}

      <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-sm font-medium text-slate-600">
          {isProcessing ? (
             <span className="flex items-center gap-2 text-blue-700 font-bold">
               <IconLoader2 className="animate-spin w-4 h-4"/> 
               Processando: {currentDoiIndex} de {totalDois}
               {countdown > 0 && <span className="text-slate-500 font-normal ml-2">| Aguardando {countdown}s timeout</span>}
             </span>
          ) : ( "Aguardando submissão de dados." )}
        </div>
        <button 
          onClick={handleProcess}
          disabled={isProcessing}
          className="w-full md:w-auto flex items-center justify-center gap-2 bg-[#ff6b00] hover:opacity-90 text-white font-serif font-bold py-3 px-8 rounded-2xl shadow-sm transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? <IconLoader2 className="animate-spin w-5 h-5"/> : <IconSend className="w-5 h-5"/> }
          {isProcessing ? "Analisando..." : "Proceder com Análise"}
        </button>
      </div>
    </div>
  );
}
