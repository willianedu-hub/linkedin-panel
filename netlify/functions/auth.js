const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  }

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

    const panelPassword = process.env.PANEL_PASSWORD
    const jwtSecret = process.env.JWT_SECRET

    if (!panelPassword || !jwtSecret) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Configuração incompleta no servidor' }) }
    }

    // Comparação direta com a senha em texto simples
    if (password !== panelPassword) {
      await new Promise(r => setTimeout(r, 1000))
      return { statusCode: 401, headers, body: JSON.stringify({ error: 'Senha incorreta' }) }
    }

    const token = jwt.sign(
      { user: 'willian' },
      jwtSecret,
      { expiresIn: '12h' }
    )

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ token })
    }
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Erro interno: ' + err.message }) }
  }
}
