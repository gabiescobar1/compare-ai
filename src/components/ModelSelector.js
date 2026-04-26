'use client';

import React from 'react';
import { AI_MODELS, PROVIDERS } from '@/constants/AiModels';
import { IconPlus, IconX } from '@tabler/icons-react';

/**
 * ModelSelector - Seletor dinâmico de 1–6 pares (Provider + Modelo).
 * @param {{ selectedModels: Array<{provider: string, modelId: string}>, onChange: Function, disabled: boolean }} props
 */
export default function ModelSelector({ selectedModels, onChange, disabled }) {
  const canAdd = selectedModels.length < 6;
  const canRemove = selectedModels.length > 1;

  const handleProviderChange = (index, newProvider) => {
    const providerConfig = PROVIDERS.find(p => p.id === newProvider);
    const modelsForProvider = AI_MODELS[providerConfig.key] || [];
    const updated = [...selectedModels];
    updated[index] = { provider: newProvider, modelId: modelsForProvider[0]?.id || '' };
    onChange(updated);
  };

  const handleModelChange = (index, newModelId) => {
    const updated = [...selectedModels];
    updated[index] = { ...updated[index], modelId: newModelId };
    onChange(updated);
  };

  const handleAdd = () => {
    if (!canAdd) return;
    onChange([...selectedModels, { provider: 'openai', modelId: AI_MODELS.OPENAI[0].id }]);
  };

  const handleRemove = (index) => {
    if (!canRemove) return;
    onChange(selectedModels.filter((_, i) => i !== index));
  };

  const renderPair = (selection, index) => {
    const providerConfig = PROVIDERS.find(p => p.id === selection.provider);
    const modelsForProvider = AI_MODELS[providerConfig?.key] || [];

    return (
      <div
        key={index}
        className="flex items-center gap-2 bg-stone-50 dark:bg-[#211307] rounded-2xl p-3 border border-[#1C1008]/15 dark:border-white/8 transition-all hover:border-[#1C1008]/25 dark:hover:border-white/15"
      >
        {/* Provider dropdown */}
        <div className="relative flex-1 min-w-0">
          <select
            disabled={disabled}
            className="w-full bg-white dark:bg-[#211307] border border-stone-300 dark:border-white/10 text-slate-800 dark:text-[#f0e4d4] text-sm font-bold rounded-xl shadow-sm px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#ff6b00] appearance-none disabled:opacity-50 transition-colors truncate"
            value={selection.provider}
            onChange={(e) => handleProviderChange(index, e.target.value)}
          >
            {PROVIDERS.map(p => (
              <option key={p.id} value={p.id}>{p.label}</option>
            ))}
          </select>
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
            <svg className="w-3.5 h-3.5 text-stone-600 dark:text-[#c4b09a]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
        </div>

        {/* Model dropdown */}
        <div className="relative flex-1 min-w-0">
          <select
            disabled={disabled}
            className="w-full bg-white dark:bg-[#211307] border border-stone-300 dark:border-white/10 text-slate-800 dark:text-[#f0e4d4] text-sm font-medium rounded-xl shadow-sm px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#ff6b00] appearance-none disabled:opacity-50 transition-colors truncate"
            value={selection.modelId}
            onChange={(e) => handleModelChange(index, e.target.value)}
          >
            {modelsForProvider.map(m => (
              <option key={m.id} value={m.id}>{m.label}</option>
            ))}
          </select>
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
            <svg className="w-3.5 h-3.5 text-slate-600 dark:text-[#c4b09a]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
        </div>

        {/* Remove button (hidden when single) */}
        {canRemove && (
          <button
            type="button"
            onClick={() => handleRemove(index)}
            disabled={disabled}
            title="Remover modelo"
            className="flex-shrink-0 p-1.5 rounded-lg transition-all text-slate-400 dark:text-[#9a8070] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
          >
            <IconX className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="mb-8 border-b border-slate-200 dark:border-white/8 pb-8">
      <label className="block text-stone-700 dark:text-[#c4b09a] text-sm font-bold mb-4">
        Modelos de IA
      </label>

      <div className="flex flex-wrap items-center justify-center gap-4">
        {selectedModels.map((selection, index) => renderPair(selection, index))}

        <button
          type="button"
          onClick={handleAdd}
          disabled={disabled || !canAdd}
          title={canAdd ? 'Adicionar modelo' : 'Máximo de 6 modelos atingido'}
          className={`flex-shrink-0 p-3 rounded-2xl border-2 transition-all ${
            canAdd && !disabled
              ? 'bg-[#ff6b00] hover:bg-gradient-to-br hover:from-[#ff6b00] hover:to-[#ff9100] text-white border-[#ff6b00] shadow-md transition-all hover:shadow-lg'
              : 'bg-stone-100 dark:bg-[#211307] text-slate-400 dark:text-[#6a5040] border-stone-200 dark:border-white/8 cursor-not-allowed'
          }`}
        >
          <IconPlus className="w-5 h-5" strokeWidth={3} />
        </button>
      </div>
    </div>
  );
}
