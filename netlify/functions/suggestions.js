const Anthropic = require('@anthropic-ai/sdk')
const { corsHeaders, verifyToken } = require('./_middleware')

const SYSTEM_PROMPT = `Você é o estrategista de LinkedIn do Willian Pimentel, CRO da CULTSEC.

PERFIL:
- CRO da CULTSEC (conscientização de cibersegurança, pioneira no Brasil)
- 20+ anos em TI e vendas B2B complexas | Engenharia da Computação - UTFPR
- Histórico: CorpFlex → Claranet (M&A Bradesco→Claranet UK) → UOL Diveo Head LATAM
- Empreendedor: 2 franquias Instituto Mix (2019-2025), inaugurou 40 dias antes do lockdown de 2020
- Resultados: 135% meta, R$40MM ARR aos 31 anos, times de até 30 pessoas, 3.000+ colaboradores aos 35
- M&A: participou ativamente, domina DRE, EBITDA, governança
- Idiomas: português, inglês e espanhol fluentes
- Tom: agradável, levemente sarcástico, humor inteligente e natural, nunca forçado
- NUNCA religião. Ética cristã como bússola moral implícita.

PÚBLICO-ALVO: CEOs, CROs, CMOs, Diretores e Gerentes Comerciais de médias/grandes empresas Brasil + LATAM

PILARES:
1. 🏆 CRO & Revenue — máquina de receita, estratégia comercial, liderança
2. 🔐 Segurança como Negócio — conscientização plugada a risco de receita
3. 🧠 Carreira & Mentalidade — trajetória real, conquistas, aprendizados
4. 🌎 LATAM — posts em espanhol, mercado regional
5. 🔥 Empreendedor que Executou — gestão com risco próprio, decisões difíceis

REGRAS DE POST:
- Gancho forte na 1ª linha, NUNCA começar com "Eu"
- Parágrafos curtos (máx 2 linhas)
- Sem jargão vazio
- CTA claro no final
- Hashtags SEMPRE no 1º comentário, nunca no corpo
- PT-BR exceto posts LATAM (espanhol)`

exports.handler = async (event) => {
  const origin = event.headers.origin || ''
  const headers = corsHeaders(origin)

  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers, body: '' }
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) }

  const user = verifyToken(event)
  if (!user) return { statusCode: 401, headers, body: JSON.stringify({ error: 'Não autorizado' }) }

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const today = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

    const message = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: `Hoje é ${today}.

Gere 3 sugestões de post para o Willian baseadas em tendências atuais de CRO, vendas B2B, cibersegurança e LATAM.

Retorne SOMENTE este JSON válido, sem markdown, sem texto extra:
{
  "suggestions": [
    {
      "pillar": "🏆 CRO & Revenue",
      "hook": "gancho impactante de 1 linha",
      "rationale": "por que este tema agora — 1 linha",
      "angle": "ângulo único que só o Willian pode defender",
      "best_time": "Terça · 07h30"
    },
    {
      "pillar": "🔐 Segurança como Negócio",
      "hook": "...",
      "rationale": "...",
      "angle": "...",
      "best_time": "Quarta · 07h30"
    },
    {
      "pillar": "🧠 Carreira & Mentalidade",
      "hook": "...",
      "rationale": "...",
      "angle": "...",
      "best_time": "Sexta · 07h30"
    }
  ]
}`
      }]
    })

    const raw = message.content.find(b => b.type === 'text')?.text || ''
    const start = raw.indexOf('{')
    const end = raw.lastIndexOf('}')
    if (start === -1 || end === -1) throw new Error('JSON inválido na resposta')
    const parsed = JSON.parse(raw.slice(start, end + 1))

    return { statusCode: 200, headers, body: JSON.stringify(parsed) }
  } catch (err) {
    console.error('suggestions error:', err.message)
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Erro ao gerar sugestões' }) }
  }
}
