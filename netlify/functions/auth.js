const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const ALLOWED_ORIGINS = ['https://seu-site.netlify.app', 'http://localhost:3000']

function corsHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  }
}

exports.handler = async (event) => {
  const origin = event.headers.origin || ''
  const headers = corsHeaders(origin)

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' }
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  try {
    const { password } = JSON.parse(event.body || '{}')

    if (!password) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Senha obrigatória' }) }
    }

    const hash = process.env.PANEL_PASSWORD_HASH
    const secret = process.env.JWT_SECRET

    if (!hash || !secret) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Configuração incompleta no servidor' }) }
    }

    const valid = await bcrypt.compare(password, hash)

    if (!valid) {
      // Delay para dificultar brute force
      await new Promise(r => setTimeout(r, 1000))
      return { statusCode: 401, headers, body: JSON.stringify({ error: 'Senha incorreta' }) }
    }

    const token = jwt.sign(
      { user: 'willian', iat: Math.floor(Date.now() / 1000) },
      secret,
      { expiresIn: '12h' }
    )

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ token })
    }
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Erro interno' }) }
  }
}
