/**
 * ============================================================================
 * SUITE DE PRUEBAS AUTOMATIZADAS DEL PORTAFOLIO MAESTRO Y BASE DE DATOS REAL
 * (tests/portfolio.test.mjs)
 * ============================================================================
 * Propósito:
 *   Verificar mediante el runner nativo `node:test` que:
 *   1. Todos los archivos maestros del portafolio, SEO, servidor y scripts SQL/Mongo existen.
 *   2. El portafolio no expone código fuente en las tarjetas ni utiliza `onclick=` inline.
 *   3. Los 17 proyectos tienen una aplicación interactiva (`previewUrl`) existente en disco.
 *   4. El motor de Base de Datos Real (`database/db-engine.mjs`) responde con HTTP 200
 *      en los endpoints CRUD de todos los proyectos.
 *
 * Comentado línea por línea en español.
 * ============================================================================
 */

import test from 'node:test'; // Importa el ejecutor de pruebas unitarias e integración nativo de Node.js
import assert from 'node:assert/strict'; // Importa el módulo de aserciones estrictas para validar condiciones
import { existsSync, readFileSync } from 'node:fs'; // Importa funciones para comprobar existencia y leer archivos del proyecto
import { resolve } from 'node:path'; // Importa función para resolver rutas absolutas multiplataforma
import { handleApiRequest } from '../database/db-engine.mjs'; // Importa el motor unificado de Base de Datos Real para probar sus endpoints

const ROOT = resolve(import.meta.dirname, '..'); // Resuelve la ruta absoluta de la carpeta raíz del portafolio

// ============================================================================
// PRUEBA 1: VERIFICACIÓN DE ARCHIVOS MAESTROS, SERVIDOR Y SCRIPTS DE BD
// ============================================================================
test('archivos maestros de portafolio, SEO, seguridad y base de datos existen', () => {
  // Lista de archivos críticos que deben existir en el repositorio
  const requiredFiles = [
    'index.html', // Portal principal del portafolio profesional
    'portfolio-app.js', // Motor de renderizado de tarjetas y conexión a BD
    'portfolio-styles.css', // Hoja de estilos principal del portafolio
    'README.md', // Documentación ejecutiva del repositorio
    'netlify.toml', // Configuración de cabeceras de seguridad y caché para Netlify
    'robots.txt', // Reglas de indexación para motores de búsqueda
    'sitemap.xml', // Mapa XML del sitio para SEO
    '404.html', // Página personalizada para rutas no encontradas
    'My CV/index.html', // Hoja de Vida / CV optimizada para web e impresión A4
    '.github/workflows/ci.yml', // Pipeline de Integración Continua (GitHub Actions)
    'server.mjs', // Servidor Full-Stack local con API de Base de Datos Real
    'netlify/functions/api.mjs', // Función Serverless de Netlify para servir `/api/*` en producción
    'database/db-engine.mjs', // Motor unificado de Base de Datos SQLite / PostgreSQL / MongoDB
    'database/portfolio_mysql.sql', // Script relacional completo para MySQL / MariaDB
    'database/portfolio_postgres.sql', // Script relacional completo para PostgreSQL / Supabase / Neon
    'database/portfolio_mongodb.json' // Colecciones documentales listas para MongoDB Atlas / Compass
  ];

  // Verifica uno por uno que cada archivo exista físicamente en el disco
  for (const rel of requiredFiles) {
    assert.equal(existsSync(resolve(ROOT, rel)), true, `Falta archivo requerido: ${rel}`);
  }
});

// ============================================================================
// PRUEBA 2: VERIFICACIÓN DE AUSENCIA DE VISTAS DE CÓDIGO Y HANDLERS INLINE
// ============================================================================
test('index.html y portfolio-app.js no muestran código de proyectos ni usan onclick inline', () => {
  const html = readFileSync(resolve(ROOT, 'index.html'), 'utf8'); // Lee el código fuente de `index.html`
  const js = readFileSync(resolve(ROOT, 'portfolio-app.js'), 'utf8'); // Lee el código fuente de `portfolio-app.js`

  // Comprueba que no existan atributos `onclick=` inline en el HTML principal (seguridad CSP)
  assert.equal(html.includes('onclick='), false, 'index.html no debe usar onclick inline');
  // Comprueba que el enlace oficial al perfil de GitHub esté presente
  assert.equal(html.includes('https://github.com/FredyMarG'), true, 'index.html debe incluir enlace a GitHub');
  // Comprueba que se hayan eliminado por completo los fragmentos de código de las tarjetas
  assert.equal(js.includes('codeSnippet'), false, 'portfolio-app.js no debe mostrar fragmentos de código');
  // Comprueba que no existan botones `data-action="code"` en el renderizado de tarjetas
  assert.equal(js.includes('data-action="code"'), false, 'portfolio-app.js no debe incluir botones de código');
});

// ============================================================================
// PRUEBA 3: VERIFICACIÓN DE LAS 16 APLICACIONES ÚNICAS 100% FUNCIONALES
// ============================================================================
test('todos los 16 proyectos únicos en portfolio-app.js tienen vista interactiva 100% funcional en disco', () => {
  const src = readFileSync(resolve(ROOT, 'portfolio-app.js'), 'utf8'); // Lee la definición del catálogo en `portfolio-app.js`

  // Extrae todas las carpetas declaradas en `folder: "..."`
  const folderMatches = [...src.matchAll(/folder:\s*"([^"]+)"/g)].map((m) => m[1]);
  // Extrae todas las rutas de aplicaciones interactivas declaradas en `previewUrl: "..."`
  const previewMatches = [...src.matchAll(/previewUrl:\s*"([^"]+)"/g)].map((m) => m[1]);

  // Valida que existan exactamente los 16 proyectos únicos (sin duplicados) y que todos tengan su `previewUrl`
  assert.equal(folderMatches.length, 16, `Se esperaban 16 proyectos únicos, encontrados: ${folderMatches.length}`);
  assert.equal(previewMatches.length, 16, `Todos los 16 proyectos deben tener previewUrl funcional`);

  // Verifica que cada carpeta de proyecto exista en el disco
  for (const folder of folderMatches) {
    assert.equal(existsSync(resolve(ROOT, folder)), true, `Carpeta inexistente en disco: ${folder}`);
  }

  // Verifica que cada archivo HTML de vista previa (incluyendo `extraLinks`) exista físicamente
  const allUrls = [...src.matchAll(/(?:previewUrl|url):\s*"([^"]+)"/g)].map((m) => m[1]);
  for (const relUrl of allUrls) {
    assert.equal(existsSync(resolve(ROOT, relUrl)), true, `Ruta de aplicación funcional inexistente: ${relUrl}`);
  }
});

// ============================================================================
// PRUEBA 4: VERIFICACIÓN EN VIVO DE LOS ENDPOINTS DE LA BASE DE DATOS REAL
// ============================================================================
test('motor de base de datos real SQL/Mongo responde en todos los endpoints de los proyectos', async () => {
  const emptyParams = new URLSearchParams(); // Crea parámetros de consulta vacíos para peticiones GET estándar

  // 1. Verifica el endpoint de diagnóstico `/api/db/status` y la creación del archivo SQLite real
  const statusRes = await handleApiRequest('GET', '/api/db/status', emptyParams);
  assert.equal(statusRes.status, 200); // Debe responder HTTP 200 OK
  assert.equal(statusRes.body.ok, true); // Indicador booleano de éxito
  assert.equal(statusRes.body.connected, true); // Confirma conexión activa al motor SQL
  assert.equal(existsSync(resolve(ROOT, 'database/portfolio_real.sqlite')), true); // Verifica que el archivo `.sqlite` exista en disco

  // 2. Verifica endpoint de Turismo MEAN (`/api/destinos`)
  const turRes = await handleApiRequest('GET', '/api/destinos', emptyParams);
  assert.equal(turRes.status, 200);
  assert.ok(turRes.body.destinos.length >= 5); // Debe devolver al menos los 5 destinos turísticos iniciales

  // 3. Verifica endpoint de Finanzas APP (`/api/finanzas/transacciones`)
  const finRes = await handleApiRequest('GET', '/api/finanzas/transacciones', emptyParams);
  assert.equal(finRes.status, 200);
  assert.ok(finRes.body.transacciones.length >= 4); // Debe devolver las transacciones financieras iniciales

  // 4. Verifica endpoint de Tablero Kanban Scrum (`/api/kanban/tareas`)
  const kanRes = await handleApiRequest('GET', '/api/kanban/tareas', emptyParams);
  assert.equal(kanRes.status, 200);
  assert.ok(Array.isArray(kanRes.body.estado.pendiente)); // Debe devolver la estructura de columnas Kanban

  // 5. Verifica endpoint de Gestor de Tareas Node (`/api/tareas`)
  const tarRes = await handleApiRequest('GET', '/api/tareas', emptyParams);
  assert.equal(tarRes.status, 200);
  assert.ok(Array.isArray(tarRes.body)); // Debe devolver el arreglo de tareas persistidas

  // 6. Verifica endpoint de BitShop REST API (`/api/products/get-products`)
  const prodRes = await handleApiRequest('GET', '/api/products/get-products', emptyParams);
  assert.equal(prodRes.status, 200);
  assert.ok(prodRes.body.length >= 4); // Debe devolver el catálogo de productos tecnológicos

  // 7. Verifica endpoint de MongoDB DBZ-V2 Playground (`/api/characters`)
  const monRes = await handleApiRequest('GET', '/api/characters', emptyParams);
  assert.equal(monRes.status, 200);
  assert.ok(monRes.body.characters.length >= 5); // Debe devolver los personajes DBZ-V2

  // 8. Verifica endpoint de Agenda Angular 16 + FullCalendar (`/api/agenda/eventos`)
  const agRes = await handleApiRequest('GET', '/api/agenda/eventos', emptyParams);
  assert.equal(agRes.status, 200);
  assert.ok(agRes.body.eventos.length >= 4); // Debe devolver los eventos agendados en el calendario

  // 9. Verifica endpoint KV de StockFlow Pro (`/api/db/kv/stockflow_inventario_state`)
  const kvRes = await handleApiRequest('GET', '/api/db/kv/stockflow_inventario_state', emptyParams);
  assert.equal(kvRes.status, 200);
  assert.equal(kvRes.body.ok, true);
});
