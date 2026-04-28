// Carga del banco real de preguntas + progreso persistido en localStorage
// El banco vive en banco.json; este módulo expone helpers globales.

const TEMA_STATUS = {
  PENDIENTE: "pendiente",
  EN_CURSO: "en_curso",
  AFIANZADO: "afianzado",
  REVISAR: "revisar",
};

const PROGRESO_KEY = "test_arq_ja_progreso_v1";
const SETTINGS_KEY = "test_arq_ja_settings_v1";

async function cargarBanco() {
  const url = (window.__resources && window.__resources.bancoJson) || "banco.json";
  const r = await fetch(url);
  if (!r.ok) throw new Error("No se pudo cargar banco.json");
  const data = await r.json();
  // Barajar opciones de forma determinista y remapear correcta
  // (mantendremos el orden original del DOCX para no perder la trazabilidad)
  return data;
}

function cargarProgresoLocal() {
  try {
    const raw = localStorage.getItem(PROGRESO_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}

function guardarProgresoLocal(p) {
  try { localStorage.setItem(PROGRESO_KEY, JSON.stringify(p)); } catch {}
}

function progresoVacio(banco) {
  const out = {};
  [...banco.comun, ...banco.especifico].forEach((t) => {
    out[t.id] = {
      aciertos: 0,
      intentos: 0,
      preguntasRespondidas: {}, // { [pid]: { correcta: bool, lastAt: ts, count } }
      falladas: {},             // pids actualmente marcados como fallados
      marcadas: {},             // pids marcados por el usuario
      ultimaRevision: null,
      status: TEMA_STATUS.PENDIENTE,
    };
  });
  return out;
}

function recalcularEstado(prog) {
  if (prog.intentos === 0) return TEMA_STATUS.PENDIENTE;
  const pct = prog.aciertos / prog.intentos;
  if (pct >= 0.8) return TEMA_STATUS.AFIANZADO;
  if (pct < 0.5) return TEMA_STATUS.REVISAR;
  return TEMA_STATUS.EN_CURSO;
}

function registrarRespuesta(progreso, temaId, preguntaId, fueCorrecta) {
  const p = progreso[temaId];
  const prev = p.preguntasRespondidas[preguntaId];
  p.intentos += 1;
  if (fueCorrecta) p.aciertos += 1;
  p.preguntasRespondidas[preguntaId] = {
    correcta: fueCorrecta,
    lastAt: Date.now(),
    count: (prev?.count || 0) + 1,
  };
  if (!fueCorrecta) p.falladas[preguntaId] = true;
  else delete p.falladas[preguntaId];
  p.ultimaRevision = Date.now();
  p.status = recalcularEstado(p);
  return { ...progreso, [temaId]: { ...p } };
}

function toggleMarcada(progreso, temaId, preguntaId) {
  const p = progreso[temaId];
  const m = { ...p.marcadas };
  if (m[preguntaId]) delete m[preguntaId];
  else m[preguntaId] = true;
  return { ...progreso, [temaId]: { ...p, marcadas: m } };
}

function shuffle(arr, seed = Date.now()) {
  const a = [...arr];
  let s = seed >>> 0;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) >>> 0;
    const j = Math.floor(((s % 233280) / 233280) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

Object.assign(window, {
  TEMA_STATUS,
  PROGRESO_KEY,
  SETTINGS_KEY,
  cargarBanco,
  cargarProgresoLocal,
  guardarProgresoLocal,
  progresoVacio,
  recalcularEstado,
  registrarRespuesta,
  toggleMarcada,
  shuffle,
});
