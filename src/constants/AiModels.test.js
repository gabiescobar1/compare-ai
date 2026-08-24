import { describe, it, expect } from 'vitest';
import { AI_MODELS, PROVIDERS, PRICING_VERIFIED_AT, calculateCost, sanitizeSelectedModels } from './AiModels';
import pricingCache from './modelPricing.json';

describe('calculateCost', () => {
  it('calcula o custo com base nos tokens × preço da tabela', () => {
    // claude-haiku-4-5 = 1.00 entrada / 5.00 saída por 1M tokens
    // 1M entrada + 1M saída => 1*1 + 1*5 = 6
    expect(calculateCost('claude', 'claude-haiku-4-5', 1_000_000, 1_000_000)).toBeCloseTo(6);
  });

  it('escala linearmente com a quantidade de tokens', () => {
    // gpt-5.4-mini = 0.75 entrada / 4.50 saída
    // 2M entrada + 0 saída => 2 * 0.75 = 1.5
    expect(calculateCost('openai', 'gpt-5.4-mini', 2_000_000, 0)).toBeCloseTo(1.5);
  });

  it('aceita o provider em qualquer caixa (case-insensitive)', () => {
    const lower = calculateCost('gemini', 'gemini-3.5-flash', 500_000, 100_000);
    const upper = calculateCost('GEMINI', 'gemini-3.5-flash', 500_000, 100_000);
    expect(lower).toBe(upper);
    expect(lower).toBeGreaterThan(0);
  });

  it('retorna 0 quando o modelo não existe na tabela', () => {
    // Esta é a falha silenciosa que zerava o custo dos abstracts.
    expect(calculateCost('openai', 'modelo-inexistente', 1_000_000, 1_000_000)).toBe(0);
  });

  it('retorna 0 quando o provider não existe', () => {
    expect(calculateCost('provedor-fantasma', 'gpt-5.5', 1_000_000, 1_000_000)).toBe(0);
  });
});

describe('integridade da tabela de modelos', () => {
  it('todo modelo tem id, label e preços positivos', () => {
    for (const [providerKey, models] of Object.entries(AI_MODELS)) {
      for (const m of models) {
        expect(m.id, `${providerKey} sem id`).toBeTruthy();
        expect(m.label, `${m.id} sem label`).toBeTruthy();
        expect(m.costIn, `${m.id} costIn inválido`).toBeGreaterThan(0);
        expect(m.costOut, `${m.id} costOut inválido`).toBeGreaterThan(0);
      }
    }
  });

  it('não há ids de modelo duplicados dentro de um provedor', () => {
    for (const [providerKey, models] of Object.entries(AI_MODELS)) {
      const ids = models.map(m => m.id);
      expect(new Set(ids).size, `ids duplicados em ${providerKey}`).toBe(ids.length);
    }
  });

  it('toda chave de provider em PROVIDERS existe em AI_MODELS', () => {
    for (const p of PROVIDERS) {
      expect(AI_MODELS[p.key], `provider ${p.id} sem entrada em AI_MODELS`).toBeDefined();
      expect(AI_MODELS[p.key].length).toBeGreaterThan(0);
    }
  });
});

describe('invariante seletor ↔ tabela (o teste que pega o bug do custo zerado)', () => {
  it('todo modelo oferecido no seletor produz custo > 0', () => {
    // Reproduz o caminho real: provider.id (como o seletor envia) -> calculateCost.
    // Se a lista de modelos e a tabela de preços dessuncronizarem, isto quebra.
    for (const provider of PROVIDERS) {
      const models = AI_MODELS[provider.key] || [];
      for (const m of models) {
        const cost = calculateCost(provider.id, m.id, 1000, 1000);
        expect(cost, `custo zerado para ${provider.id}/${m.id}`).toBeGreaterThan(0);
      }
    }
  });
});

describe('sanitizeSelectedModels (saneamento de seleções antigas do localStorage)', () => {
  it('troca um modelId inválido pelo primeiro modelo do provider (a causa do custo zerado)', () => {
    const result = sanitizeSelectedModels([{ provider: 'openai', modelId: 'gpt-4.1' }]);
    expect(result).toHaveLength(1);
    expect(result[0].provider).toBe('openai');
    expect(result[0].modelId).toBe(AI_MODELS.OPENAI[0].id);
    // E o resultado é sempre precificável:
    expect(calculateCost(result[0].provider, result[0].modelId, 1000, 1000)).toBeGreaterThan(0);
  });

  it('preserva seleções já válidas', () => {
    const valid = [{ provider: 'claude', modelId: 'claude-haiku-4-5' }];
    expect(sanitizeSelectedModels(valid)).toEqual(valid);
  });

  it('descarta providers inexistentes e entradas malformadas', () => {
    const result = sanitizeSelectedModels([
      { provider: 'provedor-fantasma', modelId: 'x' },
      null,
      'lixo',
      { provider: 'gemini', modelId: 'gemini-3.5-flash' },
    ]);
    expect(result).toEqual([{ provider: 'gemini', modelId: 'gemini-3.5-flash' }]);
  });

  it('retorna [] para entradas não-array', () => {
    expect(sanitizeSelectedModels(null)).toEqual([]);
    expect(sanitizeSelectedModels(undefined)).toEqual([]);
    expect(sanitizeSelectedModels('foo')).toEqual([]);
  });

  it('toda saída do saneador é precificável (> 0)', () => {
    const messy = [
      { provider: 'openai', modelId: 'gpt-4o-mini' },
      { provider: 'claude', modelId: 'claude-opus-4-7' },
      { provider: 'gemini', modelId: 'gemini-2.5-pro' },
    ];
    for (const sel of sanitizeSelectedModels(messy)) {
      expect(calculateCost(sel.provider, sel.modelId, 1000, 1000)).toBeGreaterThan(0);
    }
  });
});

describe('cache de preços (modelPricing.json)', () => {
  it('toda chave do cache corresponde a um modelo real da tabela', () => {
    const allIds = new Set(Object.values(AI_MODELS).flat().map(m => m.id));
    for (const id of Object.keys(pricingCache.prices || {})) {
      expect(allIds.has(id), `cache tem preço para id inexistente: ${id}`).toBe(true);
    }
  });

  it('expõe a data de verificação dos preços', () => {
    expect(PRICING_VERIFIED_AT).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
