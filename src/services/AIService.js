import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';
import { calculateCost } from '@/constants/AiModels';

export class AIService {
  constructor() {
    this.promptTemplate = (title, body) => `
Generate a research article abstract for this article.

Title: ${title}

Body text:
${body}

Write in English. Format the text in a professional way.
Return ONLY the paragraphs of the abstract. Do NOT include any titles, headings, or prefixes (such as "Abstract:" or "Abstract"). Start directly with the first word of the generated text.
`;
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

  async summarizeWithOpenAI(title, body, modelId) {
    if (!process.env.OPENAI_API_KEY) return this.createErrorResponse('OPENAI_API_KEY não configurada.', modelId);
    try {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const prompt = this.promptTemplate(title, body);

      // Trava de segurança para modelo futuro simulado
      let realModelId = modelId;
      if (modelId === 'gpt-5.1') realModelId = 'gpt-4o';

      const response = await openai.chat.completions.create({
        model: realModelId,
        messages: [
          { role: 'system', content: 'Você é um pesquisador acadêmico útil.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
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
      
      // Mapeia caso seja passado apenas gemini-3.1 para o modelo real da API (gemini-3.1-pro)
      let realModelId = modelId;
      if (modelId === 'gemini-3.1') realModelId = 'gemini-3.1-pro';
      
      const model = genAI.getGenerativeModel({ model: realModelId });
      const prompt = this.promptTemplate(title, body);

      const result = await model.generateContent(prompt);
      const response = result.response;

      const content = response.text();
      let inTokens = 0;
      let outTokens = content.length / 4; // fallback estimado caso a API oculte.

      if (response.usageMetadata) {
        inTokens = response.usageMetadata.promptTokenCount || 0;
        outTokens = response.usageMetadata.candidatesTokenCount || 0;
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
        max_tokens: 1024,
        system: 'Você é um pesquisador acadêmico útil.',
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
}
