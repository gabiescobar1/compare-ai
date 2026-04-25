import { supabase } from '@/lib/supabase';
import { ArticleSummary } from '@/models/ArticleSummary';

export class ArticleSummaryRepository {
  async save(summaryData) {
    if (!supabase) {
      console.warn("Supabase Client não inicializado. Verifique as chaves.");
      return null;
    }

    const { data, error } = await supabase
      .from('article_summaries')
      .insert({
        doi: summaryData.doi,
        title: summaryData.title,
        discipline: summaryData.discipline,
        original_abstract: summaryData.original_abstract,
        openai_summary: summaryData.openai_summary,
        gemini_summary: summaryData.gemini_summary,
        claude_summary: summaryData.claude_summary
      })
      .select('*')
      .single();

    if (error) {
      throw new Error(`Erro ao salvar no Supabase: ${error.message}`);
    }

    return new ArticleSummary(data);
  }

  async getAll() {
    if (!supabase) return [];
    
    const { data, error } = await supabase
      .from('article_summaries')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
      
    if (error) {
      console.error(error);
      return [];
    }
    
    // Map to expected UI structure
    return data.map(item => ({
      success: true,
      id: item.id,
      doi: item.doi,
      title: item.title,
      discipline: item.discipline,
      originalAbstract: item.original_abstract,
      openaiSummary: item.openai_summary,
      geminiSummary: item.gemini_summary,
      claudeSummary: item.claude_summary,
      savedToDb: true,
      created_at: item.created_at
    }));
  }

  async delete(id) {
    if (!supabase) return false;
    
    const { error } = await supabase
      .from('article_summaries')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error("Erro ao deletar:", error);
      return false;
    }
    return true;
  }
}
