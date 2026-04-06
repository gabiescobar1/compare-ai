export const AI_MODELS = {
  OPENAI: [
    { id: 'gpt-5.1', label: 'GPT-5.1 (Avançado)', costIn: 0.015, costOut: 0.060 },
    { id: 'gpt-4o', label: 'GPT-4o', costIn: 0.005, costOut: 0.015 },
    { id: 'gpt-4o-mini', label: 'GPT-4o Mini (Rápido)', costIn: 0.00015, costOut: 0.0006 }
  ],
  GEMINI: [
    { id: 'gemini-3.1', label: 'Gemini 3.1 (Avançado)', costIn: 0.015, costOut: 0.060 },
    { id: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro', costIn: 0.005, costOut: 0.015 },
    { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash (Rápido)', costIn: 0.0001, costOut: 0.0003 }
  ],
  CLAUDE: [
    { id: 'claude-4.6-sonnet', label: 'Claude 4.6 Sonnet (Avançado)', costIn: 0.015, costOut: 0.075 },
    { id: 'claude-3-5-sonnet-latest', label: 'Claude 3.5 Sonnet', costIn: 0.003, costOut: 0.015 },
    { id: 'claude-3-haiku-20240307', label: 'Claude 3 Haiku (Rápido)', costIn: 0.00025, costOut: 0.00125 }
  ]
};

// Funça utilitária para calcular o preço
export function calculateCost(provider, modelId, inTokens, outTokens) {
  const modelsForProvider = AI_MODELS[provider.toUpperCase()] || [];
  const modelConfig = modelsForProvider.find(m => m.id === modelId);
  
  if (!modelConfig) return 0;
  return ((inTokens / 1000) * modelConfig.costIn) + ((outTokens / 1000) * modelConfig.costOut);
}
