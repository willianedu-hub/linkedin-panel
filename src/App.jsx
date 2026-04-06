import { useState, useMemo } from 'react'
import { useAuth } from './hooks/useAuth.js'
import Login from './components/Login.jsx'
import { C, PILLAR_C, Badge, Card, STitle, Btn, BackBtn, Spinner, CopyBox, Textarea, Input } from './components/ui.jsx'

// ── STATIC DATA ──────────────────────────────────────────────────────────────

const POST_RETORNO = {
  id: 'retorno', pillar: '🧠 Carreira & Mentalidade',
  hook: 'Fiquei 6 anos fora do LinkedIn. Não foi burnout. Foi escolha.',
  best_time: 'Terça · 07h30–08h30', usa_imagem: false, image_tool: '', image_prompt: '',
  post_full: `Fiquei 6 anos fora do LinkedIn.\n\nNão foi burnout. Não foi crise.\nFoi uma escolha que me orgulho.\n\nDepois de construir muito rápido em São Paulo —\ntimes, receita, resultados que poucos constroem\nantes dos 35 — decidi que estava na hora de\nviver o que eu havia conquistado.\n\nVoltei para o Paraná. Perto dos meus pais,\nainda saudáveis, ainda presentes.\nEssa decisão, até hoje, é uma das melhores\nque já tomei.\n\nEmpreendi. Abri um negócio 40 dias antes\ndo lockdown de 2020.\n\nNão fechei.\n\nAprendi coisas que 20 anos de corporativo\nnão me ensinariam. Sobre gestão, sobre pessoas,\nsobre risco real — aquele em que o dinheiro\né o seu, não do acionista.\n\nHoje volto diferente.\n\nCom mais clareza sobre o que tenho a dizer\ne para quem quero dizer.\n\nVou falar sobre o que conheço de verdade:\n\n→ Como se constrói uma máquina de receita em vendas complexas B2B\n→ O que separa times mediocres de times que batem meta todo mês\n→ Por que o maior risco ao crescimento de qualquer empresa tem rosto, nome e acesso ao e-mail corporativo\n→ O que um CRO precisa saber que nenhum curso vai te ensinar\n\nSe você lidera receita, times ou crescimento — e leva isso a sério — acho que temos muito a trocar.\n\nBom voltar. 🤝`,
  post_short: `Fiquei 6 anos fora do LinkedIn.\n\nNão foi burnout. Foi escolha.\n\nVoltei para o Paraná. Perto dos meus pais ainda saudáveis. Empreendi. Arrisquei. Aprendi.\n\nHoje volto com mais clareza sobre o que tenho a dizer — e para quem.\n\nSe você lidera receita ou times comerciais, acho que temos muito a trocar.\n\nBom voltar. 🤝`,
  hashtags: '#CRO #EstrategiaComercial #VendasB2B #Liderança #Segurança #CulturaDeSegurança #MáquinaDeReceita #LATAM #Tecnologia',
}

const CHECKLIST = {
  Segunda: [
    { time: '07h30', task: 'Postar conteúdo semanal #1', type: 'post', priority: 'alta' },
    { time: '08h00', task: 'Responder comentários — primeiras 2h são críticas para o algoritmo', type: 'engage', priority: 'alta' },
    { time: '12h00', task: 'Comentar em 3 posts de ICPs prioritários', type: 'engage', priority: 'média' },
    { time: '18h00', task: 'Enviar 3 convites de conexão com mensagem personalizada', type: 'network', priority: 'média' },
  ],
  Terça: [
    { time: '08h00', task: 'Responder comentários do post de segunda', type: 'engage', priority: 'alta' },
    { time: '12h00', task: 'Comentar em 3 posts de ICPs prioritários', type: 'engage', priority: 'média' },
    { time: '18h00', task: 'Ver quem visitou seu perfil e conectar com os relevantes', type: 'network', priority: 'baixa' },
  ],
  Quarta: [
    { time: '07h30', task: 'Postar conteúdo semanal #2', type: 'post', priority: 'alta' },
    { time: '08h00', task: 'Responder comentários — primeiras 2h são críticas para o algoritmo', type: 'engage', priority: 'alta' },
    { time: '12h00', task: 'Comentar em 3 posts de ICPs prioritários', type: 'engage', priority: 'média' },
    { time: '18h00', task: 'Enviar 3 convites de conexão com mensagem personalizada', type: 'network', priority: 'média' },
  ],
  Quinta: [
    { time: '08h00', task: 'Responder comentários do post de quarta', type: 'engage', priority: 'alta' },
    { time: '12h00', task: 'Comentar em 3 posts de ICPs prioritários', type: 'engage', priority: 'média' },
    { time: '17h00', task: 'Abrir o painel e escolher sugestão de post para sexta', type: 'post', priority: 'média' },
  ],
  Sexta: [
    { time: '07h30', task: 'Postar conteúdo semanal #3', type: 'post', priority: 'alta' },
    { time: '08h00', task: 'Responder comentários — primeiras 2h são críticas para o algoritmo', type: 'engage', priority: 'alta' },
    { time: '12h00', task: 'Comentar em 2 posts de ICPs prioritários', type: 'engage', priority: 'média' },
    { time: '17h00', task: 'Registrar métricas da semana no painel', type: 'analytics', priority: 'baixa' },
  ],
}

const BEST_TIMES = [
  { day: 'Terça',   time: '07h30–08h30', score: 98 },
  { day: 'Quarta',  time: '07h30–08h30', score: 95 },
  { day: 'Segunda', time: '08h00–09h00', score: 88 },
  { day: 'Quinta',  time: '12h00–13h00', score: 82 },
  { day: 'Sexta',   time: '07h30–08h30', score: 75 },
]

const ICPS = [
  { name: 'Thiago Gabri',      role: 'CRO · RD Station',            why: 'Referência em RevOps e vendas B2B SaaS',                       action: 'comentar',  url: 'https://www.linkedin.com/in/thiagogabri/',       region: 'BR' },
  { name: 'Camila Farani',     role: 'CEO · G2 Capital',             why: 'Investidora ativa, posts sobre liderança e crescimento',       action: 'comentar',  url: 'https://www.linkedin.com/in/camilafarani/',      region: 'BR' },
  { name: 'Marcelo Lombardo',  role: 'CEO · Omie',                   why: 'CEO de scale-up, fala de gestão e tecnologia',                action: 'seguir',    url: 'https://www.linkedin.com/in/marcelolombardo/',   region: 'BR' },
  { name: 'Christian Barbosa', role: 'CEO · Trilogiq',               why: 'Autoridade em produtividade, grande alcance no LinkedIn BR',  action: 'comentar',  url: 'https://www.linkedin.com/in/christianbarbosa/',  region: 'BR' },
  { name: 'Ana Paula Assis',   role: 'GM · IBM Brasil',              why: 'Executiva de TI de alto nível, posts estratégicos',           action: 'conectar',  url: 'https://www.linkedin.com/in/anapaulaassis/',     region: 'BR' },
  { name: 'Gustavo Caetano',   role: 'CEO · Samba Tech',             why: 'Empreendedor de tech, posts sobre vendas B2B e escala',       action: 'comentar',  url: 'https://www.linkedin.com/in/gustavocaetano/',    region: 'BR' },
  { name: 'Lázaro Ibanez',     role: 'VP Sales LATAM · Salesforce',  why: 'Liderança comercial LATAM, posta RevOps em espanhol',         action: 'seguir',    url: 'https://www.linkedin.com/in/lazaro-ibanez/',     region: 'LATAM' },
  { name: 'Diego Mingorance',  role: 'CRO · Bind LATAM',             why: 'CRO ativo no LATAM, posta sobre revenue em espanhol',         action: 'conectar',  url: 'https://www.linkedin.com/in/diegomingorance/',   region: 'LATAM' },
]

const ACTION_C = { seguir: C.accent, comentar: C.green, conectar: C.purple }
const TYPE_C   = { post: C.accent, engage: C.green, network: C.purple, analytics: C.orange }
const TYPE_I   = { post: '✍️', engage: '💬', network: '🤝', analytics: '📊' }
const DAY_NAMES = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado']

// ── APP ──────────────────────────────────────────────────────────────────────

export default function App() {
  const { isAuthenticated, loading: authLoading, error: authError, login, logout, authFetch } = useAuth()

  if (!isAuthenticated) {
    return <Login onLogin={login} loading={authLoading} error={authError} />
  }

  return <Dashboard authFetch={authFetch} logout={logout} />
}

// ── DASHBOARD ────────────────────────────────────────────────────────────────

function Dashboard({ authFetch, logout }) {
  const [screen, setScreen]           = useState('home')
  const [copied, setCopied]           = useState(null)
  const [checked, setChecked]         = useState({})
  const [viewPost, setViewPost]       = useState(null)
  const [activePost, setActivePost]   = useState(null)
  const [activeSug, setActiveSug]     = useState(null)
  const [adjustment, setAdjustment]   = useState('')
  const [history, setHistory]         = useState([POST_RETORNO])
  const [commentText, setComment]     = useState('')
  const [replies, setReplies]         = useState(null)
  const [perfRows, setPerfRows]       = useState([])
  const [perfForm, setPerfForm]       = useState({ date:'', followers:'', impressions:'', likes:'', comments:'', connections:'', note:'' })
  const [suggestions, setSuggestions] = useState(null)
  const [apiLoading, setApiLoading]   = useState(false)
  const [apiError, setApiError]       = useState(null)
  const [imgFeedback, setImgFeedback] = useState(null)
  const [imgLoading, setImgLoading]   = useState(false)

  const dayName    = DAY_NAMES[new Date().getDay()]
  const todayTasks = CHECKLIST[dayName] || CHECKLIST['Quarta']
  const doneToday  = todayTasks.filter((_, i) => checked[`${dayName}-${i}`]).length

  const copy = (text, id) => {
    navigator.clipboard?.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  // ── API CALLS ──────────────────────────────────────────────────────────────

  const loadSuggestions = async () => {
    setApiLoading(true)
    setApiError(null)
    setSuggestions(null)
    setScreen('suggestions')
    try {
      const res = await authFetch('/suggestions', { method: 'POST', body: JSON.stringify({}) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao carregar sugestões')
      setSuggestions(data.suggestions)
    } catch (err) {
      setApiError(err.message)
    } finally {
      setApiLoading(false)
    }
  }

  const generatePost = async (sug) => {
    setActiveSug(sug)
    setActivePost(null)
    setApiError(null)
    setImgFeedback(null)
    setApiLoading(true)
    setScreen('post')
    try {
      const res = await authFetch('/generate', { method: 'POST', body: JSON.stringify(sug) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao gerar post')
      setActivePost(data)
    } catch (err) {
      setApiError(err.message)
    } finally {
      setApiLoading(false)
    }
  }

  const applyAdjustment = async () => {
    if (!adjustment.trim() || !activePost) return
    setApiLoading(true)
    setApiError(null)
    try {
      const res = await authFetch('/adjust', { method: 'POST', body: JSON.stringify({ ...activePost, adjustment }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao ajustar')
      setActivePost(data)
      setAdjustment('')
    } catch (err) {
      setApiError(err.message)
    } finally {
      setApiLoading(false)
    }
  }

  const generateReplies = async () => {
    if (!commentText.trim()) return
    setApiLoading(true)
    setApiError(null)
    setReplies(null)
    try {
      const res = await authFetch('/replies', {
        method: 'POST',
        body: JSON.stringify({ comment: commentText, post_hook: activeSug?.hook || '' })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao gerar respostas')
      setReplies(data.replies)
    } catch (err) {
      setApiError(err.message)
    } finally {
      setApiLoading(false)
    }
  }

  const validateImage = (file) => {
    setImgLoading(true)
    setImgFeedback(null)
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const b64 = e.target.result.split(',')[1]
        const res = await authFetch('/validate-image', {
          method: 'POST',
          body: JSON.stringify({ image_base64: b64, media_type: file.type, post_text: activePost?.post_full || '' })
        })
        const data = await res.json()
        setImgFeedback(data.feedback || 'Erro na análise.')
      } catch {
        setImgFeedback('Erro ao enviar imagem. Tente novamente.')
      } finally {
        setImgLoading(false)
      }
    }
    reader.readAsDataURL(file)
  }

  const approvePost = () => {
    if (activePost && activeSug) {
      setHistory(prev => [{
        id: Date.now(), date: new Date().toLocaleDateString('pt-BR'),
        pillar: activeSug.pillar, hook: activeSug.hook,
        ...activePost
      }, ...prev])
    }
    setComment('')
    setReplies(null)
    setScreen('comments')
  }

  const savePerf = () => {
    if (!perfForm.date) return
    setPerfRows(p => [...p, { ...perfForm, id: Date.now() }])
    setPerfForm({ date:'', followers:'', impressions:'', likes:'', comments:'', connections:'', note:'' })
  }

  const perfInsight = useMemo(() => {
    if (perfRows.length < 2) return null
    const last = perfRows[perfRows.length - 1]
    const prev = perfRows[perfRows.length - 2]
    const fDiff = Number(last.followers) - Number(prev.followers)
    const iDiff = Number(last.impressions) - Number(prev.impressions)
    const eng = last.impressions > 0
      ? (((Number(last.likes) + Number(last.comments)) / Number(last.impressions)) * 100).toFixed(1)
      : 0
    return [
      `📈 Seguidores: ${fDiff >= 0 ? '+' : ''}${fDiff} vs semana anterior`,
      `👁 Impressões: ${iDiff >= 0 ? '+' : ''}${iDiff} vs semana anterior`,
      `❤️ Taxa de engajamento: ${eng}% ${eng >= 3 ? '✅ acima da média (3%)' : '⚠️ abaixo da média (3%)'}`,
      '',
      eng >= 3
        ? '✅ Continue com o tipo de conteúdo que gerou mais comentários.'
        : '⚠️ Priorize posts com perguntas diretas e narrativas pessoais — geram mais comentários.',
      fDiff >= 5
        ? '✅ Crescimento de seguidores saudável. Mantenha a consistência.'
        : '⚠️ Crescimento lento. Aumente interações com ICPs e revise o gancho dos posts.',
    ].join('\n')
  }, [perfRows])

  // ── NAV ───────────────────────────────────────────────────────────────────

  const navItems = [
    { id: 'home',        label: 'Início',       action: () => setScreen('home') },
    { id: 'suggestions', label: 'Novo Post',    action: loadSuggestions },
    { id: 'checklist',   label: 'Checklist',    action: () => setScreen('checklist') },
    { id: 'icp',         label: 'ICPs',         action: () => setScreen('icp') },
    { id: 'comments',    label: 'Comentários',  action: () => setScreen('comments') },
    { id: 'performance', label: 'Performance',  action: () => setScreen('performance') },
  ]

  // ── SCREENS ───────────────────────────────────────────────────────────────

  const screens = {

    home: (
      <div>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 22, fontWeight: 800, background: `linear-gradient(135deg,${C.text},${C.glow})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            LinkedIn Command Center
          </div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>Willian Pimentel · CRO CULTSEC · 3 posts/semana</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 20 }}>
          {[['1.5K','Conexões',C.glow],[`${doneToday}/${todayTasks.length}`,'Tarefas hoje',C.green],[`${history.length}`,'Posts criados',C.orange]].map(([n,l,c]) => (
            <Card key={l} style={{ textAlign: 'center', padding: '14px 8px' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: c }}>{n}</div>
              <div style={{ fontSize: 10, color: C.muted, marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{l}</div>
            </Card>
          ))}
        </div>

        <Btn onClick={loadSuggestions}>⚡ Sugestões de Post</Btn>
        <Btn onClick={() => setScreen('checklist')} variant="ghost">✅ Checklist de Hoje — {dayName}</Btn>
        <Btn onClick={() => setScreen('icp')} variant="ghost">🎯 ICPs para Interagir</Btn>
        <Btn onClick={() => setScreen('comments')} variant="ghost">💬 Responder Comentários</Btn>
        <Btn onClick={() => setScreen('performance')} variant="ghost">📊 Performance da Conta</Btn>

        <Card>
          <STitle>🕐 Melhores Horários para Postar</STitle>
          {BEST_TIMES.map(t => (
            <div key={t.day} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ width: 56, fontSize: 12, fontWeight: 700 }}>{t.day}</div>
              <Badge color={C.green}>{t.time}</Badge>
              <div style={{ flex: 1, height: 5, borderRadius: 3, background: C.border, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${t.score}%`, background: `linear-gradient(90deg,${C.accent},${C.purple})`, borderRadius: 3 }} />
              </div>
              <div style={{ fontSize: 10, color: C.muted }}>{t.score}%</div>
            </div>
          ))}
        </Card>

        <Card highlight>
          <div style={{ fontSize: 10, fontWeight: 800, color: C.glow, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 10 }}>📌 Post de Reativação — Pronto para Publicar</div>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>{POST_RETORNO.hook}</div>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 14 }}>🕐 {POST_RETORNO.best_time} · {POST_RETORNO.pillar}</div>
          <button onClick={() => { setViewPost(POST_RETORNO); setScreen('viewpost') }}
            style={{ padding: '7px 16px', borderRadius: 8, border: `1px solid ${C.accent}`, background: `${C.accent}20`, color: C.glow, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
            Ver Post Completo →
          </button>
        </Card>

        {history.length > 0 && (
          <Card>
            <STitle>📋 Histórico de Posts</STitle>
            {history.map((item, i) => (
              <div key={i} onClick={() => { setViewPost(item); setScreen('viewpost') }}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10, background: C.surface, border: `1px solid ${C.border}`, marginBottom: 8, cursor: 'pointer' }}>
                <span style={{ fontSize: 16 }}>{item.pillar?.[0] || '📝'}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{item.hook}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>{item.date || 'Pendente'} · {item.pillar}</div>
                </div>
                <span style={{ color: C.muted }}>→</span>
              </div>
            ))}
          </Card>
        )}

        <button onClick={logout} style={{ width: '100%', padding: '10px', borderRadius: 10, border: `1px solid ${C.border}`, background: 'transparent', color: C.muted, fontSize: 12, cursor: 'pointer', marginTop: 8 }}>
          Sair
        </button>
      </div>
    ),

    suggestions: (
      <div>
        <BackBtn onClick={() => setScreen('home')} />
        <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>Sugestões da Semana</div>
        <div style={{ fontSize: 13, color: C.muted, marginBottom: 12 }}>Baseadas em trends e hypes do momento.</div>
        <Btn onClick={loadSuggestions} disabled={apiLoading}>{apiLoading ? 'Buscando...' : '🔄 Atualizar Sugestões'}</Btn>
        {apiLoading && <Spinner text="Pesquisando trends e gerando sugestões..." />}
        {apiError && <div style={{ padding: '12px 16px', borderRadius: 10, background: `${C.red}15`, border: `1px solid ${C.red}44`, color: C.red, fontSize: 13, marginBottom: 14 }}>⚠️ {apiError}</div>}
        {!apiLoading && suggestions?.map((sug, i) => (
          <Card key={i}>
            <Badge color={PILLAR_C[sug.pillar[0]] || C.accent}>{sug.pillar}</Badge>
            {' '}
            <Badge color={C.green} style={{ marginLeft: 4 }}>🕐 {sug.best_time}</Badge>
            <div style={{ fontSize: 16, fontWeight: 700, margin: '10px 0 6px', lineHeight: 1.4 }}>{sug.hook}</div>
            <div style={{ fontSize: 12, color: C.subtle, marginBottom: 4 }}>📰 {sug.rationale}</div>
            <div style={{ fontSize: 12, color: C.glow, fontStyle: 'italic', marginBottom: 14 }}>💡 {sug.angle}</div>
            <button onClick={() => generatePost(sug)}
              style={{ padding: '8px 18px', borderRadius: 8, border: `1px solid ${C.accent}`, background: `${C.accent}20`, color: C.glow, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
              Desenvolver este post →
            </button>
          </Card>
        ))}
      </div>
    ),

    post: (
      <div>
        <BackBtn onClick={() => setScreen('suggestions')} />
        {activeSug && (
          <div style={{ marginBottom: 18 }}>
            <Badge color={PILLAR_C[activeSug.pillar[0]] || C.accent}>{activeSug.pillar}</Badge>
            <div style={{ fontSize: 17, fontWeight: 700, marginTop: 8 }}>{activeSug.hook}</div>
          </div>
        )}
        {apiLoading && <Spinner text="Gerando seu post completo..." />}
        {apiError && (
          <Card>
            <div style={{ color: C.red, marginBottom: 12 }}>⚠️ {apiError}</div>
            <Btn onClick={() => activeSug && generatePost(activeSug)}>🔄 Tentar Novamente</Btn>
          </Card>
        )}
        {!apiLoading && !apiError && activePost && (
          <>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
              <Badge color={C.green}>🕐 {activePost.best_time}</Badge>
              <Badge color={activePost.usa_imagem ? C.orange : C.green}>
                {activePost.usa_imagem ? '🖼 Com imagem' : '✍️ Texto puro'}
              </Badge>
            </div>
            <Card>
              <STitle>📝 Post Completo</STitle>
              <CopyBox value={activePost.post_full} id="full" copied={copied} onCopy={copy} />
              <STitle>⚡ Versão Curta</STitle>
              <CopyBox value={activePost.post_short} id="short" copied={copied} onCopy={copy} />
              <STitle>#️⃣ Hashtags — colar no 1º comentário</STitle>
              <CopyBox value={activePost.hashtags} id="hash" copied={copied} onCopy={copy} />
            </Card>
            {activePost.usa_imagem && activePost.image_prompt && (
              <Card>
                <STitle>🖼 Criação da Imagem</STitle>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
                  <Badge color={C.purple}>Ferramenta: {activePost.image_tool || 'Ideogram.ai'}</Badge>
                  <a href={activePost.image_tool === 'Canva' ? 'https://canva.com' : 'https://ideogram.ai'} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: C.accent, textDecoration: 'none' }}>Abrir →</a>
                </div>
                <div style={{ fontSize: 12, color: C.muted, marginBottom: 6 }}>Cole este prompt na ferramenta:</div>
                <CopyBox value={activePost.image_prompt} id="imgprompt" copied={copied} onCopy={copy} italic />
                <div style={{ height: 1, background: C.border, margin: '16px 0' }} />
                <STitle>✅ Validar Imagem Gerada</STitle>
                <div style={{ fontSize: 12, color: C.muted, marginBottom: 10 }}>Gerou a imagem? Envie aqui para validação.</div>
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 14, borderRadius: 10, border: `2px dashed ${C.border}`, cursor: 'pointer', color: C.muted, fontSize: 13, background: C.surface }}>
                  📎 Enviar imagem para validação
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => e.target.files[0] && validateImage(e.target.files[0])} />
                </label>
                {imgLoading && <Spinner text="Analisando imagem..." />}
                {imgFeedback && (
                  <div style={{ marginTop: 12, padding: 14, borderRadius: 10, background: `${C.accent}10`, border: `1px solid ${C.accent}33`, fontSize: 13, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                    {imgFeedback}
                  </div>
                )}
              </Card>
            )}
            <Card>
              <STitle>✏️ Solicitar Ajuste</STitle>
              <Textarea value={adjustment} onChange={e => setAdjustment(e.target.value)} placeholder="Ex: mais sarcástico na abertura, encurta o meio, muda o CTA..." />
              <Btn onClick={applyAdjustment} disabled={apiLoading} style={{ marginTop: 10 }}>
                {apiLoading ? 'Ajustando...' : '🔧 Aplicar Ajuste'}
              </Btn>
            </Card>
            <Btn onClick={approvePost} variant="success">✅ Aprovado — Salvar e Ir para Comentários</Btn>
          </>
        )}
      </div>
    ),

    viewpost: (() => {
      const p = viewPost
      if (!p) return <div><BackBtn onClick={() => setScreen('home')} /></div>
      return (
        <div>
          <BackBtn onClick={() => setScreen('home')} />
          {p.best_time && <Badge color={C.green} style={{ marginBottom: 16 }}>🕐 {p.best_time}</Badge>}
          <Card>
            <STitle>📝 Post Completo</STitle>
            <CopyBox value={p.post_full} id="vf" copied={copied} onCopy={copy} />
            {p.post_short && <><STitle>⚡ Versão Curta</STitle><CopyBox value={p.post_short} id="vs" copied={copied} onCopy={copy} /></>}
            {p.hashtags && <><STitle>#️⃣ Hashtags (1º comentário)</STitle><CopyBox value={p.hashtags} id="vh" copied={copied} onCopy={copy} /></>}
            {p.usa_imagem && p.image_prompt && <><STitle>🖼 Prompt de Imagem — {p.image_tool}</STitle><CopyBox value={p.image_prompt} id="vi" copied={copied} onCopy={copy} italic /></>}
          </Card>
        </div>
      )
    })(),

    checklist: (
      <div>
        <BackBtn onClick={() => setScreen('home')} />
        <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>Checklist — {dayName}</div>
        <div style={{ fontSize: 13, color: C.muted, marginBottom: 8 }}>{doneToday} de {todayTasks.length} tarefas concluídas</div>
        <div style={{ height: 5, borderRadius: 3, background: C.border, marginBottom: 20, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${todayTasks.length ? (doneToday / todayTasks.length) * 100 : 0}%`, background: `linear-gradient(90deg,${C.accent},${C.green})`, borderRadius: 3, transition: 'width 0.4s' }} />
        </div>
        {todayTasks.map((task, i) => {
          const key = `${dayName}-${i}`, done = checked[key]
          return (
            <div key={i} onClick={() => setChecked(p => ({ ...p, [key]: !p[key] }))}
              style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '11px 14px', borderRadius: 10, background: done ? `${C.green}08` : C.surface, border: `1px solid ${done ? C.green + '33' : C.border}`, marginBottom: 8, cursor: 'pointer', opacity: done ? 0.6 : 1 }}>
              <div style={{ width: 20, height: 20, borderRadius: 6, border: `2px solid ${done ? C.green : C.border}`, background: done ? C.green : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                {done && <span style={{ color: '#fff', fontSize: 10, fontWeight: 800 }}>✓</span>}
              </div>
              <span style={{ fontSize: 15 }}>{TYPE_I[task.type]}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: TYPE_C[task.type], fontWeight: 700, marginBottom: 2 }}>{task.time}</div>
                <div style={{ fontSize: 13, color: done ? C.muted : C.text, textDecoration: done ? 'line-through' : 'none' }}>{task.task}</div>
              </div>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: task.priority === 'alta' ? C.red : task.priority === 'média' ? C.orange : C.muted, flexShrink: 0, marginTop: 6 }} />
            </div>
          )
        })}
        <Card style={{ marginTop: 20 }}>
          <STitle>📅 Resumo da Semana</STitle>
          {Object.entries(CHECKLIST).map(([day, tasks]) => (
            <div key={day} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ width: 60, fontSize: 12, fontWeight: 700, color: day === dayName ? C.glow : C.muted }}>{day}</div>
              <div style={{ flex: 1, display: 'flex', gap: 3 }}>
                {tasks.map((t, i) => <div key={i} style={{ width: 8, height: 8, borderRadius: 2, background: TYPE_C[t.type], opacity: 0.7 }} />)}
              </div>
              <div style={{ fontSize: 10, color: C.muted }}>{tasks.length}x</div>
            </div>
          ))}
        </Card>
      </div>
    ),

    icp: (
      <div>
        <BackBtn onClick={() => setScreen('home')} />
        <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>ICPs para Interagir</div>
        <div style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>Priorize comentários antes de curtidas. Meta: 3 interações/dia.</div>
        {ICPS.map((p, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 16px', borderRadius: 12, background: C.surface, border: `1px solid ${C.border}`, marginBottom: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: `${[C.accent,C.purple,C.green,C.orange,C.teal][p.name.charCodeAt(0)%5]}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: [C.accent,C.purple,C.green,C.orange,C.teal][p.name.charCodeAt(0)%5], flexShrink: 0 }}>
              {p.name[0]}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 3 }}>
                <span style={{ fontSize: 14, fontWeight: 700 }}>{p.name}</span>
                <Badge color={ACTION_C[p.action] || C.accent}>{p.action}</Badge>
                <Badge color={p.region === 'LATAM' ? C.orange : C.muted}>{p.region}</Badge>
              </div>
              <div style={{ fontSize: 12, color: C.muted, marginBottom: 3 }}>{p.role}</div>
              <div style={{ fontSize: 12, color: C.subtle, marginBottom: 6 }}>{p.why}</div>
              <a href={p.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: C.accent, textDecoration: 'none' }}>Abrir LinkedIn →</a>
            </div>
          </div>
        ))}
      </div>
    ),

    comments: (
      <div>
        <BackBtn onClick={() => setScreen('home')} />
        <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>Gestão de Comentários</div>
        <div style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>Cole o comentário e receba 3 opções de resposta.</div>
        <Card>
          <STitle>💬 Comentário Recebido</STitle>
          <Textarea value={commentText} onChange={e => setComment(e.target.value)} placeholder="Cole aqui o comentário do seu post..." minHeight={90} />
          <Btn onClick={generateReplies} disabled={apiLoading || !commentText.trim()} style={{ marginTop: 10 }}>
            {apiLoading ? 'Gerando...' : '💡 Gerar 3 Opções de Resposta'}
          </Btn>
        </Card>
        {apiLoading && <Spinner text="Criando respostas estratégicas..." />}
        {apiError && <div style={{ padding: '12px 16px', borderRadius: 10, background: `${C.red}15`, border: `1px solid ${C.red}44`, color: C.red, fontSize: 13, marginBottom: 14 }}>⚠️ {apiError}</div>}
        {replies && (
          <Card>
            <STitle>🎯 Opções de Resposta</STitle>
            {replies.map((r, i) => (
              <div key={i} style={{ position: 'relative', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14, marginBottom: 10 }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: C.glow, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 7 }}>{r.tone}</div>
                <div style={{ fontSize: 13, lineHeight: 1.7, paddingRight: 60 }}>{r.text}</div>
                <button onClick={() => copy(r.text, `r${i}`)} style={{ position: 'absolute', top: 10, right: 10, padding: '3px 10px', borderRadius: 6, border: `1px solid ${C.border}`, background: copied === `r${i}` ? `${C.green}22` : C.card, color: copied === `r${i}` ? C.green : C.muted, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                  {copied === `r${i}` ? '✓' : 'Copiar'}
                </button>
              </div>
            ))}
          </Card>
        )}
      </div>
    ),

    performance: (
      <div>
        <BackBtn onClick={() => setScreen('home')} />
        <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>Performance da Conta</div>
        <div style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>Registre os dados toda sexta. Vou analisar a evolução e ajustar a estratégia.</div>
        <Card>
          <STitle>➕ Registrar Dados da Semana</STitle>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
            {[['date','📅 Data','date'],['followers','👥 Seguidores','number'],['impressions','👁 Impressões','number'],['likes','❤️ Curtidas','number'],['comments','💬 Comentários','number'],['connections','🤝 Novas conexões','number']].map(([f,l,t]) => (
              <div key={f}>
                <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>{l}</div>
                <input type={t} value={perfForm[f]} onChange={e => setPerfForm(p => ({ ...p, [f]: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${C.border}`, background: C.surface, color: C.text, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
              </div>
            ))}
          </div>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>📝 Observação (post que bombou, algo diferente...)</div>
            <input type="text" value={perfForm.note} onChange={e => setPerfForm(p => ({ ...p, note: e.target.value }))} placeholder="Ex: post de terça teve alcance alto..."
              style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${C.border}`, background: C.surface, color: C.text, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <Btn onClick={savePerf} disabled={!perfForm.date}>💾 Salvar Registro</Btn>
        </Card>
        {perfRows.length > 0 && (
          <Card>
            <STitle>📈 Histórico de Performance</STitle>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr>{['Data','Seg.','Impr.','Curt.','Coment.','Conex.'].map(h => (
                    <th key={h} style={{ padding: '6px 10px', textAlign: 'left', color: C.muted, fontWeight: 700, borderBottom: `1px solid ${C.border}`, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {perfRows.map((d, i) => (
                    <tr key={i}>
                      {[d.date,d.followers,d.impressions,d.likes,d.comments,d.connections].map((v, j) => (
                        <td key={j} style={{ padding: '7px 10px', color: j === 0 ? C.muted : C.text, borderBottom: `1px solid ${C.border}33`, fontWeight: j > 0 ? '600' : '400' }}>{v || '–'}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
        {perfInsight && (
          <Card highlight>
            <STitle>💡 Análise Automática</STitle>
            <div style={{ fontSize: 13, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{perfInsight}</div>
          </Card>
        )}
        {perfRows.length === 0 && (
          <div style={{ textAlign: 'center', padding: '30px 20px', color: C.muted, fontSize: 13 }}>
            Nenhum dado ainda. Registre os dados da sua primeira semana após publicar o Post 1.
          </div>
        )}
      </div>
    ),
  }

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "'DM Sans','Segoe UI',sans-serif", color: C.text }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}.fade-in{animation:fadeIn .3s ease}*{box-sizing:border-box;margin:0;padding:0}button:hover{opacity:.85}input:focus,textarea:focus{border-color:${C.accent}!important;outline:none}::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:${C.bg}}::-webkit-scrollbar-thumb{background:${C.border};border-radius:3px}`}</style>

      <div style={{ background: 'linear-gradient(135deg,#0c1322,#162035)', borderBottom: `1px solid ${C.border}`, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: `linear-gradient(135deg,${C.accent},${C.purple})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 800, color: '#fff' }}>W</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.2 }}>LinkedIn Manager</div>
            <div style={{ fontSize: 10, color: C.muted }}>Willian Pimentel · CRO CULTSEC</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {navItems.map(item => (
            <button key={item.id} onClick={item.action}
              style={{ padding: '5px 10px', borderRadius: 7, border: screen === item.id ? `1px solid ${C.accent}` : '1px solid transparent', background: screen === item.id ? `${C.accent}22` : 'transparent', color: screen === item.id ? C.glow : C.muted, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px 16px' }}>
        {screens[screen] || screens.home}
      </div>
    </div>
  )
}
