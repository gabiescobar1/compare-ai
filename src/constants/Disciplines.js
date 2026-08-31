export const DISCIPLINES = [
  { id: 'Ant', label: 'Anthropology' },
  { id: 'Arch', label: 'Archaeology' },
  { id: 'Eco', label: 'Economy' },
  { id: 'Edu', label: 'Education' },
  { id: 'Law', label: 'Law' },
  { id: 'Ling', label: 'Linguistics' },
  { id: 'PolS', label: 'Political Science' },
  { id: 'Psy', label: 'Psychology' },
];

// Nomes aceitos por disciplina (inglês e português), para casar seções de
// planilha em outro idioma. Acentos são ignorados na comparação.
const DISCIPLINE_ALIASES = {
  Ant: ['anthropology', 'antropologia'],
  Arch: ['archaeology', 'archeology', 'arqueologia'],
  Eco: ['economy', 'economics', 'economia'],
  Edu: ['education', 'educacao'],
  Law: ['law', 'direito'],
  Ling: ['linguistics', 'linguistica'],
  PolS: ['political science', 'ciencia politica', 'ciencias politicas'],
  Psy: ['psychology', 'psicologia'],
};

// Normaliza um nome: minúsculas, sem espaços nas pontas e sem acentos.
const normalizeName = (s) =>
  (s || '').toString().trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

// Mapa nome-normalizado -> id (inclui id, label em inglês e aliases em pt/en).
const NAME_TO_ID = (() => {
  const map = {};
  DISCIPLINES.forEach((d) => {
    map[normalizeName(d.id)] = d.id;
    map[normalizeName(d.label)] = d.id;
  });
  Object.entries(DISCIPLINE_ALIASES).forEach(([id, names]) => {
    names.forEach((n) => { map[normalizeName(n)] = id; });
  });
  return map;
})();

/**
 * Resolve o id da disciplina a partir de um nome em qualquer idioma suportado
 * (id, rótulo em inglês ou nome em português, com ou sem acento). Retorna null
 * se não reconhecer.
 * @param {string} name
 * @returns {string|null}
 */
export function disciplineIdFromName(name) {
  return NAME_TO_ID[normalizeName(name)] || null;
}
