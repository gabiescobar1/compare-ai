import { supabase } from '@/lib/supabase';

export class ArticleSummaryRepository {
  /**
   * Salva uma análise e seus resumos nas tabelas `analyses` e `summaries`.
   * @param {{ doi: string, title: string, discipline: string, original_abstract: string }} analysisData
   * @param {Array<{ provider: string, model_id: string, content: string, input_tokens: number, output_tokens: number, cost: number }>} summariesData
   */
  async save(analysisData, summariesData) {
    if (!supabase) {
      console.warn("Supabase Client não inicializado. Verifique as chaves.");
      return null;
    }

    // 1. Inserir na tabela analyses
    const { data: analysis, error: analysisError } = await supabase
      .from('analyses')
      .insert({
        doi: analysisData.doi,
        title: analysisData.title,
        discipline: analysisData.discipline,
        original_abstract: analysisData.original_abstract,
      })
      .select('*')
      .single();

    if (analysisError) {
      throw new Error(`Erro ao salvar análise no Supabase: ${analysisError?.message || JSON.stringify(analysisError)}`);
    }

    // 2. Inserir os resumos vinculados
    const summaryRows = summariesData.map(s => ({
      analysis_id: analysis.id,
      provider: s.provider,
      model_id: s.model_id,
      content: s.content,
      input_tokens: s.input_tokens,
      output_tokens: s.output_tokens,
      cost: s.cost,
    }));

    const { error: summariesError } = await supabase
      .from('summaries')
      .insert(summaryRows);

    if (summariesError) {
      throw new Error(`Erro ao salvar resumos no Supabase: ${summariesError?.message || JSON.stringify(summariesError)}`);
    }

    return analysis;
  }

  async getAll() {
    if (!supabase) return [];

    // Pagina para trazer TODAS as análises. Sem isso, um limite fixo faz o
    // Analytics contar abstracts a menos nas disciplinas fora das mais recentes.
    // (O PostgREST limita ~1000 linhas por requisição, então iteramos por faixas.)
    const PAGE_SIZE = 1000;
    const analyses = [];
    for (let from = 0; ; from += PAGE_SIZE) {
      const { data, error } = await supabase
        .from('analyses')
        .select(`
          *,
          summaries (*)
        `)
        .order('created_at', { ascending: false })
        .range(from, from + PAGE_SIZE - 1);

      if (error) {
        console.error(error);
        break;
      }
      if (!data || data.length === 0) break;
      analyses.push(...data);
      if (data.length < PAGE_SIZE) break;
    }

    // Mapear para estrutura esperada pela UI
    return analyses.map(item => ({
      success: true,
      id: item.id,
      doi: item.doi,
      title: item.title,
      discipline: item.discipline,
      originalAbstract: item.original_abstract,
      summaries: (item.summaries || []).map(s => ({
        provider: s.provider,
        model_id: s.model_id,
        content: s.content,
        input_tokens: s.input_tokens,
        output_tokens: s.output_tokens,
        cost: s.cost,
      })),
      savedToDb: true,
      created_at: item.created_at,
    }));
  }

  async delete(id) {
    if (!supabase) return false;

    // CASCADE no FK deleta os summaries automaticamente
    const { error } = await supabase
      .from('analyses')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Erro ao deletar:", error);
      return false;
    }
    return true;
  }

  async deleteMany(ids) {
    if (!supabase || !Array.isArray(ids) || ids.length === 0) return false;

    const { error } = await supabase
      .from('analyses')
      .delete()
      .in('id', ids);

    if (error) {
      console.error("Erro ao deletar em lote:", error);
      return false;
    }
    return true;
  }
}
