/**
 * ============================================================================
 * MOTOR DEL PORTAFOLIO PROFESIONAL FULL-STACK MEAN (portfolio-app.js)
 * ============================================================================
 * Selección curada de los 14 proyectos de ingeniería y aplicaciones reales de
 * Fredy Martinez, organizados por impacto técnico para procesos de selección.
 */

const PORTFOLIO_PROJECTS = [
  // ==========================================================================
  // 1. APLICACIONES FULL-STACK & PRODUCTOS INTEGRADORES
  // ==========================================================================
  {
    id: "app-de-citas",
    title: "Amour & Planes — App de Citas y Álbum de Recuerdos (Full-Stack SQL)",
    folder: "App de citas/",
    category: "fullstack",
    categoryLabel: "Full-Stack SQL & SPA",
    stack: ["Node.js", "SQLite3", "PHP & MySQL", "REST API", "Vanilla JS SPA", "LocalStorage Fallback"],
    description: "Aplicativo web Full-Stack para parejas que permite descubrir planes sugeridos, diseñar planes personalizados, agendar citas con fecha y hora exacta, calificar experiencias y conservar un álbum interactivo de hasta 10 fotografías por cita.",
    review: "Arquitectura híbrida: Servidor HTTP en Node.js con SQLite3 (`server.js` y `database/schema.sql`), backend alternativo para hosting PHP/MySQL (`public/api.php`, `index.php` y `database/schema_mysql.sql`) y cliente SPA (`public/index.html`, `public/styles.css`, `public/app.js`) con persistencia automática en `localStorage` cuando se ejecuta sin servidor.",
    previewUrl: "App de citas/public/index.html",
    codeSnippet: `-- App de citas/database/schema.sql (Esquema Relacional SQLite / MySQL)
CREATE TABLE IF NOT EXISTS planes_sugeridos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL,
    categoria TEXT NOT NULL CHECK(categoria IN ('Romántico', 'Divertido', 'Aventura', 'Gastronómico', 'Creativo', 'Relajante')),
    descripcion TEXT NOT NULL,
    icono TEXT NOT NULL,
    duracion_estimada TEXT NOT NULL,
    presupuesto TEXT NOT NULL,
    lugar_sugerido TEXT NOT NULL,
    tips_romanticos TEXT NOT NULL,
    color_acento TEXT NOT NULL DEFAULT '#f43f5e'
);

CREATE TABLE IF NOT EXISTS citas_programadas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    plan_id INTEGER NOT NULL,
    titulo_cita TEXT NOT NULL,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    lugar TEXT NOT NULL,
    estado TEXT NOT NULL DEFAULT 'Programada',
    calificacion INTEGER DEFAULT 5 CHECK(calificacion BETWEEN 1 AND 5),
    bitacora_recuerdo TEXT DEFAULT '',
    FOREIGN KEY (plan_id) REFERENCES planes_sugeridos(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS fotos_cita (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cita_id INTEGER NOT NULL,
    slot_numero INTEGER NOT NULL CHECK(slot_numero BETWEEN 1 AND 10),
    nombre_archivo TEXT NOT NULL,
    ruta_url TEXT NOT NULL,
    datos_imagen TEXT DEFAULT NULL,
    pie_foto TEXT DEFAULT '',
    FOREIGN KEY (cita_id) REFERENCES citas_programadas(id) ON DELETE CASCADE,
    UNIQUE(cita_id, slot_numero)
);`
  },
  {
    id: "proyecto-bit",
    title: "Procrastination Nightmare — Suite de Productividad en Equipo (6 Módulos)",
    folder: "proyectoBit/",
    category: "fullstack",
    categoryLabel: "Producto SaaS Integrador",
    stack: ["HTML5", "CSS3 Variables", "Bootstrap 5", "JavaScript POO", "Pomodoro Focus", "Landing Page"],
    description: "Plataforma integral de gestión del tiempo y productividad colaborativa con 6 módulos interactivos conectados mediante barra de navegación lateral expandible y landing page corporativa.",
    review: "Incluye: Temporizador Pomodoro Focus (`index.html`, `pomodoro.html`, `js/carlos.js`), Gestor de Tareas (`to-do-list.html`, `js/main.js`), Calendario Mensual de Eventos (`calendario.html`), Tracker Semanal de Hábitos (`habitos.html`), Tablero Roadmap con POO y ordenamiento (`roadMapTareas.html`, `js/roadMapTareas.js`) y Landing Page SaaS (`landing-full-bootstrap/index.html`).",
    previewUrl: "proyectoBit/index.html",
    extraLinks: [
      { label: "Landing Page SaaS", url: "proyectoBit/landing-full-bootstrap/index.html" },
      { label: "Roadmap Tareas POO", url: "proyectoBit/roadMapTareas.html" },
      { label: "Tracker Hábitos", url: "proyectoBit/habitos.html" },
      { label: "Calendario", url: "proyectoBit/calendario.html" },
      { label: "To-Do List", url: "proyectoBit/to-do-list.html" }
    ]
  },
  {
    id: "tienda-online",
    title: "BIT Shop — E-Commerce Tecnológico con Carrito Offcanvas & Mega-Menú",
    folder: "Tienda_Online/",
    category: "fullstack",
    categoryLabel: "E-Commerce Interactivo",
    stack: ["JavaScript ES6+", "Bootstrap 5 Offcanvas", "Dynamic Cart", "Real-Time Search", "Material Symbols"],
    description: "Tienda virtual de equipamiento tecnológico para desarrolladores con filtrado dinámico por categorías en Mega-Menú, buscador instantáneo y carrito de compras lateral con liquidación en pesos colombianos (COP).",
    review: "Contiene catálogo interactivo (`index.html`), hoja de estilos (`style.css`) y motor de comercio electrónico (`script.js`) con gestión de cantidades, descuentos promocionales y checkout.",
    previewUrl: "Tienda_Online/index.html"
  },
  {
    id: "proyecto-bit-turismo",
    title: "Plataforma de Turismo Full-Stack (Arquitectura MEAN)",
    folder: "Proyecto_Bit/",
    category: "fullstack",
    categoryLabel: "Full-Stack MEAN",
    stack: ["MongoDB", "Express.js", "Angular 15", "Node.js", "Mongoose", "CORS"],
    description: "Arquitectura Full-Stack desacoplada para gestión de destinos turísticos compuesta por API REST en Node.js + Express + MongoDB y cliente SPA en Angular 15.",
    review: "Dividido en `TurismoBack/` (servidor Express en `index.js`, conexión Mongoose en `config/db.js`, modelo `models/Destino.js` y endpoints CRUD `/api/destinos` en `routes/routes.js`) y `TurismoFront/` (cliente SPA en Angular 15).",
    codeSnippet: `// Proyecto_Bit/TurismoBack/routes/routes.js
const express = require('express');
const router = express.Router();
const Destino = require('../models/Destino');

// GET /api/destinos — Consultar destinos turísticos
router.get('/destinos', async (req, res) => {
    const destinos = await Destino.find().sort({ fechaCreacion: -1 });
    res.status(200).json({ ok: true, destinos });
});

// POST /api/destinos — Registrar nuevo destino turístico
router.post('/destinos', async (req, res) => {
    const nuevoDestino = new Destino(req.body);
    const guardado = await nuevoDestino.save();
    res.status(201).json({ ok: true, msg: 'Destino registrado correctamente', data: guardado });
});

module.exports = router;`
  },

  // ==========================================================================
  // 2. BACKEND REST APIS (NODE.JS, EXPRESS, TYPESCRIPT, MONGODB, JWT) & ANGULAR
  // ==========================================================================
  {
    id: "is-error-main",
    title: "Bit-Shop REST API — Autenticación JWT & Control de Roles (RBAC)",
    folder: "is-Error-main/",
    category: "backend",
    categoryLabel: "Backend Node.js & JWT",
    stack: ["Node.js", "Express.js", "MongoDB Atlas", "Mongoose", "JWT Auth", "Morgan", "CORS"],
    description: "API RESTful de comercio electrónico con autenticación basada en JSON Web Tokens (JWT), protección de rutas privadas mediante middleware y validación de permisos de administrador.",
    review: "Arquitectura MVC en `src/`: servidor Express (`app.js`), conexión a MongoDB Atlas (`database.js`), esquemas Mongoose (`Models/Product.js`, `Models/User.js`), controladores (`ProductsController.js`, `UsersController.js`) y middleware de seguridad (`middlewares/auth.js`).",
    codeSnippet: `// is-Error-main/src/middlewares/auth.js
const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  try {
    let token = req.headers.authorization;
    if (!token) throw "Acceso denegado: Se requiere un token JWT válido.";
    if (token.startsWith("Bearer ")) token = token.slice(7).trim();

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.pato = decoded; // Payload con user_id, email y permissions
    return next();
  } catch (error) {
    res.status(401).json({ error });
  }
};

module.exports = verifyToken;`
  },
  {
    id: "ts-api",
    title: "Enterprise Modular REST API en TypeScript & Express",
    folder: "ts_api/",
    category: "backend",
    categoryLabel: "Backend TypeScript",
    stack: ["TypeScript", "Express.js", "Static Typing", "Modular Routing", "Barrel Exports"],
    description: "Servidor RESTful fuertemente tipado en TypeScript estructurado bajo arquitectura modular de controladores, validación de parámetros y exportación por barriles (`index.ts`).",
    review: "Contiene punto de entrada (`app.ts`), configuración estricta (`tsconfig.json`), 4 controladores tipados en `controllers/` (`login.controller.ts`, `math.controller.ts`, `operaciones.controller.ts`, `user.controller.ts`) y enrutadores modulares en `routes/`.",
    codeSnippet: `// ts_api/controllers/operaciones.controller.ts
import Express from "express";

export function validar(num1: number, num2: number, res: Express.Response): boolean {
    if (Number.isNaN(num1) || Number.isNaN(num2)) {
        res.status(400).json({ msg: "Uno o ambos parámetros no son números válidos" });
        return false;
    }
    return true;
}

export const division = (req: Express.Request, res: Express.Response) => {
    const num1 = parseFloat(req.params.num1);
    const num2 = parseFloat(req.params.num2);
    if (!validar(num1, num2, res)) return;
    if (num2 === 0) return res.status(400).json({ msg: "No es posible dividir entre cero" });
    res.status(200).json({ msg: \`La división es igual a \${num1 / num2}\`, resultado: num1 / num2 });
};`
  },
  {
    id: "procastination-nightmare-angular",
    title: "Procrastination Nightmare SPA (Angular 15 + FullCalendar v6)",
    folder: "procastination-nightmare/",
    category: "backend",
    categoryLabel: "Frontend Angular 15",
    stack: ["Angular 15", "TypeScript", "FullCalendar v6", "ng-bootstrap", "SweetAlert2"],
    description: "Versión Single Page Application (SPA) en Angular 15 de la suite de productividad con integración de calendario interactivo FullCalendar y modales reactivos.",
    review: "Incluye configuración de Angular CLI (`angular.json`, `package.json`, `tsconfig.json`), módulo raíz (`src/app/app.module.ts`, `app-routing.module.ts`) e integración con `@fullcalendar/angular` (`daygrid`, `timegrid`, `interaction`), `@ng-bootstrap/ng-bootstrap` y `sweetalert2`.",
    codeSnippet: `// procastination-nightmare/package.json (Arquitectura Angular 15)
{
  "name": "procrastination-nightmare-spa",
  "dependencies": {
    "@angular/core": "^15.2.0",
    "@angular/router": "^15.2.0",
    "@fullcalendar/angular": "^6.1.6",
    "@fullcalendar/daygrid": "^6.1.6",
    "@fullcalendar/interaction": "^6.1.6",
    "@fullcalendar/timegrid": "^6.1.6",
    "@ng-bootstrap/ng-bootstrap": "^14.1.1",
    "bootstrap": "^5.2.3",
    "sweetalert2": "^11.7.3"
  }
}`
  },

  // ==========================================================================
  // 3. JAVASCRIPT AVANZADO, GESTIÓN DE ESTADO & CONSUMO DE APIS REST
  // ==========================================================================
  {
    id: "rickandmorty-api",
    title: "Multiverse Character Explorer — The Rick and Morty REST API",
    folder: "rickandmorty_api/",
    category: "js",
    categoryLabel: "REST API & Async/Await",
    stack: ["Fetch API", "Async/Await", "Dynamic Pagination", "Status Filters", "Offline Fallback"],
    description: "Cliente SPA conectado a la API REST oficial de Rick & Morty con búsqueda en tiempo real, filtros por estado vital (Alive / Dead / Unknown), paginación dinámica y modo offline.",
    review: "Contiene interfaz oscura Sci-Fi (`index.html`) y controlador asíncrono (`script.js`) con manejo de parámetros `URLSearchParams`, control de páginas y dataset de respaldo.",
    previewUrl: "rickandmorty_api/index.html"
  },
  {
    id: "formulario-aspirantes",
    title: "TalentHub — Portal HR de Postulación & Colección JSON en Vivo",
    folder: "Formulario/",
    category: "js",
    categoryLabel: "JavaScript & JSON State",
    stack: ["JavaScript ES6+", "Form Validation", "Live JSON Inspector", "Bootstrap 5"],
    description: "Sistema corporativo de registro de aspirantes con campos condicionales dinámicos, adaptación visual por género, liquidación salarial en COP e inspector JSON en tiempo real.",
    review: "Contiene interfaz ejecutiva de dos columnas (`index.html`), estilos (`style.css`) y motor de validación y estado (`script.js`).",
    previewUrl: "Formulario/index.html"
  },
  {
    id: "navbar-todolist",
    title: "Panel Administrativo BIT con Sidebar Animado & Gestor de Tareas",
    folder: "Navbar-todolist/",
    category: "js",
    categoryLabel: "Dashboard UI & DOM",
    stack: ["Bootstrap 5", "Material Icons", "Bootstrap Icons", "CSS Transitions", "Vanilla JS"],
    description: "Dashboard corporativo que integra barra superior de herramientas, menú lateral colapsable con transiciones CSS y módulo interactivo de gestión de tareas.",
    review: "Contiene layout de administración (`index.html`), arquitectura CSS de sidebar aislado (`css/style.css`) y controlador DOM (`js/main.js`).",
    previewUrl: "Navbar-todolist/index.html"
  },

  // ==========================================================================
  // 4. CLONES UI DE ALTA FIDELIDAD & CV EJECUTIVO
  // ==========================================================================
  {
    id: "my-cv",
    title: "CV Ejecutivo & Perfil Profesional — Fredy Martinez",
    folder: "My CV/",
    category: "ui",
    categoryLabel: "CV Ejecutivo",
    stack: ["HTML5 Semántico", "CSS3 Flexbox", "Material Icons", "Formulario de Contacto"],
    description: "Currículum web ejecutivo de Fredy Martinez con presentación profesional, tarjetas de especialidades Full-Stack / Scrum Master y módulo de contacto directo.",
    review: "Contiene maquetación ejecutiva (`index.html`), sistema de diseño responsivo (`style.css`), retrato profesional y canales directos de WhatsApp y correo.",
    previewUrl: "My CV/index.html"
  },
  {
    id: "spotify-clone",
    title: "Clon de Spotify Premium Colombia (Landing Page & Planes)",
    folder: "Spotify/",
    category: "ui",
    categoryLabel: "Clon UI Corporativo",
    stack: ["HTML5 Semántico", "CSS3 Flexbox", "Font Awesome", "Pasarelas de Pago"],
    description: "Réplica de alta fidelidad de la página promocional de Spotify Premium Colombia con hero banner, grilla de beneficios, pasarelas locales y comparativa de 4 planes.",
    review: "Contiene estructura semántica (`index.html`), hoja de estilos completa (`assets/css/style.css`) e iconografía personalizada en `assets/img/`.",
    previewUrl: "Spotify/index.html"
  },
  {
    id: "instagram-clone",
    title: "Clon de Inicio de Sesión de Instagram Desktop",
    folder: "Instagram/",
    category: "ui",
    categoryLabel: "Clon UI & Validación",
    stack: ["HTML5", "CSS3 Positioning", "Flexbox", "Interactive Validation"],
    description: "Réplica exacta de la pantalla de acceso de Instagram para escritorio con composición superpuesta de dispositivos móviles y validación interactiva de credenciales.",
    review: "Contiene `index.html`, hoja de estilos `assets/css/style.css` con posicionamiento relativo/absoluto calibrado y recursos gráficos en `assets/img/`.",
    previewUrl: "Instagram/index.html"
  },
  {
    id: "microsoft-login",
    title: "Clon de Autenticación de Microsoft Account (Fluent UI)",
    folder: "Microsoft_Login/",
    category: "ui",
    categoryLabel: "Clon UI Fluent Design",
    stack: ["HTML5", "CSS3 Fluent UI", "Bootstrap 5", "Material Symbols"],
    description: "Réplica de la ventana de autenticación de cuentas Microsoft con estética Fluent Design, estados de foco corporativos y validación interactiva.",
    review: "Contiene `index.html`, hoja de estilos `assets/css/style.css` y activos oficiales en `assets/img/`.",
    previewUrl: "Microsoft_Login/index.html",
    extraLinks: [
      { label: "Ver también: Clon de Snapchat Web", url: "Snapchat/index.html" }
    ]
  }
];

// ============================================================================
// LÓGICA DE RENDERIZADO Y FILTRADO DEL PORTAFOLIO
// ============================================================================

const gridContainer = document.getElementById("projectsGrid");
const filterButtons = document.querySelectorAll(".filter-btn");
const searchInput = document.getElementById("projectSearch");
const countBadge = document.getElementById("projectCountBadge");

let currentCategory = "all";
let currentSearch = "";

function renderPortfolio() {
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
    countBadge.textContent = `${filtered.length} proyectos seleccionados`;
  }

  if (filtered.length === 0) {
    gridContainer.innerHTML = `
      <div class="col-12 text-center py-5">
        <h4 class="text-secondary">No se encontraron proyectos con ese criterio.</h4>
      </div>
    `;
    return;
  }

  gridContainer.innerHTML = filtered
    .map((proj) => {
      const stackBadges = proj.stack
        .map((tech) => `<span class="tech-tag">${tech}</span>`)
        .join("");

      const extraLinksHtml = (proj.extraLinks || [])
        .map(
          (lnk) =>
            `<button type="button" class="btn btn-sm btn-outline-info py-1 px-2" onclick="openPreviewModal('${proj.title} — ${lnk.label}', '${lnk.url}')">${lnk.label}</button>`
        )
        .join("");

      const actionButton = proj.previewUrl
        ? `<div class="d-flex flex-wrap gap-2 mt-auto pt-3">
             <button type="button" class="btn btn-info btn-sm fw-bold text-dark flex-grow-1" onclick="openPreviewModal('${proj.title}', '${proj.previewUrl}')">
               ▶ Vista Previa Interactiva
             </button>
             ${
               proj.codeSnippet
                 ? `<button type="button" class="btn btn-outline-warning btn-sm fw-semibold" onclick="openCodeModal('${proj.id}')" title="Inspeccionar SQL y Backend">&lt;/&gt; SQL / Código</button>`
                 : ""
             }
             <a href="${proj.previewUrl}" target="_blank" class="btn btn-outline-light btn-sm" title="Abrir en pestaña nueva">
               ↗ Abrir
             </a>
           </div>`
        : `<div class="d-flex flex-wrap gap-2 mt-auto pt-3">
             <button type="button" class="btn btn-outline-warning btn-sm fw-semibold w-100" onclick="openCodeModal('${proj.id}')">
               &lt;/&gt; Inspeccionar Código y Arquitectura
             </button>
           </div>`;

      return `
      <div class="col-lg-4 col-md-6">
        <article class="project-card">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <span class="cat-badge cat-${proj.category}">${proj.categoryLabel}</span>
            <span class="file-path-tag">📁 ${proj.folder}</span>
          </div>

          <h5 class="fw-bold mb-2 text-white">${proj.title}</h5>
          <p class="small text-secondary mb-2">${proj.description}</p>

          <div class="review-box">
            <strong class="text-info d-block mb-1">📦 Arquitectura &amp; Componentes:</strong>
            ${proj.review}
          </div>

          <div class="d-flex flex-wrap gap-1 mb-2">
            ${stackBadges}
          </div>

          ${extraLinksHtml ? `<div class="d-flex flex-wrap gap-1 mb-2">${extraLinksHtml}</div>` : ""}

          ${actionButton}
        </article>
      </div>
      `;
    })
    .join("");
}

window.openPreviewModal = function (title, url) {
  const modalTitle = document.getElementById("previewModalTitle");
  const iframe = document.getElementById("previewIframe");
  const externalLink = document.getElementById("previewExternalLink");
  const codeContainer = document.getElementById("codeInspectorContainer");
  const iframeContainer = document.getElementById("iframeContainer");

  modalTitle.textContent = title;
  externalLink.href = url;
  externalLink.classList.remove("d-none");
  codeContainer.classList.add("d-none");
  iframeContainer.classList.remove("d-none");
  iframe.src = url;

  const modal = new bootstrap.Modal(document.getElementById("portfolioModal"));
  modal.show();
};

window.openCodeModal = function (projectId) {
  const proj = PORTFOLIO_PROJECTS.find((p) => p.id === projectId);
  if (!proj) return;

  const modalTitle = document.getElementById("previewModalTitle");
  const externalLink = document.getElementById("previewExternalLink");
  const codeContainer = document.getElementById("codeInspectorContainer");
  const iframeContainer = document.getElementById("iframeContainer");
  const codeBlock = document.getElementById("codeBlockContent");
  const reviewNotes = document.getElementById("codeReviewNotes");

  modalTitle.textContent = `${proj.title} (${proj.folder})`;
  externalLink.classList.add("d-none");
  iframeContainer.classList.add("d-none");
  codeContainer.classList.remove("d-none");

  reviewNotes.textContent = proj.review;
  codeBlock.textContent = proj.codeSnippet || "// Código documentado en la carpeta " + proj.folder;

  const modal = new bootstrap.Modal(document.getElementById("portfolioModal"));
  modal.show();
};

document.getElementById("portfolioModal").addEventListener("hidden.bs.modal", () => {
  document.getElementById("previewIframe").src = "about:blank";
});

filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentCategory = btn.getAttribute("data-category");
    renderPortfolio();
  });
});

if (searchInput) {
  searchInput.addEventListener("input", (e) => {
    currentSearch = e.target.value.trim();
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

// 1. Envío directo a WhatsApp (+57 315 238 8315)
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

// 2. Envío a Correo Electrónico (FormSubmit AJAX + respaldo mailto:)
if (portfolioContactForm && pContactFeedback) {
  portfolioContactForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const { name, email, subject, msg } = getPortfolioFormValues();
    if (!name || !email || !msg) return;

    pContactFeedback.textContent = "⏳ Preparando envío a " + CONTACT_EMAIL + "...";

    // Abrir cliente de correo con el asunto y cuerpo prellenados (funciona 100% sin servidor)
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

renderPortfolio();
