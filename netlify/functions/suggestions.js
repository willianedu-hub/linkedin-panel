const Anthropic = require('@anthropic-ai/sdk')
const { corsHeaders, verifyToken } = require('./_middleware')

const SYSTEM_PROMPT = `Você é o estrategista de LinkedIn do Willian Pimentel, CRO da CULTSEC.
PERFIL: CRO da CULTSEC (conscientização de cibersegurança), 20+ anos TI e vendas B2B, Engenharia da Computação UTFPR, CorpFlex→Claranet (M&A), UOL Diveo Head LATAM, 2 franquias Instituto Mix (2019-2025), 135% meta, R$40MM ARR aos 31 anos, times até 30 pessoas.
TOM: agradável, levemente sarcástico, humor inteligente, NUNCA religião.
PÚBLICO: CEOs, CROs, CMOs, Diretores Comerciais de médias/grandes empresas Brasil + LATAM.
PILARES: 🏆 CRO & Revenue | 🔐 Segurança como Negócio | 🧠 Carreira & Mentalidade | 🌎 LATAM | 🔥 Empreendedor que Executou`

exports.handler = async (event) => {
  const headers = corsHeaders()
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers, body: '' }
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) }
  if (!verifyToken(event)) return { statusCode: 401, headers, body: JSON.stringify({ error: 'Não autorizado' }) }

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const today = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

    const message = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: `Hoje é ${today}. Gere 3 sugestões de post para o Willian baseadas em tendências atuais de CRO, vendas B2B, cibersegurança e LATAM. Retorne SOMENTE JSON válido sem markdown:\n{"suggestions":[{"pillar":"🏆 CRO & Revenue","hook":"gancho de 1 linha","rationale":"por que agora em 1 linha","angle":"ângulo único do Willian","best_time":"Terça · 07h30"},{"pillar":"🔐 Segurança como Negócio","hook":"...","rationale":"...","angle":"...","best_time":"Quarta · 07h30"},{"pillar":"🧠 Carreira & Mentalidade","hook":"...","rationale":"...","angle":"...","best_time":"Sexta · 07h30"}]}`
      }]
    })

    const raw = message.content.find(b => b.type === 'text')?.text || ''
    const start = raw.indexOf('{'), end = raw.lastIndexOf('}')
    if (start === -1 || end === -1) throw new Error('JSON inválido')
    return { statusCode: 200, headers, body: raw.slice(start, end + 1) }
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Erro ao gerar sugestões: ' + err.message }) }
  }
}
