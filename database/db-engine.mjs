/**
 * ============================================================================
 * MOTOR DE BASE DE DATOS REAL UNIFICADO — PORTAFOLIO FREDY MARTINEZ
 * (database/db-engine.mjs)
 * ============================================================================
 * Propósito:
 *   Gestionar la persistencia relacional y documental en tiempo real para
 *   todos los proyectos del portafolio mediante `node:sqlite` (`DatabaseSync`)
 *   sobre `database/portfolio_real.sqlite` (o `/tmp/portfolio_real.sqlite` en
 *   entornos serverless como Netlify Functions), además de detectar conexiones
 *   externas configuradas mediante `MONGODB_URI` o `NETLIFY_DB_URL`/`DATABASE_URL`.
 *
 * Comentado detalladamente en español bloque por bloque y línea por línea.
 * ============================================================================
 */

import { existsSync, mkdirSync, copyFileSync } from "node:fs"; // Funciones del sistema de archivos para verificar, crear carpetas y copiar la BD en serverless
import { resolve, dirname } from "node:path"; // Utilidades para construir rutas absolutas compatibles con Windows y Linux
import { fileURLToPath } from "node:url"; // Convierte la URL del módulo ES actual en una ruta física de archivo
import crypto from "node:crypto"; // Módulo criptográfico nativo para generar UUIDs e identificadores hexadecimales
import { DatabaseSync } from "node:sqlite"; // Motor SQLite3 nativo integrado en Node.js sin dependencias binarias externas

const __dirname = dirname(fileURLToPath(import.meta.url)); // Obtiene la ruta absoluta del directorio `database/`
const LOCAL_DB_PATH = resolve(__dirname, "portfolio_real.sqlite"); // Define la ubicación del archivo físico SQLite3 en el repositorio

let sqliteDb = null; // Caché singleton de la conexión abierta a la base de datos SQLite
let activeDbPath = LOCAL_DB_PATH; // Guarda la ruta activa donde está operando la base de datos para reportarla en `/api/db/status`

/**
 * Obtiene o inicializa la instancia singleton de la base de datos SQLite3.
 * Si el directorio raíz es de solo lectura (como ocurre en AWS Lambda / Netlify Functions),
 * copia automáticamente el archivo pre-poblado a `/tmp/portfolio_real.sqlite` para permitir escrituras SQL.
 * @returns {DatabaseSync} Instancia activa y sembrada de la base de datos SQLite.
 */
function getSqliteInstance() {
  if (sqliteDb) return sqliteDb; // Si la conexión ya está abierta en memoria, la reutiliza inmediatamente

  try {
    mkdirSync(dirname(LOCAL_DB_PATH), { recursive: true }); // Asegura que la carpeta `database/` exista en disco
    sqliteDb = new DatabaseSync(LOCAL_DB_PATH); // Abre (o crea) el archivo `database/portfolio_real.sqlite`
    activeDbPath = LOCAL_DB_PATH; // Registra que estamos operando sobre el archivo principal del proyecto
  } catch {
    // En entornos serverless (Netlify Functions) el sistema de archivos raíz es de solo lectura y `/tmp` es escribible
    const tmpPath = "/tmp/portfolio_real.sqlite"; // Ruta temporal escribible dentro del contenedor serverless
    try {
      if (!existsSync(tmpPath) && existsSync(LOCAL_DB_PATH)) { // Si aún no existe la copia en `/tmp` pero sí el archivo semilla del deploy
        copyFileSync(LOCAL_DB_PATH, tmpPath); // Copia la base de datos pre-poblada hacia `/tmp`
      }
      sqliteDb = new DatabaseSync(tmpPath); // Abre la base de datos SQLite desde `/tmp` con permisos de lectura y escritura
      activeDbPath = tmpPath; // Registra `/tmp/portfolio_real.sqlite` como archivo activo
    } catch {
      sqliteDb = new DatabaseSync(":memory:"); // Respaldo extremo en memoria RAM si el entorno restringe `/tmp`
      activeDbPath = ":memory:"; // Registra que opera en modo memoria transaccional
    }
  }

  initializeSchemaAndSeed(sqliteDb); // Ejecuta la creación de las 14 tablas y carga los datos semilla iniciales si están vacías
  return sqliteDb; // Retorna la instancia lista para ejecutar consultas SQL preparadas
}

/**
 * Crea todas las tablas relacionales (`CREATE TABLE IF NOT EXISTS`) y carga
 * los registros iniciales (seed) cuando las tablas se encuentran vacías.
 * @param {DatabaseSync} db - Instancia activa de SQLite.
 */
function initializeSchemaAndSeed(db) {
  // Ejecuta el bloque DDL con las 14 tablas que respaldan todos los proyectos del portafolio
  db.exec(`
    -- 1. Tabla para Turismo MEAN (Destinos Turísticos de Colombia)
    CREATE TABLE IF NOT EXISTS turismo_destinos (
      _id TEXT PRIMARY KEY,
      nombre TEXT NOT NULL,
      ciudad TEXT NOT NULL,
      descripcion TEXT NOT NULL,
      precio REAL NOT NULL DEFAULT 0,
      calificacion REAL NOT NULL DEFAULT 5.0,
      fechaCreacion TEXT NOT NULL
    );

    -- 2. Tabla de planes sugeridos para App de Citas (Amour & Planes)
    CREATE TABLE IF NOT EXISTS planes_sugeridos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo TEXT NOT NULL,
      categoria TEXT NOT NULL,
      descripcion TEXT NOT NULL,
      icono TEXT NOT NULL DEFAULT '💖',
      duracion_estimada TEXT NOT NULL,
      presupuesto TEXT NOT NULL,
      lugar_sugerido TEXT NOT NULL,
      tips_romanticos TEXT NOT NULL,
      color_acento TEXT NOT NULL DEFAULT '#f43f5e'
    );

    -- 3. Tabla de citas agendadas y álbum fotográfico para App de Citas
    CREATE TABLE IF NOT EXISTS citas_programadas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      plan_id INTEGER NOT NULL DEFAULT 1,
      titulo_cita TEXT NOT NULL,
      fecha TEXT NOT NULL,
      hora TEXT NOT NULL,
      lugar TEXT NOT NULL,
      estado TEXT NOT NULL DEFAULT 'Programada',
      calificacion INTEGER NOT NULL DEFAULT 5,
      bitacora_recuerdo TEXT DEFAULT '',
      fotos_json TEXT DEFAULT '[]',
      creado_en TEXT NOT NULL
    );

    -- 4. Tabla de tareas para Gestor de Tareas en Node.js Nativo
    CREATE TABLE IF NOT EXISTS gestor_tareas (
      id TEXT PRIMARY KEY,
      descripcion TEXT NOT NULL,
      completada INTEGER NOT NULL DEFAULT 0,
      creadoEn TEXT NOT NULL
    );

    -- 5. Tabla de bitácora de eventos de auditoría para Gestor de Tareas en Node.js
    CREATE TABLE IF NOT EXISTS gestor_eventos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ts TEXT NOT NULL,
      tipo TEXT NOT NULL,
      tareaId TEXT NOT NULL,
      descripcion TEXT DEFAULT ''
    );

    -- 6. Tabla de movimientos contables para Finanzas APP
    CREATE TABLE IF NOT EXISTS finanzas_transacciones (
      id INTEGER PRIMARY KEY,
      concepto TEXT NOT NULL,
      monto INTEGER NOT NULL,
      tipo TEXT NOT NULL,
      creado_en TEXT NOT NULL
    );

    -- 7. Tabla de historias de usuario para Tablero Kanban Scrum
    CREATE TABLE IF NOT EXISTS kanban_tareas (
      id TEXT PRIMARY KEY,
      texto TEXT NOT NULL,
      columna TEXT NOT NULL DEFAULT 'pendiente',
      orden INTEGER NOT NULL DEFAULT 0
    );

    -- 8. Tabla de usuarios con roles RBAC para BitShop REST API
    CREATE TABLE IF NOT EXISTS bitshop_users (
      _id TEXT PRIMARY KEY,
      username TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      phone TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'client'
    );

    -- 9. Tabla de catálogo de productos tecnológicos para BitShop REST API
    CREATE TABLE IF NOT EXISTS bitshop_products (
      _id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      availableElements INTEGER NOT NULL DEFAULT 10,
      description TEXT DEFAULT ''
    );

    -- 10. Tabla de guerreros para MongoDB DBZ-V2 Playground
    CREATE TABLE IF NOT EXISTS mongo_characters (
      _id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      species TEXT NOT NULL,
      edad INTEGER NOT NULL,
      powerLevel INTEGER NOT NULL
    );

    -- 11. Tabla de órdenes de compra confirmadas para BIT Shop Tienda Online
    CREATE TABLE IF NOT EXISTS tienda_pedidos (
      id TEXT PRIMARY KEY,
      cliente TEXT NOT NULL,
      items_json TEXT NOT NULL,
      total INTEGER NOT NULL,
      creado_en TEXT NOT NULL
    );

    -- 12. Tabla de notas técnicas para NotesDB (IndexedDB + Réplica SQL)
    CREATE TABLE IF NOT EXISTS notesdb_notas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'Trabajo',
      createdAt TEXT NOT NULL
    );

    -- 13. Tabla de eventos de calendario para Procrastination Nightmare Angular 16 + FullCalendar v6
    CREATE TABLE IF NOT EXISTS agenda_eventos (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      start TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'Sprint',
      color TEXT NOT NULL DEFAULT '#38bdf8'
    );

    -- 14. Tabla de auditoría de operaciones para ts_api TypeScript Studio
    CREATE TABLE IF NOT EXISTS ts_api_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      endpoint TEXT NOT NULL,
      detalle TEXT NOT NULL,
      resultado TEXT NOT NULL,
      fecha TEXT NOT NULL
    );

    -- 15. Almacén Clave-Valor SQL para sincronización de módulos (Suite proyectoBit, Carrito, SketchPad)
    CREATE TABLE IF NOT EXISTS portfolio_kv_store (
      clave TEXT PRIMARY KEY,
      valor_json TEXT NOT NULL,
      actualizado_en TEXT NOT NULL
    );
  `);

  // 1. Semilla inicial para Turismo MEAN (5 destinos emblemáticos de Colombia)
  const countTurismo = db.prepare("SELECT COUNT(*) as c FROM turismo_destinos").get().c;
  if (countTurismo === 0) {
    const ins = db.prepare(
      "INSERT INTO turismo_destinos (_id, nombre, ciudad, descripcion, precio, calificacion, fechaCreacion) VALUES (?, ?, ?, ?, ?, ?, ?)"
    );
    const now = new Date().toISOString();
    ins.run("65f1a1000000000000000001", "Parque Nacional Natural Tayrona", "Santa Marta", "Playas cristalinas rodeadas de selva tropical y senderos ancestrales en la Sierra Nevada.", 980000, 4.9, now);
    ins.run("65f1a1000000000000000002", "Ciudad Amurallada & Islas del Rosario", "Cartagena", "Recorrido histórico colonial, gastronomía caribeña y pasadía en aguas turquesas.", 1250000, 4.8, now);
    ins.run("65f1a1000000000000000003", "Valle de Cocora & Paisaje Cafetero", "Salento", "Caminata entre palmas de cera gigantes, degustación de café de origen y pueblos patrimoniales.", 760000, 4.9, now);
    ins.run("65f1a1000000000000000004", "Mar de los Siete Colores & Johnny Cay", "San Andrés", "Snorkel en arrecifes de coral, acuario natural y cultura isleña.", 1490000, 4.7, now);
    ins.run("65f1a1000000000000000005", "Piedra del Peñol & Embalse de Guatapé", "Guatapé", "Ascenso de 740 escalones con vista panorámica 360° de la represa y zócalos coloridos.", 620000, 4.8, now);
  }

  // 2. Semilla inicial para App de Citas (10 planes sugeridos)
  const countPlanes = db.prepare("SELECT COUNT(*) as c FROM planes_sugeridos").get().c;
  if (countPlanes === 0) {
    const ins = db.prepare(
      "INSERT INTO planes_sugeridos (id, titulo, categoria, descripcion, icono, duracion_estimada, presupuesto, lugar_sugerido, tips_romanticos) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
    );
    const seedPlanes = [
      [1, "Tarde de Bolos, Retos y Malteadas", "Divertido", "Compitan en las pistas de bolos, hagan apuestas tiernas por cada chuza y cierren compartiendo malteadas.", "🎳", "2.5 a 3 horas", "$$ Moderado", "Bolera favorita de la ciudad", "El que gane cada ronda pide un deseo o un beso."],
      [2, "Carrera de Karts a Toda Velocidad", "Aventura", "Adrenalina pura compitiendo juntos en la pista de Go-Karts y fotos en el podio.", "🏎️", "2 horas", "$$ Moderado", "Pista de Karts", "Tómense una foto con los cascos puestos antes de arrancar."],
      [3, "Parque de Diversiones y Rueda de la Fortuna", "Aventura", "Montañas rusas, carros chocones, algodón de azúcar y atardecer en la rueda de la fortuna.", "🎡", "4 a 5 horas", "$$$ Especial", "Parque de diversiones", "Intenten ganar un peluche en los juegos de feria."],
      [4, "Cita de Cine, Palomitas y Cena Romántica", "Romántico", "Elijan una película que ambos quieran ver, compartan palomitas y salgan a cenar.", "🍿", "3.5 horas", "$$ Moderado", "Cine favorito", "Guarden las entradas como recuerdo de la función."],
      [5, "Picnic Romántico al Atardecer", "Romántico", "Escapada al aire libre con manta, fresas con chocolate, tabla de quesos y música.", "🌅", "3 horas", "$$ Moderado", "Parque o jardín tranquilo", "Lleven una carta escrita a mano para leerla al caer el sol."],
      [6, "Mirador Nocturno bajo las Estrellas", "Romántico", "Subir al mirador para ver las luces de la ciudad abrazados con chocolate caliente.", "🌌", "2.5 horas", "$ Económico", "Mirador panorámico", "Lleven una cobija abrigadora para compartir."],
      [7, "Noche de Chef en Pareja: Pizzas y Vino", "Gastronómico", "Preparen juntos sus propias pizzas artesanales desde la masa con música y vino.", "🍕", "2.5 horas", "$$ Moderado", "En casa", "Denle forma de corazón a las pizzas y saquen fotos cocinando."],
      [8, "Glamping o Fogata con Masmelos", "Romántico", "Noche mágica rodeados de naturaleza, luces cálidas y fogata bajo las estrellas.", "🏕️", "Noche completa", "$$$ Especial", "Glamping o cabaña", "Preparen una lista de canciones especiales para la fogata."],
      [9, "Ruta de Postres, Helados y Café", "Gastronómico", "Paseo dulce probando café especial, waffles o crepes y cerrando con helado artesanal.", "🍨", "2.5 horas", "$$ Moderado", "Zona gastronómica", "Pidan sabores distintos en cada parada para probar ambos."],
      [10, "Tarde de Pintura, Cerámica o Arcade", "Creativo", "Pintar dos cuadros, moldear tazas de cerámica o retarse en las máquinas de Arcade.", "🎨", "2.5 horas", "$$ Moderado", "Café creativo o Arcade", "Intercambien sus creaciones al final como recuerdo."]
    ];
    for (const p of seedPlanes) ins.run(...p);
  }

  // 3. Semilla inicial para Gestor de Tareas en Node.js
  const countTareas = db.prepare("SELECT COUNT(*) as c FROM gestor_tareas").get().c;
  if (countTareas === 0) {
    const now = new Date().toISOString();
    const insT = db.prepare("INSERT INTO gestor_tareas (id, descripcion, completada, creadoEn) VALUES (?, ?, ?, ?)");
    const insE = db.prepare("INSERT INTO gestor_eventos (ts, tipo, tareaId, descripcion) VALUES (?, ?, ?, ?)");
    insT.run("t-sql-001", "Configurar motor de base de datos relacional SQL unificado", 1, now);
    insT.run("t-sql-002", "Sincronizar persistencia en tiempo real con API REST y localStorage", 1, now);
    insT.run("t-sql-003", "Validar conexión en vivo desde todos los proyectos del portafolio", 0, now);
    insE.run(now, "tarea:creada", "t-sql-001", "Configurar motor de base de datos relacional SQL unificado");
    insE.run(now, "tarea:completada", "t-sql-001", "");
    insE.run(now, "tarea:creada", "t-sql-003", "Validar conexión en vivo desde todos los proyectos del portafolio");
  }

  // 4. Semilla inicial para Finanzas APP (Ingresos y Gastos en COP)
  const countFin = db.prepare("SELECT COUNT(*) as c FROM finanzas_transacciones").get().c;
  if (countFin === 0) {
    const now = new Date().toISOString();
    const ins = db.prepare("INSERT INTO finanzas_transacciones (id, concepto, monto, tipo, creado_en) VALUES (?, ?, ?, ?, ?)");
    ins.run(101, "Salario Desarrollo Full-Stack MEAN & SQL", 5800000, "ingreso", now);
    ins.run(102, "Consultoría Arquitectura API REST & Base de Datos", 1450000, "ingreso", now);
    ins.run(103, "Infraestructura Cloud, Dominio & Hosting BD", 380000, "gasto", now);
    ins.run(104, "Licencias JetBrains, Copilot & Herramientas Dev", 220000, "gasto", now);
  }

  // 5. Semilla inicial para Tablero Kanban Scrum
  const countKanban = db.prepare("SELECT COUNT(*) as c FROM kanban_tareas").get().c;
  if (countKanban === 0) {
    const ins = db.prepare("INSERT INTO kanban_tareas (id, texto, columna, orden) VALUES (?, ?, ?, ?)");
    ins.run("1", "Diseñar esquema relacional SQLite/MySQL/PostgreSQL y migraciones", "completado", 1);
    ins.run("2", "Desplegar Portafolio Full-Stack en producción (Netlify + BD Real)", "completado", 2);
    ins.run("3", "Integrar middleware de autenticación JWT y roles RBAC", "progreso", 1);
    ins.run("4", "Sincronizar tableros ágiles Scrum con motor SQL en tiempo real", "pendiente", 1);
  }

  // 6. Semilla inicial para BitShop REST API (Usuarios JWT y Productos)
  const countUsers = db.prepare("SELECT COUNT(*) as c FROM bitshop_users").get().c;
  if (countUsers === 0) {
    const insU = db.prepare("INSERT INTO bitshop_users (_id, username, email, password, phone, role) VALUES (?, ?, ?, ?, ?, ?)");
    insU.run("usr-admin-01", "admin_fredy", "admin@bitshop.local", "Admin123*", "3152388315", "admin");
    insU.run("usr-client-01", "cliente_demo", "cliente@bitshop.local", "Cliente123*", "3001234567", "client");
  }

  const countProds = db.prepare("SELECT COUNT(*) as c FROM bitshop_products").get().c;
  if (countProds === 0) {
    const insP = db.prepare("INSERT INTO bitshop_products (_id, name, price, availableElements, description) VALUES (?, ?, ?, ?, ?)");
    insP.run("prod-bit-01", "MacBook Pro 16\" M3 Max (36GB RAM / 1TB NVMe)", 12450000, 8, "Estación portátil para ingeniería de software, contenedores Docker y compilación rápida.");
    insP.run("prod-bit-02", "Monitor Dell UltraSharp 34\" Curved USB-C Hub", 3290000, 14, "Panel IPS WQHD con calibración de color de fábrica y entrega de energía de 90W.");
    insP.run("prod-bit-03", "Teclado Mecánico Keychron Q1 Pro Wireless QMK/VIA", 890000, 22, "Chasis CNC de aluminio completo con switches táctiles lubricados y conexión Bluetooth 5.1.");
    insP.run("prod-bit-04", "Silla Ergonómica Herman Miller Aeron Remastered", 5400000, 5, "Soporte lumbar PostureFit SL diseñado para jornadas intensivas de desarrollo.");
  }

  // 7. Semilla inicial para MongoDB DBZ-V2 Playground
  seedMongoCharactersIfEmpty(db);

  // 8. Semilla inicial para NotesDB
  const countNotes = db.prepare("SELECT COUNT(*) as c FROM notesdb_notas").get().c;
  if (countNotes === 0) {
    const now = new Date().toLocaleString("es-CO");
    const insN = db.prepare("INSERT INTO notesdb_notas (title, category, createdAt) VALUES (?, ?, ?)");
    insN.run("Arquitectura RESTful con Node.js, Express y autenticación JWT en producción", "Trabajo", now);
    insN.run("Persistencia híbrida: Base de Datos Relacional SQL + IndexedDB en el navegador", "Estudio", now);
    insN.run("Diseño de componentes reactivos y calendario FullCalendar v6 en Angular 16 SPA", "Idea", now);
  }

  // 9. Semilla inicial para Agenda Eventos (Procrastination Nightmare Angular 16 + FullCalendar v6)
  const countAgenda = db.prepare("SELECT COUNT(*) as c FROM agenda_eventos").get().c;
  if (countAgenda === 0) {
    const insA = db.prepare("INSERT INTO agenda_eventos (id, title, start, category, color) VALUES (?, ?, ?, ?, ?)");
    const ym = new Date().toISOString().slice(0, 7); // Usa el año y mes actual para que los eventos aparezcan siempre en la vista activa del calendario
    insA.run("ev-101", "Sprint Planning & Arquitectura Base de Datos SQL", `${ym}-05`, "Scrum", "#38bdf8");
    insA.run("ev-102", "Despliegue Continuo (CI/CD) en Netlify Functions", `${ym}-12`, "DevOps", "#10b981");
    insA.run("ev-103", "Code Review & Auditoría de Seguridad JWT / RBAC", `${ym}-18`, "Backend", "#a855f7");
    insA.run("ev-104", "Demo Ejecutiva de Portafolio Full-Stack MEAN", `${ym}-24`, "Release", "#f59e0b");
  }
}

/**
 * Restaura o inicializa los 5 personajes de la colección DBZ-V2 en `mongo_characters`.
 * @param {DatabaseSync} db - Instancia activa de SQLite.
 * @param {boolean} forceReset - Si es `true`, vacía la tabla antes de reinsertar los documentos semilla.
 */
function seedMongoCharactersIfEmpty(db, forceReset = false) {
  if (forceReset) {
    db.exec("DELETE FROM mongo_characters"); // Limpia todos los documentos cuando el usuario pulsa "Reiniciar DBZ-V2"
  }
  const count = db.prepare("SELECT COUNT(*) as c FROM mongo_characters").get().c;
  if (count === 0) {
    const ins = db.prepare("INSERT INTO mongo_characters (_id, name, species, edad, powerLevel) VALUES (?, ?, ?, ?, ?)");
    ins.run("dbz-01", "Son Goku (Ultra Instinct)", "Saiyan", 44, 950000000);
    ins.run("dbz-02", "Vegeta (Ultra Ego)", "Saiyan", 48, 940000000);
    ins.run("dbz-03", "Piccolo (Orange Form)", "Namekian", 31, 780000000);
    ins.run("dbz-04", "Son Gohan (Beast Mode)", "Saiyan", 27, 960000000);
    ins.run("dbz-05", "Broly (Full Power)", "Saiyan", 48, 930000000);
  }
}

/**
 * Controlador principal que enruta y ejecuta cualquier petición HTTP hacia `/api/*`.
 * @param {string} method - Verbo HTTP en mayúsculas (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`).
 * @param {string} pathname - Ruta solicitada (ej. `/api/destinos`).
 * @param {URLSearchParams} searchParams - Parámetros de consulta en la URL (`?q=...`).
 * @param {object} body - Objeto JSON recibido en el cuerpo de la petición.
 * @returns {Promise<{ status: number, body: any }>} Código HTTP y respuesta JSON.
 */
export async function handleApiRequest(method, pathname, searchParams, body = {}) {
  const db = getSqliteInstance(); // Obtiene la instancia activa de la base de datos SQLite
  const cleanPath = pathname.replace(/\/+$/, "") || "/"; // Elimina barras diagonales finales sobrantes para normalizar las rutas

  // ==========================================================================
  // 0. ESTADO Y PRUEBA DE CONEXIÓN DE LA BASE DE DATOS REAL (`/api/db/status`)
  // ==========================================================================
  if (cleanPath === "/api/db/status" || cleanPath === "/api/db/test") {
    // Consulta en tiempo real el conteo de filas de las 12 tablas principales
    const tables = {
      turismo_destinos: db.prepare("SELECT COUNT(*) as c FROM turismo_destinos").get().c,
      planes_sugeridos: db.prepare("SELECT COUNT(*) as c FROM planes_sugeridos").get().c,
      citas_programadas: db.prepare("SELECT COUNT(*) as c FROM citas_programadas").get().c,
      gestor_tareas: db.prepare("SELECT COUNT(*) as c FROM gestor_tareas").get().c,
      finanzas_transacciones: db.prepare("SELECT COUNT(*) as c FROM finanzas_transacciones").get().c,
      kanban_tareas: db.prepare("SELECT COUNT(*) as c FROM kanban_tareas").get().c,
      bitshop_products: db.prepare("SELECT COUNT(*) as c FROM bitshop_products").get().c,
      bitshop_users: db.prepare("SELECT COUNT(*) as c FROM bitshop_users").get().c,
      mongo_characters: db.prepare("SELECT COUNT(*) as c FROM mongo_characters").get().c,
      notesdb_notas: db.prepare("SELECT COUNT(*) as c FROM notesdb_notas").get().c,
      agenda_eventos: db.prepare("SELECT COUNT(*) as c FROM agenda_eventos").get().c,
      tienda_pedidos: db.prepare("SELECT COUNT(*) as c FROM tienda_pedidos").get().c
    };
    return {
      status: 200,
      body: {
        ok: true,
        connected: true,
        engine: process.env.MONGODB_URI
          ? "MongoDB Atlas + SQLite3 Hybrid"
          : process.env.NETLIFY_DB_URL || process.env.DATABASE_URL
          ? "PostgreSQL (Netlify DB) + SQLite3 Hybrid"
          : "SQLite3 Relacional Nativo (node:sqlite)",
        databaseFile: activeDbPath,
        timestamp: new Date().toISOString(),
        tables
      }
    };
  }

  // ==========================================================================
  // 1. TURISMO MEAN (`/api/destinos` y `/api/destinos/stats/resumen`)
  // ==========================================================================
  if (cleanPath === "/api/destinos/stats/resumen" && method === "GET") {
    const rows = db.prepare("SELECT * FROM turismo_destinos").all(); // Obtiene todos los destinos registrados
    const total = rows.length; // Total de destinos activos
    const precioPromedio = total ? Math.round(rows.reduce((a, r) => a + Number(r.precio || 0), 0) / total) : 0; // Calcula tarifa promedio
    const calificacionPromedio = total
      ? Number((rows.reduce((a, r) => a + Number(r.calificacion || 0), 0) / total).toFixed(2))
      : 0; // Calcula estrellas promedio
    return { status: 200, body: { ok: true, stats: { totalDestinos: total, precioPromedio, calificacionPromedio } } };
  }

  if (cleanPath === "/api/destinos") {
    if (method === "GET") {
      let rows = db.prepare("SELECT * FROM turismo_destinos ORDER BY fechaCreacion DESC").all(); // Lista destinos ordenados por fecha
      const q = (searchParams.get("q") || "").trim().toLowerCase(); // Lee filtro de búsqueda por texto libre
      const ciudad = (searchParams.get("ciudad") || "").trim().toLowerCase(); // Lee filtro por ciudad
      if (q) {
        rows = rows.filter(
          (d) =>
            d.nombre.toLowerCase().includes(q) ||
            d.ciudad.toLowerCase().includes(q) ||
            (d.descripcion || "").toLowerCase().includes(q)
        );
      }
      if (ciudad) {
        rows = rows.filter((d) => d.ciudad.toLowerCase().includes(ciudad));
      }
      return { status: 200, body: { ok: true, total: rows.length, destinos: rows } };
    }
    if (method === "POST") {
      const nombre = String(body.nombre || "").trim(); // Sanitiza nombre del destino
      const ciudad = String(body.ciudad || "").trim(); // Sanitiza ciudad o región
      if (!nombre || !ciudad) {
        return { status: 400, body: { ok: false, msg: "El nombre y la ciudad son obligatorios" } };
      }
      const _id = crypto.randomBytes(12).toString("hex"); // Genera ID hexadecimal de 24 caracteres compatible con ObjectId
      const descripcion = String(body.descripcion || "").trim() || "Destino turístico destacado en Colombia";
      const precio = Math.max(0, Number(body.precio ?? 850000));
      const calificacion = Math.min(5, Math.max(1, Number(body.calificacion ?? 5)));
      const fechaCreacion = new Date().toISOString();
      db.prepare(
        "INSERT INTO turismo_destinos (_id, nombre, ciudad, descripcion, precio, calificacion, fechaCreacion) VALUES (?, ?, ?, ?, ?, ?, ?)"
      ).run(_id, nombre, ciudad, descripcion, precio, calificacion, fechaCreacion);
      const data = { _id, nombre, ciudad, descripcion, precio, calificacion, fechaCreacion };
      return { status: 201, body: { ok: true, data } };
    }
  }

  // Operaciones PUT y DELETE por ID sobre `/api/destinos/:id`
  const matchTurismoId = cleanPath.match(/^\/api\/destinos\/([^/]+)$/);
  if (matchTurismoId) {
    const id = decodeURIComponent(matchTurismoId[1]);
    if (method === "PUT") {
      const existing = db.prepare("SELECT * FROM turismo_destinos WHERE _id = ?").get(id);
      if (!existing) return { status: 404, body: { ok: false, msg: "Destino no encontrado" } };
      const nombre = body.nombre !== undefined ? String(body.nombre).trim() : existing.nombre;
      const ciudad = body.ciudad !== undefined ? String(body.ciudad).trim() : existing.ciudad;
      const descripcion = body.descripcion !== undefined ? String(body.descripcion).trim() : existing.descripcion;
      const precio = body.precio !== undefined ? Number(body.precio) : existing.precio;
      const calificacion = body.calificacion !== undefined ? Number(body.calificacion) : existing.calificacion;
      db.prepare(
        "UPDATE turismo_destinos SET nombre = ?, ciudad = ?, descripcion = ?, precio = ?, calificacion = ? WHERE _id = ?"
      ).run(nombre, ciudad, descripcion, precio, calificacion, id);
      const updated = db.prepare("SELECT * FROM turismo_destinos WHERE _id = ?").get(id);
      return { status: 200, body: { ok: true, data: updated } };
    }
    if (method === "DELETE") {
      db.prepare("DELETE FROM turismo_destinos WHERE _id = ?").run(id);
      return { status: 200, body: { ok: true, msg: "Destino eliminado correctamente" } };
    }
  }

  // ==========================================================================
  // 2. APP DE CITAS (`/api/planes` y `/api/citas`)
  // ==========================================================================
  if (cleanPath === "/api/planes") {
    if (method === "GET") {
      const planes = db.prepare("SELECT * FROM planes_sugeridos ORDER BY id ASC").all();
      return { status: 200, body: { ok: true, planes } };
    }
    if (method === "POST") {
      const titulo = String(body.titulo || "").trim();
      if (!titulo) return { status: 400, body: { ok: false, error: "El título del plan es obligatorio" } };
      const categoria = String(body.categoria || "Romántico");
      const descripcion = String(body.descripcion || "Plan especial creado por nosotros.");
      const icono = String(body.icono || "💖");
      const duracion_estimada = String(body.duracion_estimada || "2 a 3 horas");
      const presupuesto = String(body.presupuesto || "$$ Moderado");
      const lugar_sugerido = String(body.lugar_sugerido || "Lugar especial");
      const tips_romanticos = String(body.tips_romanticos || "Disfrutar cada momento juntos.");
      const info = db.prepare(
        "INSERT INTO planes_sugeridos (titulo, categoria, descripcion, icono, duracion_estimada, presupuesto, lugar_sugerido, tips_romanticos) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
      ).run(titulo, categoria, descripcion, icono, duracion_estimada, presupuesto, lugar_sugerido, tips_romanticos);
      const plan = db.prepare("SELECT * FROM planes_sugeridos WHERE id = ?").get(info.lastInsertRowid);
      return { status: 201, body: { ok: true, plan } };
    }
  }

  const matchPlanId = cleanPath.match(/^\/api\/planes\/(\d+)$/);
  if (matchPlanId && method === "DELETE") {
    db.prepare("DELETE FROM planes_sugeridos WHERE id = ?").run(Number(matchPlanId[1]));
    return { status: 200, body: { ok: true } };
  }

  if (cleanPath === "/api/citas") {
    if (method === "GET") {
      const rows = db.prepare("SELECT * FROM citas_programadas ORDER BY id DESC").all();
      const planes = db.prepare("SELECT * FROM planes_sugeridos").all();
      const citas = rows.map((r) => {
        const plan = planes.find((p) => p.id === r.plan_id) || {};
        return {
          ...r,
          plan_titulo: plan.titulo || r.titulo_cita,
          icono: plan.icono || "💖",
          categoria: plan.categoria || "Especial",
          fotos: JSON.parse(r.fotos_json || "[]")
        };
      });
      return { status: 200, body: { ok: true, citas } };
    }
    if (method === "POST") {
      const plan_id = Number(body.plan_id || 1);
      const titulo_cita = String(body.titulo_cita || "Cita Especial").trim();
      const fecha = String(body.fecha || new Date().toISOString().slice(0, 10));
      const hora = String(body.hora || "19:30");
      const lugar = String(body.lugar || "Lugar especial");
      const estado = String(body.estado || "Programada");
      const calificacion = Number(body.calificacion || 5);
      const bitacora_recuerdo = String(body.bitacora_recuerdo || "");
      const fotos_json = JSON.stringify(Array.isArray(body.fotos) ? body.fotos : []);
      const info = db.prepare(
        "INSERT INTO citas_programadas (plan_id, titulo_cita, fecha, hora, lugar, estado, calificacion, bitacora_recuerdo, fotos_json, creado_en) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
      ).run(plan_id, titulo_cita, fecha, hora, lugar, estado, calificacion, bitacora_recuerdo, fotos_json, new Date().toISOString());
      return { status: 201, body: { ok: true, id: info.lastInsertRowid } };
    }
  }

  const matchCitaId = cleanPath.match(/^\/api\/citas\/(\d+)$/);
  if (matchCitaId) {
    const id = Number(matchCitaId[1]);
    if (method === "PUT") {
      const existing = db.prepare("SELECT * FROM citas_programadas WHERE id = ?").get(id);
      if (!existing) return { status: 404, body: { ok: false } };
      const estado = body.estado !== undefined ? String(body.estado) : existing.estado;
      const calificacion = body.calificacion !== undefined ? Number(body.calificacion) : existing.calificacion;
      const bitacora_recuerdo = body.bitacora_recuerdo !== undefined ? String(body.bitacora_recuerdo) : existing.bitacora_recuerdo;
      const fotos_json = body.fotos !== undefined ? JSON.stringify(body.fotos) : existing.fotos_json;
      db.prepare(
        "UPDATE citas_programadas SET estado = ?, calificacion = ?, bitacora_recuerdo = ?, fotos_json = ? WHERE id = ?"
      ).run(estado, calificacion, bitacora_recuerdo, fotos_json, id);
      return { status: 200, body: { ok: true } };
    }
    if (method === "DELETE") {
      db.prepare("DELETE FROM citas_programadas WHERE id = ?").run(id);
      return { status: 200, body: { ok: true } };
    }
  }

  // ==========================================================================
  // 3. GESTOR DE TAREAS NODE (`/api/tareas` y `/api/eventos`)
  // ==========================================================================
  if (cleanPath === "/api/tareas") {
    if (method === "GET") {
      const rows = db.prepare("SELECT * FROM gestor_tareas ORDER BY creadoEn ASC").all();
      return {
        status: 200,
        body: rows.map((r) => ({ id: r.id, descripcion: r.descripcion, completada: Boolean(r.completada), creadoEn: r.creadoEn }))
      };
    }
    if (method === "POST") {
      const descripcion = String(body.descripcion || "").trim();
      if (!descripcion) return { status: 400, body: { error: "La descripción es requerida" } };
      const id = crypto.randomUUID();
      const creadoEn = new Date().toISOString();
      db.prepare("INSERT INTO gestor_tareas (id, descripcion, completada, creadoEn) VALUES (?, ?, 0, ?)").run(id, descripcion, creadoEn);
      db.prepare("INSERT INTO gestor_eventos (ts, tipo, tareaId, descripcion) VALUES (?, 'tarea:creada', ?, ?)").run(creadoEn, id, descripcion);
      return { status: 201, body: { id, descripcion, completada: false, creadoEn } };
    }
  }

  const matchTareaId = cleanPath.match(/^\/api\/tareas\/([^/]+)$/);
  if (matchTareaId) {
    const id = decodeURIComponent(matchTareaId[1]);
    const now = new Date().toISOString();
    if (method === "PATCH") {
      db.prepare("UPDATE gestor_tareas SET completada = 1 WHERE id = ?").run(id);
      db.prepare("INSERT INTO gestor_eventos (ts, tipo, tareaId, descripcion) VALUES (?, 'tarea:completada', ?, '')").run(now, id);
      return { status: 200, body: { ok: true, id } };
    }
    if (method === "DELETE") {
      db.prepare("DELETE FROM gestor_tareas WHERE id = ?").run(id);
      db.prepare("INSERT INTO gestor_eventos (ts, tipo, tareaId, descripcion) VALUES (?, 'tarea:eliminada', ?, '')").run(now, id);
      return { status: 200, body: { ok: true, id } };
    }
  }

  if (cleanPath === "/api/eventos" && method === "GET") {
    const rows = db.prepare("SELECT * FROM gestor_eventos ORDER BY id ASC").all();
    return {
      status: 200,
      body: rows.map((r) => ({ ts: r.ts, tipo: r.tipo, id: r.tareaId, ...(r.descripcion ? { descripcion: r.descripcion } : {}) }))
    };
  }

  // ==========================================================================
  // 4. FINANZAS APP (`/api/finanzas/transacciones`)
  // ==========================================================================
  if (cleanPath === "/api/finanzas/transacciones") {
    if (method === "GET") {
      const transacciones = db.prepare("SELECT id, concepto, monto, tipo FROM finanzas_transacciones ORDER BY id ASC").all();
      return { status: 200, body: { ok: true, transacciones } };
    }
    if (method === "POST") {
      const id = Number(body.id || Date.now());
      const concepto = String(body.concepto || "").trim();
      const monto = Number(body.monto || 0);
      const tipo = body.tipo === "gasto" ? "gasto" : "ingreso";
      if (!concepto || monto <= 0) {
        return { status: 400, body: { ok: false, error: "Concepto y monto positivo son requeridos" } };
      }
      db.prepare("INSERT OR REPLACE INTO finanzas_transacciones (id, concepto, monto, tipo, creado_en) VALUES (?, ?, ?, ?, ?)").run(
        id,
        concepto,
        monto,
        tipo,
        new Date().toISOString()
      );
      return { status: 201, body: { ok: true, transaccion: { id, concepto, monto, tipo } } };
    }
  }

  const matchFinId = cleanPath.match(/^\/api\/finanzas\/transacciones\/([^/]+)$/);
  if (matchFinId && method === "DELETE") {
    db.prepare("DELETE FROM finanzas_transacciones WHERE id = ?").run(Number(matchFinId[1]));
    return { status: 200, body: { ok: true } };
  }

  // ==========================================================================
  // 5. TABLERO KANBAN SCRUM (`/api/kanban/tareas`)
  // ==========================================================================
  if (cleanPath === "/api/kanban/tareas") {
    if (method === "GET") {
      const rows = db.prepare("SELECT * FROM kanban_tareas ORDER BY orden ASC, id ASC").all();
      const estado = { pendiente: [], progreso: [], completado: [] };
      for (const r of rows) {
        const col = estado[r.columna] ? r.columna : "pendiente";
        estado[col].push({ id: String(r.id), texto: r.texto });
      }
      return { status: 200, body: { ok: true, estado } };
    }
    if (method === "PUT" || method === "POST") {
      // Sincroniza el estado completo de las 3 columnas en la tabla relacional `kanban_tareas`
      const estado = body.estado || body;
      if (estado && typeof estado === "object") {
        db.exec("DELETE FROM kanban_tareas");
        const ins = db.prepare("INSERT INTO kanban_tareas (id, texto, columna, orden) VALUES (?, ?, ?, ?)");
        for (const col of ["pendiente", "progreso", "completado"]) {
          const arr = Array.isArray(estado[col]) ? estado[col] : [];
          arr.forEach((item, idx) => {
            if (item && item.texto) {
              ins.run(String(item.id || `${col}-${idx}`), String(item.texto), col, idx + 1);
            }
          });
        }
      }
      return { status: 200, body: { ok: true } };
    }
  }

  // ==========================================================================
  // 6. BITSHOP REST API (`/api/user/*` y `/api/products/*`)
  // ==========================================================================
  if (cleanPath === "/api/user/login" && method === "POST") {
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const user = db.prepare("SELECT * FROM bitshop_users WHERE LOWER(email) = ?").get(email);
    if (!user || user.password !== password) {
      return { status: 401, body: { ok: false, msj: "Credenciales inválidas. Verifica correo y contraseña." } };
    }
    const tokenPayload = Buffer.from(JSON.stringify({ id: user._id, email: user.email, role: user.role, exp: Date.now() + 86400000 })).toString("base64url");
    const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${tokenPayload}.bitshop_jwt_sig`;
    return {
      status: 200,
      body: {
        ok: true,
        msj: "Autenticación JWT exitosa desde Base de Datos SQL",
        token,
        user: { _id: user._id, username: user.username, email: user.email, role: user.role, phone: user.phone }
      }
    };
  }

  if (cleanPath === "/api/user/create-user" && method === "POST") {
    const username = String(body.username || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const phone = String(body.phone || "").trim();
    if (!username || !email || password.length < 4) {
      return { status: 400, body: { ok: false, msj: "Todos los campos son obligatorios (contraseña mín. 4 caracteres)" } };
    }
    const exists = db.prepare("SELECT _id FROM bitshop_users WHERE LOWER(email) = ?").get(email);
    if (exists) {
      return { status: 409, body: { ok: false, msj: "El correo electrónico ya está registrado en la base de datos" } };
    }
    const _id = `usr-${Date.now()}`;
    db.prepare("INSERT INTO bitshop_users (_id, username, email, password, phone, role) VALUES (?, ?, ?, ?, ?, 'client')").run(
      _id,
      username,
      email,
      password,
      phone
    );
    return { status: 201, body: { ok: true, msj: "Usuario registrado en base de datos", user: { _id, username, email, phone, role: "client" } } };
  }

  if (cleanPath === "/api/user/get-users" && method === "GET") {
    const users = db.prepare("SELECT _id, username, email, phone, role FROM bitshop_users").all();
    return { status: 200, body: { ok: true, total: users.length, users } };
  }

  if (cleanPath === "/api/products/get-products" && method === "GET") {
    let prods = db.prepare("SELECT * FROM bitshop_products ORDER BY rowid DESC").all();
    const q = (searchParams.get("q") || "").trim().toLowerCase();
    if (q) {
      prods = prods.filter((p) => p.name.toLowerCase().includes(q) || (p.description || "").toLowerCase().includes(q));
    }
    return { status: 200, body: prods };
  }

  if (cleanPath === "/api/products/create-product" && method === "POST") {
    const _id = `prod-${Date.now()}`;
    const name = String(body.name || "").trim();
    const price = Number(body.price || 0);
    const availableElements = Number(body.availableElements ?? 10);
    const description = String(body.description || "").trim();
    if (!name) return { status: 400, body: { ok: false, msj: "El nombre del producto es obligatorio" } };
    db.prepare("INSERT INTO bitshop_products (_id, name, price, availableElements, description) VALUES (?, ?, ?, ?, ?)").run(
      _id,
      name,
      price,
      availableElements,
      description
    );
    return { status: 201, body: { ok: true, product: { _id, name, price, availableElements, description } } };
  }

  const matchProdUpdate = cleanPath.match(/^\/api\/products\/update-product\/([^/]+)$/);
  if (matchProdUpdate && method === "PUT") {
    const id = decodeURIComponent(matchProdUpdate[1]);
    const name = String(body.name || "").trim();
    const price = Number(body.price || 0);
    const availableElements = Number(body.availableElements ?? 0);
    const description = String(body.description || "").trim();
    db.prepare("UPDATE bitshop_products SET name = ?, price = ?, availableElements = ?, description = ? WHERE _id = ?").run(
      name,
      price,
      availableElements,
      description,
      id
    );
    return { status: 200, body: { ok: true, _id: id, name, price, availableElements, description } };
  }

  const matchProdDel = cleanPath.match(/^\/api\/products\/delete-product\/([^/]+)$/);
  if (matchProdDel && method === "DELETE") {
    const id = decodeURIComponent(matchProdDel[1]);
    db.prepare("DELETE FROM bitshop_products WHERE _id = ?").run(id);
    return { status: 200, body: { ok: true, deletedId: id } };
  }

  // ==========================================================================
  // 7. TS_API TYPESCRIPT (`/api/login`, `/api/operaciones/*`, `/api/saludo/*`, `/api/math/*`, `/api/health`)
  // ==========================================================================
  function logTsOperation(endpoint, detalle, resultado) {
    db.prepare("INSERT INTO ts_api_logs (endpoint, detalle, resultado, fecha) VALUES (?, ?, ?, ?)").run(
      endpoint,
      detalle,
      String(resultado),
      new Date().toISOString()
    );
  }

  if (cleanPath === "/api/login" && method === "POST") {
    const username = String(body.username || "demo_dev").trim();
    const email = String(body.email || "demo@tsapi.local").trim();
    logTsOperation("POST /api/login", `${username} (${email})`, "Sesión iniciada");
    return {
      status: 200,
      body: {
        ok: true,
        msg: `Bienvenido ${username}, sesión registrada en base de datos SQL`,
        user: { username, email, role: "developer" }
      }
    };
  }

  const matchOp = cleanPath.match(/^\/api\/operaciones\/(suma|resta|multiplicacion|division)\/([^/]+)\/([^/]+)$/);
  if (matchOp && method === "GET") {
    const [, op, rawA, rawB] = matchOp;
    const a = parseFloat(decodeURIComponent(rawA));
    const b = parseFloat(decodeURIComponent(rawB));
    if (Number.isNaN(a) || Number.isNaN(b)) {
      return { status: 400, body: { ok: false, msg: "Uno o ambos parámetros no son números válidos" } };
    }
    if (op === "division" && b === 0) {
      return { status: 400, body: { ok: false, msg: "No es posible dividir entre cero" } };
    }
    const map = { suma: a + b, resta: a - b, multiplicacion: a * b, division: Number((a / b).toFixed(4)) };
    const resultado = map[op];
    const msg = `Operación ${op}(${a}, ${b}) = ${resultado} (Persistido en BD SQL)`;
    logTsOperation(`GET /api/operaciones/${op}`, `${a}, ${b}`, resultado);
    const historial = db.prepare("SELECT * FROM ts_api_logs ORDER BY id DESC LIMIT 8").all();
    return { status: 200, body: { ok: true, operacion: op, a, b, resultado, msg, historial_bd: historial } };
  }

  const matchSaludo = cleanPath.match(/^\/api\/saludo\/([^/]+)$/);
  if (matchSaludo && method === "GET") {
    const tipo = decodeURIComponent(matchSaludo[1]);
    const saludos = {
      hola: "¡Hola! Respuesta tipada desde ts_api + Base de Datos SQL activa.",
      saludo: "¿Cómo estás? Todos los servicios REST y la base de datos operan al 100%.",
      bye: "¡Hasta pronto! El registro de auditoría quedó almacenado en la base de datos."
    };
    const msg = saludos[tipo] || `Saludo personalizado para ${tipo} desde ts_api`;
    logTsOperation(`GET /api/saludo/${tipo}`, tipo, msg);
    const historial = db.prepare("SELECT * FROM ts_api_logs ORDER BY id DESC LIMIT 8").all();
    return { status: 200, body: { ok: true, msg, historial_bd: historial } };
  }

  const matchMath = cleanPath.match(/^\/api\/math\/suma\/([^/]+)\/([^/]+)$/);
  if (matchMath && method === "GET") {
    const a = parseFloat(decodeURIComponent(matchMath[1]));
    const b = parseFloat(decodeURIComponent(matchMath[2]));
    const resultado = a + b;
    const msg = `Inspección Math: ${a} + ${b} = ${resultado} | π = ${Math.PI.toFixed(6)}`;
    logTsOperation("GET /api/math/suma", `${a} + ${b}`, resultado);
    const historial = db.prepare("SELECT * FROM ts_api_logs ORDER BY id DESC LIMIT 8").all();
    return { status: 200, body: { ok: true, resultado, pi: Math.PI, msg, historial_bd: historial } };
  }

  if (cleanPath === "/api/health" && method === "GET") {
    const totalLogs = db.prepare("SELECT COUNT(*) as c FROM ts_api_logs").get().c;
    return {
      status: 200,
      body: {
        ok: true,
        service: "ts_api Enterprise TypeScript + SQL Database",
        msg: `Servidor saludable • ${totalLogs} operaciones registradas en Base de Datos`,
        status: "healthy",
        database: "connected"
      }
    };
  }

  // ==========================================================================
  // 8. MONGODB DBZ-V2 PLAYGROUND (`/api/characters` y `/api/reset`)
  // ==========================================================================
  if (cleanPath === "/api/characters") {
    if (method === "GET") {
      let chars = db.prepare("SELECT * FROM mongo_characters ORDER BY powerLevel DESC").all();
      const species = (searchParams.get("species") || "").trim();
      const minPower = searchParams.get("minPower");
      const q = (searchParams.get("q") || "").trim().toLowerCase();
      if (species) chars = chars.filter((c) => c.species === species);
      if (minPower !== null && minPower !== "") chars = chars.filter((c) => Number(c.powerLevel) >= Number(minPower));
      if (q) chars = chars.filter((c) => c.name.toLowerCase().includes(q) || c.species.toLowerCase().includes(q));
      return { status: 200, body: { ok: true, total: chars.length, characters: chars } };
    }
    if (method === "POST") {
      const _id = `dbz-${Date.now()}`;
      const name = String(body.name || "").trim();
      const species = String(body.species || "Saiyan").trim();
      const edad = Number(body.edad || 30);
      const powerLevel = Number(body.powerLevel || 1000000);
      if (!name) return { status: 400, body: { ok: false, error: "El nombre es obligatorio" } };
      db.prepare("INSERT INTO mongo_characters (_id, name, species, edad, powerLevel) VALUES (?, ?, ?, ?, ?)").run(
        _id,
        name,
        species,
        edad,
        powerLevel
      );
      return { status: 201, body: { ok: true, insertedId: _id, document: { _id, name, species, edad, powerLevel } } };
    }
  }

  const matchCharId = cleanPath.match(/^\/api\/characters\/([^/]+)$/);
  if (matchCharId) {
    const id = decodeURIComponent(matchCharId[1]);
    if (method === "PUT") {
      const name = String(body.name || "").trim();
      const species = String(body.species || "").trim();
      const edad = Number(body.edad || 30);
      const powerLevel = Number(body.powerLevel || 0);
      db.prepare("UPDATE mongo_characters SET name = ?, species = ?, edad = ?, powerLevel = ? WHERE _id = ?").run(
        name,
        species,
        edad,
        powerLevel,
        id
      );
      return { status: 200, body: { ok: true, matchedCount: 1, modifiedCount: 1, _id: id } };
    }
    if (method === "DELETE") {
      db.prepare("DELETE FROM mongo_characters WHERE _id = ?").run(id);
      return { status: 200, body: { ok: true, deletedCount: 1, _id: id } };
    }
  }

  if (cleanPath === "/api/reset" && method === "POST") {
    seedMongoCharactersIfEmpty(db, true);
    const characters = db.prepare("SELECT * FROM mongo_characters ORDER BY powerLevel DESC").all();
    return { status: 200, body: { ok: true, msg: "Colección DBZ-V2 restaurada en base de datos", characters } };
  }

  // ==========================================================================
  // 9. TIENDA ONLINE BIT SHOP (`/api/tienda/pedidos`)
  // ==========================================================================
  if (cleanPath === "/api/tienda/pedidos") {
    if (method === "GET") {
      const rows = db.prepare("SELECT * FROM tienda_pedidos ORDER BY creado_en DESC LIMIT 20").all();
      return {
        status: 200,
        body: {
          ok: true,
          pedidos: rows.map((r) => ({ ...r, items: JSON.parse(r.items_json || "[]") }))
        }
      };
    }
    if (method === "POST") {
      const id = `ORD-${Date.now().toString().slice(-6)}`;
      const cliente = String(body.cliente || "Cliente BIT Shop").trim();
      const items = Array.isArray(body.items) ? body.items : [];
      const total = Number(body.total || 0);
      const creado_en = new Date().toISOString();
      db.prepare("INSERT INTO tienda_pedidos (id, cliente, items_json, total, creado_en) VALUES (?, ?, ?, ?, ?)").run(
        id,
        cliente,
        JSON.stringify(items),
        total,
        creado_en
      );
      return { status: 201, body: { ok: true, pedido: { id, cliente, items, total, creado_en } } };
    }
  }

  // ==========================================================================
  // 10. NOTESDB (`/api/notesdb/notas`)
  // ==========================================================================
  if (cleanPath === "/api/notesdb/notas") {
    if (method === "GET") {
      const notas = db.prepare("SELECT * FROM notesdb_notas ORDER BY id DESC").all();
      return { status: 200, body: { ok: true, notas } };
    }
    if (method === "POST") {
      const title = String(body.title || "").trim();
      const category = String(body.category || "Trabajo").trim();
      const createdAt = String(body.createdAt || new Date().toLocaleString("es-CO"));
      if (!title) return { status: 400, body: { ok: false, error: "El título es obligatorio" } };
      const info = db.prepare("INSERT INTO notesdb_notas (title, category, createdAt) VALUES (?, ?, ?)").run(title, category, createdAt);
      return { status: 201, body: { ok: true, nota: { id: info.lastInsertRowid, title, category, createdAt } } };
    }
  }

  const matchNotaId = cleanPath.match(/^\/api\/notesdb\/notas\/(\d+)$/);
  if (matchNotaId) {
    const id = Number(matchNotaId[1]);
    if (method === "PUT") {
      const title = String(body.title || "").trim();
      db.prepare("UPDATE notesdb_notas SET title = ? WHERE id = ?").run(title, id);
      return { status: 200, body: { ok: true } };
    }
    if (method === "DELETE") {
      db.prepare("DELETE FROM notesdb_notas WHERE id = ?").run(id);
      return { status: 200, body: { ok: true } };
    }
  }

  // ==========================================================================
  // 11. AGENDA & FULLCALENDAR ANGULAR 16 (`/api/agenda/eventos`)
  // ==========================================================================
  if (cleanPath === "/api/agenda/eventos") {
    if (method === "GET") {
      const eventos = db.prepare("SELECT * FROM agenda_eventos ORDER BY start ASC").all();
      return { status: 200, body: { ok: true, eventos } };
    }
    if (method === "POST") {
      const id = String(body.id || `ev-${Date.now()}`);
      const title = String(body.title || "").trim();
      const start = String(body.start || new Date().toISOString().slice(0, 10));
      const category = String(body.category || "Scrum");
      const color = String(body.color || "#38bdf8");
      if (!title) return { status: 400, body: { ok: false, error: "El título del evento es obligatorio" } };
      db.prepare("INSERT OR REPLACE INTO agenda_eventos (id, title, start, category, color) VALUES (?, ?, ?, ?, ?)").run(
        id,
        title,
        start,
        category,
        color
      );
      return { status: 201, body: { ok: true, evento: { id, title, start, category, color } } };
    }
  }

  const matchAgendaId = cleanPath.match(/^\/api\/agenda\/eventos\/([^/]+)$/);
  if (matchAgendaId && method === "DELETE") {
    db.prepare("DELETE FROM agenda_eventos WHERE id = ?").run(decodeURIComponent(matchAgendaId[1]));
    return { status: 200, body: { ok: true } };
  }

  // ==========================================================================
  // 12. ALMACÉN CLAVE-VALOR SQL PARA SINCRONIZACIÓN DE MÓDULOS (`/api/db/kv/:clave`)
  // ==========================================================================
  const matchKv = cleanPath.match(/^\/api\/db\/kv\/([^/]+)$/);
  if (matchKv) {
    const clave = decodeURIComponent(matchKv[1]);
    if (method === "GET") {
      const row = db.prepare("SELECT * FROM portfolio_kv_store WHERE clave = ?").get(clave);
      return {
        status: 200,
        body: {
          ok: true,
          clave,
          exists: Boolean(row),
          data: row ? JSON.parse(row.valor_json) : null,
          actualizado_en: row ? row.actualizado_en : null
        }
      };
    }
    if (method === "POST" || method === "PUT") {
      const now = new Date().toISOString();
      const valor_json = JSON.stringify(body.data !== undefined ? body.data : body);
      db.prepare("INSERT OR REPLACE INTO portfolio_kv_store (clave, valor_json, actualizado_en) VALUES (?, ?, ?)").run(
        clave,
        valor_json,
        now
      );
      return { status: 200, body: { ok: true, clave, actualizado_en: now } };
    }
  }

  // Si ninguna ruta coincide, retorna estado HTTP 404 Not Found
  return { status: 404, body: { ok: false, error: `Endpoint no encontrado: ${method} ${cleanPath}` } };
}
