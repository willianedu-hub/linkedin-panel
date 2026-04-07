const Anthropic = require('@anthropic-ai/sdk')
const { corsHeaders, verifyToken } = require('./_middleware')

exports.handler = async (event) => {
  const headers = corsHeaders()
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers, body: '' }
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) }
  if (!verifyToken(event)) return { statusCode: 401, headers, body: JSON.stringify({ error: 'Não autorizado' }) }

  try {
    const { comment, post_hook } = JSON.parse(event.body || '{}')
    if (!comment) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Comentário obrigatório' }) }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const message = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `Você é o estrategista de LinkedIn do Willian Pimentel, CRO da CULTSEC. Tom: agradável, levemente sarcástico, humor inteligente.\n\nComentário recebido: "${comment}"\nContexto: ${post_hook || 'post do Willian'}\n\nRetorne SOMENTE JSON válido sem markdown:\n{"replies":[{"tone":"Expansiva","text":"..."},{"tone":"Direta e elegante","text":"..."},{"tone":"Com humor inteligente","text":"..."}]}`
      }]
    })

    const raw = message.content.find(b => b.type === 'text')?.text || ''
    const start = raw.indexOf('{'), end = raw.lastIndexOf('}')
    if (start === -1 || end === -1) throw new Error('JSON inválido')
    return { statusCode: 200, headers, body: raw.slice(start, end + 1) }
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Erro ao gerar respostas: ' + err.message }) }
  }
}
