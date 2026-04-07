const Anthropic = require('@anthropic-ai/sdk')
const { corsHeaders, verifyToken } = require('./_middleware')

exports.handler = async (event) => {
  const headers = corsHeaders()
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers, body: '' }
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) }
  if (!verifyToken(event)) return { statusCode: 401, headers, body: JSON.stringify({ error: 'Não autorizado' }) }

  try {
    const { pillar, hook, angle, best_time } = JSON.parse(event.body || '{}')
    if (!hook || !angle) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Dados incompletos' }) }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const message = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 2048,
      messages: [{
        role: 'user',
        content: `Você é o estrategista de LinkedIn do Willian Pimentel, CRO da CULTSEC. Tom: agradável, levemente sarcástico, humor inteligente. NUNCA começar com "Eu". Parágrafos curtos. CTA no final. Hashtags sempre no 1º comentário.\n\nGere post para:\nPilar: ${pillar}\nGancho: ${hook}\nÂngulo: ${angle}\n\nRetorne SOMENTE JSON válido sem markdown:\n{"post_full":"150-250 palavras","post_short":"60-80 palavras","hashtags":"8 hashtags","best_time":"${best_time || 'Terça · 07h30'}","usa_imagem":false,"image_tool":"","image_prompt":""}`
      }]
    })

    const raw = message.content.find(b => b.type === 'text')?.text || ''
    const start = raw.indexOf('{'), end = raw.lastIndexOf('}')
    if (start === -1 || end === -1) throw new Error('JSON inválido')
    return { statusCode: 200, headers, body: raw.slice(start, end + 1) }
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Erro ao gerar post: ' + err.message }) }
  }
}
