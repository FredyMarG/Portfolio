import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { handleApiRequest } from '../database/db-engine.mjs';

const ROOT = resolve(import.meta.dirname, '..');

test('archivos maestros de portafolio, SEO, seguridad y base de datos existen', () => {
  const requiredFiles = [
    'index.html',
    'portfolio-app.js',
    'portfolio-styles.css',
    'README.md',
    'netlify.toml',
    'robots.txt',
    'sitemap.xml',
    '404.html',
    'My CV/index.html',
    '.github/workflows/ci.yml',
    'server.mjs',
    'netlify/functions/api.mjs',
    'database/db-engine.mjs',
    'database/portfolio_mysql.sql',
    'database/portfolio_postgres.sql',
    'database/portfolio_mongodb.json'
  ];

  for (const rel of requiredFiles) {
    assert.equal(existsSync(resolve(ROOT, rel)), true, `Falta archivo requerido: ${rel}`);
  }
});

test('index.html y portfolio-app.js no muestran código de proyectos ni usan onclick inline', () => {
  const html = readFileSync(resolve(ROOT, 'index.html'), 'utf8');
  const js = readFileSync(resolve(ROOT, 'portfolio-app.js'), 'utf8');

  assert.equal(html.includes('onclick='), false, 'index.html no debe usar onclick inline');
  assert.equal(html.includes('https://github.com/FredyMarG'), true, 'index.html debe incluir enlace a GitHub');
  assert.equal(js.includes('codeSnippet'), false, 'portfolio-app.js no debe mostrar fragmentos de código');
  assert.equal(js.includes('data-action="code"'), false, 'portfolio-app.js no debe incluir botones de código');
});

test('todos los 17 proyectos en portfolio-app.js tienen vista interactiva 100% funcional en disco', () => {
  const src = readFileSync(resolve(ROOT, 'portfolio-app.js'), 'utf8');

  const folderMatches = [...src.matchAll(/folder:\s*"([^"]+)"/g)].map((m) => m[1]);
  const previewMatches = [...src.matchAll(/previewUrl:\s*"([^"]+)"/g)].map((m) => m[1]);

  assert.equal(folderMatches.length, 17, `Se esperaban 17 proyectos, encontrados: ${folderMatches.length}`);
  assert.equal(previewMatches.length, 17, `Todos los 17 proyectos deben tener previewUrl funcional`);

  for (const folder of folderMatches) {
    assert.equal(existsSync(resolve(ROOT, folder)), true, `Carpeta inexistente en disco: ${folder}`);
  }

  const allUrls = [...src.matchAll(/(?:previewUrl|url):\s*"([^"]+)"/g)].map((m) => m[1]);
  for (const relUrl of allUrls) {
    assert.equal(existsSync(resolve(ROOT, relUrl)), true, `Ruta de aplicación funcional inexistente: ${relUrl}`);
  }
});

test('motor de base de datos real SQL/Mongo responde en todos los endpoints de los proyectos', async () => {
  const emptyParams = new URLSearchParams();

  // 1. Estado de conexión y archivo SQLite generado
  const statusRes = await handleApiRequest('GET', '/api/db/status', emptyParams);
  assert.equal(statusRes.status, 200);
  assert.equal(statusRes.body.ok, true);
  assert.equal(statusRes.body.connected, true);
  assert.equal(existsSync(resolve(ROOT, 'database/portfolio_real.sqlite')), true);

  // 2. Turismo MEAN
  const turRes = await handleApiRequest('GET', '/api/destinos', emptyParams);
  assert.equal(turRes.status, 200);
  assert.ok(turRes.body.destinos.length >= 5);

  // 3. Finanzas APP
  const finRes = await handleApiRequest('GET', '/api/finanzas/transacciones', emptyParams);
  assert.equal(finRes.status, 200);
  assert.ok(finRes.body.transacciones.length >= 4);

  // 4. Tablero Kanban
  const kanRes = await handleApiRequest('GET', '/api/kanban/tareas', emptyParams);
  assert.equal(kanRes.status, 200);
  assert.ok(Array.isArray(kanRes.body.estado.pendiente));

  // 5. Gestor de Tareas Node
  const tarRes = await handleApiRequest('GET', '/api/tareas', emptyParams);
  assert.equal(tarRes.status, 200);
  assert.ok(Array.isArray(tarRes.body));

  // 6. BitShop API (Productos)
  const prodRes = await handleApiRequest('GET', '/api/products/get-products', emptyParams);
  assert.equal(prodRes.status, 200);
  assert.ok(prodRes.body.length >= 4);

  // 7. MongoDB DBZ-V2 Playground
  const monRes = await handleApiRequest('GET', '/api/characters', emptyParams);
  assert.equal(monRes.status, 200);
  assert.ok(monRes.body.characters.length >= 5);

  // 8. Agenda Angular 16 + FullCalendar
  const agRes = await handleApiRequest('GET', '/api/agenda/eventos', emptyParams);
  assert.equal(agRes.status, 200);
  assert.ok(agRes.body.eventos.length >= 4);
});
