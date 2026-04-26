import {
  IconSearch,
  IconRobot,
  IconPlayerPlay,
  IconLayoutColumns,
  IconHistory,
  IconChevronDown,
  IconBulb,
  IconAlertCircle,
  IconSparkles,
} from '@tabler/icons-react';

export const metadata = {
  title: 'Como Usar — Compare AI',
  description:
    'Aprenda passo a passo como utilizar o Compare AI para analisar artigos científicos com múltiplos modelos de inteligência artificial.',
};

const steps = [
  {
    number: '01',
    icon: IconSearch,
    title: 'Cole o DOI do artigo',
    description:
      'Na página inicial, localize o campo de busca e insira o DOI (Digital Object Identifier) do artigo científico que deseja analisar. O DOI é um identificador único no formato 10.XXXX/XXXXX.',
    tip: 'Você encontra o DOI na página do artigo ou nas bases de dados como PubMed, PLOS ONE e Scopus.',
  },
  {
    number: '02',
    icon: IconRobot,
    title: 'Selecione os modelos de IA',
    description:
      'Escolha de 1 a 6 modelos de inteligência artificial para gerar os resumos. Cada provedor (OpenAI, Anthropic, Google…) oferece modelos com características distintas de linguagem e custo.',
    tip: 'Compare modelos de provedores diferentes para obter perspectivas variadas sobre o mesmo artigo.',
  },
  {
    number: '03',
    icon: IconPlayerPlay,
    title: 'Clique em Analisar',
    description:
      'Após selecionar os modelos, clique no botão "Analisar". A plataforma irá buscar o artigo pelo DOI, extrair o abstract original e enviá-lo para cada modelo selecionado simultaneamente.',
    tip: 'O tempo de resposta varia conforme o número de modelos e a disponibilidade das APIs. Em média leva entre 10 e 30 segundos.',
  },
  {
    number: '04',
    icon: IconLayoutColumns,
    title: 'Compare os resultados',
    description:
      'Visualize os resumos gerados lado a lado. Cada card exibe o texto do modelo, a quantidade de tokens consumidos e o custo estimado da requisição. Você pode fazer o download do resumo em formato de texto.',
    tip: 'Preste atenção à profundidade, ao vocabulário e ao foco de cada modelo — eles podem destacar aspectos diferentes do mesmo artigo.',
  },
  {
    number: '05',
    icon: IconHistory,
    title: 'Acesse o Histórico',
    description:
      'Cada análise realizada é salva automaticamente. Na página "Histórico" você pode revisitar análises anteriores, filtrar por DOI, disciplina ou data, e fazer o download dos resumos.',
    tip: 'Use o campo de busca por DOI no Histórico para encontrar rapidamente uma análise específica.',
  },
];

const faqs = [
  {
    question: 'Preciso criar uma conta para usar o Compare AI?',
    answer:
      'Atualmente não é necessário criar uma conta. A plataforma está disponível para uso direto. Em breve, um sistema de login permitirá salvar análises vinculadas ao seu perfil.',
  },
  {
    question: 'O que é um DOI e onde encontro o do meu artigo?',
    answer:
      'DOI (Digital Object Identifier) é um identificador permanente para documentos digitais. Você o encontra na página do artigo nas bases PubMed, PLOS ONE, Scopus, Web of Science e outras. Geralmente aparece no início do artigo, no formato "https://doi.org/10.XXXX/XXXXX" ou simplesmente "10.XXXX/XXXXX".',
  },
  {
    question: 'Qual a diferença entre os modelos de IA disponíveis?',
    answer:
      'Cada modelo foi treinado com abordagens e dados diferentes. Modelos da OpenAI (GPT-4o), Anthropic (Claude) e Google (Gemini) possuem estilos de escrita, custos por token e capacidades analíticas distintas. Comparar múltiplos modelos ajuda a identificar nuances e convergências na interpretação do texto científico.',
  },
  {
    question: 'Quanto custa usar a plataforma?',
    answer:
      'O Compare AI por si só é gratuito. Os custos exibidos nos resultados referem-se ao consumo das APIs dos modelos de IA, calculado por milhão de tokens. Os valores são estimativas baseadas nas tabelas públicas de preço de cada provedor.',
  },
  {
    question: 'Minha análise ficou salva? Por quanto tempo?',
    answer:
      'Sim, todas as análises são salvas no banco de dados da plataforma e podem ser acessadas na página "Histórico" a qualquer momento, sem prazo de expiração definido.',
  },
];

export default function InstrucoesPage() {
  return (
    <div className="min-h-screen pt-28 pb-24 px-6">
      {/* Hero */}
      <header className="max-w-3xl mx-auto text-center mb-20">
        <div className="inline-flex items-center gap-2 bg-[#ff6b00]/10 text-[#ff6b00] text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full mb-6">
          <IconSparkles className="w-3.5 h-3.5" />
          Guia de uso
        </div>
        <h1 className="text-4xl md:text-5xl font-serif font-black text-[#291f1b] leading-tight mb-4">
          Como usar o Compare AI
        </h1>
        <p className="text-lg text-slate-600 leading-relaxed">
          Analise artigos científicos com múltiplos modelos de inteligência artificial em poucos
          passos. Veja como é simples comparar perspectivas de diferentes IAs sobre o mesmo texto.
        </p>
      </header>

      {/* Steps */}
      <section className="max-w-4xl mx-auto mb-24">
        <div className="relative">
          {/* Vertical connector line */}
          <div className="absolute left-[2.85rem] top-12 bottom-12 w-px bg-gradient-to-b from-[#ff6b00]/40 via-[#ff6b00]/20 to-transparent hidden md:block" />

          <div className="space-y-6">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={idx}
                  className="relative bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8 flex gap-6 items-start hover:shadow-md transition-shadow"
                >
                  {/* Number + Icon */}
                  <div className="flex-shrink-0 flex flex-col items-center gap-1">
                    <span className="text-[10px] font-black text-[#ff6b00] tracking-widest">
                      {step.number}
                    </span>
                    <div className="w-14 h-14 rounded-2xl bg-[#ff6b00]/10 flex items-center justify-center">
                      <Icon className="w-7 h-7 text-[#ff6b00]" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-serif font-black text-[#291f1b] mb-2">
                      {step.title}
                    </h2>
                    <p className="text-sm text-slate-600 leading-relaxed mb-3">
                      {step.description}
                    </p>
                    {step.tip && (
                      <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                        <IconBulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-700 leading-relaxed">{step.tip}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-500 text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full mb-4">
            <IconAlertCircle className="w-3.5 h-3.5" />
            Perguntas frequentes
          </div>
          <h2 className="text-2xl font-serif font-black text-[#291f1b]">Dúvidas comuns</h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <details
              key={idx}
              className="group bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl overflow-hidden shadow-sm"
            >
              <summary className="flex items-center justify-between gap-4 px-6 py-4 cursor-pointer list-none font-semibold text-[#291f1b] text-sm hover:bg-slate-50 transition-colors select-none">
                <span>{faq.question}</span>
                <IconChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0 transition-transform group-open:rotate-180" />
              </summary>
              <div className="px-6 pb-5 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
