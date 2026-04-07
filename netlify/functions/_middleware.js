const jwt = require('jsonwebtoken')

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  }
}

function verifyToken(event) {
  const auth = event.headers.authorization || event.headers.Authorization || ''
  if (!auth.startsWith('Bearer ')) return null
  try {
    return jwt.verify(auth.slice(7), process.env.JWT_SECRET)
  } catch {
    return null
  }
}

module.exports = { corsHeaders, verifyToken }
