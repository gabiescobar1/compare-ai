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
  IconSettings,
  IconLock,
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
      'Visualize os resumos gerados lado a lado. Caso você tenha cadastrado Lexical Bundles na página "Minha Conta", as expressões correspondentes à disciplina serão destacadas em amarelo automaticamente no texto.',
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
      'Lexical Bundles são sequências de palavras que ocorrem frequentemente em textos de uma disciplina específica (ex: "no presente estudo"). Na página "Minha Conta", você pode fazer o upload de uma planilha Excel (.xlsx) contendo essas expressões, e a plataforma passará a destacá-las nos resumos gerados, além de contabilizar sua frequência no Analytics.',
  },
  {
    question: 'Preciso criar uma conta para usar o Compare AI?',
    answer:
      'Atualmente não é necessário criar uma conta. A plataforma salva seus Lexical Bundles, histórico e configurações no seu navegador localmente. Em breve, um sistema de nuvem permitirá sincronizar seus dados.',
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
        <div className="inline-flex items-center gap-2 bg-[#ff6b00]/10 text-[#ff6b00] text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full mb-6">
          <IconSparkles className="w-3.5 h-3.5" />
          Guia de uso
        </div>
        <h1 className="text-4xl md:text-5xl font-serif font-black text-[#1C1008] dark:text-[#f0e4d4] leading-tight mb-4">
          Como usar o Compare AI
        </h1>
        <p className="text-lg text-[#1C1008]/80 dark:text-[#b0a090] leading-relaxed">
          Analise artigos científicos com múltiplos modelos de inteligência artificial em poucos
          passos. Veja como é simples comparar perspectivas de diferentes IAs sobre o mesmo&nbsp;texto.
        </p>
      </header>

      {/* Aviso de API Keys — Em breve */}
      <div className="max-w-7xl mx-auto mb-12">
        <div className="bg-[#1C1008] dark:bg-[#1a0e08] text-white rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 shadow-xl border border-transparent dark:border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <IconSettings className="w-24 h-24 -mr-8 -mt-8" />
          </div>
          <div className="w-14 h-14 rounded-2xl bg-[#ff6b00] flex items-center justify-center flex-shrink-0 shadow-lg">
            <IconLock className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1 text-center md:text-left relative z-10">
            <h3 className="text-xl font-serif font-black mb-2 flex items-center justify-center md:justify-start gap-2">
              Passo 0: Configurar suas Chaves de API
              <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-[#ff6b00] px-2 py-0.5 rounded text-white ml-2">Em breve</span>
            </h3>
            <p className="text-sm text-white/70 leading-relaxed max-w-2xl">
              O primeiro passo real será inserir suas próprias chaves de API (OpenAI, Anthropic, Google) nas configurações da sua conta. 
              Esta funcionalidade ainda está em desenvolvimento, mas em breve permitirá que você utilize seus próprios créditos e tenha total controle sobre suas análises.
            </p>
          </div>
        </div>
      </div>

      {/* Steps */}
      <section className="max-w-7xl mx-auto mb-24">
        <div className="relative">
          {/* Vertical connector line */}
          <div className="absolute left-[2.85rem] top-12 bottom-12 w-px bg-gradient-to-b from-[#ff6b00]/40 via-[#ff6b00]/20 to-transparent hidden md:block" />

          <div className="space-y-6">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={idx}
                  className="relative bg-white/80 dark:bg-[#211307]/90 backdrop-blur-sm rounded-2xl border border-[#1C1008]/15 dark:border-white/8 shadow-sm p-6 md:p-8 flex gap-6 items-start hover:shadow-md transition-shadow"
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
                    <h2 className="text-lg font-serif font-black text-[#1C1008] dark:text-[#f0e4d4] mb-2">
                      {step.title}
                    </h2>
                    <p className="text-sm text-[#1C1008]/80 dark:text-[#b0a090] leading-relaxed mb-3">
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
          <h2 className="text-2xl font-serif font-black text-[#1C1008] dark:text-[#f0e4d4]">Dúvidas comuns</h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <details
              key={idx}
              className="group bg-white/80 dark:bg-[#211307]/90 backdrop-blur-sm border border-[#1C1008]/15 dark:border-white/8 rounded-2xl overflow-hidden shadow-sm"
            >
              <summary className="flex items-center justify-between gap-4 px-6 py-4 cursor-pointer list-none font-semibold text-[#1C1008] dark:text-[#f0e4d4] text-sm hover:bg-[#1C1008]/5 dark:hover:bg-white/3 transition-colors select-none">
                <span>{faq.question}</span>
                <IconChevronDown className="w-4 h-4 text-[#1C1008]/40 dark:text-[#9a8070] flex-shrink-0 transition-transform group-open:rotate-180" />
              </summary>
              <div className="px-6 pb-5 text-sm text-[#1C1008]/80 dark:text-[#b0a090] leading-relaxed border-t border-[#1C1008]/10 dark:border-white/5 pt-4">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
