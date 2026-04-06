export class PlosApiService {
  async fetchArticle(doi) {
    const cleanDoi = doi.trim();
    const url = `https://api.plos.org/search?q=id:"${cleanDoi}"&fl=id,title,abstract,body&wt=json`;
    
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Erro na API Plos: ${res.statusText}`);
      
      const data = await res.json();
      if (!data.response || !data.response.docs || data.response.docs.length === 0) {
        throw new Error(`Artigo não encontrado para o DOI: ${cleanDoi}`);
      }
      
      const doc = data.response.docs[0];
      
      const title = doc.title || "Sem Título";
      const abstract = doc.abstract ? (Array.isArray(doc.abstract) ? doc.abstract.join("\n") : doc.abstract) : "Sem abstract disponível.";
      const bodyText = doc.body ? (Array.isArray(doc.body) ? doc.body.join("\n") : doc.body) : "";
      
      // Tratamento para evitar estouro de tokens
      let truncatedBody = bodyText;
      if (truncatedBody.length > 25000) {
        truncatedBody = truncatedBody.substring(0, 25000) + "\n\n... [Trecho truncado devido aos limites da API]";
      }

      return {
        doi: cleanDoi,
        title,
        abstract,
        bodyText: truncatedBody
      };
    } catch (error) {
      console.error(`Erro ao buscar DOI ${cleanDoi}:`, error);
      throw error;
    }
  }
}
