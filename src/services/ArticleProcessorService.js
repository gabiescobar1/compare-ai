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

      // Processar cada modelo selecionado sequencialmente com delay
      const summariesResults = [];
      for (let i = 0; i < selectedModels.length; i++) {
        const { provider, modelId } = selectedModels[i];
        const result = await this.aiService.summarize(provider, modelId, article.title, article.bodyText);
        summariesResults.push({
          provider,
          model_id: modelId,
          content: result.content,
          input_tokens: result.inputTokens,
          output_tokens: result.outputTokens,
          cost: result.cost,
        });

        // Delay entre chamadas para rate-limiting (exceto última)
        if (i < selectedModels.length - 1) {
          await this.sleep(5000);
        }
      }

      // Salvar no banco
      let savedToDb = false;
      let finalId = String(Date.now());

      try {
        const savedEntity = await this.repository.save(
          {
            doi: article.doi,
            title: article.title,
            discipline: discipline,
            original_abstract: article.abstract,
          },
          summariesResults
        );
        if (savedEntity) {
          savedToDb = true;
          finalId = savedEntity.id;
        }
      } catch (repoError) {
        console.error("Erro no repositório de dados:", repoError);
      }

      return {
        success: true,
        id: finalId,
        doi: article.doi,
        title: article.title,
        discipline: discipline,
        originalAbstract: article.abstract,
        summaries: summariesResults,
        savedToDb
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
}
