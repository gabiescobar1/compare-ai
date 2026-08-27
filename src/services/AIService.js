import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';
import { calculateCost } from '@/constants/AiModels';
import { buildAbstractPrompt, SYSTEM_PROMPT } from '@/constants/AiPrompt';

// Teto de tokens de saída. 1024 (2^10) era um default arbitrário que cortava
// abstracts longos no meio da frase; 1536 comporta um abstract completo e
// folgado (~1100-1200 palavras) sem elevar demais o custo de saída do Claude.
const MAX_OUTPUT_TOKENS = 1536;

export class AIService {
  constructor() {
    // Prompt compartilhado com o modal de transparência (ver AiPrompt.js).
    this.promptTemplate = buildAbstractPrompt;
  }

  createErrorResponse(errorMsg, modelId) {
    return {
      content: `ERRO: ${errorMsg}`,
      model: modelId,
      inputTokens: 0,
      outputTokens: 0,
      cost: 0
    };
  }

  // Models gpt-5.x require max_completion_tokens instead of max_tokens
  _usesCompletionTokens(modelId) {
    return modelId.startsWith('gpt-5') || modelId.startsWith('o1') || modelId.startsWith('o3');
  }

  async summarizeWithOpenAI(title, body, modelId) {
    if (!process.env.OPENAI_API_KEY) return this.createErrorResponse('OPENAI_API_KEY não configurada.', modelId);
    try {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const prompt = this.promptTemplate(title, body);

      const usesCompletionTokens = this._usesCompletionTokens(modelId);
      const tokenParam = usesCompletionTokens
        ? { max_completion_tokens: MAX_OUTPUT_TOKENS }
        : { max_tokens: MAX_OUTPUT_TOKENS };

      // Modelos de raciocínio (gpt-5.x, o1, o3) só aceitam a temperatura padrão.
      const samplingParam = usesCompletionTokens ? {} : { temperature: 0.3 };

      const response = await openai.chat.completions.create({
        model: modelId,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: prompt }
        ],
        ...samplingParam,
        ...tokenParam,
      });

      const content = response.choices[0].message.content;
      const inTokens = response.usage?.prompt_tokens || 0;
      const outTokens = response.usage?.completion_tokens || 0;
      const cost = calculateCost('OPENAI', modelId, inTokens, outTokens);

      return { content, model: modelId, inputTokens: inTokens, outputTokens: outTokens, cost };
    } catch (error) {
      console.error("OpenAI Error:", error);
      return this.createErrorResponse(error.message, modelId);
    }
  }

  async summarizeWithGemini(title, body, modelId) {
    if (!process.env.GEMINI_API_KEY) return this.createErrorResponse('GEMINI_API_KEY não configurada.', modelId);
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: modelId });
      const prompt = this.promptTemplate(title, body);

      const result = await model.generateContent(prompt);
      const response = result.response;

      const content = response.text();
      let inTokens = 0;
      let outTokens = Math.ceil(content.length / 4); // fallback estimado caso a API oculte.

      if (response.usageMetadata) {
        inTokens = response.usageMetadata.promptTokenCount || 0;
        outTokens = response.usageMetadata.candidatesTokenCount || outTokens;
      }

      const cost = calculateCost('GEMINI', modelId, inTokens, outTokens);

      return { content, model: modelId, inputTokens: inTokens, outputTokens: outTokens, cost };
    } catch (error) {
      console.error("Gemini Error:", error);
      return this.createErrorResponse(error.message, modelId);
    }
  }

  async summarizeWithClaude(title, body, modelId) {
    if (!process.env.ANTHROPIC_API_KEY) return this.createErrorResponse('ANTHROPIC_API_KEY não configurada.', modelId);
    try {
      const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      const prompt = this.promptTemplate(title, body);

      const response = await anthropic.messages.create({
        model: modelId,
        max_tokens: MAX_OUTPUT_TOKENS,
        system: SYSTEM_PROMPT,
        messages: [
          { role: 'user', content: prompt }
        ]
      });

      const content = response.content[0].text;
      const inTokens = response.usage?.input_tokens || 0;
      const outTokens = response.usage?.output_tokens || 0;
      const cost = calculateCost('CLAUDE', modelId, inTokens, outTokens);

      return { content, model: modelId, inputTokens: inTokens, outputTokens: outTokens, cost };
    } catch (error) {
      console.error("Claude Error:", error);
      return this.createErrorResponse(error.message, modelId);
    }
  }

  async _summarizeOnce(provider, modelId, title, body) {
    switch (provider) {
      case 'openai': return this.summarizeWithOpenAI(title, body, modelId);
      case 'gemini': return this.summarizeWithGemini(title, body, modelId);
      case 'claude': return this.summarizeWithClaude(title, body, modelId);
      default: return this.createErrorResponse(`Provider desconhecido: ${provider}`, modelId);
    }
  }

  /**
   * Insiste com o modelo quando ele erra (rate limit, instabilidade etc.),
   * com backoff progressivo. Só desiste depois de esgotar as tentativas.
   */
  async summarize(provider, modelId, title, body) {
    if (!['openai', 'gemini', 'claude'].includes(provider)) {
      return this.createErrorResponse(`Provider desconhecido: ${provider}`, modelId);
    }

    const delaysMs = [1500, 4000, 8000, 15000]; // espera entre tentativas
    const maxAttempts = delaysMs.length + 1;     // 5 tentativas no total
    let result;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      result = await this._summarizeOnce(provider, modelId, title, body);
      const failed = !result?.content || result.content.startsWith('ERRO');
      if (!failed) return result;

      if (attempt < maxAttempts - 1) {
        console.warn(`[AIService] ${provider}/${modelId} falhou (tentativa ${attempt + 1}/${maxAttempts}). Repetindo…`);
        await new Promise(r => setTimeout(r, delaysMs[attempt]));
      }
    }
    return result; // esgotou as tentativas — devolve o último erro
  }
}
