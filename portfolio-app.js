/**
 * ============================================================================
 * MOTOR DEL PORTAFOLIO PROFESIONAL FULL-STACK MEAN & SQL (portfolio-app.js)
 * ============================================================================
 * Selección curada de proyectos de ingeniería de software Full-Stack (MEAN,
 * SQL, TypeScript, Node.js nativo, Angular 16, HTML5 Web APIs y Testing) de
 * Fredy Martinez, con renderizado seguro (escapeHtml + delegación de eventos).
 */

const PORTFOLIO_PROJECTS = [
  // ==========================================================================
  // 1. APLICACIONES FULL-STACK & PRODUCTOS INTEGRADORES
  // ==========================================================================
  {
    id: "turismo-mean",
    title: "Turismo MEAN — Plataforma Full-Stack (MongoDB + Express + Angular 16)",
    folder: "Turismo_MEAN/",
    category: "fullstack",
    categoryLabel: "Full-Stack MEAN",
    stack: ["MongoDB & Mongoose 7", "Express.js", "Angular 16", "Node.js", "node:test (4 tests)", "JSON Fallback"],
    description: "Plataforma Full-Stack desacoplada para gestión de destinos turísticos con API REST CRUD, filtros por categoría, endpoint de métricas agregadas (/stats/resumen), cliente SPA en Angular 16 y respaldo automático offline.",
    review: "Dividido en `TurismoBack/` (Express, Mongoose 7, rutas `/api/destinos`, almacenamiento dual MongoDB/JSON y 4 pruebas automatizadas en `tests/*.test.js`) y `TurismoFront/` (SPA Angular 16 con componentes modulares).",
    runCmd: "cd Turismo_MEAN/TurismoBack && npm run dev\ncd Turismo_MEAN/TurismoFront && npm run dev",
    testCmd: "cd Turismo_MEAN/TurismoBack && npm test",
    codeSnippet: `// Turismo_MEAN/TurismoBack/routes/routes.js
const express = require('express');
const router = express.Router();
const Destino = require('../models/Destino');

// GET /api/destinos — Consultar destinos ordenados por precio
router.get('/destinos', async (req, res) => {
  const destinos = await Destino.find().sort({ precio: 1 });
  res.status(200).json({ ok: true, destinos });
});

// POST /api/destinos — Registrar nuevo destino turístico
router.post('/destinos', async (req, res) => {
  const nuevoDestino = new Destino(req.body);
  const guardado = await nuevoDestino.save();
  res.status(201).json({ ok: true, data: guardado });
});

module.exports = router;`
  },
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
);`
  },
  {
    id: "gestor-tareas-node",
    title: "Gestor de Tareas Full-Stack en Node.js Nativo (HTTP + NDJSON + node:test)",
    folder: "Gestor-Tareas-Node/",
    category: "fullstack",
    categoryLabel: "Node.js Nativo & Testing",
    stack: ["Node.js (node:http)", "REST API Nativa", "JSON & NDJSON Audit", "EventEmitter", "node:test (2 tests)", "SPA Fallback"],
    description: "Aplicación Full-Stack construida sin dependencias externas: servidor HTTP nativo con API REST CRUD, persistencia en JSON, bitácora de auditoría en NDJSON, bus de eventos con EventEmitter, pruebas unitarias con node:test y SPA con respaldo en localStorage.",
    review: "Arquitectura modular en `src/` (`server.js`, `tareas.js`, `storage.js`, `bus.js`, `index.js`), pruebas automatizadas en `tests/tareas.test.js`, protección contra Path Traversal y límite de payload de 1 MB.",
    previewUrl: "Gestor-Tareas-Node/public/index.html",
    runCmd: "cd Gestor-Tareas-Node && npm start",
    testCmd: "cd Gestor-Tareas-Node && npm test",
    codeSnippet: `// Gestor-Tareas-Node/src/server.js (API REST Nativa con node:http y seguridad)
import http from 'node:http';
import { resolve, extname } from 'node:path';
import { readFile } from 'node:fs/promises';

// Protección contra Path Traversal al servir archivos estáticos
async function intentarEnviarArchivo(baseDir, relPath, res) {
  const fullPath = resolve(baseDir, relPath);
  if (!fullPath.startsWith(baseDir)) {
    enviarJson(res, 403, { error: 'Acceso denegado' });
    return true;
  }
  const data = await readFile(fullPath);
  res.writeHead(200, { 'Content-Type': MIME_TYPES[extname(fullPath)] || 'application/octet-stream' });
  res.end(data);
  return true;
}`
  },
  {
    id: "proyecto-bit",
    title: "Procrastination Nightmare — Suite de Productividad en Equipo (7 Módulos)",
    folder: "proyectoBit/",
    category: "fullstack",
    categoryLabel: "Producto SaaS Integrador",
    stack: ["HTML5", "CSS3 Variables", "Bootstrap 5", "JavaScript POO", "Pomodoro Focus", "Backup JSON"],
    description: "Plataforma integral de gestión del tiempo y productividad colaborativa con 7 módulos interactivos conectados mediante barra lateral expandible, notas rápidas, respaldo JSON y landing page corporativa.",
    review: "Incluye: Pomodoro Focus (`index.html`, `pomodoro.html`), Gestor To-Do (`to-do-list.html`), Calendario Mensual (`calendario.html`), Tracker de Hábitos (`habitos.html`), Notas (`notas.html`), Roadmap POO (`roadMapTareas.html`), respaldo (`js/backup.js`) y Landing Page SaaS (`landing-full-bootstrap/index.html`).",
    previewUrl: "proyectoBit/index.html",
    extraLinks: [
      { label: "Landing Page SaaS", url: "proyectoBit/landing-full-bootstrap/index.html" },
      { label: "Roadmap Tareas POO", url: "proyectoBit/roadMapTareas.html" },
      { label: "Tracker Hábitos", url: "proyectoBit/habitos.html" },
      { label: "Calendario", url: "proyectoBit/calendario.html" },
      { label: "Notas", url: "proyectoBit/notas.html" },
      { label: "To-Do List", url: "proyectoBit/to-do-list.html" }
    ]
  },
  {
    id: "finanzas-app",
    title: "Finanzas APP — Dashboard de Control Financiero & Gráfico Canvas 2D",
    folder: "Finanzas APP/",
    category: "fullstack",
    categoryLabel: "FinTech App & Canvas 2D",
    stack: ["HTML5 Canvas 2D Chart", "JavaScript ES6+", "LocalStorage State", "COP Currency Formatter", "Dynamic Filters"],
    description: "Aplicación FinTech de control de ingresos, gastos y balance patrimonial en tiempo real con formateo automático de miles en pesos colombianos (COP), gráfico de dona renderizado nativamente en HTML5 Canvas 2D y filtros dinámicos.",
    review: "Contiene interfaz Glassmorphism (`index.html`), hoja de estilos (`style.css`) y motor financiero (`app.js`) con cálculo reactivo con `filter`/`reduce`, gráfico circular proporcional sin librerías externas y persistencia en `localStorage`.",
    previewUrl: "Finanzas APP/index.html",
    codeSnippet: `// Finanzas APP/app.js (Gráfico de Dona proporcional en HTML5 Canvas 2D)
function dibujarGrafico(totalIngresos, totalGastos) {
  const sumaTotal = totalIngresos + totalGastos;
  const proporcionIngresos = totalIngresos / sumaTotal;
  const anguloInicial = -Math.PI / 2;
  const anguloFinIngresos = anguloInicial + proporcionIngresos * Math.PI * 2;

  contextoGrafico.beginPath();
  contextoGrafico.arc(90, 90, 66, anguloInicial, anguloFinIngresos);
  contextoGrafico.strokeStyle = '#10b981';
  contextoGrafico.lineWidth = 22;
  contextoGrafico.stroke();

  contextoGrafico.beginPath();
  contextoGrafico.arc(90, 90, 66, anguloFinIngresos, anguloInicial + Math.PI * 2);
  contextoGrafico.strokeStyle = '#fb7185';
  contextoGrafico.lineWidth = 22;
  contextoGrafico.stroke();
}`
  },
  {
    id: "tablero-kanban",
    title: "Tablero Kanban Scrum — Gestión Ágil de Sprints con Drag & Drop",
    folder: "Tablero Kanban/",
    category: "fullstack",
    categoryLabel: "Agile Scrum & Drag-Drop",
    stack: ["HTML5 Drag & Drop API", "Scrum Workflow", "LocalStorage Persistence", "CSS Grid Glassmorphism", "Vanilla JS"],
    description: "Tablero interactivo de metodología ágil Scrum dividido en 3 columnas de flujo (Por Hacer, En Progreso, Completado) con transferencia de tarjetas mediante la API nativa Drag & Drop y persistencia automática en el navegador.",
    review: "Contiene estructura del tablero (`index.html`), tema neón oscuro (`style.css`) y controlador de estado (`app.js`) que serializa payloads JSON en `dataTransfer` durante los eventos `dragstart`, `dragover` y `drop`.",
    previewUrl: "Tablero Kanban/index.html",
    codeSnippet: `// Tablero Kanban/app.js (Transferencia entre columnas con Drag & Drop API)
contenedor.addEventListener('drop', (evento) => {
  evento.preventDefault();
  columnaEl.classList.remove('drag-over');

  const datosArrastre = JSON.parse(evento.dataTransfer.getData('text/plain'));
  const columnaDestino = columnaEl.dataset.columna;
  if (datosArrastre.origen === columnaDestino) return;

  const indice = estadoKanban[datosArrastre.origen].findIndex((t) => t.id === datosArrastre.id);
  const [tareaMovida] = estadoKanban[datosArrastre.origen].splice(indice, 1);
  estadoKanban[columnaDestino].push(tareaMovida);

  guardarEstado();
  renderizarTablero();
});`
  },
  {
    id: "buscador-peliculas",
    title: "Buscador de Películas (CineSearch) — OMDb REST API & Debounce",
    folder: "Buscador de Peliculas/",
    category: "fullstack",
    categoryLabel: "REST API & Debounce",
    stack: ["OMDb REST API", "Debounce Pattern (500ms)", "Async/Await Fetch", "HTML5 Native Dialog", "CSS Grid"],
    description: "Buscador cinematográfico en tiempo real conectado a la API REST de OMDb con optimización de peticiones mediante patrón Debounce (500ms), filtros rápidos por franquicia y ficha técnica completa en ventana modal nativa.",
    review: "Contiene interfaz con sugerencias rápidas (`index.html`), estilos Glassmorphism (`style.css`) y controlador asíncrono (`app.js`) con `buscarPeliculas()`, `verDetalles(imdbID)`, catálogo local de respaldo y apertura modal nativa `showModal()`.",
    previewUrl: "Buscador de Peliculas/index.html",
    codeSnippet: `// Buscador de Peliculas/app.js (Optimización de búsqueda en vivo con patrón Debounce)
let debounceTimer;
buscadorInput.addEventListener('input', (evento) => {
  clearTimeout(debounceTimer);
  const busqueda = evento.target.value.trim();
  if (busqueda.length < 2) return;

  debounceTimer = setTimeout(() => {
    buscarPeliculas(busqueda);
  }, 500);
});`
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

  // ==========================================================================
  // 2. BACKEND REST APIS (NODE.JS, TYPESCRIPT, MONGODB, JWT) & ANGULAR 16
  // ==========================================================================
  {
    id: "bitshop-api",
    title: "BitShop REST API — JWT, Hashing scrypt, RBAC & Docs Interactivos",
    folder: "BitShop_API/",
    category: "backend",
    categoryLabel: "Backend Security & JWT",
    stack: ["Node.js", "Express.js", "JWT Auth", "scrypt Hashing", "RBAC (admin/client)", "node:test (3 tests)"],
    description: "API RESTful de comercio electrónico orientada a producción: autenticación JWT, hashing criptográfico de contraseñas con Node crypto scrypt, control de acceso basado en roles (RBAC), panel Login-first en /, documentación interactiva en /docs y respaldo JSON.",
    review: "Arquitectura MVC en `src/`: servidor Express (`app.js`), autenticación y firma JWT, middleware RBAC (`middlewares/auth.js`), panel visual y pruebas automatizadas en `tests/*.test.js`.",
    runCmd: "cd BitShop_API && npm run dev\n# Panel Login-first: http://localhost:5000 (y /docs)",
    testCmd: "cd BitShop_API && npm test",
    codeSnippet: `// BitShop_API/src/middlewares/auth.js
const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  try {
    let token = req.headers.authorization;
    if (!token) return res.status(401).json({ error: "Token JWT requerido" });
    if (token.startsWith("Bearer ")) token = token.slice(7).trim();

    req.user = jwt.verify(token, process.env.JWT_SECRET_KEY);
    return next();
  } catch (error) {
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
};`
  },
  {
    id: "ts-api",
    title: "Enterprise Modular REST API en TypeScript Estricto & Express",
    folder: "ts_api/",
    category: "backend",
    categoryLabel: "Backend TypeScript",
    stack: ["TypeScript 5", "Express.js", "Static Typing", "Login-First UI", "node:test (4 tests)"],
    description: "Servidor RESTful fuertemente tipado en TypeScript estricto bajo arquitectura modular de controladores, rutas tipadas, interfaz Login-first en `/` y suite de pruebas automatizadas.",
    review: "Incluye punto de entrada (`app.ts`), configuración estricta (`tsconfig.json`), panel cliente (`public/`), controladores en `controllers/`, rutas modulares en `routes/` y 4 pruebas en `tests/`.",
    runCmd: "cd ts_api && npm run dev\n# Panel visual: http://localhost:3000",
    testCmd: "cd ts_api && npm test",
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
  res.status(200).json({ resultado: num1 / num2 });
};`
  },
  {
    id: "mongo-crud-playground",
    title: "MongoDB CRUD & Query Operators Engine + Playground Web (DBZ-V2)",
    folder: "Mongo/",
    category: "backend",
    categoryLabel: "NoSQL MongoDB & Testing",
    stack: ["MongoDB", "mongosh", "Query Operators ($in/$or/$gte)", "Update ($set/$inc/$push)", "node:test (3 tests)"],
    description: "Motor y laboratorio interactivo de consultas NoSQL con implementación local de operadores MongoDB ($eq, $ne, $gte, $lt, $in, $or, $set, $inc, $unset, $push), scripts mongosh, Playground Web en puerto 3002 y pruebas unitarias.",
    review: "Contiene `run-mongo-demo.js`, dataset `dbz-v2.json`, interfaz Playground Web (`public/`) y 3 suites de verificación de operadores en `tests/*.test.js`.",
    runCmd: "cd Mongo && npm run dev\n# Playground Web: http://localhost:3002",
    testCmd: "cd Mongo && npm test",
    codeSnippet: `// Mongo/tests/ — Verificación de operadores MongoDB ($gte, $in, $or, $inc)
const guerreros = await db.find({
  $or: [
    { raza: { $in: ["Saiyan", "Namekiano"] } },
    { poder: { $gte: 9000 } }
  ]
});
await db.updateOne({ nombre: "Goku" }, { $inc: { poder: 500 }, $push: { tecnicas: "Genkidama" } });`
  },
  {
    id: "procrastination-nightmare-angular",
    title: "Procrastination Nightmare SPA (Angular 16 + FullCalendar v6)",
    folder: "procrastination-nightmare/",
    category: "backend",
    categoryLabel: "Frontend Angular 16",
    stack: ["Angular 16", "TypeScript 5", "FullCalendar v6", "PrimeNG 16", "RxJS 7"],
    description: "Single Page Application (SPA) en Angular 16 con calendario interactivo FullCalendar v6, gestión de estado reactivo con RxJS, decodificación JWT y componentes UI empresariales.",
    review: "Incluye configuración de Angular 16 (`angular.json`, `package.json`, `tsconfig.json`), integración con `@fullcalendar/angular` (`daygrid`, `timegrid`, `interaction`), `primeng`, `@ng-bootstrap/ng-bootstrap` y `jwt-decode`.",
    runCmd: "cd procrastination-nightmare && npm run dev",
    codeSnippet: `// procrastination-nightmare/package.json (Stack Angular 16)
{
  "dependencies": {
    "@angular/core": "^16.0.0",
    "@fullcalendar/angular": "^6.1.8",
    "@ng-bootstrap/ng-bootstrap": "^15.0.1",
    "primeng": "^16.0.2",
    "jwt-decode": "^3.1.2",
    "rxjs": "~7.8.0"
  }
}`
  },

  // ==========================================================================
  // 3. JAVASCRIPT AVANZADO, HTML5 WEB APIS & CONSUMO DE APIS REST
  // ==========================================================================
  {
    id: "sketchpad-canvas-2d",
    title: "SketchPad 2D Pro — Estudio de Dibujo Vectorial (HTML5 Canvas API)",
    folder: "SketchPad-Canvas-2D/",
    category: "js",
    categoryLabel: "HTML5 Canvas 2D API",
    stack: ["HTML5 Canvas 2D", "ImageData Undo Stack", "Ctrl+Z History", "PNG Export (toDataURL)", "Vanilla JS"],
    description: "Pizarra interactiva de diseño 2D con soporte de pincel libre, borrador, trazado geométrico en tiempo real (rectángulos, círculos, líneas), rejilla técnica, pila de historial Deshacer (Ctrl+Z) mediante snapshots de píxeles y exportación directa a PNG.",
    review: "Aplicación standalone autocontenida (`index.html`, `style.css`, `app.js`) que manipula buffers de píxeles con `ctx.getImageData()` y `ctx.putImageData()` para previsualizar figuras sin destruir las capas previas.",
    previewUrl: "SketchPad-Canvas-2D/index.html",
    codeSnippet: `// SketchPad-Canvas-2D/app.js
function saveHistory() {
  history.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
  if (history.length > 25) history.shift();
}

function undo() {
  if (history.length <= 1) return;
  history.pop();
  ctx.putImageData(history[history.length - 1], 0, 0);
}`
  },
  {
    id: "notesdb-indexeddb",
    title: "NotesDB — Gestor Transaccional Offline-First con IndexedDB",
    folder: "Gestor-Offline-IndexedDB/",
    category: "js",
    categoryLabel: "IndexedDB & Offline-First",
    stack: ["IndexedDB API", "IDBTransaction CRUD", "IDBCursor Search", "Inline ContentEditable", "Blob JSON Export"],
    description: "Sistema de gestión de notas y tareas con arquitectura Offline-First que utiliza la base de datos transaccional nativa del navegador (`IndexedDB`) para operaciones CRUD asíncronas, edición en línea, filtrado por cursores y respaldo descargable en JSON.",
    review: "Aplicación standalone (`index.html`, `style.css`, `app.js`) que implementa `indexedDB.open()`, migración de esquemas en `upgradeneeded`, transacciones `readwrite`/`readonly`, recorrido con `openCursor()` y generación de archivos con `Blob`.",
    previewUrl: "Gestor-Offline-IndexedDB/index.html",
    codeSnippet: `// Gestor-Offline-IndexedDB/app.js
const req = indexedDB.open('NotesDB_Portfolio', 1);
req.addEventListener('upgradeneeded', () => {
  const database = req.result;
  if (!database.objectStoreNames.contains('notas')) {
    database.createObjectStore('notas', { autoIncrement: true });
  }
});`
  },
  {
    id: "filedrop-inspector",
    title: "FileDrop Inspector — Analizador Multimedia (Drag & Drop + FileReader)",
    folder: "Visor-Archivos-DragDrop/",
    category: "js",
    categoryLabel: "FileReader & Drag-Drop API",
    stack: ["Drag & Drop API", "FileReader Streams", "Blob & ObjectURL", "Clipboard API", "Progress Bar"],
    description: "Inspector y previsualizador universal de archivos en el navegador con soporte Drag & Drop, barra de progreso de lectura binaria, extracción de metadatos (MIME type y tamaño formateado), renderizado de imágenes/audio/video/código y copia al portapapeles.",
    review: "Aplicación standalone (`index.html`, `style.css`, `app.js`) con lectura adaptativa (`readAsDataURL`, `readAsArrayBuffer`, `readAsText`), `URL.createObjectURL` para streaming multimedia local e integración con `navigator.clipboard.writeText`.",
    previewUrl: "Visor-Archivos-DragDrop/index.html",
    codeSnippet: `// Visor-Archivos-DragDrop/app.js
const reader = new FileReader();
reader.addEventListener('progress', (e) => {
  if (e.lengthComputable) {
    progressFill.style.width = \`\${Math.round((e.loaded / e.total) * 100)}%\`;
  }
});`
  },
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
    id: "web-page-animations",
    title: "Portfolio UI & Motion — Animaciones CSS3 a 60 FPS (GPU & Scroll-Driven)",
    folder: "Web-Page-Animations/",
    category: "js",
    categoryLabel: "CSS3 Motion & UI Architecture",
    stack: ["CSS3 @keyframes", "3D GPU Transforms", "Scroll-Driven Animations", "prefers-reduced-motion", "Responsive Sin JS"],
    description: "Interfaz futurista de alto rendimiento visual construida con animaciones CSS aceleradas por GPU: barra de progreso ligada al scroll, órbitas rotatorias, texto con gradiente cinético, marquee infinito, tarjetas 3D y soporte de accesibilidad `prefers-reduced-motion`.",
    review: "Maquetación semántica (`index.html`), fuentes locales (`fonts.css`) y sistema de animaciones en `style.css` con menú hamburguesa 100% CSS (checkbox hack) sin librerías externas.",
    previewUrl: "Web-Page-Animations/index.html"
  }
];

// ============================================================================
// UTILIDADES DE SEGURIDAD Y RENDERIZADO
// ============================================================================

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ============================================================================
// LÓGICA DE RENDERIZADO Y FILTRADO DEL PORTAFOLIO
// ============================================================================

const gridContainer = document.getElementById("projectsGrid");
const filterButtons = document.querySelectorAll(".filter-btn");
const searchInput = document.getElementById("projectSearch");
const countBadge = document.getElementById("projectCountBadge");

let currentCategory = "all";
let currentSearch = "";

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
  if (filterBackendEl) filterBackendEl.textContent = `⚙️ Backend APIs & Angular (${backendCount})`;
  if (filterJsEl) filterJsEl.textContent = `⚡ Web APIs, JS & CSS Motion (${jsCount})`;
}

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
    countBadge.textContent = `${filtered.length} proyectos seleccionados`;
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
      const safeFolder = escapeHtml(proj.folder);
      const safeCategory = escapeHtml(proj.category);
      const safeCategoryLabel = escapeHtml(proj.categoryLabel);
      const safeDesc = escapeHtml(proj.description);
      const safeReview = escapeHtml(proj.review);
      const safeId = escapeHtml(proj.id);

      const stackBadges = proj.stack
        .map((tech) => `<span class="tech-tag">${escapeHtml(tech)}</span>`)
        .join("");

      const extraLinksHtml = (proj.extraLinks || [])
        .map(
          (lnk) =>
            `<button type="button" class="btn btn-sm btn-outline-info py-1 px-2" data-action="preview" data-title="${safeTitle} — ${escapeHtml(lnk.label)}" data-url="${escapeHtml(lnk.url)}">${escapeHtml(lnk.label)}</button>`
        )
        .join("");

      const encodedPreviewUrl = proj.previewUrl ? encodeURI(proj.previewUrl) : "";
      const actionButton = proj.previewUrl
        ? `<div class="d-flex flex-wrap gap-2 mt-auto pt-3">
             <button type="button" class="btn btn-info btn-sm fw-bold text-dark flex-grow-1" data-action="preview" data-title="${safeTitle}" data-url="${escapeHtml(proj.previewUrl)}">
               ▶ Vista Previa Interactiva
             </button>
             ${
               proj.codeSnippet || proj.runCmd
                 ? `<button type="button" class="btn btn-outline-warning btn-sm fw-semibold" data-action="code" data-id="${safeId}" title="Inspeccionar Código, Arquitectura y Comandos">&lt;/&gt; Código</button>`
                 : ""
             }
             <a href="${encodedPreviewUrl}" target="_blank" rel="noopener" class="btn btn-outline-light btn-sm" title="Abrir en pestaña nueva">
               ↗ Abrir
             </a>
           </div>`
        : `<div class="d-flex flex-wrap gap-2 mt-auto pt-3">
             <button type="button" class="btn btn-outline-warning btn-sm fw-semibold w-100" data-action="code" data-id="${safeId}">
               &lt;/&gt; Inspeccionar Código, CLI y Tests
             </button>
           </div>`;

      return `
      <div class="col-lg-4 col-md-6">
        <article class="project-card">
          <div class="d-flex justify-content-between align-items-center mb-2 gap-2">
            <span class="cat-badge cat-${safeCategory}">${safeCategoryLabel}</span>
            <span class="file-path-tag">📁 ${safeFolder}</span>
          </div>

          <h5 class="fw-bold mb-2 text-white">${safeTitle}</h5>
          <p class="small text-secondary mb-2">${safeDesc}</p>

          <div class="review-box">
            <strong class="text-info d-block mb-1">📦 Arquitectura &amp; Componentes:</strong>
            ${safeReview}
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

window.resetPortfolioFilters = function () {
  currentCategory = "all";
  currentSearch = "";
  if (searchInput) searchInput.value = "";
  filterButtons.forEach((b) => b.classList.toggle("active", b.getAttribute("data-category") === "all"));
  renderPortfolio();
};

const modalEl = document.getElementById("portfolioModal");
const previewIframeEl = document.getElementById("previewIframe");
const iframeLoaderEl = document.getElementById("iframeLoader");
const copyCodeBtnEl = document.getElementById("copyCodeBtn");

if (previewIframeEl && iframeLoaderEl) {
  previewIframeEl.addEventListener("load", () => {
    iframeLoaderEl.classList.add("loaded");
  });
}

window.openPreviewModal = function (title, url) {
  const modalTitle = document.getElementById("previewModalTitle");
  const externalLink = document.getElementById("previewExternalLink");
  const codeContainer = document.getElementById("codeInspectorContainer");
  const iframeContainer = document.getElementById("iframeContainer");
  const safeUrl = encodeURI(url);

  modalTitle.textContent = title;
  externalLink.href = safeUrl;
  externalLink.classList.remove("d-none");
  if (copyCodeBtnEl) copyCodeBtnEl.classList.add("d-none");
  codeContainer.classList.add("d-none");
  iframeContainer.classList.remove("d-none");
  if (iframeLoaderEl) iframeLoaderEl.classList.remove("loaded");
  previewIframeEl.src = safeUrl;

  const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
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
  if (copyCodeBtnEl) copyCodeBtnEl.classList.remove("d-none");
  iframeContainer.classList.add("d-none");
  codeContainer.classList.remove("d-none");

  reviewNotes.textContent = proj.review;
  const cliHeader = [
    proj.runCmd ? `# Ejecución local:\n${proj.runCmd}` : "",
    proj.testCmd ? `# Pruebas automatizadas:\n${proj.testCmd}` : ""
  ]
    .filter(Boolean)
    .join("\n\n");

  const snippet = proj.codeSnippet || `// Código fuente documentado en ${proj.folder}`;
  codeBlock.textContent = cliHeader ? `${cliHeader}\n\n${snippet}` : snippet;

  const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
  modal.show();
};

// Delegación de eventos segura en la grilla (sin handlers inline)
if (gridContainer) {
  gridContainer.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;

    const action = button.dataset.action;
    if (action === "preview") {
      openPreviewModal(button.dataset.title || "Vista Previa", button.dataset.url || "");
    } else if (action === "code") {
      openCodeModal(button.dataset.id || "");
    } else if (action === "reset") {
      window.resetPortfolioFilters();
    }
  });
}

// Botones de apertura de CV en navbar y hero
const btnNavCv = document.getElementById("btnNavCv");
const btnHeroCv = document.getElementById("btnHeroCv");
[btnNavCv, btnHeroCv].forEach((btn) => {
  if (btn) {
    btn.addEventListener("click", () => {
      window.openPreviewModal("CV Interactivo Web — Fredy Martinez", "My CV/index.html");
    });
  }
});

const btnNavCvExec = document.getElementById("btnNavCvExec");
const btnHeroCvExec = document.getElementById("btnHeroCvExec");
[btnNavCvExec, btnHeroCvExec].forEach((btn) => {
  if (btn) {
    btn.addEventListener("click", () => {
      window.openPreviewModal("CV Ejecutivo (Formato A4 / PDF) — Fredy Martinez", "CV_Ejecutivo/index.html");
    });
  }
});

if (copyCodeBtnEl) {
  copyCodeBtnEl.addEventListener("click", async () => {
    const codeText = document.getElementById("codeBlockContent")?.textContent || "";
    if (!codeText) return;
    await navigator.clipboard.writeText(codeText);
    copyCodeBtnEl.textContent = "✅ ¡Copiado!";
    setTimeout(() => {
      copyCodeBtnEl.textContent = "📋 Copiar Código";
    }, 1500);
  });
}

if (modalEl) {
  modalEl.addEventListener("hidden.bs.modal", () => {
    if (previewIframeEl) previewIframeEl.src = "about:blank";
  });
}

// Botón flotante Volver Arriba
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
