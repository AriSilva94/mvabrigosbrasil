import type { GlossarySection, SelectOption } from "./types";

export const GLOSSARY_SECTIONS: GlossarySection[] = [
  {
    title: "Geral",
    entries: [
      {
        term: "População Inicial",
        definition:
          "Número de animais presentes no início do primeiro mês de registro do abrigo/lar temporário (LT).",
      },
      {
        term: "Animais doentes",
        definition:
          "Quantidade de animais que ficaram doentes durante o respectivo mês, com sinais clínicos ou diagnóstico confirmado para enfermidades (sejam elas infecciosas, parasitárias, metabólicas, degenerativas ou traumáticas).",
      },
    ],
  },
  {
    title: "Entradas",
    entries: [
      {
        term: "Entradas",
        definition:
          "Quantidade de animais que foram admitidos no abrigo/lar temporário (LT) ao longo do referido mês. Pode incluir: resgates de rua, recolhimento por órgãos públicos, entregas voluntárias, nascimentos ocorridos no abrigo.",
      },
      {
        term: "Devoluções",
        definition:
          "Quantidade de animais adotados e que posteriormente foram devolvidos ao abrigo no mês em questão.",
      },
    ],
  },
  {
    title: "Saídas",
    entries: [
      {
        term: "Adoções",
        definition:
          "Quantidade de animais adotados por novos tutores ao longo do mês e que saíram do abrigo/lar temporário.",
      },
      {
        term: "Eutanásias",
        definition:
          "Quantidade de mortes induzidas por médico veterinário para evitar sofrimento extremo e irreversível.",
      },
      {
        term: "Mortes Naturais",
        definition:
          "Número de mortes espontâneas por causas naturais ou enfermidades sem intervenção humana direta.",
      },
      {
        term: "Retorno ao Tutor",
        definition:
          "Quantidade de animais que foram retornados ao tutor (reencontros).",
      },
      {
        term: "Retorno ao Local de Origem",
        definition:
          "Quantidade de animais retornados ao local de origem/comunidade (ex: CED ou recuperação e retorno).",
      },
    ],
  },
  {
    title: "Glossário: Tipos de Abrigos",
    entries: [
      {
        term: "Abrigos Públicos",
        definition:
          "Estabelecimentos da Administração Pública (CCZ/UVZ/Canil e Gatil Público).",
      },
      {
        term: "Abrigos Privados",
        definition:
          "Entidades do terceiro setor (ONG/OSC/OSCIP/OS) sem finalidade lucrativa.",
      },
      {
        term: "Abrigos Mistos",
        definition:
          "Parcerias entre abrigos públicos e privados, sem finalidade lucrativa.",
      },
      {
        term: "Protetores Independentes",
        definition:
          "Pessoas físicas que resgatam, cuidam e destinam animais voluntariamente (lares temporários).",
      },
    ],
  },
];

export const MONTH_OPTIONS: SelectOption[] = [
  { value: "01", label: "Janeiro" },
  { value: "02", label: "Fevereiro" },
  { value: "03", label: "Março" },
  { value: "04", label: "Abril" },
  { value: "05", label: "Maio" },
  { value: "06", label: "Junho" },
  { value: "07", label: "Julho" },
  { value: "08", label: "Agosto" },
  { value: "09", label: "Setembro" },
  { value: "10", label: "Outubro" },
  { value: "11", label: "Novembro" },
  { value: "12", label: "Dezembro" },
];

export const YEAR_OPTIONS: SelectOption[] = [
  { value: "2025", label: "2025" },
  { value: "2024", label: "2024" },
  { value: "2023", label: "2023" },
];
