/* App principal — carga asíncrona del banco + ajustes en localStorage */

const SETTINGS_KEY_APP = "test_arq_ja_ajustes_v1";
const DEFAULT_SETTINGS = {
  theme: "light",
  typography: "sans",
  density: "cozy",
  cardStyle: "minimal",
  dashLayout: "list"
};

function cargarAjustes() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY_APP);
    if (!raw) return { ...DEFAULT_SETTINGS };
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

function App() {
  const [ajustes, setAjustes] = React.useState(cargarAjustes);
  const [banco, setBanco] = React.useState(null);
  const [progreso, setProgreso] = React.useState(null);
  const [route, setRoute] = React.useState({ view: "dashboard" });
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    window.cargarBanco().
    then((b) => {
      setBanco(b);
      const guardado = window.cargarProgresoLocal();
      let prog = guardado;
      if (!prog) prog = window.progresoVacio(b);else
      {
        const vacio = window.progresoVacio(b);
        prog = { ...vacio, ...prog };
      }
      setProgreso(prog);
    }).
    catch((e) => setError(e.message));
  }, []);

  React.useEffect(() => {
    if (progreso) window.guardarProgresoLocal(progreso);
  }, [progreso]);

  React.useEffect(() => {
    try {localStorage.setItem(SETTINGS_KEY_APP, JSON.stringify(ajustes));} catch {}
    document.documentElement.dataset.theme = ajustes.theme;
    document.documentElement.dataset.density = ajustes.density;
    document.documentElement.dataset.type = ajustes.typography;
  }, [ajustes]);

  const setAjuste = (k, v) => setAjustes((a) => ({ ...a, [k]: v }));

  const navigate = (next) => {
    window.scrollTo({ top: 0, behavior: "instant" });
    if (next.view === "test") {
      if (next.mode === "rapido" || next.mode === "simulacro" || next.mode === "bloque") {
        const cfg = { mode: next.mode, feedback: next.mode === "simulacro" ? "final" : "inmediato" };
        if (next.mode === "simulacro") {cfg.tiempo = 120 * 60;cfg.numPreguntas = 100;}
        if (next.mode === "bloque") cfg.bloqueId = next.bloqueId;
        setRoute({ view: "test-run", config: cfg });
        return;
      }
      if (next.mode === "repaso") {setRoute({ view: "test-run", config: { mode: "repaso", feedback: "inmediato", numPreguntas: 15 } });return;}
      if (next.mode === "tema" || next.mode === "tema-flash") {setRoute({ view: "test-run", config: { mode: next.mode, feedback: "inmediato", temaId: next.temaId } });return;}
      setRoute({ view: "setup-test", pendingMode: next.mode });
      return;
    }
    setRoute(next);
  };

  const resetProgreso = () => {
    if (!confirm("¿Borrar todo el progreso? Esta acción no se puede deshacer.")) return;
    setProgreso(window.progresoVacio(banco));
  };

  if (error) return <div style={{ padding: 40, color: "var(--bad)" }}>Error: {error}</div>;
  if (!banco || !progreso) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", color: "var(--text-dim)" }}>
        <span className="mono" style={{ fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase" }}>Cargando banco de preguntas…</span>
      </div>);

  }

  const navItems = [
  { id: "dashboard", label: "Inicio" },
  { id: "temas", label: "Temario" },
  { id: "setup-test", label: "Practicar" },
  { id: "stats", label: "Progreso" },
  { id: "ajustes", label: "Ajustes" }];

  const activeNav = route.view === "tema-detail" ? "temas" :
  route.view === "test-run" ? "setup-test" : route.view;

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <img className="brand-logo" src={(window.__resources && window.__resources.brandLogo) || "assets/icon-192.png"} alt="" style={{ borderRadius: "0px", borderColor: "rgb(255, 255, 255)", objectFit: "contain", borderStyle: "none", width: "60px", height: "60px" }} />
          <span>Test Arquitectura - A1.2001</span>
          <span className="subtitle">Oposición · Junta de Andalucía</span>
        </div>
        <nav className="nav">
          {navItems.map((n) =>
          <button key={n.id} className={activeNav === n.id ? "active" : ""} onClick={() => navigate({ view: n.id })}>
              {n.label}
            </button>
          )}
        </nav>
        <div className="meta">
          <span className="mono">
            {banco.comun.reduce((s, t) => s + t.preguntas.length, 0) + banco.especifico.reduce((s, t) => s + t.preguntas.length, 0)} preguntas
          </span>
        </div>
      </header>

      <main className="main">
        {route.view === "dashboard" && <window.Dashboard banco={banco} progreso={progreso} tweaks={ajustes} navigate={navigate} />}
        {route.view === "temas" && <window.TemasView banco={banco} progreso={progreso} tweaks={ajustes} navigate={navigate} initialBloque={route.bloque} />}
        {route.view === "tema-detail" && (() => {
          const t = [...banco.comun, ...banco.especifico].find((x) => x.id === route.temaId);
          if (!t) return <div className="empty">Tema no encontrado.</div>;
          return <window.TemaDetail tema={t} progreso={progreso[t.id]} navigate={navigate} />;
        })()}
        {route.view === "setup-test" && <window.TestSetup banco={banco} navigate={navigate} pendingMode={route.pendingMode} />}
        {route.view === "test-run" && <window.TestRun banco={banco} progreso={progreso} setProgreso={setProgreso} config={route.config} navigate={navigate} tweaks={ajustes} />}
        {route.view === "stats" && <window.StatsView banco={banco} progreso={progreso} navigate={navigate} />}
        {route.view === "ajustes" &&
        <AjustesView
          ajustes={ajustes}
          setAjuste={setAjuste}
          resetProgreso={resetProgreso}
          navigate={navigate}
          banco={banco}
          progreso={progreso} />

        }
      </main>
      <BottomNav items={navItems} active={activeNav} onNavigate={navigate} />
    </div>);

}

function BottomNav({ items, active, onNavigate }) {
  const ICONS = {
    dashboard: <svg viewBox="0 0 24 24"><path d="M3 11.5L12 4l9 7.5"/><path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9"/></svg>,
    temas: <svg viewBox="0 0 24 24"><path d="M4 5a2 2 0 0 1 2-2h11l3 3v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>,
    "setup-test": <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>,
    stats: <svg viewBox="0 0 24 24"><path d="M4 20V10"/><path d="M10 20V4"/><path d="M16 20v-6"/><path d="M22 20H2"/></svg>,
    ajustes: <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M2 12h3M19 12h3M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12"/></svg>,
  };
  const SHORT = { dashboard: "Inicio", temas: "Temario", "setup-test": "Test", stats: "Progreso", ajustes: "Ajustes" };
  return (
    <nav className="bottom-nav" aria-label="Navegación principal">
      {items.map((n) => (
        <button key={n.id} className={active === n.id ? "active" : ""} onClick={() => onNavigate({ view: n.id })}>
          <span className="ico">{ICONS[n.id]}</span>
          <span>{SHORT[n.id] || n.label}</span>
        </button>
      ))}
    </nav>
  );
}

function AjustesView({ ajustes, setAjuste, resetProgreso, navigate, banco, progreso }) {
  const totalPregs = banco.comun.reduce((s, t) => s + t.preguntas.length, 0) + banco.especifico.reduce((s, t) => s + t.preguntas.length, 0);
  const totalIntentos = Object.values(progreso).reduce((s, p) => s + (p.intentos || 0), 0);

  return (
    <div style={{ maxWidth: 720 }}>
      <div className="back-link" onClick={() => navigate({ view: "dashboard" })}>← Volver</div>
      <div className="eyebrow">Ajustes</div>
      <h1 style={{ marginTop: 10, marginBottom: 28 }}>Personaliza la app</h1>

      <SettingGroup label="Apariencia">
        <SettingRow label="Tema" desc="Color base de la interfaz">
          <Segmented value={ajustes.theme} onChange={(v) => setAjuste("theme", v)} options={[
          { v: "light", l: "Claro" }, { v: "dark", l: "Oscuro" }, { v: "sepia", l: "Sepia" }]
          } />
        </SettingRow>
        <SettingRow label="Tipografía" desc="Familia tipográfica de toda la app">
          <Segmented value={ajustes.typography} onChange={(v) => setAjuste("typography", v)} options={[
          { v: "sans", l: "Sans" }, { v: "grotesk", l: "Grotesk" }, { v: "serif", l: "Serif" }, { v: "system", l: "Sistema" }]
          } />
        </SettingRow>
        <SettingRow label="Densidad" desc="Espaciado entre elementos">
          <Segmented value={ajustes.density} onChange={(v) => setAjuste("density", v)} options={[
          { v: "cozy", l: "Cómoda" }, { v: "compact", l: "Compacta" }]
          } />
        </SettingRow>
      </SettingGroup>

      <SettingGroup label="Layout">
        <SettingRow label="Tarjeta de pregunta" desc="Estilo visual durante el test">
          <Segmented value={ajustes.cardStyle} onChange={(v) => setAjuste("cardStyle", v)} options={[
          { v: "card", l: "Con borde" }, { v: "minimal", l: "Minimal" }]
          } />
        </SettingRow>
        <SettingRow label="Vista del temario" desc="Cómo se muestran los temas">
          <Segmented value={ajustes.dashLayout} onChange={(v) => setAjuste("dashLayout", v)} options={[
          { v: "grid", l: "Cuadrícula" }, { v: "list", l: "Lista" }]
          } />
        </SettingRow>
      </SettingGroup>

      <SettingGroup label="Datos">
        <SettingRow label="Banco de preguntas" desc={`${totalPregs.toLocaleString("es-ES")} preguntas en ${banco.comun.length + banco.especifico.length} temas`}>
          <span className="mono" style={{ fontSize: 13, color: "var(--text-dim)" }}>incluido</span>
        </SettingRow>
        <SettingRow label="Tu progreso" desc={`${totalIntentos.toLocaleString("es-ES")} respuestas registradas`}>
          <button className="btn" style={{ borderColor: "var(--bad)", color: "var(--bad)" }} onClick={resetProgreso}>
            Borrar progreso
          </button>
        </SettingRow>
      </SettingGroup>

      <div style={{ marginTop: 32, paddingTop: 20, borderTop: "1px solid var(--border)", fontSize: 12, color: "var(--text-mute)" }}>
        Test Arquitectura — Cuerpo Superior Facultativo, Opción Arquitectura Superior (A1.2001) · Junta de Andalucía. Tus ajustes y progreso se guardan en este navegador.
      </div>
    </div>);

}

function SettingGroup({ label, children }) {
  return (
    <section style={{ marginBottom: 28 }}>
      <div className="eyebrow" style={{ marginBottom: 12 }}>{label}</div>
      <div className="card" style={{ padding: 0 }}>
        {children}
      </div>
    </section>);

}

function SettingRow({ label, desc, children }) {
  return (
      <div className="ajustes-row" style={{
      display: "grid",
      gridTemplateColumns: "1fr auto",
      gap: 24,
      alignItems: "center",
      padding: "16px 20px",
      borderBottom: "1px solid var(--border)"
    }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text)" }}>{label}</div>
        {desc && <div style={{ fontSize: 12, color: "var(--text-mute)", marginTop: 3 }}>{desc}</div>}
      </div>
      <div>{children}</div>
    </div>);

}

function Segmented({ value, onChange, options }) {
  return (
    <div className="segmented">
      {options.map((o) =>
      <button key={o.v} className={value === o.v ? "active" : ""} onClick={() => onChange(o.v)}>
          {o.l}
        </button>
      )}
    </div>);

}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);