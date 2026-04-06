const Anthropic = require('@anthropic-ai/sdk')
const { corsHeaders, verifyToken } = require('./_middleware')

const SYSTEM_PROMPT = `Você é o estrategista de LinkedIn do Willian Pimentel, CRO da CULTSEC.
Tom: agradável, levemente sarcástico, humor inteligente e natural, nunca forçado.
NUNCA religião. Ética cristã como bússola moral implícita.
NUNCA começar post com "Eu". Parágrafos curtos. CTA claro no final.
Hashtags SEMPRE no 1º comentário, nunca no corpo do post.`

exports.handler = async (event) => {
  const origin = event.headers.origin || ''
  const headers = corsHeaders(origin)

  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers, body: '' }
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) }

  const user = verifyToken(event)
  if (!user) return { statusCode: 401, headers, body: JSON.stringify({ error: 'Não autorizado' }) }

  try {
    const { pillar, hook, angle, best_time } = JSON.parse(event.body || '{}')
    if (!hook || !angle) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Dados incompletos' }) }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const message = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: `Gere um post completo para o LinkedIn do Willian:

Pilar: ${pillar}
Gancho: ${hook}
Ângulo: ${angle}
Horário ideal: ${best_time}

Retorne SOMENTE este JSON válido, sem markdown, sem texto extra:
{
  "post_full": "post completo 150-250 palavras, parágrafos curtos, gancho forte, CTA no final",
  "post_short": "versão curta 60-80 palavras",
  "hashtags": "8 hashtags para o 1º comentário",
  "best_time": "${best_time}",
  "usa_imagem": false,
  "image_tool": "",
  "image_prompt": ""
}`
      }]
    })

    const raw = message.content.find(b => b.type === 'text')?.text || ''
    const start = raw.indexOf('{')
    const end = raw.lastIndexOf('}')
    if (start === -1 || end === -1) throw new Error('JSON inválido')
    const parsed = JSON.parse(raw.slice(start, end + 1))

    return { statusCode: 200, headers, body: JSON.stringify(parsed) }
  } catch (err) {
    console.error('generate error:', err.message)
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Erro ao gerar post' }) }
  }
}
