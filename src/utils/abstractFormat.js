// Classificação retórica do formato de um abstract:
//  - "structured": traz rótulos de seção antes dos movimentos retóricos
//    (ex.: "Background:", "Methods:", "Results:", "Conclusions:"), inline ou
//    em linhas próprias, às vezes em negrito markdown (**Results:**).
//  - "block": um único bloco de texto corrido, sem esses rótulos.
//
// A detecção procura rótulos conhecidos seguidos de dois-pontos, aceitando só
// quando o rótulo está em maiúscula inicial ou em negrito — evitando falsos
// positivos como "these results:" no meio de uma frase.

// Rótulos comuns de abstracts estruturados (estilo PubMed/JAMA e afins).
const HEADING_KEYWORDS = [
  'background', 'introduction', 'objective', 'objectives', 'aim', 'aims',
  'purpose', 'rationale', 'importance', 'context',
  'methods', 'method', 'materials and methods', 'design', 'setting',
  'participants', 'patients', 'subjects', 'population', 'sample',
  'intervention', 'interventions', 'exposures', 'main outcome measures',
  'outcome measures', 'measurements', 'data sources', 'study selection',
  'data extraction', 'data collection', 'analysis', 'statistical analysis',
  'results', 'findings', 'main results', 'outcomes',
  'conclusion', 'conclusions', 'conclusions and relevance', 'discussion',
  'interpretation', 'implications', 'significance', 'limitations',
  'funding', 'trial registration', 'registration',
];

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Mais longos primeiro, para "materials and methods" casar antes de "methods".
const ALTERNATION = HEADING_KEYWORDS
  .slice()
  .sort((a, b) => b.length - a.length)
  .map(escapeRegExp)
  .join('|');

/**
 * Retorna a lista (sem repetição) de rótulos de seção detectados no texto.
 * @param {string} text
 * @returns {string[]} rótulos em minúsculas (ex.: ["background", "methods"])
 */
export function detectHeadings(text) {
  if (!text || typeof text !== 'string') return [];
  const re = new RegExp(`(\\*\\*)?\\b(${ALTERNATION})\\b(\\*\\*)?\\s*:`, 'gi');
  const found = new Set();
  let m;
  while ((m = re.exec(text)) !== null) {
    const label = m[2];
    const bold = Boolean(m[1] || m[3]);
    const startsUpper = /^[A-Z]/.test(label);
    // Só conta como rótulo se estiver em negrito ou com inicial maiúscula.
    if (bold || startsUpper) found.add(label.toLowerCase());
  }
  return [...found];
}

/**
 * Classifica o formato do abstract.
 * @param {string} text
 * @returns {{ format: 'structured' | 'block', headings: string[] }}
 */
export function classifyAbstractFormat(text) {
  const headings = detectHeadings(text);
  // Dois ou mais rótulos distintos caracterizam um abstract estruturado.
  return { format: headings.length >= 2 ? 'structured' : 'block', headings };
}

// Textos que não devem entrar na análise (originais ausentes ou erros de IA).
export function isAnalyzableAbstract(text) {
  if (!text || typeof text !== 'string') return false;
  const t = text.trim();
  if (!t) return false;
  if (t.includes('ERRO')) return false;
  if (/^sem abstract dispon/i.test(t)) return false; // placeholder do PlosApiService
  return true;
}
