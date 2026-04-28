/* Listado de temas + detalle por tema */

function TemasView({ banco, progreso, tweaks, navigate, initialBloque }) {
  const [bloque, setBloque] = React.useState(initialBloque || "comun");
  const [layout, setLayout] = React.useState(tweaks.dashLayout || "grid");
  const [query, setQuery] = React.useState("");
  const [filtro, setFiltro] = React.useState("todos");

  const lista = bloque === "comun" ? banco.comun : banco.especifico;

  const filtrados = lista.filter((t) => {
    const p = progreso[t.id];
    const matchesQuery = !query ||
      t.titulo.toLowerCase().includes(query.toLowerCase()) ||
      String(t.numero).includes(query);
    const matchesFiltro = filtro === "todos" || p.status === filtro;
    return matchesQuery && matchesFiltro;
  });

  return (
    <div>
      <div className="temas-toolbar">
        <div className="left">
          <div className="segmented">
            <button className={bloque === "comun" ? "active" : ""} onClick={() => setBloque("comun")}>
              Parte común · {banco.comun.length}
            </button>
            <button className={bloque === "especifico" ? "active" : ""} onClick={() => setBloque("especifico")}>
              Parte específica · {banco.especifico.length}
            </button>
          </div>
          <div className="segmented">
            {["todos", "pendiente", "en_curso", "afianzado", "revisar"].map((f) => (
              <button key={f} className={filtro === f ? "active" : ""} onClick={() => setFiltro(f)}>
                {f === "todos" ? "Todos" : f.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>
        <div className="row-flex" style={{ gap: 8 }}>
          <div className="search">
            <span className="prefix">/</span>
            <input placeholder="Buscar por título o número" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <div className="segmented">
            <button className={layout === "grid" ? "active" : ""} onClick={() => setLayout("grid")}>Cuadrícula</button>
            <button className={layout === "list" ? "active" : ""} onClick={() => setLayout("list")}>Lista</button>
          </div>
        </div>
      </div>

      {filtrados.length === 0 ? (
        <div className="empty">Sin temas que coincidan con el filtro.</div>
      ) : layout === "grid" ? (
        <div className="temas-grid" data-density={tweaks.density}>
          {filtrados.map((t) => (
            <TemaCard key={t.id} tema={t} progreso={progreso[t.id]} navigate={navigate} />
          ))}
        </div>
      ) : (
        <div className="temas-list">
          <div className="row header">
            <div>Nº</div>
            <div>Tema</div>
            <div className="hide-mobile">Estado</div>
            <div className="hide-mobile">Aciertos</div>
            <div>Acción</div>
          </div>
          {filtrados.map((t) => {
            const p = progreso[t.id];
            const pct = p.intentos > 0 ? Math.round((p.aciertos / p.intentos) * 100) : 0;
            return (
              <div key={t.id} className="row" onClick={() => navigate({ view: "tema-detail", temaId: t.id })}>
                <div className="num">{String(t.numero).padStart(2, "0")}</div>
                <div className="title">{t.titulo}</div>
                <div className="cell hide-mobile">
                  <span className={`badge ${p.status}`}>{p.status.replace("_", " ")}</span>
                </div>
                <div className="cell hide-mobile">
                  {p.intentos > 0 ? `${pct}% · ${p.aciertos}/${p.intentos}` : "—"}
                </div>
                <div className="cell">
                  <button className="btn btn-sm" onClick={(e) => {
                    e.stopPropagation();
                    navigate({ view: "test", mode: "tema", temaId: t.id });
                  }}>Hacer test →</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function TemaCard({ tema, progreso, navigate }) {
  const pct = progreso.intentos > 0 ? Math.round((progreso.aciertos / progreso.intentos) * 100) : null;
  return (
    <div className="tema-card" onClick={() => navigate({ view: "tema-detail", temaId: tema.id })}>
      <div className="row-flex" style={{ justifyContent: "space-between" }}>
        <span className="num">T{String(tema.numero).padStart(2, "0")}</span>
        <span className={`badge ${progreso.status}`}>{progreso.status.replace("_", " ")}</span>
      </div>
      <div className="t-title">{tema.titulo}</div>
      <div className="meta-row">
        <span>{tema.preguntas.length} preguntas</span>
        <span>{pct != null ? `${pct}%` : "sin datos"}</span>
      </div>
    </div>
  );
}

function TemaDetail({ tema, progreso, navigate }) {
  const pct = progreso.intentos > 0 ? Math.round((progreso.aciertos / progreso.intentos) * 100) : 0;
  const ultimaStr = progreso.ultimaRevision
    ? new Date(progreso.ultimaRevision).toLocaleDateString("es-ES", { day: "numeric", month: "short" })
    : "nunca";
  const nMarcadas = Object.keys(progreso.marcadas || {}).length;
  const nFalladas = Object.keys(progreso.falladas || {}).length;

  return (
    <div>
      <div className="back-link" onClick={() => navigate({ view: "temas", bloque: tema.bloqueId })}>← Volver al temario</div>
      <div className="tema-detail">
        <div>
          <div className="eyebrow">
            Tema {tema.numero} · {tema.bloqueId === "comun" ? "Parte común" : "Parte específica"}
          </div>
          <h1 style={{ marginTop: 10, marginBottom: 16, maxWidth: 640 }}>{tema.titulo}</h1>
          <div className="row-flex" style={{ gap: 8, marginBottom: 28, flexWrap: "wrap" }}>
            <button className="btn primary" onClick={() => navigate({ view: "test", mode: "tema", temaId: tema.id })}>
              Hacer test completo ({tema.preguntas.length}) →
            </button>
            <button className="btn" onClick={() => navigate({ view: "test", mode: "tema-flash", temaId: tema.id })}>
              Repaso rápido (5)
            </button>
          </div>

          <div className="card">
            <div className="eyebrow" style={{ marginBottom: 10 }}>Preguntas del tema ({tema.preguntas.length})</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 480, overflowY: "auto" }}>
              {tema.preguntas.map((q, i) => {
                const r = progreso.preguntasRespondidas?.[q.id];
                const marcada = progreso.marcadas?.[q.id];
                const color = marcada ? "var(--accent)" : r ? (r.correcta ? "var(--ok)" : "var(--bad)") : "var(--text-mute)";
                return (
                  <div key={q.id} style={{
                    padding: "10px 12px", borderRadius: "6px",
                    border: "1px solid var(--border)",
                    borderLeft: `3px solid ${color}`,
                    fontSize: 13, color: "var(--text-dim)",
                    display: "flex", gap: 10,
                  }}>
                    <span className="mono" style={{ color: "var(--text-mute)", minWidth: 24 }}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span style={{ flex: 1 }}>{q.enunciado}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <aside style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="stat">
            <div className="label">Estado</div>
            <div className="val mono" style={{ fontSize: 18, marginTop: 6 }}>
              <span className={`badge ${progreso.status}`}>{progreso.status.replace("_", " ")}</span>
            </div>
          </div>
          <div className="stat">
            <div className="label">Aciertos</div>
            <div className="val mono">{pct}<span className="unit">%</span></div>
            <div className="sub">{progreso.aciertos} / {progreso.intentos || 0} respondidas</div>
          </div>
          <div className="stat">
            <div className="label">Última revisión</div>
            <div className="val mono" style={{ fontSize: 18 }}>{ultimaStr}</div>
            <div className="sub">
              {progreso.ultimaRevision
                ? `hace ${Math.floor((Date.now() - progreso.ultimaRevision) / 86400000)} días`
                : "pendiente de iniciar"}
            </div>
          </div>
          <div className="stat">
            <div className="label">Marcadas</div>
            <div className="val mono">{nMarcadas}</div>
            <div className="sub">{nFalladas} falladas pendientes</div>
          </div>
        </aside>
      </div>
    </div>
  );
}

Object.assign(window, { TemasView, TemaCard, TemaDetail });
