import pricingCache from './modelPricing.json';

// Lista base dos modelos de TEXTO da geração atual de cada provedor.
// Os preços (USD por 1 milhão de tokens, tier padrão) são apenas o ponto de
// partida — eles são sobrescritos pelo cache em modelPricing.json, que é
// atualizado pelo botão "Atualizar preços" (ver refreshModelPricing em actions.js).
const BASE_AI_MODELS = {
  OPENAI: [
    { id: 'gpt-5.5', label: 'GPT-5.5', costIn: 5.00, costOut: 30.00 },
    { id: 'gpt-5.4', label: 'GPT-5.4', costIn: 2.50, costOut: 15.00 },
    { id: 'gpt-5.4-mini', label: 'GPT-5.4 Mini', costIn: 0.75, costOut: 4.50 },
    { id: 'gpt-5.4-nano', label: 'GPT-5.4 Nano', costIn: 0.20, costOut: 1.25 }
  ],
  GEMINI: [
    { id: 'gemini-3.5-flash', label: 'Gemini 3.5 Flash', costIn: 1.50, costOut: 9.00 },
    { id: 'gemini-3.1-pro-preview', label: 'Gemini 3.1 Pro', costIn: 2.00, costOut: 12.00 },
    { id: 'gemini-3.1-flash-lite', label: 'Gemini 3.1 Flash Lite', costIn: 0.25, costOut: 1.50 }
  ],
  CLAUDE: [
    { id: 'claude-opus-4-8', label: 'Claude Opus 4.8', costIn: 5.00, costOut: 25.00 },
    { id: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6', costIn: 3.00, costOut: 15.00 },
    { id: 'claude-haiku-4-5', label: 'Claude Haiku 4.5', costIn: 1.00, costOut: 5.00 }
  ]
};

// Sobrescreve os preços base com os valores verificados em modelPricing.json.
function applyPricingCache(base, cache) {
  const priceMap = cache?.prices || {};
  const merged = {};
  for (const providerKey of Object.keys(base)) {
    merged[providerKey] = base[providerKey].map(model => {
      const override = priceMap[model.id];
      return override
        ? { ...model, costIn: override.costIn, costOut: override.costOut }
        : model;
    });
  }
  return merged;
}

export const AI_MODELS = applyPricingCache(BASE_AI_MODELS, pricingCache);

// Data da última verificação de preços (exibida ao lado do seletor).
export const PRICING_VERIFIED_AT = pricingCache?.verifiedAt || '';

export const PROVIDERS = [
  { id: 'openai', label: 'OpenAI', key: 'OPENAI' },
  { id: 'gemini', label: 'Google Gemini', key: 'GEMINI' },
  { id: 'claude', label: 'Anthropic Claude', key: 'CLAUDE' },
];

// Função utilitária para calcular o preço
export function calculateCost(provider, modelId, inTokens, outTokens) {
  const modelsForProvider = AI_MODELS[provider.toUpperCase()] || [];
  const modelConfig = modelsForProvider.find(m => m.id === modelId);

  if (!modelConfig) {
    // Falha visível: custo zera quando o modelo usado não está na tabela
    // (tipicamente uma seleção antiga salva no navegador). Ver sanitizeSelectedModels.
    console.warn(`[calculateCost] Modelo sem preço na tabela: ${provider}/${modelId} — custo retornado como 0.`);
    return 0;
  }
  return ((inTokens / 1000000) * modelConfig.costIn) + ((outTokens / 1000000) * modelConfig.costOut);
}

/**
 * Remove/corrige seleções de modelo inválidas (ex.: ids antigos guardados no
 * localStorage que não existem mais na tabela). Mantém o provider quando válido
 * e troca o modelId inválido pelo primeiro modelo daquele provider.
 * @param {Array<{provider: string, modelId: string}>} selections
 * @returns {Array<{provider: string, modelId: string}>}
 */
export function sanitizeSelectedModels(selections) {
  if (!Array.isArray(selections)) return [];
  const cleaned = [];
  for (const sel of selections) {
    if (!sel || typeof sel !== 'object') continue;
    const providerConfig = PROVIDERS.find(p => p.id === sel.provider);
    if (!providerConfig) continue;
    const models = AI_MODELS[providerConfig.key] || [];
    if (models.length === 0) continue;
    const isValid = models.some(m => m.id === sel.modelId);
    cleaned.push({ provider: sel.provider, modelId: isValid ? sel.modelId : models[0].id });
  }
  return cleaned;
}
