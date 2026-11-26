/**
 * ============================================================================
 * SERVIDOR FULL-STACK LOCAL DEL PORTAFOLIO + BASE DE DATOS SQL REAL (server.mjs)
 * ============================================================================
 * Sirve todos los proyectos del portafolio y la API REST unificada `/api/*`
 * respaldada por `database/portfolio_real.sqlite` (node:sqlite).
 *
 * Uso:
 *   npm start   -> Abre http://localhost:8080
 */

import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, extname, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { handleApiRequest } from "./database/db-engine.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 8080);

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".webp": "image/webp"
};

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  const method = (req.method || "GET").toUpperCase();

  // 1. Peticiones a la API de Base de Datos Real (/api/*)
  if (url.pathname.startsWith("/api/")) {
    let body = {};
    if (method !== "GET" && method !== "HEAD") {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      const raw = Buffer.concat(chunks).toString("utf8");
      if (raw) {
        try {
          body = JSON.parse(raw);
        } catch {
          body = {};
        }
      }
    }

    try {
      const result = await handleApiRequest(method, url.pathname, url.searchParams, body);
      res.writeHead(result.status, {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store"
      });
      res.end(JSON.stringify(result.body));
    } catch (err) {
      res.writeHead(500, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ ok: false, error: err.message }));
    }
    return;
  }

  // 2. Archivos estáticos de todos los proyectos del portafolio
  let decodedPath = decodeURIComponent(url.pathname);
  if (decodedPath === "/") decodedPath = "/index.html";

  let filePath = resolve(__dirname, "." + decodedPath);
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403);
    res.end("Acceso denegado");
    return;
  }

  try {
    const info = await stat(filePath);
    if (info.isDirectory()) {
      filePath = resolve(filePath, "index.html");
    }
    const content = await readFile(filePath);
    const mime = MIME_TYPES[extname(filePath).toLowerCase()] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": mime });
    res.end(content);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Archivo no encontrado");
  }
});

server.listen(PORT, () => {
  console.log(`🚀 Portafolio Full-Stack + Base de Datos SQL activa en: http://localhost:${PORT}`);
  console.log(`🗄️  Estado de la Base de Datos en vivo: http://localhost:${PORT}/api/db/status`);
});
