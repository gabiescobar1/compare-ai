import {
  IconBook2,
  IconUsersGroup,
  IconPick,
  IconCoin,
  IconSchool,
  IconGavel,
  IconLanguage,
  IconBuildingBank,
  IconBrain,
} from '@tabler/icons-react';

// Ícone por disciplina (chave = label em inglês, como em Disciplines.js).
const DISCIPLINE_ICONS = {
  Anthropology: IconUsersGroup,
  Archaeology: IconPick,
  Economy: IconCoin,
  Education: IconSchool,
  Law: IconGavel,
  Linguistics: IconLanguage,
  'Political Science': IconBuildingBank,
  Psychology: IconBrain,
};

/** Ícone da disciplina; cai no livro quando o nome não é reconhecido. */
export const disciplineIcon = (label) => DISCIPLINE_ICONS[label] || IconBook2;
