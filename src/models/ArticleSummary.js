export class ArticleSummary {
  constructor({
    id = null,
    doi,
    title,
    original_abstract,
    openai_summary,
    gemini_summary,
    claude_summary,
    created_at = new Date().toISOString()
  }) {
    this.id = id;
    this.doi = doi;
    this.title = title;
    this.original_abstract = original_abstract;
    this.openai_summary = openai_summary;
    this.gemini_summary = gemini_summary;
    this.claude_summary = claude_summary;
    this.created_at = created_at;
  }
}
