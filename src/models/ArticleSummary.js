export class Analysis {
  constructor({
    id = null,
    doi,
    title,
    discipline,
    original_abstract,
    created_at = new Date().toISOString()
  }) {
    this.id = id;
    this.doi = doi;
    this.title = title;
    this.discipline = discipline;
    this.original_abstract = original_abstract;
    this.created_at = created_at;
  }
}

export class Summary {
  constructor({
    id = null,
    analysis_id = null,
    provider,
    model_id,
    content,
    input_tokens = 0,
    output_tokens = 0,
    cost = 0,
    created_at = new Date().toISOString()
  }) {
    this.id = id;
    this.analysis_id = analysis_id;
    this.provider = provider;
    this.model_id = model_id;
    this.content = content;
    this.input_tokens = input_tokens;
    this.output_tokens = output_tokens;
    this.cost = cost;
    this.created_at = created_at;
  }
}
