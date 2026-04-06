import React, { useState, useMemo } from "react";
import {
  C, Badge, Card, STitle, Btn, BackBtn, Loader, CopyBox, TextArea, Input, ErrorMsg,
  PILLAR_COLOR, TYPE_COLOR, TYPE_ICON, ACTION_COLOR,
} from "../components/ui";
import { POST_RETORNO, CHECKLIST, BEST_TIMES, ICPS } from "../data/static";
import { useApi } from "../hooks/useApi";

const DAY_NAMES = ["Domingo","Segunda","Terça","Quarta","Quinta","Sexta","Sábado"];

export default function Dashboard({ onLogout }) {
  const { call } = useApi();

  const [screen,      setScreen]      = useState("home");
  const [history,     setHistory]     = useState([POST_RETORNO]);
  const [checked,     setChecked]     = useState({});
  const [viewPost,    setViewPost]    = useState(null);
  const [activePost,  setActivePost]  = useState(null);
  const [activeSug,   setActiveSug]   = useState(null);

  // suggestions
  const [suggestions, setSuggestions] = useState(null);
  const [sugLoading,  setSugLoading]  = useState(false);
  const [sugError,    setSugError]    = useState("");

  // post generation
  const [postLoading, setPostLoading] = useState(false);
  const [postError,   setPostError]   = useState("");
  const [adjustment,  setAdjustment]  = useState("");
  const [adjLoading,  setAdjLoading]  = useState(false);

  // image validation
  const [imgResult,   setImgResult]   = useState(null);
  const [imgLoading,  setImgLoading]  = useState(false);

  // comments
  const [comment,     setComment]     = useState("");
  const [replies,     setReplies]     = useState(null);
  const [repLoading,  setRepLoading]  = useState(false);
  const [repError,    setRepError]    = useState("");

  // performance
  const [perfRows,    setPerfRows]    = useState([]);
  const [perfForm,    setPerfForm]    = useState({ date:"",followers:"",impressions:"",likes:"",comments:"",connections:"",note:"" });
  const [perfInsight, setPerfInsight] = useState("");
  const [perfLoading, setPerfLoading] = useState(false);
  const [perfError,   setPerfError]   = useState("");

  const dayName    = DAY_NAMES[new Date().getDay()];
  const todayTasks = CHECKLIST[dayName] || CHECKLIST["Quarta"];
  const doneToday  = todayTasks.filter((_, i) => checked[`${dayName}-${i}`]).length;

  // ── API CALLS ──────────────────────────────────────────────────────────────

  const loadSuggestions = async () => {
    setSugLoading(true); setSugError(""); setSuggestions(null);
    setScreen("suggestions");
    try {
      const data = await call("suggestions");
      setSuggestions(data.suggestions);
    } catch (e) {
      setSugError(e.message || "Erro ao carregar sugestões. Tente novamente.");
    }
    setSugLoading(false);
  };

  const generatePost = async (sug) => {
    setActiveSug(sug); setActivePost(null); setPostError(""); setImgResult(null);
    setPostLoading(true); setScreen("post");
    try {
      const data = await call("generate", { pillar: sug.pillar, hook: sug.hook, angle: sug.angle, best_time: sug.best_time });
      setActivePost(data);
    } catch (e) {
      setPostError(e.message || "Erro ao gerar post. Tente novamente.");
    }
    setPostLoading(false);
  };

  const applyAdjustment = async () => {
    if (!adjustment.trim() || !activePost) return;
    setAdjLoading(true);
    try {
      const data = await call("adjust", { ...activePost, adjustment });
      setActivePost(data);
      setAdjustment("");
    } catch (e) {
      alert(e.message || "Erro ao ajustar. Tente novamente.");
    }
    setAdjLoading(false);
  };

  const approvePost = () => {
    if (activePost && activeSug) {
      setHistory(prev => [{
        id: Date.now(), date: new Date().toLocaleDateString("pt-BR"),
        pillar: activeSug.pillar, hook: activeSug.hook, ...activePost,
      }, ...prev]);
    }
    setComment(""); setReplies(null);
    setScreen("comments");
  };

  const generateReplies = async () => {
    if (!comment.trim()) return;
    setRepLoading(true); setRepError(""); setReplies(null);
    try {
      const data = await call("replies", { comment, post_hook: activeSug?.hook || "" });
      setReplies(data.replies);
    } catch (e) {
      setRepError(e.message || "Erro ao gerar respostas. Tente novamente.");
    }
    setRepLoading(false);
  };

  const validateImage = (file) => {
    setImgLoading(true); setImgResult(null);
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const token = localStorage.getItem("lp_token");
        const res = await fetch("/api/claude", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            action: "validate_image",
            image_b64: e.target.result.split(",")[1],
            image_type: file.type || "image/jpeg",
            post_full: activePost?.post_full?.slice(0, 300) || "",
          }),
        });
        const data = await res.json();
        setImgResult(data.insight || data.error || "Sem resposta.");
      } catch { setImgResult("Erro ao analisar. Tente novamente."); }
      setImgLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const analyzePerf = async () => {
    if (perfRows.length === 0) return;
    setPerfLoading(true); setPerfError(""); setPerfInsight("");
    try {
      const data = await call("performance", { rows: perfRows });
      setPerfInsight(data.insight);
    } catch (e) {
      setPerfError(e.message || "Erro ao analisar. Tente novamente.");
    }
    setPerfLoading(false);
  };

  const savePerf = () => {
    if (!perfForm.date) return;
    setPerfRows(p => [...p, { ...perfForm, id: Date.now() }]);
    setPerfForm({ date:"",followers:"",impressions:"",likes:"",comments:"",connections:"",note:"" });
  };

  // ── NAV ────────────────────────────────────────────────────────────────────

  const navItems = [
    { id:"home",        label:"Início",       action: () => setScreen("home") },
    { id:"suggestions", label:"Novo Post",    action: loadSuggestions },
    { id:"checklist",   label:"Checklist",    action: () => setScreen("checklist") },
    { id:"icp",         label:"ICPs",         action: () => setScreen("icp") },
    { id:"comments",    label:"Comentários",  action: () => setScreen("comments") },
    { id:"performance", label:"Performance",  action: () => setScreen("performance") },
  ];

  // ── SCREENS ────────────────────────────────────────────────────────────────

  const HomeScreen = () => (
    <div className="fade-in">
      <div style={{ textAlign:"center", marginBottom:24 }}>
        <div style={{ fontSize:22, fontWeight:800, background:`linear-gradient(135deg,${C.text},${C.glow})`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
          LinkedIn Command Center
        </div>
        <div style={{ fontSize:12, color:C.muted, marginTop:4 }}>Willian Pimentel · CRO CULTSEC · 3 posts/semana</div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:20 }}>
        {[["1.5K","Conexões",C.glow],[`${doneToday}/${todayTasks.length}`,"Tarefas hoje",C.green],[`${history.length}`,"Posts criados",C.orange]].map(([n,l,col])=>(
          <Card key={l} style={{ textAlign:"center", padding:"14px 8px", marginBottom:0 }}>
            <div style={{ fontSize:22, fontWeight:800, color:col }}>{n}</div>
            <div style={{ fontSize:10, color:C.muted, marginTop:3, textTransform:"uppercase", letterSpacing:"0.5px" }}>{l}</div>
          </Card>
        ))}
      </div>

      <Btn onClick={loadSuggestions}>⚡ Gerar Sugestões de Post</Btn>
      <Btn onClick={() => setScreen("checklist")} variant="ghost">✅ Checklist de Hoje — {dayName}</Btn>
      <Btn onClick={() => setScreen("icp")} variant="ghost">🎯 ICPs para Interagir</Btn>
      <Btn onClick={() => { setComment(""); setReplies(null); setScreen("comments"); }} variant="ghost">💬 Responder Comentários</Btn>
      <Btn onClick={() => setScreen("performance")} variant="ghost">📊 Performance da Conta</Btn>

      <Card>
        <STitle>🕐 Melhores Horários para Postar</STitle>
        {BEST_TIMES.map(t => (
          <div key={t.day} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
            <div style={{ width:56, fontSize:12, fontWeight:700 }}>{t.day}</div>
            <Badge color={C.green}>{t.time}</Badge>
            <div style={{ flex:1, height:5, borderRadius:3, background:C.border, overflow:"hidden" }}>
              <div style={{ height:"100%", width:`${t.score}%`, background:`linear-gradient(90deg,${C.accent},${C.purple})`, borderRadius:3 }} />
            </div>
            <div style={{ fontSize:10, color:C.muted }}>{t.score}%</div>
          </div>
        ))}
      </Card>

      <Card highlight>
        <div style={{ fontSize:10, fontWeight:800, color:C.glow, textTransform:"uppercase", letterSpacing:"1px", marginBottom:10 }}>
          📌 Post de Reativação — Pronto para Publicar
        </div>
        <div style={{ fontSize:15, fontWeight:700, marginBottom:6 }}>{POST_RETORNO.hook}</div>
        <div style={{ fontSize:12, color:C.muted, marginBottom:14 }}>🕐 {POST_RETORNO.best_time} · {POST_RETORNO.pillar}</div>
        <button onClick={() => { setViewPost(POST_RETORNO); setScreen("viewpost"); }} style={{
          padding:"7px 16px", borderRadius:8, border:`1px solid ${C.accent}`,
          background:`${C.accent}20`, color:C.glow, fontSize:12, fontWeight:700,
        }}>
          Ver Post Completo →
        </button>
      </Card>

      {history.length > 0 && (
        <Card>
          <STitle>📋 Histórico de Posts</STitle>
          {history.map((item, i) => (
            <div key={i} onClick={() => { setViewPost(item); setScreen("viewpost"); }} style={{
              display:"flex", alignItems:"center", gap:12, padding:"10px 12px",
              borderRadius:10, background:C.surface, border:`1px solid ${C.border}`,
              marginBottom:8, cursor:"pointer",
            }}>
              <span style={{ fontSize:16 }}>{item.pillar?.[0] || "📝"}</span>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:600 }}>{item.hook}</div>
                <div style={{ fontSize:11, color:C.muted }}>{item.date || "Pendente"} · {item.pillar}</div>
              </div>
              <span style={{ color:C.muted }}>→</span>
            </div>
          ))}
        </Card>
      )}
    </div>
  );

  const SuggestionsScreen = () => (
    <div className="fade-in">
      <BackBtn onClick={() => setScreen("home")} />
      <div style={{ fontSize:20, fontWeight:800, marginBottom:4 }}>Sugestões da Semana</div>
      <div style={{ fontSize:13, color:C.muted, marginBottom:14 }}>Geradas com base em trends e hypes do momento.</div>
      <Btn onClick={loadSuggestions} disabled={sugLoading}>
        {sugLoading ? "Buscando..." : "🔄 Atualizar Sugestões"}
      </Btn>
      {sugLoading && <Loader text="Pesquisando trends e gerando sugestões..." />}
      <ErrorMsg>{sugError}</ErrorMsg>
      {!sugLoading && suggestions?.map((sug, i) => (
        <Card key={i}>
          <Badge color={PILLAR_COLOR[sug.pillar?.[0]] || C.accent}>{sug.pillar}</Badge>
          {" "}
          <Badge color={C.green} style={{ marginLeft:4 }}>🕐 {sug.best_time}</Badge>
          <div style={{ fontSize:16, fontWeight:700, margin:"10px 0 6px", lineHeight:1.4 }}>{sug.hook}</div>
          <div style={{ fontSize:12, color:C.subtle, marginBottom:4 }}>📰 {sug.rationale}</div>
          <div style={{ fontSize:12, color:C.glow, fontStyle:"italic", marginBottom:14 }}>💡 {sug.angle}</div>
          <button onClick={() => generatePost(sug)} style={{
            padding:"8px 18px", borderRadius:8, border:`1px solid ${C.accent}`,
            background:`${C.accent}20`, color:C.glow, fontSize:13, fontWeight:700,
          }}>
            Desenvolver este post →
          </button>
        </Card>
      ))}
    </div>
  );

  const PostScreen = () => (
    <div className="fade-in">
      <BackBtn onClick={() => setScreen("suggestions")} />
      {activeSug && (
        <div style={{ marginBottom:18 }}>
          <Badge color={PILLAR_COLOR[activeSug.pillar?.[0]] || C.accent}>{activeSug.pillar}</Badge>
          <div style={{ fontSize:17, fontWeight:700, marginTop:8 }}>{activeSug.hook}</div>
        </div>
      )}
      {postLoading && <Loader text="Gerando seu post completo..." />}
      <ErrorMsg>{postError}</ErrorMsg>
      {postError && (
        <Btn onClick={() => activeSug && generatePost(activeSug)}>🔄 Tentar Novamente</Btn>
      )}
      {!postLoading && !postError && activePost && (
        <>
          <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap" }}>
            <Badge color={C.green}>🕐 {activePost.best_time}</Badge>
            <Badge color={activePost.usa_imagem ? C.orange : C.green}>
              {activePost.usa_imagem ? "🖼 Com imagem" : "✍️ Texto puro — sem imagem"}
            </Badge>
          </div>

          <Card>
            <STitle>📝 Post Completo</STitle>
            <CopyBox value={activePost.post_full} id="pf" />
            <STitle>⚡ Versão Curta</STitle>
            <CopyBox value={activePost.post_short} id="ps" />
            <STitle>#️⃣ Hashtags — colar no 1º comentário, nunca no corpo do post</STitle>
            <CopyBox value={activePost.hashtags} id="ph" />
          </Card>

          {activePost.usa_imagem && activePost.image_prompt && (
            <Card>
              <STitle>🖼 Criação da Imagem</STitle>
              <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:12 }}>
                <Badge color={C.purple}>Ferramenta: {activePost.image_tool || "Ideogram.ai"}</Badge>
                <a href={activePost.image_tool === "Canva" ? "https://canva.com" : "https://ideogram.ai"}
                  target="_blank" rel="noopener noreferrer" style={{ fontSize:11 }}>
                  Abrir →
                </a>
              </div>
              <div style={{ fontSize:12, color:C.muted, marginBottom:6 }}>Cole este prompt na ferramenta:</div>
              <CopyBox value={activePost.image_prompt} id="ip" italic />
              <div style={{ height:1, background:C.border, margin:"16px 0" }} />
              <STitle>✅ Validar Imagem Gerada</STitle>
              <div style={{ fontSize:12, color:C.muted, marginBottom:10 }}>Gerou a imagem? Envie aqui e eu avalio.</div>
              <label style={{
                display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                padding:14, borderRadius:10, border:`2px dashed ${C.border}`,
                cursor:"pointer", color:C.muted, fontSize:13, background:C.surface,
              }}>
                📎 Enviar imagem para validação
                <input type="file" accept="image/*" style={{ display:"none" }}
                  onChange={e => e.target.files[0] && validateImage(e.target.files[0])} />
              </label>
              {imgLoading && <Loader text="Analisando imagem..." />}
              {imgResult && (
                <div style={{ marginTop:12, padding:14, borderRadius:10, background:`${C.accent}10`, border:`1px solid ${C.accent}33`, fontSize:13, lineHeight:1.7, whiteSpace:"pre-wrap" }}>
                  {imgResult}
                </div>
              )}
            </Card>
          )}

          <Card>
            <STitle>✏️ Solicitar Ajuste</STitle>
            <TextArea value={adjustment} onChange={e => setAdjustment(e.target.value)}
              placeholder="Ex: mais sarcástico na abertura, encurta o meio, adiciona uma pergunta no CTA..." />
            <Btn onClick={applyAdjustment} disabled={adjLoading || !adjustment.trim()} style={{ marginTop:10 }}>
              {adjLoading ? "Ajustando..." : "🔧 Aplicar Ajuste"}
            </Btn>
          </Card>

          <Btn onClick={approvePost} variant="success">✅ Aprovado — Salvar e Ir para Comentários</Btn>
        </>
      )}
    </div>
  );

  const ViewPostScreen = () => {
    const p = viewPost;
    if (!p) return null;
    return (
      <div className="fade-in">
        <BackBtn onClick={() => setScreen("home")} />
        {p.best_time && <div style={{ marginBottom:12 }}><Badge color={C.green}>🕐 {p.best_time}</Badge></div>}
        <Card>
          <STitle>📝 Post Completo</STitle>
          <CopyBox value={p.post_full} id="vf" />
          {p.post_short && <><STitle>⚡ Versão Curta</STitle><CopyBox value={p.post_short} id="vs" /></>}
          {p.hashtags   && <><STitle>#️⃣ Hashtags (1º comentário)</STitle><CopyBox value={p.hashtags} id="vh" /></>}
          {p.usa_imagem && p.image_prompt && (
            <><STitle>🖼 Prompt de Imagem — {p.image_tool}</STitle><CopyBox value={p.image_prompt} id="vi" italic /></>
          )}
        </Card>
      </div>
    );
  };

  const ChecklistScreen = () => (
    <div className="fade-in">
      <BackBtn onClick={() => setScreen("home")} />
      <div style={{ fontSize:20, fontWeight:800, marginBottom:4 }}>Checklist — {dayName}</div>
      <div style={{ fontSize:13, color:C.muted, marginBottom:8 }}>{doneToday} de {todayTasks.length} tarefas concluídas</div>
      <div style={{ height:5, borderRadius:3, background:C.border, marginBottom:20, overflow:"hidden" }}>
        <div style={{ height:"100%", width:`${todayTasks.length ? (doneToday/todayTasks.length)*100 : 0}%`, background:`linear-gradient(90deg,${C.accent},${C.green})`, borderRadius:3, transition:"width .4s" }} />
      </div>
      {todayTasks.map((task, i) => {
        const key = `${dayName}-${i}`, done = checked[key];
        return (
          <div key={i} onClick={() => setChecked(p => ({ ...p, [key]: !p[key] }))} style={{
            display:"flex", alignItems:"flex-start", gap:12, padding:"11px 14px",
            borderRadius:10, background: done ? `${C.green}08` : C.surface,
            border:`1px solid ${done ? C.green+"33" : C.border}`,
            marginBottom:8, cursor:"pointer", opacity: done ? 0.6 : 1,
          }}>
            <div style={{ width:20, height:20, borderRadius:6, border:`2px solid ${done ? C.green : C.border}`, background: done ? C.green : "transparent", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:1 }}>
              {done && <span style={{ color:"#fff", fontSize:10, fontWeight:800 }}>✓</span>}
            </div>
            <span style={{ fontSize:15 }}>{TYPE_ICON[task.type]}</span>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:11, color:TYPE_COLOR[task.type], fontWeight:700, marginBottom:2 }}>{task.time}</div>
              <div style={{ fontSize:13, color: done ? C.muted : C.text, textDecoration: done ? "line-through" : "none" }}>{task.task}</div>
            </div>
            <div style={{ width:6, height:6, borderRadius:"50%", background: task.priority==="alta" ? C.red : task.priority==="média" ? C.orange : C.muted, flexShrink:0, marginTop:6 }} />
          </div>
        );
      })}
    </div>
  );

  const ICPScreen = () => (
    <div className="fade-in">
      <BackBtn onClick={() => setScreen("home")} />
      <div style={{ fontSize:20, fontWeight:800, marginBottom:4 }}>ICPs para Interagir</div>
      <div style={{ fontSize:13, color:C.muted, marginBottom:20 }}>Priorize comentários antes de curtidas · Meta: 3 interações/dia</div>
      {ICPS.map((p, i) => (
        <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:12, padding:"14px 16px", borderRadius:12, background:C.surface, border:`1px solid ${C.border}`, marginBottom:10 }}>
          <div style={{ width:38, height:38, borderRadius:10, background:`${[C.accent,C.purple,C.green,C.orange,C.teal][p.name.charCodeAt(0)%5]}22`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:800, color:[C.accent,C.purple,C.green,C.orange,C.teal][p.name.charCodeAt(0)%5], flexShrink:0 }}>
            {p.name[0]}
          </div>
          <div style={{ flex:1 }}>
            <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap", marginBottom:3 }}>
              <span style={{ fontSize:14, fontWeight:700 }}>{p.name}</span>
              <Badge color={ACTION_COLOR[p.action] || C.accent}>{p.action}</Badge>
              <Badge color={p.region === "LATAM" ? C.orange : C.muted}>{p.region}</Badge>
            </div>
            <div style={{ fontSize:12, color:C.muted, marginBottom:3 }}>{p.role}</div>
            <div style={{ fontSize:12, color:C.subtle, marginBottom:6 }}>{p.why}</div>
            <a href={p.url} target="_blank" rel="noopener noreferrer" style={{ fontSize:11 }}>Abrir LinkedIn →</a>
          </div>
        </div>
      ))}
    </div>
  );

  const CommentsScreen = () => (
    <div className="fade-in">
      <BackBtn onClick={() => setScreen("home")} />
      <div style={{ fontSize:20, fontWeight:800, marginBottom:4 }}>Gestão de Comentários</div>
      <div style={{ fontSize:13, color:C.muted, marginBottom:20 }}>Cole o comentário e receba 3 opções de resposta no tom certo.</div>
      <Card>
        <STitle>💬 Comentário Recebido</STitle>
        <TextArea value={comment} onChange={e => setComment(e.target.value)} placeholder="Cole aqui o comentário do seu post..." minHeight={90} />
        <Btn onClick={generateReplies} disabled={repLoading || !comment.trim()} style={{ marginTop:10 }}>
          {repLoading ? "Gerando..." : "💡 Gerar 3 Opções de Resposta"}
        </Btn>
      </Card>
      {repLoading && <Loader text="Criando respostas estratégicas..." />}
      <ErrorMsg>{repError}</ErrorMsg>
      {replies && (
        <Card>
          <STitle>🎯 Opções de Resposta</STitle>
          {replies.map((r, i) => (
            <div key={i} style={{ position:"relative", background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, padding:14, marginBottom:10 }}>
              <div style={{ fontSize:10, fontWeight:800, color:C.glow, textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:7 }}>{r.tone}</div>
              <div style={{ fontSize:13, lineHeight:1.7, paddingRight:60 }}>{r.text}</div>
              <CopyBox value={r.text} id={`r${i}`} />
            </div>
          ))}
        </Card>
      )}
    </div>
  );

  const PerformanceScreen = () => (
    <div className="fade-in">
      <BackBtn onClick={() => setScreen("home")} />
      <div style={{ fontSize:20, fontWeight:800, marginBottom:4 }}>Performance da Conta</div>
      <div style={{ fontSize:13, color:C.muted, marginBottom:20 }}>Registre dados semanalmente. Analiso a evolução e ajusto a estratégia.</div>

      <Card>
        <STitle>➕ Registrar Semana</STitle>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
          {[["date","📅 Data","date",""],["followers","👥 Seguidores","number","ex: 1520"],["impressions","👁 Impressões","number","ex: 4800"],["likes","❤️ Curtidas","number","ex: 45"],["comments","💬 Comentários","number","ex: 12"],["connections","🤝 Novas conexões","number","ex: 18"]].map(([field, label, type, ph]) => (
            <div key={field}>
              <div style={{ fontSize:11, color:C.muted, marginBottom:4 }}>{label}</div>
              <input type={type} value={perfForm[field]} placeholder={ph}
                onChange={e => setPerfForm(p => ({ ...p, [field]: e.target.value }))} style={{
                  width:"100%", padding:"8px 12px", borderRadius:8,
                  border:`1px solid ${C.border}`, background:C.surface,
                  color:C.text, fontSize:13, boxSizing:"border-box",
                }} />
            </div>
          ))}
        </div>
        <div style={{ marginBottom:10 }}>
          <div style={{ fontSize:11, color:C.muted, marginBottom:4 }}>📝 Observação</div>
          <input type="text" value={perfForm.note} placeholder="Ex: post de terça teve alcance alto..."
            onChange={e => setPerfForm(p => ({ ...p, note: e.target.value }))} style={{
              width:"100%", padding:"8px 12px", borderRadius:8,
              border:`1px solid ${C.border}`, background:C.surface,
              color:C.text, fontSize:13, boxSizing:"border-box",
            }} />
        </div>
        <Btn onClick={savePerf} disabled={!perfForm.date}>💾 Salvar Registro</Btn>
      </Card>

      {perfRows.length > 0 && (
        <>
          <Card>
            <STitle>📈 Histórico</STitle>
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
                <thead>
                  <tr>{["Data","Seg.","Impr.","Curtidas","Coment.","Conex."].map(h => (
                    <th key={h} style={{ padding:"6px 10px", textAlign:"left", color:C.muted, fontWeight:700, borderBottom:`1px solid ${C.border}`, whiteSpace:"nowrap" }}>{h}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {perfRows.map((d, i) => (
                    <tr key={i}>{[d.date,d.followers,d.impressions,d.likes,d.comments,d.connections].map((v,j) => (
                      <td key={j} style={{ padding:"7px 10px", color: j===0 ? C.muted : C.text, borderBottom:`1px solid ${C.border}33`, fontWeight: j>0 ? "600" : "400" }}>{v||"–"}</td>
                    ))}</tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          <Btn onClick={analyzePerf} disabled={perfLoading}>
            {perfLoading ? "Analisando..." : "🤖 Analisar e Ajustar Estratégia"}
          </Btn>
          {perfLoading && <Loader text="Analisando seus dados..." />}
          <ErrorMsg>{perfError}</ErrorMsg>
          {perfInsight && (
            <Card highlight>
              <STitle>💡 Análise e Recomendações</STitle>
              <div style={{ fontSize:13, lineHeight:1.8, whiteSpace:"pre-wrap" }}>{perfInsight}</div>
            </Card>
          )}
        </>
      )}
      {perfRows.length === 0 && (
        <div style={{ textAlign:"center", padding:"30px", color:C.muted, fontSize:13 }}>
          Nenhum dado registrado ainda.<br />Registre os dados após publicar seu primeiro post.
        </div>
      )}
    </div>
  );

  // ── LAYOUT ─────────────────────────────────────────────────────────────────

  return (
    <div style={{ minHeight:"100vh", background:C.bg, color:C.text, fontFamily:"'DM Sans','Segoe UI',sans-serif" }}>
      {/* Header */}
      <div style={{ background:`linear-gradient(135deg,#0c1322,#162035)`, borderBottom:`1px solid ${C.border}`, padding:"12px 16px", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:34, height:34, borderRadius:9, background:`linear-gradient(135deg,${C.accent},${C.purple})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:15, fontWeight:800, color:"#fff" }}>W</div>
          <div>
            <div style={{ fontSize:14, fontWeight:700, lineHeight:1.2 }}>LinkedIn Manager</div>
            <div style={{ fontSize:10, color:C.muted }}>Willian Pimentel · CRO CULTSEC</div>
          </div>
        </div>
        <div style={{ display:"flex", gap:4, flexWrap:"wrap", alignItems:"center" }}>
          {navItems.map(item => (
            <button key={item.id} onClick={item.action} style={{
              padding:"5px 10px", borderRadius:7,
              border: screen===item.id ? `1px solid ${C.accent}` : "1px solid transparent",
              background: screen===item.id ? `${C.accent}22` : "transparent",
              color: screen===item.id ? C.glow : C.muted,
              fontSize:11, fontWeight:600,
            }}>
              {item.label}
            </button>
          ))}
          <button onClick={onLogout} style={{ padding:"5px 10px", borderRadius:7, border:`1px solid ${C.border}`, background:"transparent", color:C.muted, fontSize:11, marginLeft:4 }}>
            Sair
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth:800, margin:"0 auto", padding:"24px 16px" }}>
        {screen === "home"        && <HomeScreen />}
        {screen === "suggestions" && <SuggestionsScreen />}
        {screen === "post"        && <PostScreen />}
        {screen === "viewpost"    && <ViewPostScreen />}
        {screen === "checklist"   && <ChecklistScreen />}
        {screen === "icp"         && <ICPScreen />}
        {screen === "comments"    && <CommentsScreen />}
        {screen === "performance" && <PerformanceScreen />}
      </div>
    </div>
  );
}
