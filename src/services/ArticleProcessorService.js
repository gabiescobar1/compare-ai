import { PlosApiService } from './PlosApiService';
import { AIService } from './AIService';
import { ArticleSummaryRepository } from '@/repositories/ArticleSummaryRepository';
import { ArticleSummary } from '@/models/ArticleSummary';

export class ArticleProcessorService {
  constructor() {
    this.plosApi = new PlosApiService();
    this.aiService = new AIService();
    this.repository = new ArticleSummaryRepository();
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async processDoi(doiInput, selectedModels) {
    try {
      const doi = doiInput.trim();
      if (!doi) throw new Error("DOI inválido.");

      const article = await this.plosApi.fetchArticle(doi);
      
      const openaiModel = selectedModels?.openai || 'gpt-5.1';
      const geminiModel = selectedModels?.gemini || 'gemini-3.1';
      const claudeModel = selectedModels?.claude || 'claude-4.6-sonnet';

      const openaiPromise = this.aiService.summarizeWithOpenAI(article.title, article.bodyText, openaiModel);
      await this.sleep(5000);
      const geminiPromise = this.aiService.summarizeWithGemini(article.title, article.bodyText, geminiModel);
      await this.sleep(5000);
      const claudePromise = this.aiService.summarizeWithClaude(article.title, article.bodyText, claudeModel);
      
      const [openaiSummary, geminiSummary, claudeSummary] = await Promise.all([
        openaiPromise,
        geminiPromise,
        claudePromise
      ]);
      
      const summaryToSave = new ArticleSummary({
        doi: article.doi,
        title: article.title,
        original_abstract: article.abstract,
        openai_summary: openaiSummary, // JSON Object containing content, model, inputTokens, outputTokens, cost
        gemini_summary: geminiSummary, // JSON Object
        claude_summary: claudeSummary  // JSON Object
      });

      let savedToDb = false;
      let finalId = String(Date.now());
      
      try {
        const savedEntity = await this.repository.save(summaryToSave);
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
        doi: summaryToSave.doi,
        title: summaryToSave.title,
        originalAbstract: summaryToSave.original_abstract,
        openaiSummary: summaryToSave.openai_summary,
        geminiSummary: summaryToSave.gemini_summary,
        claudeSummary: summaryToSave.claude_summary,
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
