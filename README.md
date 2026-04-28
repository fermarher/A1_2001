# Test Arquitectura — Oposición Junta de Andalucía

App de tests interactiva para preparar las oposiciones del **Cuerpo Superior Facultativo, Opción Arquitectura Superior (A1.2001)** de la Junta de Andalucía.

> **1.928 preguntas · 105 temas** (35 parte común + 70 parte específica) con progreso persistido en el navegador.

---

## ✨ Características

- **4 modos de test** — por tema, aleatorio multi-tema, simulacro cronometrado (100 preguntas / 120 min) y modo repaso de fallos y marcadas.
- **Corrección configurable** — inmediata con explicación o al final del test.
- **Estadísticas** — distribución del temario por estado, aciertos por bloque y temas a priorizar.
- **3 temas visuales** — Claro, Oscuro y Sepia (paleta corporativa de la Junta de Andalucía).
- **Diseño responsive** — barra de navegación inferior y safe-area en iPhone, layout adaptado en escritorio.
- **PWA instalable** — desde Safari iOS o Chrome Android se puede añadir a la pantalla de inicio y abrir como app.
- **100 % cliente** — todo se guarda en `localStorage`. Sin backend, sin telemetría, sin cuentas.

## 🛠 Pila técnica

- **React 18** (UMD, producción minificada) cargado desde unpkg.
- **Babel Standalone** transpilando JSX en el navegador — sin paso de build.
- HTML, CSS y JSX puros: subir los ficheros tal cual a un host estático cualquiera.

## 🚀 Despliegue en GitHub Pages

### Opción A — Automática con GitHub Actions (recomendada)

El repositorio incluye un workflow en `.github/workflows/deploy.yml` que despliega en Pages cada vez que se hace push a `main`.

1. Crear un repositorio nuevo en GitHub y subir estos ficheros:

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/<TU_USUARIO>/<TU_REPO>.git
   git push -u origin main
   ```

2. En el repositorio en GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.

3. Esperar a que el workflow termine (pestaña **Actions**). La URL aparecerá en `Settings → Pages` y será del estilo:

   ```
   https://<TU_USUARIO>.github.io/<TU_REPO>/
   ```

### Opción B — Sin Actions (rama directa)

Si prefieres no usar Actions:

1. Push a `main` igual que en la opción A.
2. **Settings → Pages → Source: Deploy from a branch → Branch: `main` / `(root)`**.
3. Guardar. La URL tarda un par de minutos en estar disponible.

> El fichero `.nojekyll` evita que Pages procese el repo con Jekyll, que filtra carpetas que empiezan con `_`.

## 💻 Probar localmente

Como la app carga `banco.json` con `fetch()`, **abrir `index.html` con doble clic no funciona** — los navegadores bloquean `fetch` sobre `file://`. Hace falta servir los ficheros con un servidor estático cualquiera. Por ejemplo:

```bash
# Python 3
python3 -m http.server 8000

# Node.js
npx serve

# PHP
php -S localhost:8000
```

Y abrir `http://localhost:8000` en el navegador.

## 📁 Estructura

```
.
├── index.html               # Punto de entrada
├── manifest.webmanifest     # Web App Manifest (PWA)
├── styles.css               # Estilos generales
├── mobile.css               # Adaptaciones móvil/iPhone (≤640 px)
├── data.jsx                 # Carga de banco y persistencia (localStorage)
├── dashboard.jsx            # Pantalla de inicio
├── temas.jsx                # Listado y detalle de temas
├── test.jsx                 # Flujo de test, corrección y resultados
├── stats.jsx                # Estadísticas y temas a priorizar
├── app.jsx                  # Componente raíz, ajustes, navegación
├── banco.json               # Banco de 1.928 preguntas
├── assets/
│   └── logo.jpeg            # Logo / favicon / icono PWA
├── .nojekyll                # Desactiva Jekyll en GitHub Pages
└── .github/workflows/
    └── deploy.yml           # Despliegue automático a Pages
```

## 💾 Datos del usuario

Todo se guarda en el `localStorage` del navegador. Dos claves:

- `test_arq_ja_progreso_v1` — aciertos, fallos, preguntas marcadas y estado por tema.
- `test_arq_ja_ajustes_v1` — preferencias visuales (tema, tipografía, densidad, layout).

Si limpias datos del navegador, abres la app en otro dispositivo, o usas modo incógnito, el progreso **no se sincroniza**. Para resetear voluntariamente: **Ajustes → Borrar progreso**.

## 🎨 Paleta corporativa

Basada en el Manual de Identidad Corporativa de la Junta de Andalucía:

| Color                    | Hex       | Uso                                |
|--------------------------|-----------|------------------------------------|
| Pantone 356 C (verde)    | `#007932` | Acento principal en modo claro     |
| Pantone 7740 C (verde 2) | `#368f3f` | Acento en modo oscuro              |
| Pantone Black            | `#2e2925` | Texto principal                    |
| Pantone 322 C (teal)     | `#007078` | Estado «en curso» / información    |
| Cool Gray 7 / 11         | `#9b9b9a` / `#555559` | Textos secundarios       |

## 📝 Notas

- El banco original del documento de referencia listaba 70 temas específicos pero el texto sólo incluía 66. Los 4 que faltaban (25, 26, 31, 32) se añadieron en una iteración posterior; ahora el banco tiene los 70 temas completos.
- La transpilación de Babel en el navegador añade ~1–2 s en el primer arranque. En cargas posteriores, el navegador cachea Babel y los `.jsx`.
- Para uso totalmente offline (avión, metro sin cobertura), es preferible la versión empaquetada en un único `.html` autocontenido (con todo embebido) en lugar de esta versión multifichero.

## 📄 Licencia

Uso personal. El banco de preguntas ha sido elaborado por el autor del repositorio.
