const Anthropic = require('@anthropic-ai/sdk')
const { corsHeaders, verifyToken } = require('./_middleware')

exports.handler = async (event) => {
  const headers = corsHeaders()
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers, body: '' }
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) }
  if (!verifyToken(event)) return { statusCode: 401, headers, body: JSON.stringify({ error: 'Não autorizado' }) }

  try {
    const { image_base64, media_type, post_text } = JSON.parse(event.body || '{}')
    if (!image_base64 || !media_type) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Imagem obrigatória' }) }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const message = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 512,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type, data: image_base64 } },
          { type: 'text', text: `Avalie esta imagem para o LinkedIn do Willian Pimentel, CRO da CULTSEC.\n\nPost: "${(post_text || '').slice(0, 200)}"\n\nDê: nota 1-10, pontos fortes, o que melhorar. Máx 4 linhas.` }
        ]
      }]
    })

    const text = message.content.find(b => b.type === 'text')?.text || 'Erro na análise.'
    return { statusCode: 200, headers, body: JSON.stringify({ feedback: text }) }
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Erro ao validar imagem: ' + err.message }) }
  }
}
