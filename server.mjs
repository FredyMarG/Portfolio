/**
 * ============================================================================
 * SERVIDOR FULL-STACK LOCAL DEL PORTAFOLIO + BASE DE DATOS SQL REAL (server.mjs)
 * ============================================================================
 * Propósito:
 *   Servir localmente todas las aplicaciones interactivas del portafolio y
 *   exponer la API REST unificada (`/api/*`) conectada al motor de base de
 *   datos relacional SQLite3 (`database/portfolio_real.sqlite`).
 *
 * Comentado línea por línea en español de forma educativa y técnica.
 *
 * Uso en terminal:
 *   npm start   -> Inicia el servidor en http://localhost:8080
 * ============================================================================
 */

import http from "node:http"; // Importa el módulo HTTP nativo de Node.js para crear el servidor web sin dependencias externas
import { readFile, stat } from "node:fs/promises"; // Importa funciones asíncronas del sistema de archivos para leer archivos y verificar directorios
import { resolve, extname, dirname } from "node:path"; // Importa utilidades de rutas para resolver rutas absolutas y extraer extensiones
import { fileURLToPath } from "node:url"; // Importa conversor de URL de módulo ES (`import.meta.url`) a ruta de sistema de archivos
import { handleApiRequest } from "./database/db-engine.mjs"; // Importa el controlador central que procesa todas las rutas `/api/*` contra la Base de Datos

const __dirname = dirname(fileURLToPath(import.meta.url)); // Obtiene la ruta absoluta del directorio raíz donde se encuentra `server.mjs`
const PORT = Number(process.env.PORT || 8080); // Define el puerto de escucha leyendo la variable de entorno `PORT` o usando `8080` por defecto

// Diccionario de tipos MIME estándar para entregar cada archivo estático con la cabecera `Content-Type` correcta
const MIME_TYPES = {
  ".html": "text/html; charset=utf-8", // Documentos HTML5 codificados en UTF-8
  ".css": "text/css; charset=utf-8", // Hojas de estilo en cascada CSS3
  ".js": "application/javascript; charset=utf-8", // Scripts de cliente JavaScript
  ".mjs": "application/javascript; charset=utf-8", // Módulos ECMAScript nativos
  ".json": "application/json; charset=utf-8", // Archivos de datos y configuración JSON
  ".png": "image/png", // Imágenes en formato PNG sin pérdida
  ".jpg": "image/jpeg", // Fotografías JPEG
  ".jpeg": "image/jpeg", // Fotografías JPEG (extensión alternativa)
  ".svg": "image/svg+xml", // Gráficos vectoriales escalables SVG
  ".ico": "image/x-icon", // Iconos de pestaña de navegador (favicon)
  ".webp": "image/webp" // Imágenes optimizadas para web en formato WebP
};

// Crea la instancia del servidor HTTP que atiende tanto la API REST (`/api/*`) como los archivos estáticos de cada proyecto
const server = http.createServer(async (req, res) => {
  // Construye un objeto `URL` seguro a partir de la ruta solicitada (`req.url`) y el host de la cabecera HTTP
  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  // Normaliza el verbo HTTP a mayúsculas (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`)
  const method = (req.method || "GET").toUpperCase();

  // ==========================================================================
  // 1. ENRUTAMIENTO DE PETICIONES A LA API DE BASE DE DATOS REAL (/api/*)
  // ==========================================================================
  if (url.pathname.startsWith("/api/")) { // Verifica si la ruta solicitada pertenece a un endpoint de la API REST
    let body = {}; // Inicializa el cuerpo de la petición como un objeto vacío por defecto

    // Si el método HTTP puede transportar payload en el cuerpo (ej. POST, PUT, PATCH, DELETE)
    if (method !== "GET" && method !== "HEAD") {
      const chunks = []; // Arreglo temporal para acumular los fragmentos binarios (Buffers) del stream de entrada
      for await (const chunk of req) chunks.push(chunk); // Lee de forma asíncrona todos los fragmentos enviados por el cliente
      const raw = Buffer.concat(chunks).toString("utf8"); // Une los fragmentos binarios y los decodifica como texto UTF-8

      if (raw) { // Si el cliente envió contenido en el cuerpo de la petición
        try {
          body = JSON.parse(raw); // Parsea la cadena JSON para convertirla en un objeto JavaScript utilizable
        } catch {
          body = {}; // Si el JSON está malformado, conserva un objeto vacío para evitar que el servidor colapse
        }
      }
    }

    try {
      // Delega la operación al motor unificado de Base de Datos (`handleApiRequest`) pasando método, ruta, query params y body
      const result = await handleApiRequest(method, url.pathname, url.searchParams, body);
      // Escribe el código de estado HTTP devuelto por el motor (200, 201, 400, 401, 404) y desactiva el caché para datos en vivo
      res.writeHead(result.status, {
        "Content-Type": "application/json; charset=utf-8", // Indica al navegador que la respuesta es un payload JSON en UTF-8
        "Cache-Control": "no-store" // Garantiza que el navegador siempre consulte el estado más reciente de la Base de Datos
      });
      res.end(JSON.stringify(result.body)); // Serializa la respuesta a JSON y finaliza la transmisión HTTP
    } catch (err) {
      // En caso de error inesperado en tiempo de ejecución, responde con código HTTP 500 y el mensaje diagnóstico
      res.writeHead(500, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ ok: false, error: err.message }));
    }
    return; // Finaliza la ejecución del handler para no procesar la ruta como archivo estático
  }

  // ==========================================================================
  // 2. SERVIDOR DE ARCHIVOS ESTÁTICOS PARA TODOS LOS PROYECTOS DEL PORTAFOLIO
  // ==========================================================================
  let decodedPath = decodeURIComponent(url.pathname); // Decodifica espacios (`%20`) y caracteres especiales en nombres de carpetas (ej. `My CV` o `App de citas`)
  if (decodedPath === "/") decodedPath = "/index.html"; // Si se solicita la raíz `/`, apunta automáticamente al archivo maestro `index.html`

  // Resuelve la ruta física absoluta en el disco a partir de la carpeta raíz del portafolio
  let filePath = resolve(__dirname, "." + decodedPath);

  // Medida de seguridad contra ataques Path Traversal (impide acceder a carpetas fuera del workspace usando `../`)
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" }); // Responde con código HTTP 403 Forbidden
    res.end("Acceso denegado"); // Cierra la conexión rechazando la ruta maliciosa
    return; // Detiene el flujo
  }

  try {
    const info = await stat(filePath); // Consulta los metadatos del archivo o carpeta en el sistema de archivos
    if (info.isDirectory()) { // Si la ruta apunta a una carpeta (ej. `/Turismo_MEAN/public/`)
      filePath = resolve(filePath, "index.html"); // Busca automáticamente el documento `index.html` dentro de esa carpeta
    }
    const content = await readFile(filePath); // Lee el contenido binario completo del archivo solicitado desde el disco
    // Determina el tipo MIME según la extensión del archivo o usa `application/octet-stream` como valor genérico
    const mime = MIME_TYPES[extname(filePath).toLowerCase()] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": mime }); // Envía cabecera HTTP 200 OK con el tipo MIME correspondiente
    res.end(content); // Envía el contenido del archivo al navegador
  } catch {
    // Si el archivo no existe en disco, responde con estado HTTP 404 Not Found
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Archivo no encontrado");
  }
});

// Pone el servidor HTTP a escuchar conexiones entrantes en el puerto configurado
server.listen(PORT, () => {
  console.log(`🚀 Portafolio Full-Stack + Base de Datos SQL activa en: http://localhost:${PORT}`); // Informa la URL principal del portafolio
  console.log(`🗄️  Estado de la Base de Datos en vivo: http://localhost:${PORT}/api/db/status`); // Informa el endpoint de diagnóstico de la BD
});
