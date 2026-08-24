'use server'

import { ArticleProcessorService } from '@/services/ArticleProcessorService';
import { createSupabaseServerClient } from '@/lib/supabase-server';

// Guard de defesa em profundidade: além do proxy, nenhuma action que consome
// APIs/dados roda sem sessão Supabase válida.
async function requireAuth() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Não autorizado.');
}

export async function processSingleDoi(doiInput, selectedModels, discipline) {
  await requireAuth();
  const processor = new ArticleProcessorService();
  return await processor.processDoi(doiInput, selectedModels, discipline);
}

import Anthropic from '@anthropic-ai/sdk';
import { promises as fs } from 'fs';
import path from 'path';
import { AI_MODELS } from '@/constants/AiModels';

const PRICING_CACHE_PATH = path.join(process.cwd(), 'src', 'constants', 'modelPricing.json');

function extractJson(text) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1);
  return JSON.parse(candidate);
}

/**
 * Consulta os preços públicos atuais (USD por 1M de tokens) de cada modelo de
 * texto via web search do Claude, grava em modelPricing.json e devolve a
 * estrutura AI_MODELS já com os valores atualizados.
 */
export async function refreshModelPricing() {
  await requireAuth();
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY não configurada — necessária para consultar os preços.');
  }

  // Lista plana dos modelos a verificar.
  const targets = [];
  for (const [providerKey, models] of Object.entries(AI_MODELS)) {
    for (const m of models) {
      targets.push({ provider: providerKey, id: m.id, label: m.label, costIn: m.costIn, costOut: m.costOut });
    }
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const prompt = `Você é um pesquisador de preços de APIs de LLM. Verifique, usando web search nas páginas oficiais de pricing (platform.claude.com / openai.com / ai.google.dev), o preço PÚBLICO ATUAL de lista (USD por 1 milhão de tokens, tier padrão) de entrada (input) e saída (output) de cada modelo abaixo.

Modelos (provider | id | preço atual conhecido entrada/saída):
${targets.map(t => `- ${t.provider} | ${t.id} | ${t.costIn}/${t.costOut}`).join('\n')}

Regras:
- Mantenha exatamente os mesmos "id".
- Para o Gemini, use o tier de prompts curtos (≤200k tokens) quando houver preço escalonado.
- Se não conseguir confirmar com segurança o preço de um modelo, mantenha o valor atual conhecido.
- Responda APENAS com JSON válido, sem texto fora dele, no formato:
{"prices":[{"id":"...","costIn":0.0,"costOut":0.0}]}`;

  const messages = [{ role: 'user', content: prompt }];
  let response;
  // Server tools podem pausar (pause_turn) — continua até finalizar.
  for (let i = 0; i < 4; i++) {
    response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      system: 'Responda sempre em JSON válido e seja preciso com números.',
      tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 6 }],
      messages,
    });
    if (response.stop_reason !== 'pause_turn') break;
    messages.push({ role: 'assistant', content: response.content });
  }

  const text = response.content.filter(b => b.type === 'text').map(b => b.text).join('\n').trim();

  let parsed;
  try {
    parsed = extractJson(text);
  } catch (e) {
    throw new Error('Não foi possível interpretar a resposta de preços do modelo.');
  }

  const fetchedMap = {};
  for (const p of parsed.prices || []) {
    if (p && p.id && Number.isFinite(Number(p.costIn)) && Number.isFinite(Number(p.costOut))) {
      fetchedMap[p.id] = { costIn: Number(p.costIn), costOut: Number(p.costOut) };
    }
  }

  // Mescla sobre os valores atuais (mantém o valor antigo se algo faltou).
  const verifiedAt = new Date().toISOString().slice(0, 10);
  const newPrices = {};
  const mergedModels = {};
  for (const [providerKey, models] of Object.entries(AI_MODELS)) {
    mergedModels[providerKey] = models.map(m => {
      const next = fetchedMap[m.id] || { costIn: m.costIn, costOut: m.costOut };
      newPrices[m.id] = next;
      return { ...m, costIn: next.costIn, costOut: next.costOut };
    });
  }

  await fs.writeFile(
    PRICING_CACHE_PATH,
    JSON.stringify({ verifiedAt, source: 'web_search', prices: newPrices }, null, 2) + '\n',
    'utf-8'
  );

  return { verifiedAt, models: mergedModels };
}

import { ArticleSummaryRepository } from '@/repositories/ArticleSummaryRepository';
import { revalidatePath } from 'next/cache';

export async function deleteHistoryRecord(id) {
  await requireAuth();
  const repo = new ArticleSummaryRepository();
  const success = await repo.delete(id);
  if (success) {
    revalidatePath('/resultados');
  }
  return success;
}

export async function deleteHistoryRecords(ids) {
  await requireAuth();
  const repo = new ArticleSummaryRepository();
  const success = await repo.deleteMany(ids);
  if (success) {
    revalidatePath('/resultados');
  }
  return success;
}
