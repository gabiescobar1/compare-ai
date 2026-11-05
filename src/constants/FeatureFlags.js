// ============================================================
// INTERRUPTORES DO SITE
// ============================================================
// O site é público e não tem login: qualquer visitante abre o Histórico e os
// N-gramas. Tudo o que gasta dinheiro ou mexe nos dados fica atrás dos
// interruptores abaixo, que só se abrem editando este arquivo.
// ============================================================


// MODO AUTORA — gerar abstracts e excluir registros.
//
// `false` (normal): o site é só leitura. Ninguém gera abstracts (o que
// gastaria as chaves pagas da OpenAI / Anthropic / Gemini) e ninguém exclui
// análises do histórico — nem um visitante, nem você.
//
// `true`: libera o formulário de geração, o botão "Regenerar" de cada modelo,
// o "Atualizar preços" e as lixeiras do histórico.
//
// ATENÇÃO: ligar isto no site publicado libera para QUALQUER visitante,
// porque não existe login para distinguir você dos outros. O certo é ligar
// apenas aqui na sua máquina (`npm run dev`), gerar o que precisa, e desligar
// de novo antes de publicar.
export const OWNER_MODE = false;


// PÁGINA DE ANALYTICS — ainda em construção.
//
// `false`: a página mostra um aviso de "em construção". O código e os gráficos
// continuam todos no projeto, intactos.
// `true`: publica a página normalmente.
export const ANALYTICS_PUBLISHED = false;
