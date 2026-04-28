/* Dashboard + navegación principal */

function Dashboard({ banco, progreso, tweaks, navigate }) {
  const totalComun = banco.comun.length;
  const totalEsp = banco.especifico.length;

  const resumenBloque = (lista) => {
    let estudiados = 0,aciertos = 0,intentos = 0;
    lista.forEach((t) => {
      const p = progreso[t.id];
      if (p.intentos > 0) estudiados++;
      aciertos += p.aciertos;
      intentos += p.intentos;
    });
    return {
      estudiados,
      total: lista.length,
      pctEstudiados: Math.round(estudiados / lista.length * 100),
      pctAciertos: intentos > 0 ? Math.round(aciertos / intentos * 100) : 0
    };
  };

  const rC = resumenBloque(banco.comun);
  const rE = resumenBloque(banco.especifico);
  const pctGlobal = Math.round(
    (rC.estudiados + rE.estudiados) / (totalComun + totalEsp) * 100
  );
  const totalPreguntas =
  banco.comun.reduce((s, t) => s + t.preguntas.length, 0) +
  banco.especifico.reduce((s, t) => s + t.preguntas.length, 0);

  const temasRevisar = [...banco.comun, ...banco.especifico].filter(
    (t) => progreso[t.id].status === "revisar"
  ).length;

  return (
    <div>
      <section className="dash-hero">
        <div className="hero-title">
          <div className="eyebrow">Oposición · Arquitecto · Junta de Andalucía</div>
          <h1 style={{ marginTop: 14 }}>Tu temario, bajo control.</h1>
          <p>
            {totalComun} temas en la parte común, {totalEsp} en la específica —
            {" "}{totalPreguntas.toLocaleString("es-ES")} preguntas en total.
            Practica por tema, haz simulacros y repasa lo que fallas.
          </p>
          <div className="row-flex" style={{ gap: 8 }}>
            <button className="btn primary" onClick={() => navigate({ view: "setup-test" })}>
              Empezar a practicar →
            </button>
            <button className="btn" onClick={() => navigate({ view: "temas" })}>
              Ver temario
            </button>
          </div>
        </div>
        <div className="hero-stats">
          <div className="stat" style={{ backgroundColor: "rgb(250, 250, 248)" }}>
            <div className="label">Progreso global</div>
            <div className="val mono">{pctGlobal}<span className="unit">%</span></div>
            <div className="sub">{rC.estudiados + rE.estudiados} / {totalComun + totalEsp} temas iniciados</div>
          </div>
          <div className="stat">
            <div className="label">Aciertos medios</div>
            <div className="val mono">{Math.round((rC.pctAciertos + rE.pctAciertos) / 2)}<span className="unit">%</span></div>
            <div className="sub">sobre preguntas respondidas</div>
          </div>
          <div className="stat">
            <div className="label">Banco de preguntas</div>
            <div className="val mono">{totalPreguntas.toLocaleString("es-ES")}</div>
            <div className="sub">en {totalComun + totalEsp} temas</div>
          </div>
          <div className="stat">
            <div className="label">Para revisar</div>
            <div className="val mono">{temasRevisar}</div>
            <div className="sub">temas con &lt; 50% aciertos</div>
          </div>
        </div>
      </section>

      <section className="blocks">
        <BlockCard id="comun" label="Parte común" eyebrow="Bloque I"
        temas={banco.comun} progreso={progreso} resumen={rC} navigate={navigate} />
        <BlockCard id="especifico" label="Parte específica" eyebrow="Bloque II"
        temas={banco.especifico} progreso={progreso} resumen={rE} navigate={navigate} />
      </section>

      <div className="eyebrow" style={{ marginBottom: 14 }}>Acciones rápidas</div>
      <section className="quick-actions">
        <button className="quick-action" onClick={() => navigate({ view: "test", mode: "rapido" })}>
          <span className="qa-label">10 preguntas</span>
          <span className="qa-title">Test rápido</span>
          <span className="qa-desc">Aleatorio, todos los temas</span>
        </button>
        <button className="quick-action" onClick={() => navigate({ view: "test", mode: "simulacro" })}>
          <span className="qa-label">100 preg · 120 min</span>
          <span className="qa-title">Simulacro</span>
          <span className="qa-desc">Formato examen cronometrado</span>
        </button>
        <button className="quick-action" onClick={() => navigate({ view: "test", mode: "repaso" })}>
          <span className="qa-label">Falladas y marcadas</span>
          <span className="qa-title">Modo repaso</span>
          <span className="qa-desc">Afianza lo que te cuesta</span>
        </button>
        <button className="quick-action" onClick={() => navigate({ view: "stats" })}>
          <span className="qa-label">Histórico</span>
          <span className="qa-title">Estadísticas</span>
          <span className="qa-desc">Evolución y distribución</span>
        </button>
      </section>
    </div>);

}

function BlockCard({ id, label, eyebrow, temas, progreso, resumen, navigate }) {
  return (
    <div className="block">
      <div className="block-head">
        <div>
          <div className="eyebrow">{eyebrow}</div>
          <div className="title" style={{ marginTop: 6 }}>{label}</div>
        </div>
        <div className="count mono">
          {resumen.estudiados}<span className="of">/{resumen.total}</span>
        </div>
      </div>

      <div className="progress-bar">
        <div className="fill" style={{ width: `${resumen.pctEstudiados}%` }} />
      </div>
      <div className="pct-row">
        <span>{resumen.pctEstudiados}% estudiado</span>
        <span>{resumen.pctAciertos}% aciertos</span>
      </div>

      <div className={`tema-grid ${id}`}>
        {temas.map((t) => {
          const st = progreso[t.id].status;
          return (
            <div key={t.id} className="tema-cell" data-s={st}
            title={`T${t.numero}. ${t.titulo.substring(0, 60)} · ${st}`}
            onClick={() => navigate({ view: "tema-detail", temaId: t.id })} />);

        })}
      </div>

      <div className="cta-row">
        <button className="btn" onClick={() => navigate({ view: "temas", bloque: id })}>
          Ver {resumen.total} temas
        </button>
        <button className="btn ghost" onClick={() => navigate({ view: "test", mode: "bloque", bloqueId: id })}>
          Test del bloque
        </button>
      </div>
    </div>);

}

Object.assign(window, { Dashboard });