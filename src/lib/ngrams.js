// Extração de n-gramas para a busca de lexical bundles no corpus.
//
// Um lexical bundle é uma sequência de n palavras que recorre no corpus
// (Biber et al., 1999); ferramentas como o N-gram do Sketch Engine
// (Kilgarriff et al., 2014) listam essas sequências por frequência e por
// dispersão (em quantos textos ocorrem).
//
// Convenção adotada aqui: a janela de n palavras NÃO atravessa fronteira de
// frase — ponto, interrogação, exclamação, ponto e vírgula, dois-pontos,
// travessão, parênteses, aspas e quebra de parágrafo interrompem a sequência
// — mas atravessa vírgulas, para não perder bundles como "on the other hand".
// Marcação de markdown (**Background:**) é removida antes da tokenização.

const SEGMENT_BREAK = /[.!?;:()[\]{}"“”«»…]+|\r?\n+|—|–|--/;
const TOKEN = /[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu;

/**
 * Quebra o texto em frases e tokeniza cada uma (minúsculas).
 * @param {string} text
 * @returns {string[][]} um array de tokens por segmento
 */
export function tokenizeSegments(text) {
  if (!text) return [];
  const clean = String(text).replace(/[*_`]+/g, ' ');
  return clean
    .split(SEGMENT_BREAK)
    .map(seg => seg.toLowerCase().match(TOKEN) || [])
    .filter(tokens => tokens.length > 0);
}

/** Total de palavras (tokens) de um texto já segmentado. */
export function countTokens(segments) {
  let total = 0;
  for (const seg of segments) total += seg.length;
  return total;
}

/** Percorre cada n-grama do texto segmentado, sem atravessar segmentos. */
export function eachNgram(segments, n, fn) {
  for (const tokens of segments) {
    for (let i = 0; i + n <= tokens.length; i += 1) {
      fn(tokens.slice(i, i + n).join(' '));
    }
  }
}

/** Frequência de cada n-grama num único texto segmentado. */
export function countNgrams(segments, n) {
  const counts = new Map();
  eachNgram(segments, n, g => counts.set(g, (counts.get(g) || 0) + 1));
  return counts;
}

/**
 * Índice de n-gramas de um corpus, em duas passadas: a primeira conta as
 * frequências no corpus-alvo e descarta o que não recorre (a maior parte das
 * sequências ocorre uma única vez); a segunda, só para as candidatas, registra
 * em que textos e em que fonte cada uma apareceu.
 *
 * @param {Array<{segments: string[][], source: string}>} texts corpus inteiro
 * @param {number} n tamanho da sequência (4 a 6, tipicamente)
 * @param {string[]} targetSources fontes que formam o corpus-alvo da busca
 * @param {number} minFreq piso de frequência no alvo (mínimo 2: precisa recorrer)
 * @returns {Array<{ngram, total, range, bySource, hits}>} `hits` traz todas as
 *   ocorrências, inclusive nos textos fora do alvo (para a comparação).
 */
export function buildNgramIndex(texts, n, targetSources, minFreq = 2) {
  const target = new Set(targetSources);
  const floor = Math.max(2, minFreq);

  // 1ª passada: frequência no corpus-alvo.
  const targetCounts = new Map();
  texts.forEach(t => {
    if (!target.has(t.source)) return;
    eachNgram(t.segments, n, g => targetCounts.set(g, (targetCounts.get(g) || 0) + 1));
  });

  const detail = new Map();
  targetCounts.forEach((total, ngram) => {
    if (total >= floor) detail.set(ngram, { ngram, total, range: 0, bySource: {}, hits: [] });
  });
  if (detail.size === 0) return [];

  // 2ª passada: onde ocorrem (só as candidatas).
  texts.forEach((t, textIndex) => {
    const local = new Map();
    eachNgram(t.segments, n, g => {
      if (detail.has(g)) local.set(g, (local.get(g) || 0) + 1);
    });
    local.forEach((count, g) => {
      const d = detail.get(g);
      d.bySource[t.source] = (d.bySource[t.source] || 0) + count;
      d.hits.push({ textIndex, count });
      if (target.has(t.source)) d.range += 1;
    });
  });

  return [...detail.values()];
}
