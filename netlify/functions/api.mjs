/**
 * ============================================================================
 * NETLIFY SERVERLESS FUNCTION — API REST & BASE DE DATOS REAL DEL PORTAFOLIO
 * (netlify/functions/api.mjs)
 * ============================================================================
 * Enruta todas las peticiones `/api/*` en producción (Netlify) hacia el motor
 * unificado de base de datos relacional SQL (`database/db-engine.mjs`).
 */

import { handleApiRequest } from "../../database/db-engine.mjs";

export default async (req) => {
  const url = new URL(req.url);
  const method = req.method.toUpperCase();

  if (method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      }
    });
  }

  let body = {};
  if (method !== "GET" && method !== "HEAD") {
    try {
      body = await req.json();
    } catch {
      body = {};
    }
  }

  try {
    const result = await handleApiRequest(method, url.pathname, url.searchParams, body);
    return new Response(JSON.stringify(result.body), {
      status: result.status,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store"
      }
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ ok: false, error: error.message || "Error interno en el servidor de base de datos" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json; charset=utf-8" }
      }
    );
  }
};

export const config = {
  path: ["/api/*"]
};
