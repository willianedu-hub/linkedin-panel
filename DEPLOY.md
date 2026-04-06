# 🚀 Guia de Deploy — LinkedIn Manager

Tempo estimado: **15 a 20 minutos**

---

## PRÉ-REQUISITOS

- Conta no GitHub (github.com) — crie se não tiver, é gratuito
- Conta no Netlify (netlify.com) — faça login com o GitHub
- Sua API Key da Anthropic (sk-ant-...)
- Node.js instalado no seu computador (nodejs.org → versão LTS)

---

## PASSO 1 — Instalar o Git e o Node.js

### Node.js
1. Acesse https://nodejs.org
2. Baixe a versão **LTS** e instale
3. Verifique abrindo o terminal e digitando: `node -v`

### Git
1. Acesse https://git-scm.com/downloads
2. Baixe e instale para Windows/Mac
3. Verifique: `git -v`

---

## PASSO 2 — Criar o repositório no GitHub

1. Acesse https://github.com e faça login
2. Clique em **"New repository"** (botão verde, canto superior direito)
3. Nome: `linkedin-panel`
4. Marque **Private** (importante — repositório privado)
5. Clique em **"Create repository"**
6. Copie a URL do repositório (ex: `https://github.com/seunome/linkedin-panel.git`)

---

## PASSO 3 — Configurar os arquivos do projeto

1. Abra o terminal no seu computador
2. Navegue até onde quer salvar o projeto:
   ```
   cd Desktop
   ```
3. Crie a pasta e entre nela:
   ```
   mkdir linkedin-panel
   cd linkedin-panel
   ```
4. Copie todos os arquivos do projeto para esta pasta
   (os arquivos que você recebeu: src/, netlify/, package.json, etc.)

5. Crie o arquivo `.env` com suas credenciais:
   ```
   cp .env.example .env
   ```
   Abra o `.env` em qualquer editor de texto e preencha:
   ```
   PANEL_PASSWORD=escolha_uma_senha_forte_aqui
   SESSION_SECRET=qualquer_string_longa_e_aleatoria_ex_abc123xyz789
   ANTHROPIC_API_KEY=sk-ant-sua-chave-aqui
   ```

---

## PASSO 4 — Instalar dependências e testar localmente

No terminal, dentro da pasta do projeto:

```bash
npm install
```

Para testar localmente (opcional mas recomendado):
```bash
npm install -g netlify-cli
netlify dev
```
Acesse http://localhost:3000 — o painel deve abrir com a tela de login.

---

## PASSO 5 — Subir para o GitHub

No terminal, dentro da pasta do projeto:

```bash
git init
git add .
git commit -m "primeiro commit"
git branch -M main
git remote add origin https://github.com/seunome/linkedin-panel.git
git push -u origin main
```

Substitua a URL pela URL do seu repositório criado no Passo 2.

---

## PASSO 6 — Deploy no Netlify

1. Acesse https://netlify.com e faça login com GitHub
2. Clique em **"Add new site"** → **"Import an existing project"**
3. Escolha **GitHub** e autorize o acesso
4. Selecione o repositório `linkedin-panel`
5. Configurações de build:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
   - **Functions directory:** `netlify/functions`
6. Clique em **"Deploy site"**

---

## PASSO 7 — Configurar variáveis de ambiente no Netlify

**Este passo é crítico — sem ele o painel não funciona.**

1. No Netlify, após o deploy, vá em **Site settings**
2. Clique em **Environment variables** (menu lateral)
3. Clique em **"Add a variable"** para cada uma:

   | Key                  | Value                          |
   |----------------------|--------------------------------|
   | PANEL_PASSWORD       | sua senha escolhida            |
   | SESSION_SECRET       | sua string aleatória           |
   | ANTHROPIC_API_KEY    | sk-ant-sua-chave               |

4. Após adicionar todas, vá em **Deploys** e clique em **"Trigger deploy"** → **"Deploy site"**

---

## PASSO 8 — Acessar o painel

1. O Netlify gera uma URL como `https://nome-aleatorio.netlify.app`
2. Acesse essa URL
3. Digite a senha que você configurou em `PANEL_PASSWORD`
4. Pronto — painel funcionando com todas as funcionalidades de IA

### Domínio personalizado (opcional)
Se quiser uma URL mais limpa (ex: `painel.cultsec.com.br`):
- Netlify → Site settings → Domain management → Add custom domain

---

## ATUALIZAÇÕES FUTURAS

Para atualizar o painel após qualquer mudança:

```bash
git add .
git commit -m "descrição da mudança"
git push
```

O Netlify faz o redeploy automaticamente.

---

## PROBLEMAS COMUNS

**"Function returned an error"**
→ Verifique se as variáveis de ambiente estão corretas no Netlify

**"Senha incorreta" mesmo com a senha certa**
→ Verifique se não há espaços extras no valor de PANEL_PASSWORD

**Build falhou**
→ Verifique se o Node.js está na versão 18+ (node -v)

**API Key inválida**
→ Verifique no console.anthropic.com se a chave está ativa e com créditos

---

## SEGURANÇA

- O arquivo `.env` NUNCA vai para o GitHub (está no .gitignore)
- A API Key fica apenas no backend (Netlify Functions) — nunca no browser
- O token de sessão expira em 7 dias automaticamente
- O repositório é privado — ninguém além de você tem acesso ao código
