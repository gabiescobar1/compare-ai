import { describe, it, expect } from 'vitest';
import { tokenizeSegments, countTokens, countNgrams, buildNgramIndex } from './ngrams';

describe('tokenizeSegments', () => {
  it('quebra em frases e devolve tokens em minúsculas', () => {
    expect(tokenizeSegments('The Study Shows X. It also shows Y!')).toEqual([
      ['the', 'study', 'shows', 'x'],
      ['it', 'also', 'shows', 'y'],
    ]);
  });

  it('remove marcação de markdown dos rótulos de seção', () => {
    expect(tokenizeSegments('**Background:** the present study')).toEqual([
      ['background'],
      ['the', 'present', 'study'],
    ]);
  });

  it('mantém a sequência através de vírgulas', () => {
    expect(tokenizeSegments('on the other hand, the results')).toEqual([
      ['on', 'the', 'other', 'hand', 'the', 'results'],
    ]);
  });

  it('descarta segmentos vazios e trata texto ausente', () => {
    expect(tokenizeSegments('... ; ...')).toEqual([]);
    expect(tokenizeSegments('')).toEqual([]);
    expect(tokenizeSegments(null)).toEqual([]);
  });
});

describe('countNgrams', () => {
  const segs = tokenizeSegments('the results of the study show that the results of the study matter');

  it('conta sequências repetidas', () => {
    expect(countNgrams(segs, 4).get('the results of the')).toBe(2);
  });

  it('não gera n-gramas maiores que o segmento', () => {
    expect(countNgrams(tokenizeSegments('one two three.'), 4).size).toBe(0);
  });

  it('não atravessa a fronteira de frase', () => {
    // "b. c" não pode formar a sequência "a b c d"
    const s = tokenizeSegments('a b. c d');
    expect(countNgrams(s, 3).size).toBe(0);
  });
});

describe('buildNgramIndex', () => {
  const texts = [
    { source: 'openai', segments: tokenizeSegments('the aim of this study was to examine') },
    { source: 'gemini', segments: tokenizeSegments('the aim of this study is clear') },
    { source: 'original', segments: tokenizeSegments('the aim of this study was different') },
  ];

  it('conta apenas o corpus-alvo no total e na dispersão', () => {
    const [row] = buildNgramIndex(texts, 5, ['openai', 'gemini']).filter(r => r.ngram === 'the aim of this study');
    expect(row.total).toBe(2);
    expect(row.range).toBe(2);
  });

  it('registra as ocorrências fora do alvo para comparação', () => {
    const [row] = buildNgramIndex(texts, 5, ['openai', 'gemini']).filter(r => r.ngram === 'the aim of this study');
    expect(row.bySource.original).toBe(1);
    expect(row.hits).toHaveLength(3);
  });

  it('descarta sequências que não recorrem no alvo', () => {
    const rows = buildNgramIndex(texts, 5, ['openai', 'gemini']);
    expect(rows.some(r => r.ngram === 'aim of this study was')).toBe(false);
  });

  it('respeita o piso de frequência, nunca abaixo de 2', () => {
    expect(buildNgramIndex(texts, 5, ['openai', 'gemini'], 3)).toHaveLength(0);
    expect(buildNgramIndex(texts, 5, ['original'], 1)).toHaveLength(0);
  });

  it('troca o alvo sem perder a contagem das outras fontes', () => {
    const [row] = buildNgramIndex(texts, 5, ['openai', 'gemini', 'original'])
      .filter(r => r.ngram === 'the aim of this study');
    expect(row.total).toBe(3);
    expect(row.bySource.openai).toBe(1);
  });
});

describe('countTokens', () => {
  it('soma as palavras de todos os segmentos', () => {
    expect(countTokens(tokenizeSegments('one two. three four five'))).toBe(5);
  });
});
