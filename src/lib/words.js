// Contagem de palavras do corpus — definição única, usada em toda a aplicação.
//
// Segue a definição do Sketch Engine: o texto é dividido em *tokens*, e
// *palavra* é todo token que COMEÇA COM UMA LETRA.
// (https://www.sketchengine.eu/glossary/word/)
//
// Daí decorre que CONTAM como palavra: "study", "T-shirt", "post-1945",
// "mp3", "CO2", "e.g." — todos começam com letra. E NÃO contam:
//   - pontuação e símbolos ("=", "<", "±", "≥");
//   - tokens numéricos ("95%", "0.05", "2008", "(1)") — começam com dígito;
//   - marcação de markdown dos textos gerados ("**Background:**").
//
// Calibrado contra a lista de frequências exportada do Sketch Engine para o
// corpus do projeto (480 abstracts gerados por IA). Lá: 169.991 tokens, dos
// quais 144.474 começam com letra — e é esse o número de *words* deles.
// Evolução da nossa contagem sobre os mesmos 480 textos:
//   - split por espaço em branco (regra antiga) ... 147.092  (+1,81%)
//   - sequências que começam com letra ............ 144.591  (+0,08%)
//   - esta regra .................................. 144.472  (-0,0014%)
// Restam 2 palavras de diferença, em formas que o próprio tokenizador deles
// (unitok — Michelfeit, Pomikálek & Suchomel, 2014) trata de modo
// inconsistente: manteve "TestMyBrain.org" inteiro mas quebrou "spryng.io".
// Fora isso, as divergências restantes são só de grafia, com a MESMA
// contagem: "U.S" vs "U.S.", "al" vs "al.", "FEV₁" vs "FEV1", "’" vs "'".
//
// Atenção: números seguem sendo tokens na extração de n-gramas
// (src/lib/ngrams.js), senão "in the past 10 years" viraria a sequência
// falsa "in the past years". São métricas distintas — a mesma distinção
// entre *tokens* e *words* que o Sketch Engine faz.

// Primeiro tokeniza, depois filtra — nesta ordem. Um token é uma sequência de
// letras e dígitos, admitindo apóstrofo, hífen e ponto INTERNOS: assim
// "10-item", "65-year-old", "20th" e "1990s" são um token só, que começa com
// dígito e portanto não é palavra. (Casar direto "trechos que começam com
// letra" contaria "item", "year-old" e "th" — palavras que não existem.)
// O ponto interno mantém "e.g.", "U.S." e "TestMyBrain.org" inteiros.
// O sublinhado une ("China_EPU" é um token só), mas só no meio — senão o
// itálico de markdown "_palavra_" viraria um token iniciado por sublinhado.
const TOKEN = /[\p{L}\p{N}]+(?:['’\-._][\p{L}\p{N}]+)*/gu;
const COMECA_COM_LETRA = /^\p{L}/u;
// Clítico negativo do inglês: "don't" -> "do" + "n't", "can't" -> "ca" + "n't".
const CLITICO_NT = /^(.+?)(n['’]t)$/iu;

/** Palavras de um texto, na ordem em que aparecem. */
export function extractWords(text) {
  if (!text) return [];
  const palavras = [];
  for (const token of String(text).match(TOKEN) || []) {
    if (!COMECA_COM_LETRA.test(token)) continue; // nonword: começa com dígito

    // "cannot" conta como duas palavras, como em qualquer tokenizador de inglês.
    if (/^cannot$/i.test(token)) {
      palavras.push(token.slice(0, 3), token.slice(3));
      continue;
    }
    const m = CLITICO_NT.exec(token);
    if (m && COMECA_COM_LETRA.test(m[1])) {
      palavras.push(m[1], m[2]);
      continue;
    }
    palavras.push(token);
  }
  return palavras;
}

/** Número de palavras de um texto. */
export function countWords(text) {
  return extractWords(text).length;
}
