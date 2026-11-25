-- ============================================================================
-- ESQUEMA DE BASE DE DATOS: NUESTROS PLANES JUNTOS
-- ============================================================================

PRAGMA foreign_keys = ON;

-- 1. Tabla de Planes
CREATE TABLE IF NOT EXISTS planes_sugeridos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL,
    categoria TEXT NOT NULL CHECK(categoria IN ('Romántico', 'Divertido', 'Aventura', 'Gastronómico', 'Creativo', 'Relajante')),
    descripcion TEXT NOT NULL,
    icono TEXT NOT NULL,
    duracion_estimada TEXT NOT NULL,
    presupuesto TEXT NOT NULL,
    lugar_sugerido TEXT NOT NULL,
    tips_romanticos TEXT NOT NULL,
    color_acento TEXT NOT NULL DEFAULT '#f43f5e',
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla de Citas Programadas (Con selección de Fecha y Hora)
CREATE TABLE IF NOT EXISTS citas_programadas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    plan_id INTEGER NOT NULL,
    titulo_cita TEXT NOT NULL,
    fecha DATE NOT NULL,               -- Formato YYYY-MM-DD
    hora TIME NOT NULL,                -- Formato HH:MM (24h)
    lugar TEXT NOT NULL,
    notas_previas TEXT DEFAULT '',
    estado TEXT NOT NULL DEFAULT 'Programada' CHECK(estado IN ('Programada', 'Completada', 'Cancelada')),
    calificacion INTEGER DEFAULT 5 CHECK(calificacion BETWEEN 1 AND 5),
    bitacora_recuerdo TEXT DEFAULT '',
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (plan_id) REFERENCES planes_sugeridos(id) ON DELETE RESTRICT
);

-- 3. Tabla de Fotos de Recordatorio por Plan (Hasta 10 fotos almacenadas en la Base de Datos)
CREATE TABLE IF NOT EXISTS fotos_cita (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cita_id INTEGER NOT NULL,
    slot_numero INTEGER NOT NULL CHECK(slot_numero BETWEEN 1 AND 10),
    nombre_archivo TEXT NOT NULL,
    ruta_url TEXT NOT NULL,
    datos_imagen TEXT DEFAULT NULL,
    pie_foto TEXT DEFAULT '',
    fecha_captura DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cita_id) REFERENCES citas_programadas(id) ON DELETE CASCADE,
    UNIQUE(cita_id, slot_numero)
);

CREATE INDEX IF NOT EXISTS idx_citas_fecha_hora ON citas_programadas(fecha, hora);
CREATE INDEX IF NOT EXISTS idx_citas_plan_id ON citas_programadas(plan_id);
CREATE INDEX IF NOT EXISTS idx_fotos_cita_id ON fotos_cita(cita_id);
-- Nota: El límite de 10 fotos por cita se garantiza con CHECK(slot_numero BETWEEN 1 AND 10) + UNIQUE(cita_id, slot_numero).

-- ============================================================================
-- PLANES INICIALES: BOLOS, KARTS, PARQUE DE DIVERSIONES, CINE Y PLANES ROMÁNTICOS
-- ============================================================================
INSERT INTO planes_sugeridos (id, titulo, categoria, descripcion, icono, duracion_estimada, presupuesto, lugar_sugerido, tips_romanticos, color_acento)
VALUES
(1, 'Tarde de Bolos, Retos y Malteadas', 'Divertido',
 'Una cita llena de risas compitiendo en las pistas de bolos. Hagan apuestas tiernas por cada chuza y celebren al final compartiendo malteadas y snacks.',
 '🎳', '2.5 a 3 horas', '$$ Moderado', 'Bolera favorita de la ciudad',
 'El que gane cada ronda pide un deseo o un beso, y el otro invita el postre al salir.', '#ec4899'),

(2, 'Carrera de Karts a Toda Velocidad', 'Aventura',
 'Adrenalina pura compitiendo juntos en la pista de Go-Karts. Pónganse el casco, midan sus tiempos por vuelta y tómense fotos en el podio de ganadores.',
 '🏎️', '2 horas', '$$ Moderado', 'Pista de Karts cubierta o al aire libre',
 'Tómense una foto con los cascos puestos antes de arrancar y vayan a cenar hamburguesas al terminar.', '#f43f5e'),

(3, 'Parque de Diversiones y Rueda de la Fortuna', 'Aventura',
 'Un día mágico entre montañas rusas, carros chocones, algodón de azúcar y juegos de feria, cerrando al atardecer en lo más alto de la rueda de la fortuna.',
 '🎡', '4 a 5 horas', '$$$ Especial', 'Parque de diversiones o feria',
 'Intenten ganar un peluche en los juegos de puntería y tómense una foto en la cima de la rueda gigante.', '#db2777'),

(4, 'Cita de Cine, Palomitas y Cena Romántica', 'Romántico',
 'El clásico infalible: elijan una película que ambos quieran ver, compartan un combo grande de palomitas y chocolates, y salgan a cenar comentando su parte favorita.',
 '🍿', '3.5 horas', '$$ Moderado', 'Salas de Cine VIP, autocine o cine favorito',
 'Guarden las entradas o tomen foto con las palomitas antes de que empiece la función.', '#e11d48'),

(5, 'Picnic Romántico al Atardecer', 'Romántico',
 'Una escapada al aire libre con manta suave, fresas con chocolate, tabla de quesos, frutas y su música favorita mientras ven caer el sol juntos.',
 '🌅', '3 horas', '$$ Moderado', 'Parque botánico, jardín o pradera tranquila',
 'Lleven una pequeña guirnalda de luces cálidas y una carta escrita a mano para leerla al atardecer.', '#fb7185'),

(6, 'Mirador Nocturno bajo las Estrellas', 'Romántico',
 'Subir de noche al mirador más bonito para contemplar las luces de la ciudad abrazados, acompañados de chocolate caliente o café y buena conversación.',
 '🌌', '2.5 horas', '$ Económico', 'Mirador panorámico de la ciudad o montaña',
 'Lleven una cobija abrigadora para compartir y tomen fotos con las luces de fondo.', '#a855f7'),

(7, 'Noche de Chef en Pareja: Pizzas y Vino', 'Gastronómico',
 'Preparen juntos sus propias pizzas artesanales desde la masa con sus ingredientes favoritos, música romántica de fondo y una copa de vino para brindar.',
 '🍕', '2.5 horas', '$$ Moderado', 'En casa con ambiente de restaurante italiano',
 'Denle forma de corazón a las pizzas y saquen fotos divertidas cocinando juntos.', '#f97316'),

(8, 'Glamping o Fogata con Masmelos', 'Romántico',
 'Una noche mágica desconectados de la rutina, rodeados de naturaleza, luces cálidas y una fogata para asar masmelos bajo un cielo lleno de estrellas.',
 '🏕️', 'Noche completa', '$$$ Especial', 'Domo de Glamping o cabaña en la montaña',
 'Preparen una lista de canciones especiales para escuchar junto a la fogata.', '#be123c'),

(9, 'Ruta de Postres, Helados y Café', 'Gastronómico',
 'Un paseo dulce caminando de la mano por sus sitios favoritos: empiecen con un café especial, sigan con waffles o crepes y cierren con helado artesanal.',
 '🍨', '2.5 horas', '$$ Moderado', 'Zona gastronómica o paseo peatonal',
 'Pidan sabores distintos en cada parada para probar el postre del otro.', '#f472b6'),

(10, 'Tarde de Pintura, Cerámica o Arcade', 'Creativo',
 'Una cita diferente para crear algo juntos con sus propias manos —como pintar dos cuadros o moldear tazas— o retarse en las máquinas de videojuegos.',
 '🎨', '2.5 horas', '$$ Moderado', 'Café creativo, taller de arte o salón Arcade',
 'Intercambien sus creaciones al final para que cada uno conserve el recuerdo hecho por el otro.', '#ec4899');
