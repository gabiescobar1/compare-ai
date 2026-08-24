// Prompt único enviado às três IAs (OpenAI, Gemini e Claude).
// Fonte única: usado pelo AIService (servidor) e pelo PromptModal (cliente),
// para que o texto exibido ao usuário seja exatamente o que é submetido.

export const SYSTEM_PROMPT = 'Você é um pesquisador acadêmico útil.';

export const buildAbstractPrompt = (title, body) => `
Generate a research article abstract for this article.

Title: ${title}

Body text:
${body}

Write in English. Format the text in a professional way.
IMPORTANT: Do NOT use, reference, or reproduce any existing abstract of the article. Generate the abstract solely based on the body text provided above.
Return ONLY the paragraphs of the abstract. Do NOT include any titles, headings, or prefixes (such as "Abstract:" or "Abstract"). Start directly with the first word of the generated text.
`;

// Placeholders no lugar do título e do corpo reais do artigo — para exibição
// no modal de transparência (o usuário vê a estrutura, não os dados de um DOI).
export const PROMPT_TITLE_PLACEHOLDER = '{título do artigo}';
export const PROMPT_BODY_PLACEHOLDER = '{texto completo do artigo}';

export const PROMPT_DISPLAY = buildAbstractPrompt(
  PROMPT_TITLE_PLACEHOLDER,
  PROMPT_BODY_PLACEHOLDER
).trim();
