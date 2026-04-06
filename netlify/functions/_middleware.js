const jwt = require('jsonwebtoken')

function corsHeaders(origin) {
  const allowed = ['https://seu-site.netlify.app', 'http://localhost:3000']
  return {
    'Access-Control-Allow-Origin': allowed.includes(origin) ? origin : allowed[0],
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  }
}

function verifyToken(event) {
  const auth = event.headers.authorization || ''
  if (!auth.startsWith('Bearer ')) return null
  try {
    return jwt.verify(auth.slice(7), process.env.JWT_SECRET)
  } catch {
    return null
  }
}

module.exports = { corsHeaders, verifyToken }
