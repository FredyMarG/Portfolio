import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');

test('archivos maestros de portafolio, SEO y seguridad existen', () => {
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
    '.github/workflows/ci.yml'
  ];

  for (const rel of requiredFiles) {
    assert.equal(existsSync(resolve(ROOT, rel)), true, `Falta archivo requerido: ${rel}`);
  }
});

test('index.html no contiene handlers inline onclick= y referencia GitHub', () => {
  const html = readFileSync(resolve(ROOT, 'index.html'), 'utf8');
  assert.equal(html.includes('onclick='), false, 'index.html no debe usar onclick inline');
  assert.equal(html.includes('https://github.com/FredyMarG'), true, 'index.html debe incluir enlace a GitHub');
});

test('todos los proyectos en portfolio-app.js apuntan a carpetas y rutas existentes', () => {
  const src = readFileSync(resolve(ROOT, 'portfolio-app.js'), 'utf8');

  const folderMatches = [...src.matchAll(/folder:\s*"([^"]+)"/g)].map((m) => m[1]);
  assert.ok(folderMatches.length >= 16, `Se esperaban al menos 16 proyectos, encontrados: ${folderMatches.length}`);

  for (const folder of folderMatches) {
    assert.equal(existsSync(resolve(ROOT, folder)), true, `Carpeta inexistente en disco: ${folder}`);
  }

  const previewMatches = [...src.matchAll(/(?:previewUrl|url):\s*"([^"]+)"/g)].map((m) => m[1]);
  for (const relUrl of previewMatches) {
    assert.equal(existsSync(resolve(ROOT, relUrl)), true, `Ruta de vista previa inexistente: ${relUrl}`);
  }
});
