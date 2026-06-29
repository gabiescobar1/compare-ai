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
      'Na página inicial, insira o DOI (Digital Object Identifier) do artigo científico e selecione a Disciplina acadêmica correspondente. Você pode inserir múltiplos DOIs ao mesmo tempo, separando-os por vírgula.',
    tip: 'A disciplina escolhida será usada para identificar e destacar os Lexical Bundles específicos dessa área.',
  },
  {
    number: '02',
    icon: IconRobot,
    title: 'Selecione os modelos de IA',
    description:
      'Escolha de 1 a 6 modelos de inteligência artificial para gerar os resumos. Cada provedor (OpenAI, Anthropic, Google…) oferece opções com diferentes características de linguagem e custo.',
    tip: 'Compare modelos de provedores diferentes para obter perspectivas variadas sobre o mesmo artigo.',
  },
  {
    number: '03',
    icon: IconPlayerPlay,
    title: 'Clique em Proceder com Análise',
    description:
      'Após selecionar os modelos e a disciplina, clique em "Proceder com Análise". A plataforma buscará o artigo, extrairá o abstract original e o enviará para todos os modelos selecionados simultaneamente.',
    tip: 'O processamento agora é feito em paralelo, garantindo resultados rápidos mesmo ao selecionar vários modelos.',
  },
  {
    number: '04',
    icon: IconLayoutColumns,
    title: 'Compare os resultados',
    description:
      'Visualize os resumos gerados lado a lado. Caso você tenha cadastrado Lexical Bundles na página "Analytics", as expressões correspondentes à disciplina serão destacadas em amarelo automaticamente no texto.',
    tip: 'Você pode baixar cada resumo individualmente em formato .txt ou todos os resumos de um artigo em um arquivo .zip.',
  },
  {
    number: '05',
    icon: IconHistory,
    title: 'Histórico e Analytics',
    description:
      'Cada análise é salva automaticamente. Na página "Histórico" você pode revisitar e baixar análises passadas. Na página "Analytics", você acessa estatísticas detalhadas de uso e exporta planilhas com a frequência dos Lexical Bundles.',
    tip: 'Acompanhe na página Analytics quais modelos tendem a ser mais concisos e quais bundles são mais gerados pelas IAs.',
  },
];

const faqs = [
  {
    question: 'O que são Lexical Bundles e como utilizá-los?',
    answer:
      'Lexical Bundles são sequências de palavras que ocorrem frequentemente em textos de uma disciplina específica (ex: "no presente estudo"). Na página "Analytics", você pode fazer o upload de uma planilha Excel (.xlsx) contendo essas expressões, e a plataforma passará a destacá-las nos resumos gerados, além de contabilizar sua frequência.',
  },
  {
    question: 'Preciso criar uma conta para usar o Compare AI?',
    answer:
      'Não. O Compare AI funciona sem cadastro: seus Lexical Bundles, histórico e configurações ficam salvos localmente no seu navegador.',
  },
  {
    question: 'O que é um DOI e onde encontro o do meu artigo?',
    answer:
      'DOI (Digital Object Identifier) é um identificador permanente para documentos digitais. Você o encontra na página do artigo nas bases PubMed, PLOS ONE, Scopus, etc. Geralmente no formato "10.XXXX/XXXXX".',
  },
  {
    question: 'Qual a diferença entre os modelos de IA disponíveis?',
    answer:
      'Cada modelo foi treinado com abordagens diferentes. Modelos da OpenAI (GPT), Anthropic (Claude) e Google (Gemini) possuem estilos de escrita, custos e capacidades analíticas distintas.',
  },
  {
    question: 'Quanto custa usar a plataforma?',
    answer:
      'O Compare AI é gratuito. Os custos exibidos nos resultados são apenas estimativas do valor que seria gasto nas APIs oficiais dos modelos de IA, calculado por quantidade de tokens.',
  },
];

export default function InstrucoesPage() {
  return (
    <div className="min-h-screen pt-28 pb-24 px-6">
      {/* Hero */}
      <header className="max-w-7xl mx-auto text-center mb-20">
        <div className="inline-flex items-center gap-2 bg-accent/10 text-accent text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full mb-6">
          <IconSparkles className="w-3.5 h-3.5" />
          Guia de uso
        </div>
        <h1 className="text-4xl md:text-5xl font-serif font-black text-ink dark:text-parchment leading-tight mb-4">
          Como usar o Compare AI
        </h1>
        <p className="text-lg text-ink/80 dark:text-[#b0a090] leading-relaxed">
          Analise artigos científicos com múltiplos modelos de inteligência artificial em poucos
          passos. Veja como é simples comparar perspectivas de diferentes IAs sobre o mesmo&nbsp;texto.
        </p>
      </header>

      {/* Steps */}
      <section className="max-w-7xl mx-auto mb-24">
        <div className="relative">
          {/* Vertical connector line */}
          <div className="absolute left-[2.85rem] top-12 bottom-12 w-px bg-gradient-to-b from-accent/40 via-accent/20 to-transparent hidden md:block" />

          <div className="space-y-6">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={idx}
                  className="relative bg-cream/80 dark:bg-paper-dark/90 backdrop-blur-sm rounded-2xl border border-ink/15 dark:border-white/8 shadow-sm p-6 md:p-8 flex gap-6 items-start hover:shadow-md transition-shadow"
                >
                  {/* Number + Icon */}
                  <div className="flex-shrink-0 flex flex-col items-center gap-1">
                    <span className="text-[10px] font-black text-accent tracking-widest">
                      {step.number}
                    </span>
                    <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center">
                      <Icon className="w-7 h-7 text-accent" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-serif font-black text-ink dark:text-parchment mb-2">
                      {step.title}
                    </h2>
                    <p className="text-sm text-ink/80 dark:text-[#b0a090] leading-relaxed mb-3">
                      {step.description}
                    </p>
                    {step.tip && (
                      <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-900/15 border border-amber-200 dark:border-amber-700/30 rounded-xl px-3 py-2">
                        <IconBulb className="w-4 h-4 text-amber-500 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">{step.tip}</p>
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
      <section className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-serif font-black text-ink dark:text-parchment">Dúvidas comuns</h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <details
              key={idx}
              className="group bg-cream/80 dark:bg-paper-dark/90 backdrop-blur-sm border border-ink/15 dark:border-white/8 rounded-2xl overflow-hidden shadow-sm"
            >
              <summary className="flex items-center justify-between gap-4 px-6 py-4 cursor-pointer list-none font-semibold text-ink dark:text-parchment text-sm hover:bg-ink/5 dark:hover:bg-white/3 transition-colors select-none">
                <span>{faq.question}</span>
                <IconChevronDown className="w-4 h-4 text-ink/40 dark:text-[#9a8070] flex-shrink-0 transition-transform group-open:rotate-180" />
              </summary>
              <div className="px-6 pb-5 text-sm text-ink/80 dark:text-[#b0a090] leading-relaxed border-t border-ink/10 dark:border-white/5 pt-4">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
