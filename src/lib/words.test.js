import { describe, it, expect } from 'vitest';
import { countWords, extractWords } from './words';

// Regra do Sketch Engine: tokeniza primeiro, e palavra é o token que começa
// com letra. Os casos abaixo foram conferidos contra a lista de frequências
// exportada do Sketch Engine para o corpus do projeto.
describe('countWords', () => {
  it('conta palavras simples', () => {
    expect(countWords('the results of this study')).toBe(5);
  });

  it('não conta pontuação nem símbolos soltos', () => {
    expect(countWords('significant ( p = 0.05 ) results')).toBe(3); // significant, p, results
    expect(countWords('a ± b ≥ c < d')).toBe(4);
  });

  it('não conta tokens que começam com dígito', () => {
    expect(countWords('95% of the 2008 cohort')).toBe(3); // of, the, cohort
    expect(countWords('12345')).toBe(0);
  });

  it('não parte compostos iniciados por dígito', () => {
    // O token inteiro começa com dígito, então nenhum deles é palavra —
    // contar "item", "day" ou "year-old" aqui inflava a contagem.
    expect(extractWords('a 10-item scale')).toEqual(['a', 'scale']);
    expect(extractWords('the 65-year-old patients')).toEqual(['the', 'patients']);
    expect(extractWords('in the 20th century and the 1990s')).toEqual(
      ['in', 'the', 'century', 'and', 'the']
    );
  });

  it('conta tokens que começam com letra e seguem com dígito', () => {
    expect(extractWords('mp3 CO2 post-1945 T-shirt')).toEqual(['mp3', 'CO2', 'post-1945', 'T-shirt']);
  });

  it('trata o sublinhado como caractere de palavra', () => {
    expect(extractWords('the China_EPU index')).toEqual(['the', 'China_EPU', 'index']);
  });

  it('mantém inteiras as formas com ponto interno', () => {
    expect(extractWords('the U.S. policy')).toEqual(['the', 'U.S', 'policy']);
    expect(extractWords('see TestMyBrain.org now')).toEqual(['see', 'TestMyBrain.org', 'now']);
    expect(countWords('e.g. this and i.e. that')).toBe(5);
  });

  it('não confunde fim de frase com abreviatura', () => {
    expect(extractWords('was low. Two cases')).toEqual(['was', 'low', 'Two', 'cases']);
    expect(countWords('et al. reported')).toBe(3); // et, al, reported
  });

  it('separa "cannot" e o clítico negativo, como o tokenizador de inglês', () => {
    expect(extractWords('they cannot know')).toEqual(['they', 'can', 'not', 'know']);
    expect(extractWords("they don't know")).toEqual(['they', 'do', "n't", 'know']);
    expect(extractWords("it can't be")).toEqual(['it', 'ca', "n't", 'be']);
    expect(countWords("doesn't")).toBe(2);
  });

  it('ignora a marcação de markdown dos textos gerados', () => {
    expect(countWords('**Background:** the present study')).toBe(4);
    expect(countWords('*emphasis* and _underscore_')).toBe(3);
  });

  it('mantém apóstrofo e hífen internos como uma só palavra', () => {
    expect(countWords("children's well-known state-of-the-art")).toBe(3);
    expect(countWords('the researchers’ approach')).toBe(3);
  });

  it('conta o possessivo plural como uma palavra', () => {
    expect(extractWords("the participants' answers")).toEqual(['the', 'participants', 'answers']);
  });

  it('separa palavras coladas por pontuação', () => {
    expect(countWords('data/analysis')).toBe(2);
    expect(countWords('results,conclusions')).toBe(2);
  });

  it('conta formas mistas iniciadas por letra', () => {
    expect(extractWords('COVID-19')).toEqual(['COVID-19']);
    expect(countWords('p<0.05')).toBe(1);
  });

  it('trata texto ausente ou vazio', () => {
    expect(countWords('')).toBe(0);
    expect(countWords(null)).toBe(0);
    expect(countWords(undefined)).toBe(0);
    expect(countWords('   ')).toBe(0);
  });

  it('conta palavras acentuadas e de outros alfabetos', () => {
    expect(countWords('análise da educação brasileira')).toBe(4);
  });
});

describe('extractWords', () => {
  it('devolve as palavras na ordem', () => {
    expect(extractWords('**Results:** the mean was 4.5 points')).toEqual(
      ['Results', 'the', 'mean', 'was', 'points']
    );
  });
});
