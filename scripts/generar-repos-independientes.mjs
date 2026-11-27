/**
 * ============================================================================
 * GENERADOR DE REPOSITORIOS INDEPENDIENTES PARA GITHUB
 * (scripts/generar-repos-independientes.mjs)
 * ============================================================================
 * Propósito:
 *   Empaquetar cada uno de los 17 proyectos del portafolio en su propia carpeta
 *   100% independiente dentro de `Repositorios_GitHub_Independientes/`, lista
 *   para inicializar con `git init` y subir como un repositorio individual a
 *   la cuenta de GitHub (`https://github.com/FredyMarG`).
 *
 * Qué incluye cada carpeta generada:
 *   1. Todos los archivos fuente del proyecto (excluyendo `node_modules` y `.git`).
 *   2. Su propio `README.md` profesional para GitHub (con insignias, arquitectura,
 *      stack tecnológico, esquema de Base de Datos y comandos de ejecución).
 *   3. Su propio `.gitignore` configurado para Node.js, Angular, TypeScript y SQLite.
 *   4. Su propio `package.json`, `server.mjs` y `database/schema.sql` (para los
 *      proyectos que eran solo frontend, dotándolos de su propio servidor y BD
 *      autónoma al clonarlos desde GitHub).
 *
 * Comentado línea por línea en español.
 * ============================================================================
 */

import { existsSync, mkdirSync, readdirSync, statSync, copyFileSync, writeFileSync } from "node:fs"; // Funciones síncronas del sistema de archivos
import { resolve, join, dirname, extname } from "node:path"; // Utilidades de construcción de rutas multiplataforma
import { fileURLToPath } from "node:url"; // Conversor de URL de módulo ES a ruta física

const __dirname = dirname(fileURLToPath(import.meta.url)); // Directorio `scripts/`
const ROOT_DIR = resolve(__dirname, ".."); // Carpeta raíz del portafolio (`portafolio final/`)
const OUTPUT_DIR = resolve(ROOT_DIR, "Repositorios_GitHub_Independientes"); // Carpeta destino donde se crearán los 17 repositorios independientes

// Lista de carpetas que NO se deben copiar hacia los repositorios de GitHub para mantenerlos ligeros y limpios
const EXCLUDED_DIRS = new Set(["node_modules", ".git", ".angular", "dist", ".vscode"]);

// Definición detallada de los 17 proyectos independientes a generar
const PROJECTS_CONFIG = [
  {
    repoSlug: "01-Turismo-MEAN-FullStack",
    sourceFolder: "Turismo_MEAN",
    title: "Turismo MEAN — Plataforma Full-Stack de Destinos de Colombia",
    stack: ["MongoDB & Mongoose 7", "SQLite3 / SQL", "Express.js", "Angular 16", "Node.js", "node:test"],
    description: "Plataforma Full-Stack desacoplada para la gestión de destinos turísticos de Colombia con API REST CRUD (`/api/destinos`), métricas agregadas (`/api/destinos/stats/resumen`), cliente Angular 16, vista interactiva en `public/` y pruebas automatizadas.",
    startCmd: "cd TurismoBack && npm install && npm run dev",
    testCmd: "cd TurismoBack && npm test",
    sqlTable: "turismo_destinos"
  },
  {
    repoSlug: "02-Amour-Planes-App-de-Citas-SQL",
    sourceFolder: "App de citas",
    title: "Amour & Planes — App de Citas y Álbum de Recuerdos (Full-Stack SQL)",
    stack: ["Node.js", "SQLite3", "PHP & MySQL", "REST API", "Vanilla JS SPA"],
    description: "Aplicativo web Full-Stack para parejas con catálogo de planes sugeridos, creación de planes personalizados, agendamiento de citas con fecha y hora, calificación de experiencias y álbum interactivo de hasta 10 fotografías por cita.",
    startCmd: "npm install && npm start",
    testCmd: "node --check server.js",
    sqlTable: "planes_sugeridos, citas_programadas"
  },
  {
    repoSlug: "03-Gestor-Tareas-NodeJS-Nativo",
    sourceFolder: "Gestor-Tareas-Node",
    title: "Gestor de Tareas Full-Stack en Node.js Nativo (HTTP + SQL + NDJSON)",
    stack: ["Node.js (node:http)", "REST API Nativa", "SQL & JSON", "NDJSON Audit", "EventEmitter", "node:test"],
    description: "Aplicación Full-Stack construida con el servidor HTTP nativo de Node.js (`node:http`), API REST CRUD (`/api/tareas`), bitácora de auditoría de eventos (`/api/eventos`), bus de eventos con `EventEmitter`, protección contra Path Traversal y pruebas unitarias.",
    startCmd: "npm start",
    testCmd: "npm test",
    sqlTable: "gestor_tareas, gestor_eventos"
  },
  {
    repoSlug: "04-Procrastination-Nightmare-Suite-SaaS",
    sourceFolder: "proyectoBit",
    title: "Procrastination Nightmare — Suite SaaS de Productividad (7 Módulos + BD)",
    stack: ["JavaScript POO", "Base de Datos SQLite/SQL", "Bootstrap 5", "HTML5", "CSS3 Variables"],
    description: "Plataforma integral de gestión del tiempo y productividad colaborativa con 7 módulos conectados: Pomodoro Focus, To-Do List, Calendario Mensual, Tracker de Hábitos, Notas Rápidas, Roadmap POO, sincronización con Base de Datos y Landing Page SaaS.",
    startCmd: "npm start",
    testCmd: "node --check server.mjs",
    sqlTable: "portfolio_kv_store"
  },
  {
    repoSlug: "05-Finanzas-APP-Canvas2D-SQL",
    sourceFolder: "Finanzas APP",
    title: "Finanzas APP — Dashboard de Control Financiero, Canvas 2D & Base de Datos SQL",
    stack: ["HTML5 Canvas 2D Chart", "JavaScript ES6+", "Node.js + SQLite3", "REST API", "COP Currency Formatter"],
    description: "Aplicación FinTech de control de ingresos, gastos y balance patrimonial en tiempo real con formateo automático de miles en pesos colombianos (COP), gráfico de dona renderizado nativamente en HTML5 Canvas 2D y persistencia en Base de Datos SQL.",
    startCmd: "npm start",
    testCmd: "node --check server.mjs",
    sqlTable: "finanzas_transacciones"
  },
  {
    repoSlug: "06-Tablero-Kanban-Scrum-DragDrop",
    sourceFolder: "Tablero Kanban",
    title: "Tablero Kanban Scrum — Gestión Ágil de Sprints con Drag & Drop y Base de Datos",
    stack: ["HTML5 Drag & Drop API", "Scrum Workflow", "Node.js + SQLite3", "REST API", "CSS Grid Glassmorphism"],
    description: "Tablero interactivo de metodología ágil Scrum dividido en 3 columnas (Por Hacer, En Progreso, Completado) con transferencia de tarjetas mediante la API nativa Drag & Drop y sincronización en tiempo real con Base de Datos SQL.",
    startCmd: "npm start",
    testCmd: "node --check server.mjs",
    sqlTable: "kanban_tareas"
  },
  {
    repoSlug: "07-CineSearch-Buscador-Peliculas-OMDb",
    sourceFolder: "Buscador de Peliculas",
    title: "CineSearch — Buscador de Películas en Tiempo Real (OMDb REST API & Debounce)",
    stack: ["OMDb REST API", "Debounce Pattern (500ms)", "Async/Await Fetch", "HTML5 Native Dialog", "Node.js Server"],
    description: "Buscador cinematográfico en tiempo real conectado a la API REST de OMDb con optimización de peticiones mediante patrón Debounce (500ms), filtros rápidos por franquicia, catálogo local de respaldo y ficha técnica en modal nativo `<dialog>`.",
    startCmd: "npm start",
    testCmd: "node --check server.mjs",
    sqlTable: "peliculas_favoritos"
  },
  {
    repoSlug: "08-BIT-Shop-Ecommerce-Tienda-Online",
    sourceFolder: "Tienda_Online",
    title: "BIT Shop — E-Commerce Tecnológico con Carrito Offcanvas & Pedidos en Base de Datos",
    stack: ["JavaScript ES6+", "Bootstrap 5 Offcanvas", "Node.js + SQLite3", "REST API Pedidos", "Mega-Menú"],
    description: "Tienda virtual de equipamiento tecnológico para desarrolladores con filtrado dinámico por categorías en Mega-Menú, buscador instantáneo, carrito de compras sincronizado y registro real de órdenes de compra en Base de Datos SQL.",
    startCmd: "npm start",
    testCmd: "node --check server.mjs",
    sqlTable: "tienda_pedidos, portfolio_kv_store"
  },
  {
    repoSlug: "09-BitShop-REST-API-JWT-RBAC",
    sourceFolder: "BitShop_API",
    title: "BitShop REST API — Autenticación JWT, Hashing scrypt, RBAC & Studio Interactivo",
    stack: ["Node.js", "Express.js", "JWT Auth", "crypto scrypt", "RBAC (admin/client)", "SQL & MongoDB", "node:test"],
    description: "API RESTful de comercio electrónico orientada a producción con autenticación JWT, hashing criptográfico de contraseñas con `scrypt`, control de acceso basado en roles (RBAC), Studio interactivo Login-first en `/`, documentación en `/docs` y pruebas automatizadas.",
    startCmd: "npm install && npm run dev",
    testCmd: "npm test",
    sqlTable: "bitshop_users, bitshop_products"
  },
  {
    repoSlug: "10-Enterprise-REST-API-TypeScript",
    sourceFolder: "ts_api",
    title: "Enterprise Modular REST API en TypeScript 5 Estricto & Express",
    stack: ["TypeScript 5", "Express.js", "Strict Typing", "Login-First Studio", "SQL Audit Logs", "node:test"],
    description: "Servidor RESTful fuertemente tipado en TypeScript 5 estricto bajo arquitectura modular de controladores y rutas (`/api/login`, `/api/operaciones/*`, `/api/saludo/*`, `/api/math/*`, `/api/health`) con consola interactiva y pruebas automatizadas.",
    startCmd: "npm install && npm run dev",
    testCmd: "npm test",
    sqlTable: "ts_api_logs"
  },
  {
    repoSlug: "11-MongoDB-CRUD-Playground-DBZ",
    sourceFolder: "Mongo",
    title: "MongoDB CRUD & Query Operators Engine + Playground Web (DBZ-V2)",
    stack: ["MongoDB", "mongosh Syntax", "Query Operators ($eq / $gte / $in / $or)", "Node.js", "node:test"],
    description: "Motor y laboratorio interactivo de consultas NoSQL con implementación de operadores MongoDB (`find`, `insertOne`, `updateOne`, `deleteOne`, `$eq`, `$gte`, `$set`, `$inc`), vista previa en vivo de comandos `mongosh` y pruebas unitarias.",
    startCmd: "npm run dev",
    testCmd: "npm test",
    sqlTable: "mongo_characters"
  },
  {
    repoSlug: "12-Procrastination-Nightmare-Angular16-FullCalendar",
    sourceFolder: "procrastination-nightmare",
    title: "Procrastination Nightmare SPA (Angular 16 + FullCalendar v6 + Base de Datos)",
    stack: ["Angular 16", "TypeScript 5", "FullCalendar v6", "PrimeNG 16", "RxJS 7", "SQL Database"],
    description: "Single Page Application en Angular 16 con calendario interactivo FullCalendar v6 para planificación de sprints Scrum, creación y eliminación de eventos en tiempo real sobre Base de Datos SQL y gestión de estado reactivo.",
    startCmd: "npm install && npm run dev",
    testCmd: "node --check public/index.html",
    sqlTable: "agenda_eventos"
  },
  {
    repoSlug: "13-SketchPad-2D-Pro-Canvas-API",
    sourceFolder: "SketchPad-Canvas-2D",
    title: "SketchPad 2D Pro — Estudio de Dibujo Vectorial (HTML5 Canvas 2D + Base de Datos)",
    stack: ["HTML5 Canvas 2D", "ImageData Undo Stack", "Ctrl+Z History", "PNG Export", "Node.js + SQL Sync"],
    description: "Pizarra interactiva de diseño 2D con pincel libre, borrador, trazado geométrico en tiempo real (rectángulos, círculos, líneas), rejilla técnica, pila Deshacer (Ctrl+Z) mediante snapshots de píxeles, sincronización con BD y exportación a PNG.",
    startCmd: "npm start",
    testCmd: "node --check server.mjs",
    sqlTable: "portfolio_kv_store"
  },
  {
    repoSlug: "14-NotesDB-Offline-First-IndexedDB",
    sourceFolder: "Gestor-Offline-IndexedDB",
    title: "NotesDB — Gestor Transaccional Offline-First con IndexedDB + Réplica SQL",
    stack: ["IndexedDB API", "IDBTransaction CRUD", "IDBCursor Search", "Node.js + SQLite3", "Blob JSON Export"],
    description: "Sistema de gestión de notas y tareas con arquitectura Offline-First que combina la base de datos transaccional nativa del navegador (`IndexedDB`) con replicación automática hacia Base de Datos SQL en el servidor, edición en línea y exportación JSON.",
    startCmd: "npm start",
    testCmd: "node --check server.mjs",
    sqlTable: "notesdb_notas, portfolio_kv_store"
  },
  {
    repoSlug: "15-FileDrop-Inspector-Multimedia",
    sourceFolder: "Visor-Archivos-DragDrop",
    title: "FileDrop Inspector — Analizador Multimedia (Drag & Drop + FileReader Streams)",
    stack: ["Drag & Drop API", "FileReader Streams", "Blob & ObjectURL", "Clipboard API", "Node.js Server"],
    description: "Inspector y previsualizador universal de archivos en el navegador con soporte Drag & Drop, barra de progreso de lectura binaria, extracción de metadatos MIME, renderizado de imágenes/audio/video/código y copia al portapapeles.",
    startCmd: "npm start",
    testCmd: "node --check server.mjs",
    sqlTable: "portfolio_kv_store"
  },
  {
    repoSlug: "16-RickAndMorty-Multiverse-Explorer",
    sourceFolder: "rickandmorty_api",
    title: "Multiverse Character Explorer — The Rick and Morty REST API",
    stack: ["Fetch API", "Async/Await", "URLSearchParams Pagination", "Status Filters", "Offline Fallback"],
    description: "Aplicación SPA conectada a la API REST oficial de Rick & Morty con búsqueda en tiempo real, filtros por estado vital (Alive / Dead / Unknown), paginación dinámica y dataset local de alta disponibilidad.",
    startCmd: "npm start",
    testCmd: "node --check server.mjs",
    sqlTable: "portfolio_kv_store"
  },
  {
    repoSlug: "17-Portfolio-UI-Motion-CSS3-60FPS",
    sourceFolder: "Web-Page-Animations",
    title: "Portfolio UI & Motion — Animaciones CSS3 a 60 FPS (GPU & Scroll-Driven)",
    stack: ["CSS3 @keyframes", "3D GPU Transforms", "Scroll-Driven Animations", "prefers-reduced-motion", "Responsive UI"],
    description: "Interfaz futurista de alto rendimiento visual construida con animaciones CSS3 aceleradas por GPU: barra de progreso ligada al scroll, órbitas rotatorias, gradiente cinético, marquee infinito, tarjetas 3D y soporte de accesibilidad `prefers-reduced-motion`.",
    startCmd: "npm start",
    testCmd: "node --check server.mjs",
    sqlTable: "portfolio_kv_store"
  }
];

/**
 * Copia recursivamente todos los archivos de `srcDir` hacia `destDir`,
 * omitiendo directorios pesados o internos como `node_modules` y `.git`.
 * @param {string} srcDir - Ruta de origen.
 * @param {string} destDir - Ruta de destino.
 */
function copyDirectoryFiltered(srcDir, destDir) {
  mkdirSync(destDir, { recursive: true }); // Crea la carpeta destino si no existe
  const entries = readdirSync(srcDir); // Lista todos los elementos dentro de la carpeta origen

  for (const entry of entries) {
    if (EXCLUDED_DIRS.has(entry)) continue; // Salta `node_modules`, `.git`, `dist`, `.angular`
    const srcPath = join(srcDir, entry);
    const destPath = join(destDir, entry);
    const info = statSync(srcPath);

    if (info.isDirectory()) {
      copyDirectoryFiltered(srcPath, destPath); // Copia subdirectorios recursivamente
    } else {
      copyFileSync(srcPath, destPath); // Copia el archivo individual
    }
  }
}

/**
 * Genera un archivo `.gitignore` estándar y comentado para cada repositorio independiente.
 * @returns {string} Contenido del archivo `.gitignore`.
 */
function buildGitignoreContent() {
  return `# ============================================================================
# ARCHIVOS IGNORADOS EN GIT (.gitignore)
# ============================================================================
node_modules/
dist/
.angular/
.env
*.log
.DS_Store
Thumbs.db
`;
}

/**
 * Genera un servidor Full-Stack autónomo (`server.mjs`) totalmente comentado para los
 * proyectos que no tenían uno propio, conectándolos con su base de datos SQLite3 local.
 * @param {object} proj - Configuración del proyecto.
 * @returns {string} Código fuente de `server.mjs` comentado en español.
 */
function buildStandaloneServerMjs(proj) {
  return `/**
 * ============================================================================
 * SERVIDOR FULL-STACK AUTÓNOMO + BASE DE DATOS SQLITE3 — ${proj.title}
 * (server.mjs)
 * ============================================================================
 * Propósito:
 *   Servir la aplicación interactiva y exponer los endpoints REST (\`/api/*\`)
 *   respaldados por SQLite3 nativo (\`node:sqlite\` -> \`database/app.sqlite\`).
 *
 * Comentado línea por línea en español.
 * ============================================================================
 */

import http from "node:http"; // Servidor HTTP nativo de Node.js
import { readFile, stat } from "node:fs/promises"; // Lectura asíncrona de archivos estáticos
import { mkdirSync } from "node:fs"; // Creación síncrona de la carpeta database/
import { resolve, extname, dirname } from "node:path"; // Utilidades de rutas
import { fileURLToPath } from "node:url"; // Ruta del módulo actual
import { DatabaseSync } from "node:sqlite"; // Motor SQLite3 nativo integrado en Node.js

const __dirname = dirname(fileURLToPath(import.meta.url)); // Directorio raíz del proyecto
const PORT = Number(process.env.PORT || 3000); // Puerto configurable (3000 por defecto)

// Inicializa la base de datos SQLite3 local del proyecto en \`database/app.sqlite\`
mkdirSync(resolve(__dirname, "database"), { recursive: true });
const db = new DatabaseSync(resolve(__dirname, "database/app.sqlite"));

// Crea las tablas relacionales del proyecto si aún no existen
db.exec(\`
  CREATE TABLE IF NOT EXISTS finanzas_transacciones (
    id INTEGER PRIMARY KEY,
    concepto TEXT NOT NULL,
    monto INTEGER NOT NULL,
    tipo TEXT NOT NULL,
    creado_en TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS kanban_tareas (
    id TEXT PRIMARY KEY,
    texto TEXT NOT NULL,
    columna TEXT NOT NULL DEFAULT 'pendiente',
    orden INTEGER NOT NULL DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS tienda_pedidos (
    id TEXT PRIMARY KEY,
    cliente TEXT NOT NULL,
    items_json TEXT NOT NULL,
    total INTEGER NOT NULL,
    creado_en TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS portfolio_kv_store (
    clave TEXT PRIMARY KEY,
    valor_json TEXT NOT NULL,
    actualizado_en TEXT NOT NULL
  );
\`);

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon"
};

// Crea el servidor HTTP que responde tanto a \`/api/*\` como a los archivos del proyecto
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || "/", \`http://\${req.headers.host || "localhost"}\`);
  const method = (req.method || "GET").toUpperCase();

  // Endpoints de Base de Datos SQLite3 (\`/api/*\`)
  if (url.pathname.startsWith("/api/")) {
    let body = {};
    if (method !== "GET" && method !== "HEAD") {
      const chunks = [];
      for await (const c of req) chunks.push(c);
      const raw = Buffer.concat(chunks).toString("utf8");
      if (raw) {
        try { body = JSON.parse(raw); } catch { body = {}; }
      }
    }

    res.setHeader("Content-Type", "application/json; charset=utf-8");

    if (url.pathname === "/api/finanzas/transacciones") {
      if (method === "GET") {
        const transacciones = db.prepare("SELECT id, concepto, monto, tipo FROM finanzas_transacciones ORDER BY id ASC").all();
        res.end(JSON.stringify({ ok: true, transacciones }));
        return;
      }
      if (method === "POST") {
        db.prepare("INSERT OR REPLACE INTO finanzas_transacciones (id, concepto, monto, tipo, creado_en) VALUES (?, ?, ?, ?, ?)").run(
          Number(body.id || Date.now()), String(body.concepto || ""), Number(body.monto || 0), String(body.tipo || "ingreso"), new Date().toISOString()
        );
        res.statusCode = 201;
        res.end(JSON.stringify({ ok: true }));
        return;
      }
    }

    if (url.pathname.startsWith("/api/finanzas/transacciones/") && method === "DELETE") {
      const id = Number(url.pathname.split("/").pop());
      db.prepare("DELETE FROM finanzas_transacciones WHERE id = ?").run(id);
      res.end(JSON.stringify({ ok: true }));
      return;
    }

    if (url.pathname === "/api/kanban/tareas") {
      if (method === "GET") {
        const rows = db.prepare("SELECT * FROM kanban_tareas ORDER BY orden ASC").all();
        if (!rows.length) {
          res.end(JSON.stringify({ ok: false }));
          return;
        }
        const estado = { pendiente: [], progreso: [], completado: [] };
        rows.forEach((r) => estado[r.columna]?.push({ id: r.id, texto: r.texto }));
        res.end(JSON.stringify({ ok: true, estado }));
        return;
      }
      if (method === "PUT" || method === "POST") {
        const estado = body.estado || body;
        db.exec("DELETE FROM kanban_tareas");
        const ins = db.prepare("INSERT INTO kanban_tareas (id, texto, columna, orden) VALUES (?, ?, ?, ?)");
        ["pendiente", "progreso", "completado"].forEach((col) => {
          (estado[col] || []).forEach((t, i) => ins.run(String(t.id), String(t.texto), col, i + 1));
        });
        res.end(JSON.stringify({ ok: true }));
        return;
      }
    }

    if (url.pathname === "/api/tienda/pedidos" && method === "POST") {
      const id = "ORD-" + Date.now().toString().slice(-6);
      db.prepare("INSERT INTO tienda_pedidos (id, cliente, items_json, total, creado_en) VALUES (?, ?, ?, ?, ?)").run(
        id, String(body.cliente || "Cliente"), JSON.stringify(body.items || []), Number(body.total || 0), new Date().toISOString()
      );
      res.statusCode = 201;
      res.end(JSON.stringify({ ok: true, pedido: { id } }));
      return;
    }

    if (url.pathname.startsWith("/api/db/kv/")) {
      const clave = decodeURIComponent(url.pathname.split("/").pop());
      if (method === "GET") {
        const row = db.prepare("SELECT * FROM portfolio_kv_store WHERE clave = ?").get(clave);
        res.end(JSON.stringify({ ok: true, exists: Boolean(row), data: row ? JSON.parse(row.valor_json) : null }));
        return;
      }
      if (method === "POST" || method === "PUT") {
        db.prepare("INSERT OR REPLACE INTO portfolio_kv_store (clave, valor_json, actualizado_en) VALUES (?, ?, ?)").run(
          clave, JSON.stringify(body.data ?? body), new Date().toISOString()
        );
        res.end(JSON.stringify({ ok: true }));
        return;
      }
    }

    res.end(JSON.stringify({ ok: true, engine: "SQLite3 (node:sqlite)" }));
    return;
  }

  // Servidor de archivos estáticos
  let relPath = decodeURIComponent(url.pathname);
  if (relPath === "/") relPath = "/index.html";
  let filePath = resolve(__dirname, "." + relPath);
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403);
    res.end("Acceso denegado");
    return;
  }

  try {
    const info = await stat(filePath);
    if (info.isDirectory()) filePath = resolve(filePath, "index.html");
    const content = await readFile(filePath);
    res.writeHead(200, { "Content-Type": MIME_TYPES[extname(filePath).toLowerCase()] || "application/octet-stream" });
    res.end(content);
  } catch {
    res.writeHead(404);
    res.end("No encontrado");
  }
});

server.listen(PORT, () => {
  console.log(\`🚀 ${proj.title} corriendo en http://localhost:\${PORT}\`);
});
`;
}

/**
 * Construye un `README.md` profesional y detallado en español para cada repositorio independiente.
 * @param {object} proj - Configuración del proyecto.
 * @returns {string} Contenido Markdown del README.
 */
function buildProjectReadme(proj) {
  return `# 🚀 ${proj.title}

> **Autor:** Fredy Leonardo Martinez Galeano — *Full-Stack Software Developer & Certified Scrum Master*  
> **Portafolio en Vivo:** [https://portafoliofredy.netlify.app/](https://portafoliofredy.netlify.app/) • **GitHub:** [@FredyMarG](https://github.com/FredyMarG)

---

## 📋 Descripción General

${proj.description}

---

## 🛠️ Stack Tecnológico

${proj.stack.map((s) => `- **${s}**`).join("\n")}

---

## 🗄️ Persistencia en Base de Datos Real + Sincronización Híbrida

Este proyecto cuenta con arquitectura de persistencia dual:
1. **Base de Datos Relacional SQL / NoSQL (\`${proj.sqlTable}\`)**: Incluye su esquema SQL en \`database/\` y conexión directa mediante endpoints REST (\`/api/*\`).
2. **Respaldo Híbrido en Navegador (\`localStorage\` / \`IndexedDB\`)**: Garantiza funcionamiento continuo e instantáneo tanto conectado al servidor de base de datos como en entornos estáticos.

---

## ⚡ Instalación y Ejecución Local

\`\`\`bash
# 1. Clonar el repositorio
git clone https://github.com/FredyMarG/${proj.repoSlug}.git
cd ${proj.repoSlug}

# 2. Iniciar la aplicación y la Base de Datos
${proj.startCmd}
\`\`\`

### 🧪 Verificación / Tests
\`\`\`bash
${proj.testCmd}
\`\`\`

---

## 📬 Contacto Profesional

- **Nombre:** Fredy Leonardo Martinez Galeano
- **Correo:** [fredymartinezquinto@hotmail.com](mailto:fredymartinezquinto@hotmail.com)
- **WhatsApp / Teléfono:** [+57 315 238 8315](https://wa.me/573152388315)
- **LinkedIn:** [fredy-leonardo-martinez-galeano](https://www.linkedin.com/in/fredy-leonardo-martinez-galeano-84b5511a0)
`;
}

// ============================================================================
// EJECUCIÓN PRINCIPAL DEL GENERADOR DE LOS 17 REPOSITORIOS
// ============================================================================
mkdirSync(OUTPUT_DIR, { recursive: true });
const mysqlSchemaContent = resolve(ROOT_DIR, "database/portfolio_mysql.sql");

for (const proj of PROJECTS_CONFIG) {
  const srcPath = resolve(ROOT_DIR, proj.sourceFolder);
  const destPath = resolve(OUTPUT_DIR, proj.repoSlug);

  // 1. Copia todos los archivos fuente del proyecto sin node_modules ni .git
  copyDirectoryFiltered(srcPath, destPath);

  // 2. Asegura que tenga su archivo .gitignore limpio
  writeFileSync(resolve(destPath, ".gitignore"), buildGitignoreContent(), "utf8");

  // 3. Escribe un README.md ejecutivo listo para mostrar en la portada del repositorio de GitHub
  writeFileSync(resolve(destPath, "README.md"), buildProjectReadme(proj), "utf8");

  // 4. Copia el esquema SQL comentado en `database/schema_mysql.sql` si aún no existe en el proyecto
  const projDbDir = resolve(destPath, "database");
  mkdirSync(projDbDir, { recursive: true });
  if (!existsSync(resolve(projDbDir, "schema.sql")) && existsSync(mysqlSchemaContent)) {
    copyFileSync(mysqlSchemaContent, resolve(projDbDir, "schema_mysql.sql"));
  }

  // 5. Si el proyecto no tenía `package.json`, le genera su propio `package.json` y `server.mjs` comentado con SQLite3
  if (!existsSync(resolve(destPath, "package.json"))) {
    const pkgJson = {
      name: proj.repoSlug.toLowerCase(),
      version: "1.0.0",
      description: proj.title,
      type: "module",
      scripts: {
        start: "node server.mjs",
        dev: "node server.mjs"
      },
      author: "Fredy Leonardo Martinez Galeano <fredymartinezquinto@hotmail.com>",
      license: "MIT"
    };
    writeFileSync(resolve(destPath, "package.json"), JSON.stringify(pkgJson, null, 2), "utf8");
    writeFileSync(resolve(destPath, "server.mjs"), buildStandaloneServerMjs(proj), "utf8");
  }

  console.log(`✔ Repositorio independiente generado: ${proj.repoSlug}`);
}

console.log("============================================================================");
console.log(`✅ 17 repositorios independientes listos en: ${OUTPUT_DIR}`);
console.log("============================================================================");
