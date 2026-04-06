export const POST_RETORNO = {
  id: "retorno",
  pillar: "🧠 Carreira & Mentalidade",
  hook: "Fiquei 6 anos fora do LinkedIn. Não foi burnout. Foi escolha.",
  best_time: "Terça · 07h30–08h30",
  usa_imagem: false,
  image_tool: "",
  image_prompt: "",
  post_full: `Fiquei 6 anos fora do LinkedIn.

Não foi burnout. Não foi crise.
Foi uma escolha que me orgulho.

Depois de construir muito rápido em São Paulo —
times, receita, resultados que poucos constroem
antes dos 35 — decidi que estava na hora de
viver o que eu havia conquistado.

Voltei para o Paraná. Perto dos meus pais,
ainda saudáveis, ainda presentes.
Essa decisão, até hoje, é uma das melhores
que já tomei.

Empreendi. Abri um negócio 40 dias antes
do lockdown de 2020.

Não fechei.

Aprendi coisas que 20 anos de corporativo
não me ensinariam. Sobre gestão, sobre pessoas,
sobre risco real — aquele em que o dinheiro
é o seu, não do acionista.

Hoje volto diferente.

Com mais clareza sobre o que tenho a dizer
e para quem quero dizer.

Vou falar sobre o que conheço de verdade:

→ Como se constrói uma máquina de receita em vendas complexas B2B
→ O que separa times mediocres de times que batem meta todo mês
→ Por que o maior risco ao crescimento de qualquer empresa tem rosto, nome e acesso ao e-mail corporativo
→ O que um CRO precisa saber que nenhum curso vai te ensinar

Se você lidera receita, times ou crescimento — e leva isso a sério — acho que temos muito a trocar.

Bom voltar. 🤝`,
  post_short: `Fiquei 6 anos fora do LinkedIn.

Não foi burnout. Foi escolha.

Voltei para o Paraná. Perto dos meus pais ainda saudáveis. Empreendi. Arrisquei. Aprendi.

Hoje volto com mais clareza sobre o que tenho a dizer — e para quem.

Se você lidera receita ou times comerciais, acho que temos muito a trocar.

Bom voltar. 🤝`,
  hashtags: "#CRO #EstrategiaComercial #VendasB2B #Liderança #Segurança #CulturaDeSegurança #MáquinaDeReceita #LATAM #Tecnologia",
};

export const CHECKLIST = {
  Segunda: [
    { time: "07h30", task: "Postar conteúdo semanal #1", type: "post", priority: "alta" },
    { time: "08h00", task: "Responder comentários — primeiras 2h são críticas para o algoritmo", type: "engage", priority: "alta" },
    { time: "12h00", task: "Comentar em 3 posts de ICPs prioritários", type: "engage", priority: "média" },
    { time: "18h00", task: "Enviar 3 convites de conexão com mensagem personalizada", type: "network", priority: "média" },
  ],
  Terça: [
    { time: "08h00", task: "Responder comentários do post de segunda", type: "engage", priority: "alta" },
    { time: "12h00", task: "Comentar em 3 posts de ICPs prioritários", type: "engage", priority: "média" },
    { time: "18h00", task: "Ver quem visitou seu perfil e conectar com os relevantes", type: "network", priority: "baixa" },
  ],
  Quarta: [
    { time: "07h30", task: "Postar conteúdo semanal #2", type: "post", priority: "alta" },
    { time: "08h00", task: "Responder comentários — primeiras 2h são críticas para o algoritmo", type: "engage", priority: "alta" },
    { time: "12h00", task: "Comentar em 3 posts de ICPs prioritários", type: "engage", priority: "média" },
    { time: "18h00", task: "Enviar 3 convites de conexão com mensagem personalizada", type: "network", priority: "média" },
  ],
  Quinta: [
    { time: "08h00", task: "Responder comentários do post de quarta", type: "engage", priority: "alta" },
    { time: "12h00", task: "Comentar em 3 posts de ICPs prioritários", type: "engage", priority: "média" },
    { time: "17h00", task: "Abrir o painel e escolher sugestão de post para sexta", type: "post", priority: "média" },
  ],
  Sexta: [
    { time: "07h30", task: "Postar conteúdo semanal #3", type: "post", priority: "alta" },
    { time: "08h00", task: "Responder comentários — primeiras 2h são críticas para o algoritmo", type: "engage", priority: "alta" },
    { time: "12h00", task: "Comentar em 2 posts de ICPs prioritários", type: "engage", priority: "média" },
    { time: "17h00", task: "Registrar métricas da semana no painel", type: "analytics", priority: "baixa" },
  ],
};

export const BEST_TIMES = [
  { day: "Terça",   time: "07h30–08h30", score: 98 },
  { day: "Quarta",  time: "07h30–08h30", score: 95 },
  { day: "Segunda", time: "08h00–09h00", score: 88 },
  { day: "Quinta",  time: "12h00–13h00", score: 82 },
  { day: "Sexta",   time: "07h30–08h30", score: 75 },
];

export const ICPS = [
  { name: "Thiago Gabri",      role: "CRO · RD Station",            why: "Referência em RevOps e vendas B2B SaaS",                        action: "comentar", url: "https://www.linkedin.com/in/thiagogabri/",       region: "BR" },
  { name: "Camila Farani",     role: "CEO · G2 Capital",             why: "Investidora ativa, posts sobre liderança e crescimento",        action: "comentar", url: "https://www.linkedin.com/in/camilafarani/",      region: "BR" },
  { name: "Marcelo Lombardo",  role: "CEO · Omie",                   why: "CEO de scale-up, fala de gestão e tecnologia",                 action: "seguir",   url: "https://www.linkedin.com/in/marcelolombardo/",   region: "BR" },
  { name: "Christian Barbosa", role: "CEO · Trilogiq",               why: "Autoridade em produtividade, grande alcance no LinkedIn BR",   action: "comentar", url: "https://www.linkedin.com/in/christianbarbosa/",  region: "BR" },
  { name: "Ana Paula Assis",   role: "GM · IBM Brasil",              why: "Executiva de TI de alto nível, posts estratégicos",            action: "conectar", url: "https://www.linkedin.com/in/anapaulaassis/",     region: "BR" },
  { name: "Gustavo Caetano",   role: "CEO · Samba Tech",             why: "Empreendedor de tech, posts sobre vendas B2B e escala",        action: "comentar", url: "https://www.linkedin.com/in/gustavocaetano/",    region: "BR" },
  { name: "Lázaro Ibanez",     role: "VP Sales LATAM · Salesforce",  why: "Liderança comercial LATAM, posta RevOps em espanhol",          action: "seguir",   url: "https://www.linkedin.com/in/lazaro-ibanez/",     region: "LATAM" },
  { name: "Diego Mingorance",  role: "CRO · Bind LATAM",             why: "CRO ativo no LATAM, posta sobre revenue em espanhol",          action: "conectar", url: "https://www.linkedin.com/in/diegomingorance/",   region: "LATAM" },
];
