/**
 * Execute UMA VEZ para gerar o hash da senha e o JWT secret.
 * Depois salve os valores gerados no Netlify como variáveis de ambiente.
 *
 * Como usar:
 *   node setup.js SuaSenhaAqui
 */

const bcrypt = require('bcryptjs')
const crypto = require('crypto')

const password = process.argv[2]

if (!password) {
  console.error('\nUso: node setup.js SuaSenha\n')
  process.exit(1)
}

async function main() {
  const hash = await bcrypt.hash(password, 10)
  const jwtSecret = crypto.randomBytes(48).toString('hex')

  console.log('\n=== COPIE ESTES VALORES PARA O NETLIFY ===\n')
  console.log(`PANEL_PASSWORD_HASH=${hash}`)
  console.log(`JWT_SECRET=${jwtSecret}`)
  console.log('\n==========================================\n')
  console.log('⚠️  Não compartilhe esses valores com ninguém.')
  console.log('⚠️  Configure como variáveis de ambiente no Netlify, não no código.\n')
}

main()
