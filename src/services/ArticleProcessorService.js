import { PlosApiService } from './PlosApiService';
import { AIService } from './AIService';
import { ArticleSummaryRepository } from '@/repositories/ArticleSummaryRepository';

export class ArticleProcessorService {
  constructor() {
    this.plosApi = new PlosApiService();
    this.aiService = new AIService();
    this.repository = new ArticleSummaryRepository();
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * @param {string} doiInput
   * @param {Array<{provider: string, modelId: string}>} selectedModels
   * @param {string} discipline
   */
  async processDoi(doiInput, selectedModels, discipline) {
    try {
      const doi = doiInput.trim();
      if (!doi) throw new Error("DOI inválido.");

      const article = await this.plosApi.fetchArticle(doi);

      // Processar todos os modelos selecionados em paralelo
      const summariesResults = await Promise.all(
        selectedModels.map(async ({ provider, modelId }) => {
          const result = await this.aiService.summarize(provider, modelId, article.title, article.bodyText);
          return {
            provider,
            model_id: modelId,
            content: result.content,
            input_tokens: result.inputTokens,
            output_tokens: result.outputTokens,
            cost: result.cost,
          };
        })
      );

      // Salvar no banco
      const savedEntity = await this.repository.save(
        {
          doi: article.doi,
          title: article.title,
          discipline: discipline,
          original_abstract: article.abstract,
        },
        summariesResults
      );

      return {
        success: true,
        id: savedEntity.id,
        doi: article.doi,
        title: article.title,
        discipline: discipline,
        originalAbstract: article.abstract,
        summaries: summariesResults,
        savedToDb: true
      };

    } catch (error) {
      console.error("Erro no processamento do DOI:", error);
      return {
        success: false,
        error: error.message || 'Erro interno desconhecido ao processar DOI.',
        doi: doiInput
      };
    }
  }

  /**
   * Regenera o resumo de UM único modelo de uma análise existente: re-busca o
   * corpo do artigo pelo DOI, reenvia o prompt só para esse modelo e persiste.
   * @param {{ analysisId: string, doi: string, provider: string, modelId: string }} params
   */
  async regenerateSummary({ analysisId, doi, provider, modelId }) {
    try {
      const article = await this.plosApi.fetchArticle(doi);
      const result = await this.aiService.summarize(provider, modelId, article.title, article.bodyText);

      const summary = {
        provider,
        model_id: modelId,
        content: result.content,
        input_tokens: result.inputTokens,
        output_tokens: result.outputTokens,
        cost: result.cost,
      };

      if (analysisId) {
        await this.repository.upsertSummary(analysisId, summary);
      }

      const isError = !result.content || result.content.startsWith('ERRO');
      return { success: !isError, summary };
    } catch (error) {
      console.error("Erro ao regenerar resumo:", error);
      const message = error.message || 'Erro ao regenerar.';
      return {
        success: false,
        error: message,
        summary: {
          provider,
          model_id: modelId,
          content: `ERRO: ${message}`,
          input_tokens: 0,
          output_tokens: 0,
          cost: 0,
        },
      };
    }
  }
}
