/* Test flow actualizado — guarda progreso real en localStorage */

function TestSetup({ banco, navigate, pendingMode }) {
  const [mode, setMode] = React.useState(pendingMode || "tema");
  const defaultTema = banco.comun[0]?.id || banco.especifico[0]?.id;
  const [selectedTema, setSelectedTema] = React.useState(defaultTema);
  const [bloque, setBloque] = React.useState("comun");
  const [numPreguntas, setNumPreguntas] = React.useState(20);
  const [feedback, setFeedback] = React.useState("inmediato");

  const MODES = [
    { id: "tema", label: "Test por tema", desc: "Un tema específico. Ideal para consolidar." },
    { id: "aleatorio", label: "Aleatorio multi-tema", desc: "Mezcla de varios temas de un bloque." },
    { id: "simulacro", label: "Simulacro de examen", desc: "100 preguntas · 120 min · corrección al final." },
    { id: "repaso", label: "Modo repaso", desc: "Solo preguntas que fallaste o marcaste." },
  ];

  const start = () => {
    const config = { mode, feedback };
    if (mode === "tema") config.temaId = selectedTema;
    if (mode === "aleatorio") { config.bloqueId = bloque; config.numPreguntas = numPreguntas; }
    if (mode === "simulacro") { config.numPreguntas = 100; config.feedback = "final"; config.tiempo = 120 * 60; }
    if (mode === "repaso") { config.numPreguntas = numPreguntas; }
    navigate({ view: "test-run", config });
  };

  return (
    <div className="test-shell">
      <div className="back-link" onClick={() => navigate({ view: "dashboard" })}>← Volver</div>
      <div className="eyebrow">Configurar test</div>
      <h1 style={{ marginTop: 10, marginBottom: 24 }}>¿Qué quieres practicar?</h1>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 28 }}>
        {MODES.map((m) => (
          <button
            key={m.id}
            className="quick-action"
            style={{
              minHeight: 0,
              flexDirection: "row",
              alignItems: "center",
              gap: 16,
              borderColor: mode === m.id ? "var(--accent)" : "var(--border)",
              background: mode === m.id ? "var(--accent-dim)" : "var(--bg-elev)",
            }}
            onClick={() => setMode(m.id)}
          >
            <div style={{
              width: 18, height: 18, borderRadius: "50%",
              border: "1px solid var(--border-strong)",
              background: mode === m.id ? "var(--accent)" : "transparent",
              flexShrink: 0,
            }} />
            <div style={{ flex: 1, textAlign: "left" }}>
              <div className="qa-title" style={{ fontSize: 15 }}>{m.label}</div>
              <div className="qa-desc" style={{ marginTop: 2 }}>{m.desc}</div>
            </div>
          </button>
        ))}
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="eyebrow" style={{ marginBottom: 12 }}>Parámetros</div>

        {mode === "tema" && (
          <SelectField label="Tema">
            <select value={selectedTema} onChange={(e) => setSelectedTema(e.target.value)}>
              <optgroup label="Parte común">
                {banco.comun.map((t) => (
                  <option key={t.id} value={t.id}>
                    T{String(t.numero).padStart(2,"0")} — {t.titulo.substring(0, 80)} ({t.preguntas.length})
                  </option>
                ))}
              </optgroup>
              <optgroup label="Parte específica">
                {banco.especifico.map((t) => (
                  <option key={t.id} value={t.id}>
                    T{String(t.numero).padStart(2,"0")} — {t.titulo.substring(0, 80)} ({t.preguntas.length})
                  </option>
                ))}
              </optgroup>
            </select>
          </SelectField>
        )}

        {mode === "aleatorio" && (
          <React.Fragment>
            <SelectField label="Bloque">
              <select value={bloque} onChange={(e) => setBloque(e.target.value)}>
                <option value="comun">Parte común ({banco.comun.length} temas)</option>
                <option value="especifico">Parte específica ({banco.especifico.length} temas)</option>
                <option value="todos">Todos los temas</option>
              </select>
            </SelectField>
            <SelectField label="Nº preguntas">
              <select value={numPreguntas} onChange={(e) => setNumPreguntas(Number(e.target.value))}>
                {[10, 20, 30, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </SelectField>
          </React.Fragment>
        )}

        {mode === "repaso" && (
          <SelectField label="Nº preguntas">
            <select value={numPreguntas} onChange={(e) => setNumPreguntas(Number(e.target.value))}>
              {[10, 15, 20, 30, 50].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </SelectField>
        )}

        {mode !== "simulacro" && (
          <SelectField label="Corrección">
            <select value={feedback} onChange={(e) => setFeedback(e.target.value)}>
              <option value="inmediato">Inmediata</option>
              <option value="final">Al final del test</option>
            </select>
          </SelectField>
        )}

        {mode === "simulacro" && (
          <div style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.55 }}>
            100 preguntas · 120 minutos · corrección al final. Formato idéntico al examen oficial.
          </div>
        )}
      </div>

      <button className="btn primary" style={{ padding: "12px 20px" }} onClick={start}>
        Empezar test →
      </button>
    </div>
  );
}

function SelectField({ label, children }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: 14, padding: "10px 0", alignItems: "center", borderBottom: "1px solid var(--border)" }}>
      <label className="eyebrow">{label}</label>
      <div style={{
        background: "var(--bg-elev-2)", borderRadius: 6, padding: "6px 10px",
        border: "1px solid var(--border)",
      }}>
        {React.cloneElement(React.Children.only(children), {
          style: {
            width: "100%", background: "transparent", border: "none", outline: "none",
            color: "var(--text)", fontFamily: "inherit", fontSize: 13,
          }
        })}
      </div>
    </div>
  );
}

function TestRun({ banco, progreso, setProgreso, config, navigate, tweaks }) {
  const preguntas = React.useMemo(() => construirPreguntas(banco, progreso, config), []);
  const [idx, setIdx] = React.useState(0);
  const [respuestas, setRespuestas] = React.useState({});
  const [mostrarFeedback, setMostrarFeedback] = React.useState(false);
  const [tiempoRestante, setTiempoRestante] = React.useState(config.tiempo || 0);
  const [finalizado, setFinalizado] = React.useState(false);
  const [yaRegistradas, setYaRegistradas] = React.useState({});

  React.useEffect(() => {
    if (!config.tiempo) return;
    const i = setInterval(() => {
      setTiempoRestante((t) => {
        if (t <= 1) { clearInterval(i); setFinalizado(true); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(i);
  }, []);

  if (preguntas.length === 0) {
    return (
      <div className="test-shell">
        <div className="back-link" onClick={() => navigate({ view: "dashboard" })}>← Volver</div>
        <div className="empty" style={{ marginTop: 40 }}>
          No hay preguntas disponibles para este modo.<br/>
          {config.mode === "repaso" && "Responde algún test primero para tener preguntas que repasar."}
        </div>
      </div>
    );
  }

  const preguntaActual = preguntas[idx];
  const seleccion = respuestas[preguntaActual.id];
  const respondida = seleccion !== undefined;
  const esCorrecta = seleccion === preguntaActual.correcta;
  const feedbackInmediato = (config.feedback || "inmediato") === "inmediato";

  if (finalizado) {
    // Registrar respuestas no registradas aún
    let prog = progreso;
    preguntas.forEach((q) => {
      const sel = respuestas[q.id];
      if (sel === undefined) return;
      if (yaRegistradas[q.id]) return;
      prog = window.registrarRespuesta(prog, q.temaId, q.id, sel === q.correcta);
    });
    if (prog !== progreso) setProgreso(prog);
    return <TestResults
      preguntas={preguntas}
      respuestas={respuestas}
      banco={banco}
      progreso={prog}
      setProgreso={setProgreso}
      navigate={navigate}
    />;
  }

  const responder = (opcionIdx) => {
    if (respondida && feedbackInmediato) return;
    setRespuestas({ ...respuestas, [preguntaActual.id]: opcionIdx });
    if (feedbackInmediato) {
      setMostrarFeedback(true);
      if (!yaRegistradas[preguntaActual.id]) {
        const prog = window.registrarRespuesta(
          progreso,
          preguntaActual.temaId,
          preguntaActual.id,
          opcionIdx === preguntaActual.correcta,
        );
        setProgreso(prog);
        setYaRegistradas({ ...yaRegistradas, [preguntaActual.id]: true });
      }
    }
  };

  const siguiente = () => {
    setMostrarFeedback(false);
    if (idx < preguntas.length - 1) setIdx(idx + 1);
    else setFinalizado(true);
  };

  const toggleMarca = () => {
    const prog = window.toggleMarcada(progreso, preguntaActual.temaId, preguntaActual.id);
    setProgreso(prog);
  };

  const fmtTime = (s) => {
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${String(m).padStart(2,"0")}:${String(r).padStart(2,"0")}`;
  };

  const respondidas = Object.keys(respuestas).length;
  const pctProgreso = Math.round((respondidas / preguntas.length) * 100);

  const modoLabel = {
    tema: "Test por tema",
    aleatorio: "Test aleatorio",
    simulacro: "Simulacro de examen",
    repaso: "Modo repaso",
    rapido: "Test rápido",
    bloque: config.bloqueId === "comun" ? "Test parte común" : "Test parte específica",
    "tema-flash": "Repaso rápido",
  }[config.mode] || "Test";

  const marcada = progreso[preguntaActual.temaId]?.marcadas?.[preguntaActual.id];

  return (
    <div className="test-shell">
      <div className="test-header">
        <div className="left">
          <h2>{modoLabel}</h2>
          <div className="sub">Pregunta {idx + 1} / {preguntas.length} · {respondidas} respondidas</div>
        </div>
        <div className="right">
          {config.tiempo && (
            <div className={`timer ${tiempoRestante < 300 ? "warning" : ""}`}>{fmtTime(tiempoRestante)}</div>
          )}
          <button className="btn btn-sm" onClick={() => {
            if (confirm("¿Finalizar el test ahora?")) setFinalizado(true);
          }}>Finalizar</button>
        </div>
      </div>

      <div className="q-progress">
        <div className="fill" style={{ width: `${pctProgreso}%` }} />
      </div>

      <div className="q-card" data-card-style={tweaks.cardStyle || "card"}>
        <div className="q-number">
          Pregunta {String(idx + 1).padStart(2, "0")}
          {preguntaActual.procedencia && ` · ${preguntaActual.procedencia}`}
        </div>
        <div className="q-text">{preguntaActual.enunciado}</div>

        <div className="q-options">
          {preguntaActual.opciones.map((op, i) => {
            const letters = ["A", "B", "C", "D"];
            let cls = "q-option";
            const mostrandoCorreccion = feedbackInmediato && respondida && mostrarFeedback;
            if (mostrandoCorreccion) {
              if (i === preguntaActual.correcta) cls += " correct";
              else if (i === seleccion) cls += " wrong";
            } else if (seleccion === i) {
              cls += " selected";
            }
            return (
              <button
                key={i}
                className={cls}
                disabled={mostrandoCorreccion}
                onClick={() => responder(i)}
              >
                <span className="letter">{letters[i]}</span>
                <span>{op}</span>
              </button>
            );
          })}
        </div>

        {feedbackInmediato && respondida && mostrarFeedback && (
          <div className="q-explanation">
            <strong>{esCorrecta ? "Correcto." : "Incorrecto."}</strong>{" "}
            La respuesta correcta es{" "}
            <strong>{["A","B","C","D"][preguntaActual.correcta]}</strong>
            {preguntaActual.procedencia && ` · Fuente: ${preguntaActual.procedencia}`}.
          </div>
        )}
      </div>

      <div className="q-actions">
        <button className="btn btn-sm ghost" onClick={toggleMarca}>
          <span style={{ color: marcada ? "var(--accent)" : "var(--text-mute)" }}>●</span>
          {marcada ? "Marcada para revisar" : "Marcar para revisar"}
        </button>
        <div style={{ display: "flex", gap: 8 }}>
          {idx > 0 && (
            <button className="btn" onClick={() => { setIdx(idx - 1); setMostrarFeedback(false); }}>
              ← Anterior
            </button>
          )}
          <button
            className="btn primary"
            disabled={!respondida && feedbackInmediato}
            style={!respondida && feedbackInmediato ? { opacity: 0.4 } : {}}
            onClick={siguiente}
          >
            {idx === preguntas.length - 1 ? "Terminar" : "Siguiente →"}
          </button>
        </div>
      </div>
    </div>
  );
}

function construirPreguntas(banco, progreso, config) {
  const todosT = [...banco.comun, ...banco.especifico];
  const pregsConTema = (temas) =>
    temas.flatMap(t => t.preguntas.map(q => ({ ...q, temaId: t.id, temaNumero: t.numero, temaTitulo: t.titulo })));

  if (config.mode === "tema" || config.mode === "tema-flash") {
    const tema = todosT.find((t) => t.id === config.temaId);
    if (!tema) return [];
    const pool = tema.preguntas.map(q => ({ ...q, temaId: tema.id, temaNumero: tema.numero, temaTitulo: tema.titulo }));
    const base = window.shuffle(pool);
    return config.mode === "tema-flash" ? base.slice(0, 5) : base;
  }
  if (config.mode === "aleatorio" || config.mode === "bloque") {
    const lb = config.bloqueId || "todos";
    let pool = [];
    if (lb === "comun") pool = pregsConTema(banco.comun);
    else if (lb === "especifico") pool = pregsConTema(banco.especifico);
    else pool = pregsConTema(todosT);
    return window.shuffle(pool).slice(0, config.numPreguntas || 20);
  }
  if (config.mode === "rapido") {
    return window.shuffle(pregsConTema(todosT)).slice(0, 10);
  }
  if (config.mode === "simulacro") {
    return window.shuffle(pregsConTema(todosT)).slice(0, 100);
  }
  if (config.mode === "repaso") {
    // Preguntas actualmente falladas o marcadas
    const pids = new Set();
    Object.values(progreso).forEach((p) => {
      Object.keys(p.falladas || {}).forEach((pid) => pids.add(pid));
      Object.keys(p.marcadas || {}).forEach((pid) => pids.add(pid));
    });
    if (pids.size === 0) return [];
    const pool = pregsConTema(todosT).filter(q => pids.has(q.id));
    return window.shuffle(pool).slice(0, config.numPreguntas || 15);
  }
  return [];
}

function TestResults({ preguntas, respuestas, banco, progreso, setProgreso, navigate }) {
  const total = preguntas.length;
  const correctas = preguntas.filter(q => respuestas[q.id] === q.correcta).length;
  const incorrectas = preguntas.filter(q => respuestas[q.id] !== undefined && respuestas[q.id] !== q.correcta).length;
  const sinResponder = total - correctas - incorrectas;
  const pct = Math.round((correctas / total) * 100);

  const porTema = {};
  preguntas.forEach(q => {
    if (!porTema[q.temaId]) porTema[q.temaId] = { correctas: 0, total: 0, titulo: q.temaTitulo, numero: q.temaNumero };
    porTema[q.temaId].total++;
    if (respuestas[q.id] === q.correcta) porTema[q.temaId].correctas++;
  });

  return (
    <div className="test-shell">
      <div className="results-hero">
        <div className="eyebrow">Resultado del test</div>
        <div className="score mono" style={{ marginTop: 14 }}>
          {correctas}<span className="of">/{total}</span>
        </div>
        <div className="pct">{pct}% de aciertos</div>
        <div className="label">
          {pct >= 80 ? "Excelente — tema afianzado." :
           pct >= 60 ? "Buen nivel, sigue repasando." :
           pct >= 40 ? "Nivel medio. Merece más práctica." :
           "Necesita más estudio — añade este tema a tu próxima sesión."}
        </div>
      </div>

      <div className="results-grid">
        <div className="stat">
          <div className="label">Correctas</div>
          <div className="val mono" style={{ color: "var(--ok)" }}>{correctas}</div>
        </div>
        <div className="stat">
          <div className="label">Incorrectas</div>
          <div className="val mono" style={{ color: "var(--bad)" }}>{incorrectas}</div>
        </div>
        <div className="stat">
          <div className="label">Sin responder</div>
          <div className="val mono">{sinResponder}</div>
        </div>
        <div className="stat">
          <div className="label">Temas tocados</div>
          <div className="val mono">{Object.keys(porTema).length}</div>
        </div>
      </div>

      {Object.keys(porTema).length > 1 && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="eyebrow" style={{ marginBottom: 14 }}>Resultados por tema</div>
          <div className="distribution">
            {Object.values(porTema).map((pt, i) => {
              const p = Math.round((pt.correctas / pt.total) * 100);
              return (
                <div key={i} className="dist-row">
                  <div style={{ fontSize: 12, color: "var(--text-dim)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    T{String(pt.numero).padStart(2,"0")} — {pt.titulo}
                  </div>
                  <div className="bar">
                    <div className="fill" style={{
                      width: `${p}%`,
                      background: p >= 70 ? "var(--ok)" : p >= 40 ? "var(--accent)" : "var(--bad)",
                    }} />
                  </div>
                  <div className="count">{pt.correctas}/{pt.total}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="card">
        <div className="eyebrow" style={{ marginBottom: 14 }}>Revisión pregunta a pregunta</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {preguntas.map((q, i) => {
            const sel = respuestas[q.id];
            const ok = sel === q.correcta;
            const sinResp = sel === undefined;
            return (
              <div key={q.id} style={{
                padding: 14,
                border: "1px solid var(--border)",
                borderLeft: `3px solid ${sinResp ? "var(--text-mute)" : ok ? "var(--ok)" : "var(--bad)"}`,
                borderRadius: 4,
              }}>
                <div style={{ display: "flex", gap: 10, alignItems: "baseline", marginBottom: 8 }}>
                  <span className="mono" style={{ fontSize: 11, color: "var(--text-mute)" }}>{String(i + 1).padStart(2, "0")}</span>
                  <span style={{ fontSize: 13, flex: 1 }}>{q.enunciado}</span>
                </div>
                <div style={{ fontSize: 12, color: "var(--text-dim)", paddingLeft: 28, marginTop: 6 }}>
                  <div>
                    <span style={{ color: "var(--text-mute)" }}>Correcta:</span>{" "}
                    <span style={{ color: "var(--ok)" }}>{["A","B","C","D"][q.correcta]} — {q.opciones[q.correcta]}</span>
                  </div>
                  {!sinResp && !ok && (
                    <div style={{ marginTop: 2 }}>
                      <span style={{ color: "var(--text-mute)" }}>Tu respuesta:</span>{" "}
                      <span style={{ color: "var(--bad)" }}>{["A","B","C","D"][sel]} — {q.opciones[sel]}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="q-actions" style={{ marginTop: 28 }}>
        <button className="btn" onClick={() => navigate({ view: "dashboard" })}>← Volver al dashboard</button>
        <button className="btn primary" onClick={() => navigate({ view: "setup-test" })}>Otro test →</button>
      </div>
    </div>
  );
}

Object.assign(window, { TestSetup, TestRun, TestResults });
