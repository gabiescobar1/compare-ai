'use client'

import { useState, useEffect, useRef } from 'react';
import { processSingleDoi } from '@/app/actions';
import { IconLoader2, IconSend, IconAlertCircle, IconPlayerStop, IconCircleCheck, IconTerminal2 } from '@tabler/icons-react';
import ModelSelector from '@/components/ModelSelector';
import PromptModal from '@/components/PromptModal';
import { AI_MODELS, sanitizeSelectedModels } from '@/constants/AiModels';
import { DISCIPLINES } from '@/constants/Disciplines';

// Quantos DOIs processar ao mesmo tempo. Cada DOI já roda seus modelos em
// paralelo internamente; o pool acelera o lote sem disparar todos de uma vez
// (o que estouraria os limites das APIs).
const CONCURRENCY = 4;

export default function DoiForm({ onResult, onProcessStart }) {
  const [doisInput, setDoisInput] = useState("");
  const [selectedDiscipline, setSelectedDiscipline] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);
  const [totalDois, setTotalDois] = useState(0);
  const [errorText, setErrorText] = useState("");
  const [allSucceeded, setAllSucceeded] = useState(false);
  const [wasCancelled, setWasCancelled] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  const cancelRef = useRef(false);

  const [selectedModels, setSelectedModels] = useState([
    { provider: 'openai', modelId: AI_MODELS.OPENAI[0].id },
  ]);

  useEffect(() => {
    const saved = localStorage.getItem('compare-ai-selected-models');
    if (saved) {
      try {
        // Sanea ids antigos que não existem mais na tabela (senão o custo zera).
        const cleaned = sanitizeSelectedModels(JSON.parse(saved));
        if (cleaned.length > 0) {
          setSelectedModels(cleaned);
          localStorage.setItem('compare-ai-selected-models', JSON.stringify(cleaned));
        }
      } catch (e) {}
    }
  }, []);

  const handleSelectedModelsChange = (models) => {
    setSelectedModels(models);
    localStorage.setItem('compare-ai-selected-models', JSON.stringify(models));
  };

  const handleProcess = async () => {
    if (!doisInput.trim()) { setErrorText("Por favor, insira ao menos um DOI."); return; }
    setErrorText("");
    const dois = doisInput.split(',').map(d => d.trim()).filter(d => d.length > 0);
    if (dois.length === 0) { setErrorText("DOIs inválidos."); return; }
    if (!selectedDiscipline) { setErrorText("Por favor, selecione a disciplina do artigo."); return; }

    cancelRef.current = false;
    setWasCancelled(false);
    setAllSucceeded(false);
    setIsCancelling(false);
    setIsProcessing(true);
    setTotalDois(dois.length);
    setCompletedCount(0);
    onProcessStart();

    let nextIndex = 0;
    let processed = 0;
    let anyError = false;

    // Worker do pool: pega o próximo DOI disponível até acabar (ou cancelar).
    const worker = async () => {
      while (true) {
        if (cancelRef.current) return;
        const i = nextIndex++;
        if (i >= dois.length) return;

        let res;
        try {
          res = await processSingleDoi(dois[i], selectedModels, selectedDiscipline);
        } catch (e) {
          console.error("Falha ao processar DOI:", dois[i], e);
          res = {
            id: Date.now() + i,
            doi: dois[i],
            error: "Não foi possível processar este DOI. Verifique o console do servidor.",
          };
        }

        // Cancelou enquanto este rodava: descarta o resultado e para.
        if (cancelRef.current) return;

        onResult(res);
        if (res?.error || res?.summaries?.some(s => s?.content?.includes('ERRO'))) {
          anyError = true;
        }
        processed++;
        setCompletedCount(processed);
      }
    };

    await Promise.all(
      Array.from({ length: Math.min(CONCURRENCY, dois.length) }, () => worker())
    );

    setIsProcessing(false);
    setIsCancelling(false);
    if (cancelRef.current) {
      setWasCancelled(true);
    } else if (!anyError) {
      setAllSucceeded(true);
    }
  };

  const handleCancel = () => {
    cancelRef.current = true;
    setIsCancelling(true);
  };

  return (
    <div className="bg-cream dark:bg-paper-dark rounded-3xl p-8 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] dark:shadow-[0_2px_15px_-3px_rgba(0,0,0,0.3)] border border-stone-200 dark:border-white/8 transition-colors duration-300">
      <ModelSelector selectedModels={selectedModels} onChange={handleSelectedModelsChange} disabled={isProcessing} />

      <label className="block text-stone-700 dark:text-[#c4b09a] text-sm font-bold mb-3">
        Insira os identificadores (DOIs) separados por vírgula
      </label>
      <div className="relative">
        <textarea
          className="w-full bg-cream dark:bg-paper-dark text-stone-800 dark:text-parchment border border-stone-300 dark:border-white/10 rounded-2xl p-4 pr-16 focus:ring-2 focus:ring-accent focus:outline-none transition shadow-sm font-medium placeholder-stone-400 dark:placeholder-[#8a7058]"
          placeholder={"Ex: 10.1371/journal.pone.0210340,\n10.1371/journal.pone.0202277"}
          value={doisInput}
          onChange={(e) => setDoisInput(e.target.value)}
          disabled={isProcessing}
        />
        {/* Botão circular: ver o prompt enviado às IAs (com tooltip no hover) */}
        <div className="absolute top-3 right-3 group">
          <button
            type="button"
            onClick={() => setShowPrompt(true)}
            aria-label="Ver o prompt enviado às IAs"
            title="Ver o prompt enviado às IAs"
            className="w-10 h-10 flex items-center justify-center rounded-full text-parchment shadow-sm bg-gradient-to-br from-[#6d4c3d] to-[#6d4c3d] hover:to-[#ffb347] hover:shadow-md transition-all duration-500"
          >
            <IconTerminal2 className="w-5 h-5" />
          </button>
          <span className="pointer-events-none absolute right-full mr-2 top-1/2 -translate-y-1/2 w-max max-w-[200px] px-3 py-1.5 rounded-lg bg-ink text-parchment dark:bg-[#3a2a1e] text-xs font-bold shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            Ver o prompt enviado às IAs
          </span>
        </div>
      </div>

      <label className="block text-stone-700 dark:text-[#c4b09a] text-sm font-bold mt-6 mb-3">
        Selecione a Disciplina do Artigo
      </label>
      <div className="relative mb-6">
        <select
          className="w-full bg-cream dark:bg-paper-dark border border-stone-300 dark:border-white/10 text-stone-800 dark:text-parchment text-sm font-bold rounded-xl shadow-sm px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-accent appearance-none disabled:opacity-50 transition-colors truncate"
          value={selectedDiscipline}
          onChange={(e) => setSelectedDiscipline(e.target.value)}
          disabled={isProcessing}
        >
          <option value="" disabled>Selecione a disciplina…</option>
          {DISCIPLINES.map(d => (
            <option key={d.id} value={d.id}>{d.label}</option>
          ))}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
           <svg className="w-5 h-5 text-stone-600 dark:text-[#c4b09a]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
        </div>
      </div>

      {errorText && (
        <div className="flex items-center text-red-700 dark:text-red-400 mt-4 text-sm bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 p-3 rounded">
          <IconAlertCircle className="w-5 h-5 mr-2" /> {errorText}
        </div>
      )}

      <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-sm font-medium text-stone-600 dark:text-[#9a8070]">
          {isProcessing ? (
             <span className="flex items-center gap-2 text-ink dark:text-[#c4b09a] font-bold">
               <IconLoader2 className="animate-spin w-4 h-4"/>
               Processando: {completedCount} de {totalDois}
               {isCancelling && <span className="text-stone-500 dark:text-[#7a6050] font-normal ml-2">| finalizando os em andamento…</span>}
             </span>
          ) : ( "Aguardando submissão de dados." )}
        </div>

        {isProcessing ? (
          <button
            onClick={handleCancel}
            disabled={isCancelling}
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-serif font-bold py-3 px-8 rounded-2xl shadow-sm transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <IconPlayerStop className="w-5 h-5" />
            {isCancelling ? "Cancelando…" : "Cancelar análises"}
          </button>
        ) : (
          <button
            onClick={handleProcess}
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-accent hover:bg-gradient-to-br hover:from-accent hover:to-accent-2 text-white font-serif font-bold py-3 px-8 rounded-2xl shadow-sm transition-all hover:shadow-md"
          >
            <IconSend className="w-5 h-5"/>
            Proceder com Análise
          </button>
        )}
      </div>

      {allSucceeded && (
        <div className="mt-5 flex items-center gap-2 text-green-700 dark:text-green-400 text-sm font-bold bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 p-3 rounded-2xl">
          <IconCircleCheck className="w-5 h-5 flex-shrink-0" /> Análises concluídas com sucesso.
        </div>
      )}
      {wasCancelled && (
        <div className="mt-5 flex items-center gap-2 text-amber-700 dark:text-amber-400 text-sm font-bold bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 p-3 rounded-2xl">
          <IconPlayerStop className="w-5 h-5 flex-shrink-0" /> Análise interrompida. Os resultados já gerados aparecem acima.
        </div>
      )}

      <PromptModal open={showPrompt} onClose={() => setShowPrompt(false)} />
    </div>
  );
}
