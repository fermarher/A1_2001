/* Estadísticas — basadas en progreso real */

function StatsView({ banco, progreso, navigate }) {
  const todosT = [...banco.comun, ...banco.especifico];
  const estudiados = todosT.filter((t) => progreso[t.id].intentos > 0);
  const totalIntentos = todosT.reduce((s, t) => s + progreso[t.id].intentos, 0);
  const totalAciertos = todosT.reduce((s, t) => s + progreso[t.id].aciertos, 0);
  const pctGlobal = totalIntentos > 0 ? Math.round((totalAciertos / totalIntentos) * 100) : 0;

  const dist = {
    pendiente: todosT.filter((t) => progreso[t.id].status === "pendiente").length,
    en_curso: todosT.filter((t) => progreso[t.id].status === "en_curso").length,
    afianzado: todosT.filter((t) => progreso[t.id].status === "afianzado").length,
    revisar: todosT.filter((t) => progreso[t.id].status === "revisar").length,
  };

  const peores = [...todosT]
    .filter((t) => progreso[t.id].intentos > 0)
    .sort((a, b) => (progreso[a.id].aciertos / progreso[a.id].intentos) - (progreso[b.id].aciertos / progreso[b.id].intentos))
    .slice(0, 8);

  const totalMarcadas = Object.values(progreso).reduce((s, p) => s + Object.keys(p.marcadas || {}).length, 0);
  const totalFalladas = Object.values(progreso).reduce((s, p) => s + Object.keys(p.falladas || {}).length, 0);

  return (
    <div>
      <div className="back-link" onClick={() => navigate({ view: "dashboard" })}>← Volver</div>
      <div className="eyebrow">Estadísticas</div>
      <h1 style={{ marginTop: 10, marginBottom: 24 }}>Tu evolución</h1>

      <div className="hero-stats" style={{ gridTemplateColumns: "repeat(4, 1fr)", marginBottom: 24 }}>
        <div className="stat">
          <div className="label">Temas iniciados</div>
          <div className="val mono">{estudiados.length}<span className="unit">/{todosT.length}</span></div>
          <div className="sub">{Math.round((estudiados.length / todosT.length) * 100)}% del temario</div>
        </div>
        <div className="stat">
          <div className="label">Preguntas respondidas</div>
          <div className="val mono">{totalIntentos}</div>
          <div className="sub">acumulado histórico</div>
        </div>
        <div className="stat">
          <div className="label">Aciertos medios</div>
          <div className="val mono">{pctGlobal}<span className="unit">%</span></div>
          <div className="sub">{totalAciertos} correctas</div>
        </div>
        <div className="stat">
          <div className="label">Para repasar</div>
          <div className="val mono">{totalFalladas + totalMarcadas}</div>
          <div className="sub">{totalFalladas} falladas · {totalMarcadas} marcadas</div>
        </div>
      </div>

      <div className="stats-layout">
        <div className="card">
          <div className="eyebrow" style={{ marginBottom: 10 }}>Distribución del temario</div>
          <div className="distribution">
            {[
              { key: "afianzado", label: "Afianzados", color: "var(--ok)" },
              { key: "en_curso", label: "En curso", color: "var(--accent)" },
              { key: "revisar", label: "Para revisar", color: "var(--bad)" },
              { key: "pendiente", label: "Pendientes", color: "var(--border-strong)" },
            ].map((row) => {
              const pct = Math.round((dist[row.key] / todosT.length) * 100);
              return (
                <div key={row.key} className="dist-row">
                  <div style={{ fontSize: 12, color: "var(--text-dim)" }}>{row.label}</div>
                  <div className="bar">
                    <div className="fill" style={{ width: `${pct}%`, background: row.color }} />
                  </div>
                  <div className="count">{dist[row.key]}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          <div className="eyebrow" style={{ marginBottom: 10 }}>Aciertos por bloque</div>
          <div className="distribution">
            {[
              { lista: banco.comun, label: "Parte común" },
              { lista: banco.especifico, label: "Parte específica" },
            ].map((b, i) => {
              const int = b.lista.reduce((s, t) => s + progreso[t.id].intentos, 0);
              const ac = b.lista.reduce((s, t) => s + progreso[t.id].aciertos, 0);
              const pct = int > 0 ? Math.round((ac / int) * 100) : 0;
              return (
                <div key={i} className="dist-row">
                  <div style={{ fontSize: 12, color: "var(--text-dim)" }}>{b.label}</div>
                  <div className="bar">
                    <div className="fill" style={{ width: `${pct}%`, background: pct >= 70 ? "var(--ok)" : pct >= 40 ? "var(--accent)" : "var(--bad)" }} />
                  </div>
                  <div className="count">{pct}%</div>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 16, fontSize: 12, color: "var(--text-mute)", lineHeight: 1.55 }}>
            Haz tests para ver aquí tu evolución. Cada respuesta actualiza el aciertos por bloque y el estado del tema.
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <div className="eyebrow" style={{ marginBottom: 14 }}>Temas a priorizar</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {peores.length === 0 ? (
            <div style={{ fontSize: 13, color: "var(--text-mute)" }}>
              Aún no hay suficientes datos. Haz algún test y vuelve aquí.
            </div>
          ) : peores.map((t) => {
            const p = progreso[t.id];
            const pct = Math.round((p.aciertos / p.intentos) * 100);
            return (
              <div key={t.id} className="dist-row"
                style={{ gridTemplateColumns: "40px 1fr 80px 110px", cursor: "pointer" }}
                onClick={() => navigate({ view: "tema-detail", temaId: t.id })}>
                <span className="mono" style={{ fontSize: 11, color: "var(--text-mute)" }}>
                  T{String(t.numero).padStart(2, "0")}
                </span>
                <span style={{ fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {t.titulo}
                </span>
                <span className="mono" style={{ fontSize: 12, color: pct < 50 ? "var(--bad)" : "var(--accent)" }}>
                  {pct}%
                </span>
                <button className="btn btn-sm" onClick={(e) => {
                  e.stopPropagation();
                  navigate({ view: "test", mode: "tema", temaId: t.id });
                }}>Repasar →</button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { StatsView });
