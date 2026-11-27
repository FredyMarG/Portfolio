/**
 * ============================================================================
 * NETLIFY SERVERLESS FUNCTION — API REST & BASE DE DATOS REAL DEL PORTAFOLIO
 * (netlify/functions/api.mjs)
 * ============================================================================
 * Propósito:
 *   Interceptar y responder todas las peticiones HTTP dirigidas a `/api/*`
 *   cuando el portafolio está desplegado en producción sobre Netlify,
 *   conectándolas con el motor unificado de base de datos (`database/db-engine.mjs`).
 *
 * Comentado línea por línea en español.
 * ============================================================================
 */

import { handleApiRequest } from "../../database/db-engine.mjs"; // Importa el controlador central de la Base de Datos SQL/Mongo del portafolio

/**
 * Handler moderno de Netlify Functions basado en los objetos estándar Web `Request` y `Response`.
 * @param {Request} req - Objeto Request estándar de la Fetch API entrante a Netlify.
 * @returns {Promise<Response>} Respuesta HTTP serializada en formato JSON.
 */
export default async (req) => {
  const url = new URL(req.url); // Extrae el objeto URL completo para acceder a `pathname` y `searchParams`
  const method = req.method.toUpperCase(); // Normaliza el método HTTP (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS`)

  // Manejo de peticiones preflight CORS (`OPTIONS`) para permitir llamadas desde vistas previas o clientes externos
  if (method === "OPTIONS") {
    return new Response(null, { // Retorna una respuesta sin cuerpo con estado HTTP 204 No Content
      status: 204, // Código estándar para preflight exitoso
      headers: {
        "Access-Control-Allow-Origin": "*", // Permite origen cruzado si se invoca desde otro subdominio
        "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS", // Métodos HTTP habilitados en la API
        "Access-Control-Allow-Headers": "Content-Type, Authorization" // Cabeceras permitidas (incluyendo token JWT en Authorization)
      }
    });
  }

  let body = {}; // Inicializa el cuerpo de la petición como objeto vacío por defecto
  if (method !== "GET" && method !== "HEAD") { // Solo intenta leer cuerpo JSON en métodos de escritura o mutación
    try {
      body = await req.json(); // Deserializa el cuerpo JSON enviado por el cliente web
    } catch {
      body = {}; // Si no hay cuerpo o no es JSON válido, continúa con un objeto vacío sin lanzar excepción
    }
  }

  try {
    // Ejecuta la consulta o transacción correspondiente en el motor de Base de Datos (`handleApiRequest`)
    const result = await handleApiRequest(method, url.pathname, url.searchParams, body);
    // Construye y retorna la respuesta HTTP con el código de estado y el payload JSON resultante
    return new Response(JSON.stringify(result.body), {
      status: result.status, // Estado HTTP devuelto por la operación (200, 201, 400, 401, 404)
      headers: {
        "Content-Type": "application/json; charset=utf-8", // Define tipo de contenido JSON con codificación UTF-8
        "Cache-Control": "no-store" // Evita que el CDN almacene en caché respuestas dinámicas de la base de datos
      }
    });
  } catch (error) {
    // Captura cualquier fallo inesperado y devuelve una respuesta JSON estructurada con estado HTTP 500
    return new Response(
      JSON.stringify({ ok: false, error: error.message || "Error interno en el servidor de base de datos" }),
      {
        status: 500, // Código HTTP de error interno del servidor
        headers: { "Content-Type": "application/json; charset=utf-8" }
      }
    );
  }
};

// Configuración declarativa de Netlify Functions: enruta cualquier petición `/api/*` hacia esta función serverless
export const config = {
  path: ["/api/*"] // Patrón URLPattern que captura todos los endpoints de los 17 proyectos del portafolio
};
