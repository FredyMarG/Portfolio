/**
 * ============================================================================
 * IMPORTADOR AUTOMÁTICO PARA MONGODB ATLAS / COMPASS (database/seed-mongodb.mjs)
 * ============================================================================
 * Uso:
 *   MONGODB_URI="mongodb+srv://usuario:pass@cluster.mongodb.net/portafolio_fredy" node database/seed-mongodb.mjs
 */

import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const seedData = JSON.parse(readFileSync(resolve(__dirname, "portfolio_mongodb.json"), "utf8"));

console.log("============================================================================");
console.log("🍃 COLECCIONES MONGODB DEL PORTAFOLIO LISTAS PARA IMPORTAR");
console.log("============================================================================");
for (const [colName, docs] of Object.entries(seedData.collections)) {
  console.log(`✔ Colección: ${colName.padEnd(26)} -> ${docs.length} documentos iniciales`);
}
console.log("----------------------------------------------------------------------------");
console.log("Archivo fuente para MongoDB Compass / mongoimport: database/portfolio_mongodb.json");
