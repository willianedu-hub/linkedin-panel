const Anthropic = require('@anthropic-ai/sdk')
const { corsHeaders, verifyToken } = require('./_middleware')

exports.handler = async (event) => {
  const origin = event.headers.origin || ''
  const headers = corsHeaders(origin)

  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers, body: '' }
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) }

  const user = verifyToken(event)
  if (!user) return { statusCode: 401, headers, body: JSON.stringify({ error: 'Não autorizado' }) }

  try {
    const { post_full, post_short, hashtags, best_time, usa_imagem, image_tool, image_prompt, adjustment } = JSON.parse(event.body || '{}')
    if (!post_full || !adjustment) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Dados incompletos' }) }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const message = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 2048,
      system: `Você é o estrategista de LinkedIn do Willian Pimentel, CRO da CULTSEC.
Tom: agradável, levemente sarcástico, humor inteligente. NUNCA começar com "Eu". Parágrafos curtos.`,
      messages: [{
        role: 'user',
        content: `Post atual do Willian:\n"${post_full}"\n\nAjuste solicitado: ${adjustment}\n\nMantenha o tom e o ângulo. Aplique o ajuste.\n\nRetorne SOMENTE este JSON válido, sem markdown:\n{"post_full":"...","post_short":"...","hashtags":"${hashtags}","best_time":"${best_time}","usa_imagem":${usa_imagem},"image_tool":"${image_tool}","image_prompt":"${image_prompt}"}`
      }]
    })

    const raw = message.content.find(b => b.type === 'text')?.text || ''
    const start = raw.indexOf('{')
    const end = raw.lastIndexOf('}')
    if (start === -1 || end === -1) throw new Error('JSON inválido')
    const parsed = JSON.parse(raw.slice(start, end + 1))

    return { statusCode: 200, headers, body: JSON.stringify(parsed) }
  } catch (err) {
    console.error('adjust error:', err.message)
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Erro ao ajustar post' }) }
  }
}
