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
    const { comment, post_hook } = JSON.parse(event.body || '{}')
    if (!comment) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Comentário obrigatório' }) }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const message = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 1024,
      system: `Você é o estrategista de LinkedIn do Willian Pimentel, CRO da CULTSEC.
Tom: agradável, levemente sarcástico, humor inteligente e natural. Respostas autênticas, nunca corporativas.`,
      messages: [{
        role: 'user',
        content: `Comentário recebido no LinkedIn do Willian:\n"${comment}"\n\nContexto do post: ${post_hook || 'post do Willian Pimentel, CRO da CULTSEC'}\n\nGere 3 opções de resposta:\n1. Expansiva — aprofunda o tema\n2. Direta e elegante — curta e impactante\n3. Com humor inteligente — sarcasmo sutil\n\nRetorne SOMENTE este JSON válido, sem markdown:\n{"replies":[{"tone":"Expansiva","text":"..."},{"tone":"Direta e elegante","text":"..."},{"tone":"Com humor inteligente","text":"..."}]}`
      }]
    })

    const raw = message.content.find(b => b.type === 'text')?.text || ''
    const start = raw.indexOf('{')
    const end = raw.lastIndexOf('}')
    if (start === -1 || end === -1) throw new Error('JSON inválido')
    const parsed = JSON.parse(raw.slice(start, end + 1))

    return { statusCode: 200, headers, body: JSON.stringify(parsed) }
  } catch (err) {
    console.error('replies error:', err.message)
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Erro ao gerar respostas' }) }
  }
}
