/**
 * ============================================================================
 * MOTOR DEL PORTAFOLIO PROFESIONAL FULL-STACK MEAN & SQL (portfolio-app.js)
 * ============================================================================
 * Propósito:
 *   Gestionar el catálogo curado y sin duplicados de 16 aplicaciones 100%
 *   funcionales e interactivas de Fredy Martinez, conectadas a Base de Datos
 *   Real (SQL / MongoDB vía `/api/*`) y sincronización híbrida en navegador.
 *   - Proyectos unificados (Procrastination Nightmare Suite + FullCalendar v6,
 *     y BIT Shop Storefront + REST API JWT/RBAC).
 *   - Enlaces directos a los repositorios oficiales en GitHub (`@FredyMarG`).
 *
 * Comentado detalladamente en español bloque por bloque y línea por línea.
 * ============================================================================
 */

// Catálogo maestro con las 16 aplicaciones únicas 100% funcionales
const PORTFOLIO_PROJECTS = [
  // ==========================================================================
  // 1. APLICACIONES FULL-STACK & PRODUCTOS INTEGRADORES
  // ==========================================================================
  {
    id: "turismo-mean", // Identificador único del proyecto
    title: "Turismo MEAN — Plataforma Full-Stack (MongoDB + Express + Angular 16)", // Título comercial
    folder: "Turismo_MEAN/", // Carpeta raíz del proyecto
    category: "fullstack", // Categoría para el filtro superior ('fullstack', 'backend', 'js')
    categoryLabel: "Full-Stack MEAN + BD", // Etiqueta visual de categoría
    stack: ["Base de Datos SQL/Mongo", "Express.js REST API", "Angular 16 SPA", "Node.js", "CRUD & Métricas"],
    description: "Plataforma Full-Stack para gestión de destinos turísticos de Colombia con operaciones CRUD en tiempo real contra la Base de Datos, filtros por ciudad, ordenamiento por precio/calificación y métricas agregadas.",
    review: "Conectada a la tabla/colección `turismo_destinos` mediante `/api/destinos` con sincronización automática y cálculo reactivo de tarifas y calificaciones.",
    previewUrl: "Turismo_MEAN/public/index.html",
    githubUrl: "https://github.com/FredyMarG/Turismo_App"
  },
  {
    id: "app-de-citas",
    title: "Amour & Planes — App de Citas y Álbum de Recuerdos (Full-Stack SQL)",
    folder: "App de citas/",
    category: "fullstack",
    categoryLabel: "Full-Stack SQL & SPA",
    stack: ["Base de Datos SQL", "Node.js & SQLite3", "MySQL Compatible", "REST API", "Álbum 10 Fotos"],
    description: "Aplicativo web Full-Stack para descubrir planes sugeridos, diseñar planes personalizados, agendar citas con fecha y hora exacta, calificar experiencias y conservar un álbum interactivo de fotografías.",
    review: "Persistencia relacional real en las tablas `planes_sugeridos` y `citas_programadas` a través de `/api/planes` y `/api/citas` con sincronización híbrida.",
    previewUrl: "App de citas/public/index.html",
    githubUrl: "https://github.com/FredyMarG/Dates_App"
  },
  {
    id: "stockflow-inventario",
    title: "StockFlow Pro — Sistema de Inventario, Kardex y Facturación POS (PHP MVC + MySQL)",
    folder: "Sistema-Inventario/",
    category: "fullstack",
    categoryLabel: "PHP 8 MVC + MySQL + POS",
    stack: ["PHP 8 MVC", "MySQL / PDO", "RBAC (3 Roles)", "Facturación POS", "Bootstrap 5 & Sass"],
    description: "Sistema empresarial de inventario y facturación con arquitectura PHP MVC sin frameworks, PDO Singleton, bloqueo pesimista FOR UPDATE, control de roles RBAC (admin, vendedor, almacén), alertas de stock bajo, Kardex y POS transaccional.",
    review: "Código fuente PHP 8 MVC + MySQL (`database/bd.sql` con 10 tablas) y demo interactiva en vivo sincronizada con `/api/db/kv/stockflow_inventario_state` y `localStorage`.",
    previewUrl: "Sistema-Inventario/index.html",
    githubUrl: "https://github.com/FredyMarG/Sistema_Inventarios"
  },
  {
    id: "gestor-tareas-node",
    title: "Gestor de Tareas Full-Stack en Node.js Nativo (SQL + Auditoría NDJSON)",
    folder: "Gestor-Tareas-Node/",
    category: "fullstack",
    categoryLabel: "Node.js & Base de Datos",
    stack: ["Base de Datos SQL", "Node.js (node:http)", "REST API Nativa", "Auditoría de Eventos", "Sincronización Real"],
    description: "Aplicación Full-Stack con API REST CRUD conectada a base de datos relacional para gestión de tareas y bitácora de eventos de auditoría en tiempo real.",
    review: "Conectada a las tablas `gestor_tareas` y `gestor_eventos` mediante los endpoints `/api/tareas` y `/api/eventos` con actualización instantánea.",
    previewUrl: "Gestor-Tareas-Node/public/index.html",
    githubUrl: "https://github.com/FredyMarG/Gestor-Tareas"
  },
  {
    id: "proyecto-bit",
    title: "Procrastination Nightmare — Suite SaaS (7 Módulos + FullCalendar v6 + BD)",
    folder: "proyectoBit/",
    category: "fullstack",
    categoryLabel: "Producto SaaS + FullCalendar",
    stack: ["Base de Datos SQL/Mongo", "FullCalendar v6 SPA", "7 Módulos Conectados", "Bootstrap 5", "JavaScript POO"],
    description: "Plataforma integral unificada de gestión del tiempo y productividad: incluye el planificador interactivo de sprints con FullCalendar v6, Pomodoro Focus, To-Do List, Hábitos, Notas, Roadmap POO y Landing Page SaaS.",
    review: "Unifica la suite colaborativa y el calendario interactivo FullCalendar v6 sincronizando eventos y módulos en `/api/agenda/eventos` y `/api/db/kv/proyectobit_suite_state`.",
    previewUrl: "proyectoBit/index.html",
    githubUrl: "https://github.com/FredyMarG/Procastination-Nigtmare",
    extraLinks: [
      { label: "📅 Sprint Planner (FullCalendar v6)", url: "proyectoBit/fullcalendar-spa.html" },
      { label: "Landing Page SaaS", url: "proyectoBit/landing-full-bootstrap/index.html" },
      { label: "Roadmap Tareas POO", url: "proyectoBit/roadMapTareas.html" },
      { label: "Tracker Hábitos", url: "proyectoBit/habitos.html" },
      { label: "Calendario Mensual", url: "proyectoBit/calendario.html" },
      { label: "Notas", url: "proyectoBit/notas.html" },
      { label: "To-Do List", url: "proyectoBit/to-do-list.html" }
    ]
  },
  {
    id: "finanzas-app",
    title: "Finanzas APP — Dashboard de Control Financiero & Gráfico Canvas 2D",
    folder: "Finanzas APP/",
    category: "fullstack",
    categoryLabel: "FinTech + Base de Datos",
    stack: ["Base de Datos SQL", "HTML5 Canvas 2D Chart", "JavaScript ES6+", "COP Currency Formatter", "Filtros Dinámicos"],
    description: "Aplicación FinTech de control de ingresos, gastos y balance patrimonial en tiempo real con formateo automático de miles en pesos colombianos (COP), gráfico de dona en Canvas 2D y persistencia en Base de Datos.",
    review: "Cada ingreso o gasto se registra y elimina directamente en la tabla relacional `finanzas_transacciones` (`/api/finanzas/transacciones`) con respaldo en `localStorage`.",
    previewUrl: "Finanzas APP/index.html"
  },
  {
    id: "tablero-kanban",
    title: "Tablero Kanban Scrum — Gestión Ágil de Sprints con Drag & Drop y BD",
    folder: "Tablero Kanban/",
    category: "fullstack",
    categoryLabel: "Agile Scrum + BD Real",
    stack: ["Base de Datos SQL", "HTML5 Drag & Drop API", "Scrum Workflow", "Sincronización Real-Time", "CSS Grid"],
    description: "Tablero interactivo de metodología ágil Scrum dividido en 3 columnas (Por Hacer, En Progreso, Completado) con transferencia de tarjetas mediante Drag & Drop y guardado automático en Base de Datos.",
    review: "Persiste cada movimiento de columna, creación o eliminación de historia de usuario en la tabla relacional `kanban_tareas` (`/api/kanban/tareas`).",
    previewUrl: "Tablero Kanban/index.html"
  },
  {
    id: "buscador-peliculas",
    title: "Buscador de Películas (CineSearch) — OMDb REST API & Debounce",
    folder: "Buscador de Peliculas/",
    category: "fullstack",
    categoryLabel: "REST API & Debounce",
    stack: ["OMDb REST API", "Debounce Pattern (500ms)", "Async/Await Fetch", "HTML5 Native Dialog", "Catálogo Respaldo"],
    description: "Buscador cinematográfico en tiempo real conectado a la API REST de OMDb con optimización de peticiones mediante patrón Debounce (500ms), filtros rápidos por franquicia y ficha técnica completa en modal nativo.",
    review: "Interfaz interactiva con búsqueda en vivo, sugerencias por franquicia y ventana modal nativa con sinopsis, director y calificación IMDb.",
    previewUrl: "Buscador de Peliculas/index.html"
  },

  // ==========================================================================
  // 2. BACKEND REST APIS (NODE.JS, TYPESCRIPT, MONGODB, JWT & E-COMMERCE)
  // ==========================================================================
  {
    id: "bitshop-api",
    title: "BIT Shop E-Commerce & REST API — Storefront, Login JWT, RBAC & Base de Datos",
    folder: "BitShop_API/",
    category: "backend",
    categoryLabel: "E-Commerce + JWT & BD SQL",
    stack: ["Base de Datos SQL", "Storefront + Carrito", "JWT Authentication", "RBAC (Admin/Cliente)", "CRUD Productos & Pedidos"],
    description: "Plataforma unificada de comercio electrónico tecnológico: incluye tanto la Tienda Online con Mega-Menú y carrito Offcanvas como el Panel API Studio con Login JWT, roles RBAC y administración de inventario en Base de Datos.",
    review: "Unifica el Storefront (`public/tienda/`) y el Studio JWT (`public/index.html`) sobre las tablas reales `bitshop_users`, `bitshop_products` y `tienda_pedidos`.",
    previewUrl: "BitShop_API/public/index.html",
    githubUrl: "https://github.com/FredyMarG/E-comerce",
    extraLinks: [
      { label: "🛒 Abrir Tienda Online (Storefront & Carrito)", url: "BitShop_API/public/tienda/index.html" },
      { label: "🔐 Abrir Panel Admin & API Studio (JWT)", url: "BitShop_API/public/index.html" }
    ]
  },
  {
    id: "ts-api",
    title: "ts_api Studio — Enterprise REST API en TypeScript Estricto + Auditoría BD",
    folder: "ts_api/",
    category: "backend",
    categoryLabel: "TypeScript API + BD Logs",
    stack: ["TypeScript 5", "Base de Datos SQL", "Express.js", "Login-First Studio", "Historial en BD"],
    description: "Aplicación interactiva Login-first para ejecutar en vivo los módulos de la API TypeScript (`/api/login`, `/api/operaciones/*`, `/api/saludo/*`, `/api/math/*` y `/api/health`) almacenando el historial de operaciones en Base de Datos.",
    review: "Registra cada inicio de sesión y cálculo aritmético en la tabla `ts_api_logs` y devuelve el historial de auditoría junto con el payload JSON en tiempo real.",
    previewUrl: "ts_api/public/index.html"
  },
  {
    id: "mongo-crud-playground",
    title: "MongoDB DBZ-V2 Playground — Operadores CRUD & Consultas en Vivo",
    folder: "Mongo/",
    category: "backend",
    categoryLabel: "NoSQL MongoDB + BD Real",
    stack: ["MongoDB & SQL Hybrid", "mongosh Live Query", "Operadores ($eq / $gte)", "CRUD Documental", "DBZ-V2 Dataset"],
    description: "Laboratorio interactivo que ejecuta operaciones reales `find`, `insertOne`, `updateOne` y `deleteOne` con filtros `$eq` y `$gte` sobre la colección de guerreros DBZ-V2 persistida en Base de Datos.",
    review: "Conectado a la tabla/colección `mongo_characters` mediante `/api/characters` y `/api/reset`, generando en vivo la consulta equivalente en sintaxis `mongosh`.",
    previewUrl: "Mongo/public/index.html"
  },

  // ==========================================================================
  // 3. JAVASCRIPT AVANZADO, HTML5 WEB APIS & CONSUMO DE APIS REST
  // ==========================================================================
  {
    id: "sketchpad-canvas-2d",
    title: "SketchPad 2D Pro — Estudio de Dibujo Vectorial (Canvas API + Sync BD)",
    folder: "SketchPad-Canvas-2D/",
    category: "js",
    categoryLabel: "HTML5 Canvas 2D + BD",
    stack: ["HTML5 Canvas 2D", "Base de Datos Sync", "ImageData Undo Stack", "Ctrl+Z History", "PNG Export"],
    description: "Pizarra interactiva de diseño 2D con pincel libre, borrador, trazado geométrico en tiempo real (rectángulos, círculos, líneas), rejilla técnica, pila Deshacer (Ctrl+Z), sincronización con BD y exportación a PNG.",
    review: "Manipula buffers de píxeles con `getImageData()`/`putImageData()` y sincroniza el estado del lienzo en `/api/db/kv/sketchpad_canvas_state`.",
    previewUrl: "SketchPad-Canvas-2D/index.html"
  },
  {
    id: "notesdb-indexeddb",
    title: "NotesDB — Gestor Transaccional con IndexedDB + Réplica en Base de Datos",
    folder: "Gestor-Offline-IndexedDB/",
    category: "js",
    categoryLabel: "IndexedDB + BD Servidor",
    stack: ["IndexedDB API", "Base de Datos SQL Sync", "IDBTransaction CRUD", "Inline ContentEditable", "JSON Export"],
    description: "Sistema de gestión de notas y tareas que combina la base de datos transaccional del navegador (`IndexedDB`) con replicación automática hacia la Base de Datos del servidor, edición en línea y exportación JSON.",
    review: "Ejecuta transacciones `readwrite` en `IndexedDB` (`NotesDB_Portfolio`) y replica los registros hacia `/api/db/kv/notesdb_indexeddb_sync`.",
    previewUrl: "Gestor-Offline-IndexedDB/index.html"
  },
  {
    id: "filedrop-inspector",
    title: "FileDrop Inspector — Analizador Multimedia (Drag & Drop + FileReader)",
    folder: "Visor-Archivos-DragDrop/",
    category: "js",
    categoryLabel: "FileReader & Drag-Drop API",
    stack: ["Drag & Drop API", "FileReader Streams", "Blob & ObjectURL", "Clipboard API", "Progress Bar"],
    description: "Inspector y previsualizador universal de archivos en el navegador con soporte Drag & Drop, barra de progreso de lectura binaria, extracción de metadatos MIME, renderizado multimedia y copia al portapapeles.",
    review: "Lectura adaptativa con `FileReader`, `URL.createObjectURL` para streaming local e integración directa con `navigator.clipboard.writeText`.",
    previewUrl: "Visor-Archivos-DragDrop/index.html"
  },
  {
    id: "rickandmorty-api",
    title: "Multiverse Character Explorer — The Rick and Morty REST API",
    folder: "rickandmorty_api/",
    category: "js",
    categoryLabel: "REST API & Async/Await",
    stack: ["Fetch API", "Async/Await", "Dynamic Pagination", "Status Filters", "Offline Fallback"],
    description: "Aplicación SPA conectada a la API REST oficial de Rick & Morty con búsqueda en tiempo real, filtros por estado vital (Alive / Dead / Unknown), paginación dinámica y catálogo de respaldo.",
    review: "Consumo asíncrono mediante `URLSearchParams`, control dinámico de páginas y renderizado instantáneo de fichas de personajes.",
    previewUrl: "rickandmorty_api/index.html"
  },
  {
    id: "web-page-animations",
    title: "Portfolio UI & Motion — Animaciones CSS3 a 60 FPS (GPU & Scroll-Driven)",
    folder: "Web-Page-Animations/",
    category: "js",
    categoryLabel: "CSS3 Motion & UI Architecture",
    stack: ["CSS3 @keyframes", "3D GPU Transforms", "Scroll-Driven Animations", "prefers-reduced-motion", "Responsive UI"],
    description: "Experiencia interactiva de alto rendimiento visual construida con animaciones CSS aceleradas por GPU: barra de progreso ligada al scroll, órbitas rotatorias, gradiente cinético, marquee infinito y tarjetas 3D.",
    review: "Maquetación interactiva 100% funcional con soporte de accesibilidad `prefers-reduced-motion` y navegación responsiva.",
    previewUrl: "Web-Page-Animations/index.html"
  }
];

// ============================================================================
// UTILIDADES DE SEGURIDAD Y RENDERIZADO ANTI-XSS
// ============================================================================

/**
 * Escapa caracteres HTML especiales para prevenir vulnerabilidades XSS al construir plantillas.
 * @param {string} value - Cadena de entrada.
 * @returns {string} Cadena con entidades HTML escapadas.
 */
function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ============================================================================
// LÓGICA DE RENDERIZADO Y FILTRADO DEL PORTAFOLIO (100% FUNCIONAL, SIN CÓDIGO)
// ============================================================================

const gridContainer = document.getElementById("projectsGrid");
const filterButtons = document.querySelectorAll(".filter-btn");
const searchInput = document.getElementById("projectSearch");
const countBadge = document.getElementById("projectCountBadge");

let currentCategory = "all";
let currentSearch = "";

/**
 * Calcula y actualiza los contadores de proyectos en las tarjetas del Hero y en los botones de filtro.
 */
function updatePortfolioMetrics() {
  const totalEl = document.getElementById("statTotalProjects");
  const liveEl = document.getElementById("statLiveDemos");
  const filterAllEl = document.getElementById("filterAllBtn");
  const filterFullstackEl = document.getElementById("filterFullstackBtn");
  const filterBackendEl = document.getElementById("filterBackendBtn");
  const filterJsEl = document.getElementById("filterJsBtn");

  const liveCount = PORTFOLIO_PROJECTS.filter((p) => Boolean(p.previewUrl)).length;
  const fullstackCount = PORTFOLIO_PROJECTS.filter((p) => p.category === "fullstack").length;
  const backendCount = PORTFOLIO_PROJECTS.filter((p) => p.category === "backend").length;
  const jsCount = PORTFOLIO_PROJECTS.filter((p) => p.category === "js").length;

  if (totalEl) totalEl.textContent = String(PORTFOLIO_PROJECTS.length);
  if (liveEl) liveEl.textContent = String(liveCount);
  if (filterAllEl) filterAllEl.textContent = `Todos (${PORTFOLIO_PROJECTS.length})`;
  if (filterFullstackEl) filterFullstackEl.textContent = `🌟 Full-Stack & Productos (${fullstackCount})`;
  if (filterBackendEl) filterBackendEl.textContent = `⚙️ Backend APIs & E-Commerce (${backendCount})`;
  if (filterJsEl) filterJsEl.textContent = `⚡ Web APIs, JS & CSS Motion (${jsCount})`;
}

/**
 * Filtra y dibuja las tarjetas del catálogo de aplicaciones funcionales en `#projectsGrid`.
 */
function renderPortfolio() {
  if (!gridContainer) return;

  const filtered = PORTFOLIO_PROJECTS.filter((proj) => {
    const matchesCategory = currentCategory === "all" || proj.category === currentCategory;
    const query = currentSearch.toLowerCase();
    const matchesSearch =
      !query ||
      proj.title.toLowerCase().includes(query) ||
      proj.folder.toLowerCase().includes(query) ||
      proj.description.toLowerCase().includes(query) ||
      proj.stack.some((s) => s.toLowerCase().includes(query));

    return matchesCategory && matchesSearch;
  });

  if (countBadge) {
    countBadge.textContent = `${filtered.length} aplicaciones funcionales`;
  }

  if (filtered.length === 0) {
    gridContainer.innerHTML = `
      <div class="col-12 text-center py-5">
        <h4 class="text-secondary mb-3">No se encontraron proyectos con ese criterio.</h4>
        <button type="button" class="btn btn-outline-info btn-sm rounded-pill px-4" data-action="reset">
          Restablecer filtros
        </button>
      </div>
    `;
    return;
  }

  gridContainer.innerHTML = filtered
    .map((proj) => {
      const safeTitle = escapeHtml(proj.title);
      const safeCategory = escapeHtml(proj.category);
      const safeCategoryLabel = escapeHtml(proj.categoryLabel);
      const safeDesc = escapeHtml(proj.description);
      const safeReview = escapeHtml(proj.review);
      const encodedPreviewUrl = encodeURI(proj.previewUrl);

      const stackBadges = proj.stack
        .map((tech) => `<span class="tech-tag">${escapeHtml(tech)}</span>`)
        .join("");

      const extraLinksHtml = (proj.extraLinks || [])
        .map(
          (lnk) =>
            `<button type="button" class="btn btn-sm btn-outline-info py-1 px-2" data-action="preview" data-title="${safeTitle} — ${escapeHtml(lnk.label)}" data-url="${escapeHtml(lnk.url)}">${escapeHtml(lnk.label)}</button>`
        )
        .join("");

      const githubBtnHtml = proj.githubUrl
        ? `<a href="${escapeHtml(proj.githubUrl)}" target="_blank" rel="noopener" class="btn btn-outline-secondary btn-sm text-light" title="Ver repositorio en GitHub">GitHub ↗</a>`
        : "";

      return `
      <div class="col-lg-4 col-md-6">
        <article class="project-card">
          <div class="d-flex justify-content-between align-items-center mb-2 gap-2">
            <span class="cat-badge cat-${safeCategory}">${safeCategoryLabel}</span>
            <span class="file-path-tag">🟢 100% Funcional</span>
          </div>

          <h5 class="fw-bold mb-2 text-white">${safeTitle}</h5>
          <p class="small text-secondary mb-2">${safeDesc}</p>

          <div class="review-box">
            <strong class="text-info d-block mb-1">🗄️ Persistencia &amp; Funcionamiento:</strong>
            ${safeReview}
          </div>

          <div class="d-flex flex-wrap gap-1 mb-2">
            ${stackBadges}
          </div>

          ${extraLinksHtml ? `<div class="d-flex flex-wrap gap-1 mb-2">${extraLinksHtml}</div>` : ""}

          <div class="d-flex flex-wrap gap-2 mt-auto pt-3">
            <button type="button" class="btn btn-info btn-sm fw-bold text-dark flex-grow-1" data-action="preview" data-title="${safeTitle}" data-url="${escapeHtml(proj.previewUrl)}">
              ▶ Abrir Aplicación Interactiva
            </button>
            <a href="${encodedPreviewUrl}" target="_blank" rel="noopener" class="btn btn-outline-light btn-sm" title="Abrir aplicación en pestaña nueva">
              ↗ Abrir
            </a>
            ${githubBtnHtml}
          </div>
        </article>
      </div>
      `;
    })
    .join("");
}

/** Restablece la categoría a 'all' y limpia el campo de búsqueda. */
window.resetPortfolioFilters = function () {
  currentCategory = "all";
  currentSearch = "";
  if (searchInput) searchInput.value = "";
  filterButtons.forEach((b) => b.classList.toggle("active", b.getAttribute("data-category") === "all"));
  renderPortfolio();
};

// ============================================================================
// CONTROL DEL MODAL INTERACTIVO DE APLICACIONES Y HOJA DE VIDA (CV)
// ============================================================================
const modalEl = document.getElementById("portfolioModal");
const previewIframeEl = document.getElementById("previewIframe");
const iframeLoaderEl = document.getElementById("iframeLoader");

if (previewIframeEl && iframeLoaderEl) {
  previewIframeEl.addEventListener("load", () => {
    iframeLoaderEl.classList.add("loaded");
  });
}

window.openPreviewModal = function (title, url) {
  const modalTitle = document.getElementById("previewModalTitle");
  const externalLink = document.getElementById("previewExternalLink");
  const iframeContainer = document.getElementById("iframeContainer");
  const safeUrl = encodeURI(url);

  if (!modalEl || !previewIframeEl) {
    window.open(safeUrl, "_blank", "noopener");
    return;
  }

  if (modalTitle) modalTitle.textContent = title;
  if (externalLink) {
    externalLink.href = safeUrl;
    externalLink.classList.remove("d-none");
  }
  if (iframeContainer) iframeContainer.classList.remove("d-none");
  if (iframeLoaderEl) {
    iframeLoaderEl.classList.remove("loaded");
    setTimeout(() => {
      iframeLoaderEl.classList.add("loaded");
    }, 900);
  }
  previewIframeEl.src = safeUrl;

  if (window.bootstrap && window.bootstrap.Modal) {
    const modal = window.bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();
  } else {
    window.open(safeUrl, "_blank", "noopener");
  }
};

document.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const action = button.dataset.action;
  if (action === "preview") {
    window.openPreviewModal(button.dataset.title || "Aplicación Interactiva", button.dataset.url || "");
  } else if (action === "reset") {
    window.resetPortfolioFilters();
  }
});

if (modalEl) {
  modalEl.addEventListener("hidden.bs.modal", () => {
    if (previewIframeEl) previewIframeEl.src = "about:blank";
  });
}

// ============================================================================
// VERIFICADOR EN VIVO DE CONEXIÓN A LA BASE DE DATOS REAL (/api/db/status)
// ============================================================================
const btnTestDbConnection = document.getElementById("btnTestDbConnection");
const dbConnectionAlert = document.getElementById("dbConnectionAlert");

async function checkDatabaseStatus(showAlert = false) {
  try {
    if (location.protocol === "file:") throw new Error("Modo archivo local");
    const res = await fetch("/api/db/status");
    const data = await res.json();
    if (res.ok && data.ok) {
      if (btnTestDbConnection) {
        btnTestDbConnection.className = "btn btn-success btn-sm rounded-pill px-3 fw-semibold";
        btnTestDbConnection.textContent = `🟢 BD Conectada (${data.engine})`;
      }
      if (showAlert && dbConnectionAlert) {
        const tableSummary = Object.entries(data.tables || {})
          .map(([k, v]) => `<code>${escapeHtml(k)}</code>: <strong>${Number(v)}</strong> reg.`)
          .join(" • ");
        dbConnectionAlert.classList.remove("d-none");
        dbConnectionAlert.innerHTML = `<strong>✅ Conexión Exitosa a Base de Datos Real (${escapeHtml(data.engine)}):</strong><br>${tableSummary}`;
      }
      return;
    }
  } catch {}

  if (btnTestDbConnection) {
    btnTestDbConnection.className = "btn btn-outline-info btn-sm rounded-pill px-3 fw-semibold";
    btnTestDbConnection.textContent = "⚡ Persistencia Híbrida Activa (SQL + LocalStorage)";
  }
  if (showAlert && dbConnectionAlert) {
    dbConnectionAlert.classList.remove("d-none");
    dbConnectionAlert.innerHTML =
      "<strong>⚡ Modo Híbrido Activo:</strong> Ejecuta <code>npm start</code> localmente o despliega en Netlify para consultar el endpoint en vivo <code>/api/db/status</code>. Todos los scripts SQL (MySQL, PostgreSQL, SQLite) y colecciones MongoDB están listos en la carpeta <code>database/</code>.";
  }
}

if (btnTestDbConnection) {
  btnTestDbConnection.addEventListener("click", () => checkDatabaseStatus(true));
}

// ============================================================================
// NAVEGACIÓN, BÚSQUEDA Y BOTÓN FLOTANTE VOLVER ARRIBA
// ============================================================================
const backToTopBtn = document.getElementById("backToTopBtn");
if (backToTopBtn) {
  window.addEventListener(
    "scroll",
    () => {
      backToTopBtn.classList.toggle("visible", window.scrollY > 400);
    },
    { passive: true }
  );
  backToTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentCategory = btn.getAttribute("data-category");
    updatePortfolioMetrics();
    renderPortfolio();
  });
});

if (searchInput) {
  searchInput.addEventListener("input", (e) => {
    currentSearch = e.target.value.trim();
    updatePortfolioMetrics();
    renderPortfolio();
  });
}

// ============================================================================
// ENVÍO REAL DEL FORMULARIO DE CONTACTO POR WHATSAPP Y CORREO ELECTRÓNICO
// ============================================================================
const CONTACT_PHONE = "573152388315";
const CONTACT_EMAIL = "fredymartinezquinto@hotmail.com";

const portfolioContactForm = document.getElementById("portfolioContactForm");
const pContactFeedback = document.getElementById("pContactFeedback");
const btnSendWhatsApp = document.getElementById("btnSendWhatsApp");

function getPortfolioFormValues() {
  const name = (document.getElementById("pContactName")?.value || "").trim();
  const email = (document.getElementById("pContactEmail")?.value || "").trim();
  const subject = (document.getElementById("pContactSubject")?.value || "Contacto Portafolio").trim();
  const msg = (document.getElementById("pContactMsg")?.value || "").trim();
  return { name, email, subject, msg };
}

if (btnSendWhatsApp) {
  btnSendWhatsApp.addEventListener("click", () => {
    if (portfolioContactForm && !portfolioContactForm.reportValidity()) return;
    const { name, email, subject, msg } = getPortfolioFormValues();
    const text =
      `Hola Fredy, te escribo desde tu Portafolio Profesional:%0A%0A` +
      `*Nombre/Empresa:* ${encodeURIComponent(name)}%0A` +
      `*Correo:* ${encodeURIComponent(email)}%0A` +
      `*Motivo:* ${encodeURIComponent(subject)}%0A` +
      `*Mensaje:* ${encodeURIComponent(msg)}`;
    window.open(`https://wa.me/${CONTACT_PHONE}?text=${text}`, "_blank", "noopener");
    if (pContactFeedback) {
      pContactFeedback.textContent = "✓ Abriendo chat de WhatsApp con tu mensaje listo...";
    }
  });
}

if (portfolioContactForm && pContactFeedback) {
  portfolioContactForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const { name, email, subject, msg } = getPortfolioFormValues();
    if (!name || !email || !msg) return;

    pContactFeedback.textContent = "⏳ Preparando envío a " + CONTACT_EMAIL + "...";

    const mailtoSubject = encodeURIComponent(`[Portafolio] ${subject} — ${name}`);
    const mailtoBody = encodeURIComponent(
      `Hola Fredy,\n\n` +
        `Nombre / Empresa: ${name}\n` +
        `Correo de contacto: ${email}\n` +
        `Motivo: ${subject}\n\n` +
        `Mensaje:\n${msg}\n`
    );
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${mailtoSubject}&body=${mailtoBody}`;

    pContactFeedback.textContent = `✓ Se abrió tu cliente de correo hacia ${CONTACT_EMAIL}.`;
    portfolioContactForm.reset();
  });
}

updatePortfolioMetrics();
renderPortfolio();
checkDatabaseStatus(false);
