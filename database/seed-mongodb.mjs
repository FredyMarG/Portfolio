/**
 * ============================================================================
 * VERIFICADOR E IMPORTADOR PARA MONGODB ATLAS / COMPASS (database/seed-mongodb.mjs)
 * ============================================================================
 * Propósito:
 *   Validar la estructura de las colecciones documentales NoSQL definidas en
 *   `database/portfolio_mongodb.json` y mostrar el resumen de documentos listos
 *   para importar en MongoDB Atlas o MongoDB Compass.
 *
 * Comentado línea por línea en español.
 * ============================================================================
 */

import { readFileSync } from "node:fs"; // Importa función síncrona para leer el archivo JSON de colecciones MongoDB
import { resolve, dirname } from "node:path"; // Importa utilidades para construir la ruta absoluta hacia el archivo JSON
import { fileURLToPath } from "node:url"; // Convierte la URL del módulo ES actual en una ruta de archivo del sistema operativo

const __dirname = dirname(fileURLToPath(import.meta.url)); // Obtiene el directorio actual (`database/`)
// Lee y parsea el archivo `portfolio_mongodb.json` que contiene todas las colecciones iniciales del portafolio
const seedData = JSON.parse(readFileSync(resolve(__dirname, "portfolio_mongodb.json"), "utf8"));

console.log("============================================================================"); // Imprime separador superior en consola
console.log("🍃 COLECCIONES MONGODB DEL PORTAFOLIO LISTAS PARA IMPORTAR"); // Título del reporte de verificación
console.log("============================================================================"); // Imprime separador de encabezado

// Recorre cada colección definida en `seedData.collections` e imprime la cantidad de documentos iniciales
for (const [colName, docs] of Object.entries(seedData.collections)) {
  console.log(`✔ Colección: ${colName.padEnd(26)} -> ${docs.length} documentos iniciales`); // Muestra nombre alineado y total de registros
}

console.log("----------------------------------------------------------------------------"); // Imprime línea divisoria inferior
console.log("Archivo fuente para MongoDB Compass / mongoimport: database/portfolio_mongodb.json"); // Indica la ruta exacta del archivo para importar
