export const AI_MODELS = {
  OPENAI: [
    { id: 'gpt-5.1', label: 'GPT-5.1 (Avançado)', costIn: 15.00, costOut: 60.00 },
    { id: 'gpt-4o', label: 'GPT-4o', costIn: 5.00, costOut: 15.00 },
    { id: 'gpt-4o-mini', label: 'GPT-4o Mini (Rápido)', costIn: 0.15, costOut: 0.60 }
  ],
  GEMINI: [
    { id: 'gemini-3.1', label: 'Gemini 3.1 (Avançado)', costIn: 15.00, costOut: 60.00 },
    { id: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro', costIn: 1.25, costOut: 10.00 },
    { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash (Rápido)', costIn: 0.30, costOut: 2.50 }
  ],
  CLAUDE: [
    { id: 'claude-opus-4-6', label: 'Claude Opus 4.6 (Avançado)', costIn: 15.00, costOut: 75.00 },
    { id: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6', costIn: 3.00, costOut: 15.00 },
    { id: 'claude-haiku-4-5', label: 'Claude Haiku 4.5 (Rápido)', costIn: 0.25, costOut: 1.25 }
  ]
};

export const PROVIDERS = [
  { id: 'openai', label: 'OpenAI', key: 'OPENAI' },
  { id: 'gemini', label: 'Google Gemini', key: 'GEMINI' },
  { id: 'claude', label: 'Anthropic Claude', key: 'CLAUDE' },
];

// Funça utilitária para calcular o preço
export function calculateCost(provider, modelId, inTokens, outTokens) {
  const modelsForProvider = AI_MODELS[provider.toUpperCase()] || [];
  const modelConfig = modelsForProvider.find(m => m.id === modelId);

  if (!modelConfig) return 0;
  return ((inTokens / 1000000) * modelConfig.costIn) + ((outTokens / 1000000) * modelConfig.costOut);
}
