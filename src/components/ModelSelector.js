'use client';

import React, { useState } from 'react';
import { AI_MODELS, PROVIDERS, PRICING_VERIFIED_AT } from '@/constants/AiModels';
import { refreshModelPricing } from '@/app/actions';
import { IconPlus, IconX, IconRefresh, IconLoader2, IconAlertCircle } from '@tabler/icons-react';

/**
 * ModelSelector - Seletor dinâmico de 1–6 pares (Provider + Modelo).
 * @param {{ selectedModels: Array<{provider: string, modelId: string}>, onChange: Function, disabled: boolean }} props
 */
export default function ModelSelector({ selectedModels, onChange, disabled }) {
  // Preços ficam em estado para o botão "Atualizar preços" poder substituí-los ao vivo.
  const [models, setModels] = useState(AI_MODELS);
  const [verifiedAt, setVerifiedAt] = useState(PRICING_VERIFIED_AT);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState('');

  const canAdd = selectedModels.length < 6;
  const canRemove = selectedModels.length > 1;

  const handleRefreshPrices = async () => {
    setRefreshing(true);
    setRefreshError('');
    try {
      const res = await refreshModelPricing();
      if (res?.models) setModels(res.models);
      if (res?.verifiedAt) setVerifiedAt(res.verifiedAt);
    } catch (e) {
      setRefreshError('Não foi possível atualizar os preços agora. Tente novamente.');
    } finally {
      setRefreshing(false);
    }
  };

  const handleProviderChange = (index, newProvider) => {
    const providerConfig = PROVIDERS.find(p => p.id === newProvider);
    const modelsForProvider = models[providerConfig.key] || [];
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
    onChange([...selectedModels, { provider: 'openai', modelId: models.OPENAI[0].id }]);
  };

  const handleRemove = (index) => {
    if (!canRemove) return;
    onChange(selectedModels.filter((_, i) => i !== index));
  };

  const renderPair = (selection, index) => {
    const providerConfig = PROVIDERS.find(p => p.id === selection.provider);
    const modelsForProvider = models[providerConfig?.key] || [];

    return (
      <div
        key={index}
        className="flex items-center gap-2 bg-stone-50 dark:bg-paper-dark rounded-2xl p-3 border border-ink/15 dark:border-white/8 transition-all hover:border-ink/25 dark:hover:border-white/15"
      >
        {/* Provider dropdown */}
        <div className="relative flex-1 min-w-0">
          <select
            disabled={disabled}
            className="w-full bg-cream dark:bg-paper-dark border border-stone-300 dark:border-white/10 text-stone-800 dark:text-parchment text-sm font-bold rounded-xl shadow-sm px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-accent appearance-none disabled:opacity-50 transition-colors truncate"
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
            className="w-full bg-cream dark:bg-paper-dark border border-stone-300 dark:border-white/10 text-stone-800 dark:text-parchment text-sm font-medium rounded-xl shadow-sm px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-accent appearance-none disabled:opacity-50 transition-colors truncate"
            value={selection.modelId}
            onChange={(e) => handleModelChange(index, e.target.value)}
          >
            {modelsForProvider.map(m => (
              <option key={m.id} value={m.id}>{m.label}</option>
            ))}
          </select>
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
            <svg className="w-3.5 h-3.5 text-stone-600 dark:text-[#c4b09a]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
        </div>

        {/* Remove button (hidden when single) */}
        {canRemove && (
          <button
            type="button"
            onClick={() => handleRemove(index)}
            disabled={disabled}
            title="Remover modelo"
            className="flex-shrink-0 p-1.5 rounded-lg transition-all text-stone-400 dark:text-[#9a8070] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
          >
            <IconX className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="mb-8 border-b border-stone-200 dark:border-white/8 pb-8">
      <div className="flex items-center justify-between gap-3 mb-4">
        <label className="block text-stone-700 dark:text-[#c4b09a] text-sm font-bold">
          Modelos de IA
        </label>

        <div className="flex items-center gap-2">
          {verifiedAt && (
            <span className="text-[11px] text-stone-400 dark:text-[#8a7058]">
              Preços de {verifiedAt}
            </span>
          )}
          <button
            type="button"
            onClick={handleRefreshPrices}
            disabled={disabled || refreshing}
            title="Buscar os preços mais recentes dos modelos"
            className="flex items-center gap-1.5 text-xs font-bold rounded-xl px-3 py-1.5 border border-stone-300 dark:border-white/10 text-stone-600 dark:text-[#c4b09a] bg-cream dark:bg-paper-dark hover:border-accent hover:text-accent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {refreshing
              ? <IconLoader2 className="w-3.5 h-3.5 animate-spin" />
              : <IconRefresh className="w-3.5 h-3.5" />}
            {refreshing ? 'Atualizando…' : 'Atualizar preços'}
          </button>
        </div>
      </div>

      {refreshError && (
        <div className="flex items-center text-red-700 dark:text-red-400 mb-4 text-xs bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 p-2.5 rounded-xl">
          <IconAlertCircle className="w-4 h-4 mr-2 flex-shrink-0" /> {refreshError}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-center gap-4">
        {selectedModels.map((selection, index) => renderPair(selection, index))}

        <button
          type="button"
          onClick={handleAdd}
          disabled={disabled || !canAdd}
          title={canAdd ? 'Adicionar modelo' : 'Máximo de 6 modelos atingido'}
          className={`flex-shrink-0 p-3 rounded-2xl border-2 transition-all ${
            canAdd && !disabled
              ? 'bg-accent hover:bg-gradient-to-br hover:from-accent hover:to-accent-2 text-white border-accent shadow-md transition-all hover:shadow-lg'
              : 'bg-stone-100 dark:bg-paper-dark text-stone-400 dark:text-[#8a7058] border-stone-200 dark:border-white/8 cursor-not-allowed'
          }`}
        >
          <IconPlus className="w-5 h-5" strokeWidth={3} />
        </button>
      </div>
    </div>
  );
}
