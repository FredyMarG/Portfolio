const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');

const PORT = process.env.PORT || 3000;
const ROOT_DIR = __dirname;
const DB_DIR = path.join(ROOT_DIR, 'database');
const DB_PATH = path.join(DB_DIR, 'citas.db');
const SCHEMA_PATH = path.join(DB_DIR, 'schema.sql');
const UPLOADS_DIR = path.join(ROOT_DIR, 'uploads');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');

// Asegurar carpetas necesarias
if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
if (!fs.existsSync(PUBLIC_DIR)) fs.mkdirSync(PUBLIC_DIR, { recursive: true });

// Inicializar conexión a la base de datos
const db = new DatabaseSync(DB_PATH);
db.exec('PRAGMA foreign_keys = ON;');
db.exec('PRAGMA journal_mode = WAL;');

/**
 * Inicializa las tablas y las 10 sugerencias de planes (sin fotos prefabricadas)
 */
function initializeDatabase() {
  const schemaSql = fs.readFileSync(SCHEMA_PATH, 'utf8');

  const [ddlPart, insertPart] = schemaSql.split('-- PLANES INICIALES: BOLOS, KARTS, PARQUE DE DIVERSIONES, CINE Y PLANES ROMÁNTICOS');
  db.exec(ddlPart);

  // Asegurar columna datos_imagen en fotos_cita para almacenar las fotos dentro de la base de datos SQL en el hosting
  const columns = db.prepare(`PRAGMA table_info(fotos_cita)`).all();
  if (!columns.some((col) => col.name === 'datos_imagen')) {
    db.exec(`ALTER TABLE fotos_cita ADD COLUMN datos_imagen TEXT DEFAULT NULL;`);
  }

  const countRow = db.prepare('SELECT COUNT(*) as total FROM planes_sugeridos').get();
  if (countRow.total === 0 && insertPart) {
    db.exec(insertPart);
  }

  // Limpiar cualquier foto SVG de demostración que se haya generado anteriormente
  const demoFotos = db.prepare(`SELECT id, nombre_archivo FROM fotos_cita WHERE nombre_archivo LIKE 'demo_%' OR nombre_archivo LIKE 'postal_%'`).all();
  for (const df of demoFotos) {
    const p = path.join(UPLOADS_DIR, df.nombre_archivo);
    if (fs.existsSync(p)) {
      try { fs.unlinkSync(p); } catch (_) {}
    }
    db.prepare('DELETE FROM fotos_cita WHERE id = ?').run(df.id);
  }
}

initializeDatabase();

// Utilidades HTTP
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function sendJson(res, statusCode, data) {
  const payload = JSON.stringify(data);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store'
  });
  res.end(payload);
}

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let totalBytes = 0;
    const MAX_BYTES = 50 * 1024 * 1024;

    req.on('data', (chunk) => {
      totalBytes += chunk.length;
      if (totalBytes > MAX_BYTES) {
        reject(new Error('El tamaño de los archivos supera el límite permitido (50MB).'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });

    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf8');
        resolve(raw ? JSON.parse(raw) : {});
      } catch (err) {
        reject(new Error('Formato de datos inválido en la petición.'));
      }
    });

    req.on('error', reject);
  });
}

function saveDataUrlToFile(dataUrl, citaId, slotNumero, originalName = 'foto.jpg') {
  const match = /^data:image\/([a-zA-Z0-9+.-]+);base64,(.+)$/.exec(dataUrl);
  if (!match) {
    throw new Error('Formato de imagen inválido. Usa PNG, JPG, WEBP o GIF.');
  }
  let ext = match[1].toLowerCase();
  if (ext === 'jpeg') ext = 'jpg';
  if (ext === 'svg+xml') ext = 'svg';
  const base64Data = match[2];
  const buffer = Buffer.from(base64Data, 'base64');

  const safeBase = path
    .basename(originalName, path.extname(originalName))
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 30) || 'recuerdo';

  const fileName = `cita_${citaId}_slot_${slotNumero}_${Date.now()}_${safeBase}.${ext}`;
  const filePath = path.join(UPLOADS_DIR, fileName);
  fs.writeFileSync(filePath, buffer);
  return {
    fileName,
    urlPath: `/uploads/${fileName}`
  };
}

function getAllCitasWithDetails() {
  const citas = db.prepare(`
    SELECT 
      c.id,
      c.plan_id,
      c.titulo_cita,
      c.fecha,
      c.hora,
      c.lugar,
      c.notas_previas,
      c.estado,
      c.calificacion,
      c.bitacora_recuerdo,
      c.creado_en,
      p.titulo AS plan_titulo,
      p.categoria AS plan_categoria,
      p.icono AS plan_icono,
      p.descripcion AS plan_descripcion,
      p.duracion_estimada AS plan_duracion,
      p.presupuesto AS plan_presupuesto,
      p.tips_romanticos AS plan_tips,
      p.color_acento AS plan_color
    FROM citas_programadas c
    INNER JOIN planes_sugeridos p ON c.plan_id = p.id
    ORDER BY c.fecha DESC, c.hora DESC, c.id DESC
  `).all();

  const fotosStmt = db.prepare(`
    SELECT id, cita_id, slot_numero, nombre_archivo, ruta_url, datos_imagen, pie_foto, fecha_captura
    FROM fotos_cita
    WHERE cita_id = ?
    ORDER BY slot_numero ASC
  `);

  return citas.map((cita) => {
    const fotos = fotosStmt.all(cita.id).map((f) => {
      const fileOnDisk = path.join(UPLOADS_DIR, f.nombre_archivo || '');
      const urlFinal = fs.existsSync(fileOnDisk) ? f.ruta_url : (f.datos_imagen || f.ruta_url);
      return {
        id: f.id,
        cita_id: f.cita_id,
        slot_numero: f.slot_numero,
        nombre_archivo: f.nombre_archivo,
        ruta_url: urlFinal,
        pie_foto: f.pie_foto,
        fecha_captura: f.fecha_captura
      };
    });
    return {
      ...cita,
      fotos,
      total_fotos: fotos.length,
      recordatorio_completo: fotos.length >= 10
    };
  });
}

// Servidor HTTP principal
const server = http.createServer(async (req, res) => {
  try {
    const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const pathname = decodeURIComponent(parsedUrl.pathname);
    const method = req.method.toUpperCase();

    // GET /api/planes -> Lista todos los planes (los 10 sugeridos + los personalizados)
    if (pathname === '/api/planes' && method === 'GET') {
      const planes = db.prepare(`
        SELECT 
          p.*,
          (SELECT COUNT(*) FROM citas_programadas c WHERE c.plan_id = p.id) AS veces_agendado
        FROM planes_sugeridos p
        ORDER BY p.id ASC
      `).all();
      return sendJson(res, 200, { ok: true, planes });
    }

    // POST /api/planes -> Permite escribir y crear un plan propio diferente a los sugeridos
    if (pathname === '/api/planes' && method === 'POST') {
      const body = await parseJsonBody(req);
      const validCategories = ['Romántico', 'Divertido', 'Aventura', 'Gastronómico', 'Creativo', 'Relajante'];
      const categoria = validCategories.includes(body.categoria) ? body.categoria : 'Romántico';
      const titulo = (body.titulo || '').trim();
      const descripcion = (body.descripcion || '').trim();
      const icono = (body.icono || '💖').trim();
      const duracion_estimada = (body.duracion_estimada || '2 a 3 horas').trim();
      const presupuesto = (body.presupuesto || '$$ A nuestra medida').trim();
      const lugar_sugerido = (body.lugar_sugerido || 'Nuestro lugar especial').trim();
      const tips_romanticos = (body.tips_romanticos || 'Disfrutar cada instante juntos y tomar nuestras 4 a 5 fotos de recuerdo.').trim();
      const color_acento = (body.color_acento || '#f43f5e').trim();

      if (!titulo || !descripcion) {
        return sendJson(res, 400, { ok: false, error: 'Por favor escribe un título y una descripción para tu plan.' });
      }

      const stmt = db.prepare(`
        INSERT INTO planes_sugeridos (titulo, categoria, descripcion, icono, duracion_estimada, presupuesto, lugar_sugerido, tips_romanticos, color_acento)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      const info = stmt.run(titulo, categoria, descripcion, icono, duracion_estimada, presupuesto, lugar_sugerido, tips_romanticos, color_acento);
      const nuevoPlanId = Number(info.lastInsertRowid);

      let nuevaCita = null;
      if (body.agendar_ahora && body.fecha && body.hora) {
        const insertCita = db.prepare(`
          INSERT INTO citas_programadas (plan_id, titulo_cita, fecha, hora, lugar, notas_previas, estado, calificacion, bitacora_recuerdo)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        const citaInfo = insertCita.run(
          nuevoPlanId,
          titulo,
          body.fecha,
          body.hora,
          lugar_sugerido,
          tips_romanticos,
          'Programada',
          5,
          ''
        );
        const citaId = Number(citaInfo.lastInsertRowid);

        if (Array.isArray(body.fotos) && body.fotos.length > 0) {
          const insertFoto = db.prepare(`
            INSERT INTO fotos_cita (cita_id, slot_numero, nombre_archivo, ruta_url, datos_imagen, pie_foto)
            VALUES (?, ?, ?, ?, ?, ?)
          `);
          body.fotos.slice(0, 10).forEach((fotoObj, index) => {
            const slot = Number(fotoObj.slot_numero) || (index + 1);
            if (fotoObj.dataUrl && slot >= 1 && slot <= 10) {
              const saved = saveDataUrlToFile(fotoObj.dataUrl, citaId, slot, fotoObj.nombre_archivo || `foto_${slot}.jpg`);
              insertFoto.run(citaId, slot, saved.fileName, saved.urlPath, fotoObj.dataUrl, fotoObj.pie_foto || `Foto #${slot}`);
            }
          });
        }

        nuevaCita = getAllCitasWithDetails().find((c) => c.id === citaId);
      }

      const nuevoPlan = db.prepare('SELECT * FROM planes_sugeridos WHERE id = ?').get(nuevoPlanId);
      return sendJson(res, 201, { ok: true, plan: nuevoPlan, cita: nuevaCita });
    }

    // DELETE /api/planes/:id -> Eliminar un plan personalizado (mayor al id 10)
    const planDeleteMatch = /^\/api\/planes\/(\d+)$/.exec(pathname);
    if (planDeleteMatch && method === 'DELETE') {
      const planId = Number(planDeleteMatch[1]);
      if (planId <= 10) {
        return sendJson(res, 400, { ok: false, error: 'Las 10 sugerencias principales vienen incluidas por defecto.' });
      }
      const enUso = db.prepare('SELECT COUNT(*) as total FROM citas_programadas WHERE plan_id = ?').get(planId);
      if (enUso.total > 0) {
        return sendJson(res, 400, { ok: false, error: 'Este plan ya tiene citas agendadas.' });
      }
      db.prepare('DELETE FROM planes_sugeridos WHERE id = ?').run(planId);
      return sendJson(res, 200, { ok: true, deletedId: planId });
    }

    // GET /api/citas -> Lista todas las citas con su fecha, hora, plan y sus fotos subidas manualmente
    if (pathname === '/api/citas' && method === 'GET') {
      const citas = getAllCitasWithDetails();
      return sendJson(res, 200, { ok: true, citas });
    }

    // POST /api/citas -> Crea una nueva cita escogiendo plan, fecha, hora y fotos subidas manualmente
    if (pathname === '/api/citas' && method === 'POST') {
      const body = await parseJsonBody(req);
      let {
        plan_id,
        es_plan_libre,
        plan_libre_datos,
        titulo_cita,
        fecha,
        hora,
        lugar,
        notas_previas = '',
        estado = 'Programada',
        calificacion = 5,
        bitacora_recuerdo = '',
        fotos = []
      } = body;

      if (!fecha || !hora) {
        return sendJson(res, 400, {
          ok: false,
          error: 'Debes escoger la fecha y la hora para su plan.'
        });
      }

      if (es_plan_libre && plan_libre_datos) {
        const validCategories = ['Romántico', 'Divertido', 'Aventura', 'Gastronómico', 'Creativo', 'Relajante'];
        const catLibre = validCategories.includes(plan_libre_datos.categoria) ? plan_libre_datos.categoria : 'Romántico';
        const tituloLibre = (plan_libre_datos.titulo || titulo_cita || 'Nuestro Plan Especial').trim();
        const descLibre = (plan_libre_datos.descripcion || notas_previas || 'Plan creado especialmente por nosotros.').trim();
        const iconoLibre = (plan_libre_datos.icono || '💑').trim();
        const lugarLibre = (lugar || plan_libre_datos.lugar_sugerido || 'Lugar especial').trim();

        const infoPlan = db.prepare(`
          INSERT INTO planes_sugeridos (titulo, categoria, descripcion, icono, duracion_estimada, presupuesto, lugar_sugerido, tips_romanticos, color_acento)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          tituloLibre,
          catLibre,
          descLibre,
          iconoLibre,
          plan_libre_datos.duracion_estimada || 'Libre',
          plan_libre_datos.presupuesto || 'A nuestra medida',
          lugarLibre,
          plan_libre_datos.tips_romanticos || 'Guardar de 4 a 5 fotos de este momento.',
          '#ec4899'
        );
        plan_id = Number(infoPlan.lastInsertRowid);
        if (!titulo_cita) titulo_cita = tituloLibre;
      }

      if (!plan_id) {
        return sendJson(res, 400, { ok: false, error: 'Selecciona un plan o escribe tu propio plan.' });
      }

      const plan = db.prepare('SELECT * FROM planes_sugeridos WHERE id = ?').get(Number(plan_id));
      if (!plan) {
        return sendJson(res, 404, { ok: false, error: 'El plan seleccionado no existe.' });
      }

      if (Array.isArray(fotos) && fotos.length > 10) {
        return sendJson(res, 400, {
          ok: false,
          error: 'Puedes subir un máximo de 10 fotos por cada plan.'
        });
      }

      const finalTitle = (titulo_cita && titulo_cita.trim()) ? titulo_cita.trim() : plan.titulo;
      const finalLugar = (lugar && lugar.trim()) ? lugar.trim() : plan.lugar_sugerido;

      const insertCita = db.prepare(`
        INSERT INTO citas_programadas (plan_id, titulo_cita, fecha, hora, lugar, notas_previas, estado, calificacion, bitacora_recuerdo)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const info = insertCita.run(
        Number(plan_id),
        finalTitle,
        fecha,
        hora,
        finalLugar,
        notas_previas,
        estado,
        Number(calificacion) || 5,
        bitacora_recuerdo
      );

      const citaId = Number(info.lastInsertRowid);

      if (Array.isArray(fotos) && fotos.length > 0) {
        const insertFoto = db.prepare(`
          INSERT INTO fotos_cita (cita_id, slot_numero, nombre_archivo, ruta_url, datos_imagen, pie_foto)
          VALUES (?, ?, ?, ?, ?, ?)
        `);

        fotos.slice(0, 10).forEach((fotoObj, index) => {
          const slot = Number(fotoObj.slot_numero) || (index + 1);
          if (fotoObj.dataUrl && slot >= 1 && slot <= 10) {
            const saved = saveDataUrlToFile(fotoObj.dataUrl, citaId, slot, fotoObj.nombre_archivo || `foto_${slot}.jpg`);
            insertFoto.run(citaId, slot, saved.fileName, saved.urlPath, fotoObj.dataUrl, fotoObj.pie_foto || `Foto #${slot}`);
          }
        });
      }

      const citasActualizadas = getAllCitasWithDetails();
      const nuevaCita = citasActualizadas.find((c) => c.id === citaId);
      return sendJson(res, 201, { ok: true, cita: nuevaCita });
    }

    // PUT /api/citas/:id -> Actualizar fecha, hora, lugar, estado, bitácora o calificación
    const citaMatch = /^\/api\/citas\/(\d+)$/.exec(pathname);
    if (citaMatch && method === 'PUT') {
      const citaId = Number(citaMatch[1]);
      const existing = db.prepare('SELECT * FROM citas_programadas WHERE id = ?').get(citaId);
      if (!existing) {
        return sendJson(res, 404, { ok: false, error: 'Cita no encontrada.' });
      }

      const body = await parseJsonBody(req);
      const updated = {
        plan_id: body.plan_id !== undefined ? Number(body.plan_id) : existing.plan_id,
        titulo_cita: body.titulo_cita !== undefined ? body.titulo_cita : existing.titulo_cita,
        fecha: body.fecha !== undefined ? body.fecha : existing.fecha,
        hora: body.hora !== undefined ? body.hora : existing.hora,
        lugar: body.lugar !== undefined ? body.lugar : existing.lugar,
        notas_previas: body.notas_previas !== undefined ? body.notas_previas : existing.notas_previas,
        estado: body.estado !== undefined ? body.estado : existing.estado,
        calificacion: body.calificacion !== undefined ? Number(body.calificacion) : existing.calificacion,
        bitacora_recuerdo: body.bitacora_recuerdo !== undefined ? body.bitacora_recuerdo : existing.bitacora_recuerdo
      };

      db.prepare(`
        UPDATE citas_programadas
        SET plan_id = ?, titulo_cita = ?, fecha = ?, hora = ?, lugar = ?, notas_previas = ?, estado = ?, calificacion = ?, bitacora_recuerdo = ?
        WHERE id = ?
      `).run(
        updated.plan_id,
        updated.titulo_cita,
        updated.fecha,
        updated.hora,
        updated.lugar,
        updated.notas_previas,
        updated.estado,
        updated.calificacion,
        updated.bitacora_recuerdo,
        citaId
      );

      const citaActualizada = getAllCitasWithDetails().find((c) => c.id === citaId);
      return sendJson(res, 200, { ok: true, cita: citaActualizada });
    }

    // DELETE /api/citas/:id -> Eliminar una cita y sus fotos físicas
    if (citaMatch && method === 'DELETE') {
      const citaId = Number(citaMatch[1]);
      const fotos = db.prepare('SELECT * FROM fotos_cita WHERE cita_id = ?').all(citaId);
      for (const f of fotos) {
        const filePath = path.join(UPLOADS_DIR, f.nombre_archivo);
        if (fs.existsSync(filePath)) {
          try { fs.unlinkSync(filePath); } catch (_) {}
        }
      }
      db.prepare('DELETE FROM citas_programadas WHERE id = ?').run(citaId);
      return sendJson(res, 200, { ok: true, deletedId: citaId });
    }

    // POST /api/citas/:id/fotos -> Subir o reemplazar manualmente de 1 a 10 fotos para un plan
    const citaFotosMatch = /^\/api\/citas\/(\d+)\/fotos$/.exec(pathname);
    if (citaFotosMatch && method === 'POST') {
      const citaId = Number(citaFotosMatch[1]);
      const cita = db.prepare('SELECT * FROM citas_programadas WHERE id = ?').get(citaId);
      if (!cita) {
        return sendJson(res, 404, { ok: false, error: 'La cita indicada no existe.' });
      }

      const body = await parseJsonBody(req);
      const incomingFotos = Array.isArray(body.fotos) ? body.fotos : [];
      if (incomingFotos.length === 0) {
        return sendJson(res, 400, { ok: false, error: 'No se recibieron fotos para guardar.' });
      }

      const existingFotos = db.prepare('SELECT * FROM fotos_cita WHERE cita_id = ? ORDER BY slot_numero ASC').all(citaId);
      const occupiedSlots = new Set(existingFotos.map((f) => f.slot_numero));

      for (const item of incomingFotos) {
        let targetSlot = Number(item.slot_numero);

        if (!targetSlot || targetSlot < 1 || targetSlot > 10) {
          for (let s = 1; s <= 10; s++) {
            if (!occupiedSlots.has(s)) {
              targetSlot = s;
              break;
            }
          }
        }

        if (!targetSlot || targetSlot < 1 || targetSlot > 10) {
          return sendJson(res, 400, {
            ok: false,
            error: 'Este plan ya tiene sus 10 espacios de fotos llenos. Haz clic en cualquier foto para reemplazarla o borrarla.'
          });
        }

        const prevPhoto = db.prepare('SELECT * FROM fotos_cita WHERE cita_id = ? AND slot_numero = ?').get(citaId, targetSlot);
        if (prevPhoto) {
          const oldPath = path.join(UPLOADS_DIR, prevPhoto.nombre_archivo);
          if (fs.existsSync(oldPath)) {
            try { fs.unlinkSync(oldPath); } catch (_) {}
          }
          db.prepare('DELETE FROM fotos_cita WHERE id = ?').run(prevPhoto.id);
        }

        const saved = saveDataUrlToFile(item.dataUrl, citaId, targetSlot, item.nombre_archivo || `recuerdo_${targetSlot}.jpg`);
        const pie = item.pie_foto !== undefined && item.pie_foto.trim() !== ''
          ? item.pie_foto.trim()
          : (prevPhoto ? prevPhoto.pie_foto : `Recuerdo #${targetSlot}`);

        db.prepare(`
          INSERT INTO fotos_cita (cita_id, slot_numero, nombre_archivo, ruta_url, datos_imagen, pie_foto)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(citaId, targetSlot, saved.fileName, saved.urlPath, item.dataUrl, pie);

        occupiedSlots.add(targetSlot);
      }

      const citaActualizada = getAllCitasWithDetails().find((c) => c.id === citaId);
      return sendJson(res, 200, { ok: true, cita: citaActualizada });
    }

    // PUT /api/fotos/:fotoId -> Editar el pie de foto (caption) de una foto
    const fotoMatch = /^\/api\/fotos\/(\d+)$/.exec(pathname);
    if (fotoMatch && method === 'PUT') {
      const fotoId = Number(fotoMatch[1]);
      const foto = db.prepare('SELECT * FROM fotos_cita WHERE id = ?').get(fotoId);
      if (!foto) {
        return sendJson(res, 404, { ok: false, error: 'Foto no encontrada.' });
      }
      const body = await parseJsonBody(req);
      db.prepare('UPDATE fotos_cita SET pie_foto = ? WHERE id = ?').run(body.pie_foto || '', fotoId);
      const citaActualizada = getAllCitasWithDetails().find((c) => c.id === foto.cita_id);
      return sendJson(res, 200, { ok: true, cita: citaActualizada });
    }

    // DELETE /api/fotos/:fotoId -> Eliminar una foto individual de un slot
    if (fotoMatch && method === 'DELETE') {
      const fotoId = Number(fotoMatch[1]);
      const foto = db.prepare('SELECT * FROM fotos_cita WHERE id = ?').get(fotoId);
      if (!foto) {
        return sendJson(res, 404, { ok: false, error: 'Foto no encontrada.' });
      }
      const filePath = path.join(UPLOADS_DIR, foto.nombre_archivo);
      if (fs.existsSync(filePath)) {
        try { fs.unlinkSync(filePath); } catch (_) {}
      }
      db.prepare('DELETE FROM fotos_cita WHERE id = ?').run(fotoId);
      const citaActualizada = getAllCitasWithDetails().find((c) => c.id === foto.cita_id);
      return sendJson(res, 200, { ok: true, cita: citaActualizada });
    }

    // Archivos estáticos (/uploads y /public)
    if (pathname.startsWith('/uploads/')) {
      const safeName = path.basename(pathname);
      const filePath = path.join(UPLOADS_DIR, safeName);
      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const ext = path.extname(filePath).toLowerCase();
        res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
        return fs.createReadStream(filePath).pipe(res);
      }
      res.writeHead(404);
      return res.end('Imagen no encontrada');
    }

    let staticPath = pathname === '/' ? '/index.html' : pathname;
    const fullStaticPath = path.join(PUBLIC_DIR, path.normalize(staticPath));
    if (fullStaticPath.startsWith(PUBLIC_DIR) && fs.existsSync(fullStaticPath) && fs.statSync(fullStaticPath).isFile()) {
      const ext = path.extname(fullStaticPath).toLowerCase();
      res.writeHead(200, {
        'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
        'Cache-Control': 'no-cache'
      });
      return fs.createReadStream(fullStaticPath).pipe(res);
    }

    const indexHtml = path.join(PUBLIC_DIR, 'index.html');
    if (fs.existsSync(indexHtml)) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return fs.createReadStream(indexHtml).pipe(res);
    }

    sendJson(res, 404, { ok: false, error: 'Ruta no encontrada' });
  } catch (err) {
    console.error('Error en servidor:', err);
    sendJson(res, 500, { ok: false, error: err.message || 'Error interno del servidor' });
  }
});

server.listen(PORT, () => {
  console.log('====================================================================');
  console.log(`💖 Nuestros Planes Juntos activo en: http://localhost:${PORT}`);
  console.log('====================================================================');
});
