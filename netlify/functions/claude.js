// netlify/functions/claude.js
// Proxy seguro para a API da Anthropic — a API key nunca vai ao browser

const crypto  = require("crypto");
const ANTHROPIC_KEY    = process.env.ANTHROPIC_API_KEY;
const SESSION_SECRET   = process.env.SESSION_SECRET;

// ─── Auth helper ─────────────────────────────────────────────────────────────

function verifyToken(token) {
  try {
    const [header, body, sig] = token.split(".");
    const expected = crypto
      .createHmac("sha256", SESSION_SECRET)
      .update(`${header}.${body}`)
      .digest("base64")
      .replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
    if (sig !== expected) return null;
    const payload = JSON.parse(Buffer.from(body, "base64url").toString());
    if (payload.exp && Date.now() > payload.exp) return null;
    return payload;
  } catch { return null; }
}

// ─── Anthropic helper ─────────────────────────────────────────────────────────

async function callAnthropic(system, userMessage, maxTokens = 2048) {
  const https = require("https");
  const body  = JSON.stringify({
    model: "claude-sonnet-4-20250514",
    max_tokens: maxTokens,
    system,
    messages: [{ role: "user", content: userMessage }],
  });

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: "api.anthropic.com",
        path: "/v1/messages",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "anthropic-version": "2023-06-01",
          "x-api-key": ANTHROPIC_KEY,
          "Content-Length": Buffer.byteLength(body),
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            const parsed = JSON.parse(data);
            const text = (parsed.content || [])
              .filter((b) => b.type === "text")
              .map((b) => b.text)
              .join("");
            resolve(text);
          } catch (e) { reject(e); }
        });
      }
    );
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

function parseJSON(text) {
  const clean = text.replace(/```json|```/g, "").trim();
  const s = clean.indexOf("{");
  const e = clean.lastIndexOf("}");
  if (s === -1 || e === -1) throw new Error("JSON não encontrado na resposta");
  return JSON.parse(clean.slice(s, e + 1));
}

// ─── CORS headers ─────────────────────────────────────────────────────────────

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

// ─── System prompt ─────────────────────────────────────────────────────────────

const SYSTEM = `Você é o estrategista de LinkedIn do Willian Pimentel, CRO da CULTSEC.

PERFIL DO WILLIAN:
- CRO da CULTSEC (conscientização de cibersegurança, pioneira no Brasil)
- 20+ anos em TI e vendas B2B complexas | Eng. Computação - UTFPR
- Histórico: CorpFlex → Claranet (M&A Bradesco→Claranet UK) → UOL Diveo Head LATAM
- Empreendedor: 2 franquias Instituto Mix (2019-2025), inaugurou 40 dias antes do lockdown
- Resultados: 135% meta, R$40MM ARR aos 31 anos, times até 30 pessoas, 3.000+ colaboradores aos 35
- Domina DRE, EBITDA, governança (experiência real de M&A)
- Idiomas: português, inglês e espanhol fluentes
- Tom: agradável, levemente sarcástico, humor inteligente e natural, nunca forçado
- NUNCA abordar religião. Ética cristã como bússola moral implícita.

PÚBLICO-ALVO: CEOs, CROs, CMOs, Diretores e Gerentes Comerciais de médias/grandes empresas Brasil + LATAM

PILARES:
1. 🏆 CRO & Revenue — máquina de receita, estratégia comercial, liderança
2. 🔐 Segurança como Negócio — conscientização plugada a risco de receita
3. 🧠 Carreira & Mentalidade — trajetória real, conquistas, aprendizados
4. 🌎 LATAM — posts em espanhol, mercado regional
5. 🔥 Empreendedor que Executou — gestão com risco próprio, decisões difíceis

REGRAS DE POST:
- Gancho forte na 1ª linha, NUNCA começar com "Eu"
- Parágrafos curtos (máx 2 linhas)
- Sem jargão vazio
- CTA claro no final
- Hashtags SEMPRE no 1º comentário, nunca no corpo do post
- PT-BR exceto posts LATAM (espanhol)

IMPORTANTE: Retorne SEMPRE JSON puro válido, sem markdown, sem blocos de código, sem texto antes ou depois do JSON.`;

// ─── Handler ──────────────────────────────────────────────────────────────────

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers: CORS, body: "" };
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: "Método não permitido" }) };
  }

  // Verificar autenticação
  const authHeader = event.headers["authorization"] || event.headers["Authorization"] || "";
  const token = authHeader.replace("Bearer ", "").trim();
  if (!verifyToken(token)) {
    return { statusCode: 401, headers: CORS, body: JSON.stringify({ error: "Não autorizado" }) };
  }

  let body;
  try { body = JSON.parse(event.body || "{}"); }
  catch { return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: "Body inválido" }) }; }

  const { action } = body;

  try {
    // ── SUGESTÕES ──────────────────────────────────────────────────────────
    if (action === "suggestions") {
      const today = new Date().toLocaleDateString("pt-BR", {
        weekday: "long", day: "numeric", month: "long", year: "numeric",
      });
      const prompt = `Hoje é ${today}.

Pesquise tendências atuais em CRO, vendas B2B complexas, cibersegurança, conscientização de segurança e mercado LATAM.

Gere 3 sugestões de post distintas para o Willian — uma por pilar diferente, variando entre os 5 pilares disponíveis.

Retorne SOMENTE este JSON:
{
  "suggestions": [
    {
      "pillar": "🏆 CRO & Revenue",
      "hook": "gancho impactante de 1 linha que para o scroll",
      "rationale": "por que este tema está relevante AGORA em 1 linha",
      "angle": "ângulo único que só o Willian pode defender com credibilidade",
      "best_time": "Dia · HH:mm"
    },
    {
      "pillar": "🔐 Segurança como Negócio",
      "hook": "...",
      "rationale": "...",
      "angle": "...",
      "best_time": "..."
    },
    {
      "pillar": "🧠 Carreira & Mentalidade",
      "hook": "...",
      "rationale": "...",
      "angle": "...",
      "best_time": "..."
    }
  ]
}`;

      const raw = await callAnthropic(SYSTEM, prompt);
      const data = parseJSON(raw);
      return { statusCode: 200, headers: CORS, body: JSON.stringify(data) };
    }

    // ── GERAR POST ─────────────────────────────────────────────────────────
    if (action === "generate") {
      const { pillar, hook, angle, best_time } = body;
      if (!pillar || !hook || !angle) {
        return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: "pillar, hook e angle são obrigatórios" }) };
      }

      const prompt = `Gere um post completo para o LinkedIn do Willian:

Pilar: ${pillar}
Gancho: ${hook}
Ângulo: ${angle}
Horário ideal: ${best_time || "Terça · 07h30"}

Retorne SOMENTE este JSON:
{
  "post_full": "post completo 180-250 palavras, parágrafos curtos máx 2 linhas, gancho forte na 1ª linha, CTA no final, NUNCA começar com Eu",
  "post_short": "versão curta 60-80 palavras igualmente impactante",
  "hashtags": "#tag1 #tag2 #tag3 #tag4 #tag5 #tag6 #tag7 #tag8",
  "best_time": "${best_time || "Terça · 07h30"}",
  "usa_imagem": false,
  "image_tool": "Ideogram.ai ou Canva ou vazio",
  "image_prompt": "prompt detalhado em inglês para gerar imagem 1:1 para LinkedIn, ou string vazia se usa_imagem=false"
}`;

      const raw = await callAnthropic(SYSTEM, prompt);
      const data = parseJSON(raw);
      return { statusCode: 200, headers: CORS, body: JSON.stringify(data) };
    }

    // ── AJUSTAR POST ───────────────────────────────────────────────────────
    if (action === "adjust") {
      const { post_full, post_short, hashtags, best_time, usa_imagem, image_tool, image_prompt, adjustment } = body;
      if (!post_full || !adjustment) {
        return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: "post_full e adjustment são obrigatórios" }) };
      }

      const prompt = `Post atual do Willian:\n"${post_full}"\n\nAjuste solicitado: ${adjustment}\n\nMantenha o tom, o pilar e o ângulo. Aplique o ajuste.\n\nRetorne SOMENTE este JSON:\n{"post_full":"novo texto ajustado","post_short":"nova versão curta ajustada","hashtags":"${hashtags}","best_time":"${best_time}","usa_imagem":${usa_imagem},"image_tool":"${image_tool}","image_prompt":"${image_prompt}"}`;

      const raw = await callAnthropic(SYSTEM, prompt, 1200);
      const data = parseJSON(raw);
      return { statusCode: 200, headers: CORS, body: JSON.stringify(data) };
    }

    // ── RESPOSTAS DE COMENTÁRIO ────────────────────────────────────────────
    if (action === "replies") {
      const { comment, post_hook } = body;
      if (!comment) {
        return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: "comment é obrigatório" }) };
      }

      const prompt = `Comentário recebido no LinkedIn do Willian:\n"${comment}"\n\nContexto do post: "${post_hook || "post do Willian Pimentel, CRO da CULTSEC"}"\n\nGere 3 opções de resposta estratégicas:\n\nRetorne SOMENTE este JSON:\n{\n  "replies": [\n    {"tone": "Expansiva", "text": "resposta que aprofunda o tema e agrega valor real"},\n    {"tone": "Direta e elegante", "text": "resposta curta, impactante e memorável"},\n    {"tone": "Com humor inteligente", "text": "resposta com sarcasmo sutil e inteligente no tom do Willian"}\n  ]\n}`;

      const raw = await callAnthropic(SYSTEM, prompt, 800);
      const data = parseJSON(raw);
      return { statusCode: 200, headers: CORS, body: JSON.stringify(data) };
    }

    // ── ANÁLISE DE PERFORMANCE ─────────────────────────────────────────────
    if (action === "performance") {
      const { rows } = body;
      if (!rows || rows.length < 1) {
        return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: "rows é obrigatório" }) };
      }

      const summary = rows.map((d) =>
        `${d.date}: seguidores=${d.followers}, impressões=${d.impressions}, curtidas=${d.likes}, comentários=${d.comments}, novas conexões=${d.connections}${d.note ? `, obs: ${d.note}` : ""}`
      ).join("\n");

      const prompt = `Dados de performance do LinkedIn do Willian:\n${summary}\n\nAnalise a evolução dos dados. Identifique padrões, o que está funcionando bem, o que precisa melhorar e recomende ajustes específicos na estratégia de conteúdo e engajamento. Seja direto, prático e baseado nos números. Responda em texto corrido, máximo 10 linhas.`;

      const raw = await callAnthropic(SYSTEM, prompt, 600);
      return { statusCode: 200, headers: CORS, body: JSON.stringify({ insight: raw.trim() }) };
    }

    // ── VALIDAR IMAGEM ─────────────────────────────────────────────────────
    if (action === "validate_image") {
      const { image_b64, image_type, post_full } = body;
      if (!image_b64) {
        return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: "image_b64 é obrigatório" }) };
      }
      const https = require("https");
      const reqBody = JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 400,
        messages: [{
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: image_type || "image/jpeg", data: image_b64 } },
            { type: "text", text: `Avalie esta imagem para o LinkedIn do Willian Pimentel, CRO.\n\nPost: "${post_full}"\n\nDê nota 1-10, pontos fortes e o que melhorar. Máx 5 linhas. Seja direto.` }
          ]
        }]
      });
      const imgText = await new Promise((resolve, reject) => {
        const req = https.request(
          { hostname:"api.anthropic.com", path:"/v1/messages", method:"POST",
            headers:{ "Content-Type":"application/json", "anthropic-version":"2023-06-01", "x-api-key":ANTHROPIC_KEY, "Content-Length":Buffer.byteLength(reqBody) } },
          (res) => { let d=""; res.on("data",c=>d+=c); res.on("end",()=>{ try{ const p=JSON.parse(d); resolve((p.content||[]).filter(b=>b.type==="text").map(b=>b.text).join("")); }catch(e){reject(e);} }); }
        );
        req.on("error", reject); req.write(reqBody); req.end();
      });
      return { statusCode: 200, headers: CORS, body: JSON.stringify({ insight: imgText.trim() }) };
    }

    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: `Ação desconhecida: ${action}` }) };

  } catch (err) {
    console.error("Erro na função claude:", err.message);
    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({ error: "Erro interno. Tente novamente." }),
    };
  }
};
