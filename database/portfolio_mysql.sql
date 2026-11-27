-- ============================================================================
-- BASE DE DATOS RELACIONAL UNIFICADA DEL PORTAFOLIO — FREDY MARTINEZ (MySQL / MariaDB)
-- (database/portfolio_mysql.sql)
-- ============================================================================
-- Propósito:
--   Crear e inicializar todas las tablas relacionales y datos semilla (seed)
--   para los proyectos Full-Stack del portafolio en motores MySQL 8+ o MariaDB 10.5+.
--   Compatible con: phpMyAdmin (XAMPP), Railway, Clever Cloud, PlanetScale y AWS RDS.
--   Comentado tabla por tabla y columna por columna en español.
-- ============================================================================

-- Crea la base de datos si aún no existe usando codificación UTF-8 completa (soporta emojis y tildes)
CREATE DATABASE IF NOT EXISTS portafolio_fredy CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- Selecciona la base de datos recién creada como esquema activo para las siguientes sentencias
USE portafolio_fredy;

-- ============================================================================
-- 1. TABLA: turismo_destinos (Proyecto: Turismo MEAN — Destinos de Colombia)
-- ============================================================================
CREATE TABLE IF NOT EXISTS turismo_destinos (
  id VARCHAR(36) PRIMARY KEY,                            -- Identificador único hexadecimal (compatible con ObjectId de MongoDB)
  nombre VARCHAR(140) NOT NULL,                          -- Nombre oficial del atractivo o destino turístico
  ciudad VARCHAR(90) NOT NULL,                           -- Ciudad o departamento de ubicación en Colombia
  descripcion TEXT NOT NULL,                             -- Reseña detallada de las actividades incluidas en el destino
  precio DECIMAL(12, 2) NOT NULL DEFAULT 0,              -- Valor del paquete turístico en pesos colombianos (COP)
  calificacion DECIMAL(3, 1) NOT NULL DEFAULT 5.0,       -- Puntuación promedio de los viajeros en escala de 1.0 a 5.0
  fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP -- Marca de tiempo automática de registro en la base de datos
);

-- Inserta los 5 destinos turísticos iniciales sin duplicar si ya existen (INSERT IGNORE)
INSERT IGNORE INTO turismo_destinos (id, nombre, ciudad, descripcion, precio, calificacion) VALUES
('65f1a1000000000000000001', 'Parque Nacional Natural Tayrona', 'Santa Marta', 'Playas cristalinas rodeadas de selva tropical y senderos ancestrales en la Sierra Nevada.', 980000, 4.9),
('65f1a1000000000000000002', 'Ciudad Amurallada & Islas del Rosario', 'Cartagena', 'Recorrido histórico colonial, gastronomía caribeña y pasadía en aguas turquesas.', 1250000, 4.8),
('65f1a1000000000000000003', 'Valle de Cocora & Paisaje Cafetero', 'Salento', 'Caminata entre palmas de cera gigantes, degustación de café de origen y pueblos patrimoniales.', 760000, 4.9),
('65f1a1000000000000000004', 'Mar de los Siete Colores & Johnny Cay', 'San Andrés', 'Snorkel en arrecifes de coral, acuario natural y cultura isleña.', 1490000, 4.7),
('65f1a1000000000000000005', 'Piedra del Peñol & Embalse de Guatapé', 'Guatapé', 'Ascenso de 740 escalones con vista panorámica 360° de la represa y zócalos coloridos.', 620000, 4.8);

-- ============================================================================
-- 2. TABLAS: planes_sugeridos y citas_programadas (Proyecto: App de Citas)
-- ============================================================================
CREATE TABLE IF NOT EXISTS planes_sugeridos (
  id INT AUTO_INCREMENT PRIMARY KEY,                     -- Llave primaria autoincremental del catálogo de planes
  titulo VARCHAR(160) NOT NULL,                          -- Título descriptivo de la idea o experiencia en pareja
  categoria VARCHAR(40) NOT NULL,                        -- Categoría temática (Romántico, Divertido, Aventura, Gastronómico, Creativo)
  descripcion TEXT NOT NULL,                             -- Explicación detallada de la actividad propuesta
  icono VARCHAR(20) NOT NULL DEFAULT '💖',               -- Emoji representativo para la interfaz visual
  duracion_estimada VARCHAR(60) NOT NULL,                -- Tiempo aproximado de duración de la experiencia
  presupuesto VARCHAR(60) NOT NULL,                      -- Nivel de costo estimado ($ Económico, $$ Moderado, $$$ Especial)
  lugar_sugerido VARCHAR(140) NOT NULL,                  -- Ubicación recomendada para realizar el plan
  tips_romanticos TEXT NOT NULL,                         -- Consejo especial para hacer memorable la cita
  color_acento VARCHAR(20) NOT NULL DEFAULT '#f43f5e'    -- Color hexadecimal de acento para la tarjeta del plan
);

-- Inserta los planes sugeridos iniciales en el catálogo
INSERT IGNORE INTO planes_sugeridos (id, titulo, categoria, descripcion, icono, duracion_estimada, presupuesto, lugar_sugerido, tips_romanticos) VALUES
(1, 'Tarde de Bolos, Retos y Malteadas', 'Divertido', 'Compitan en las pistas de bolos, hagan apuestas tiernas por cada chuza y cierren compartiendo malteadas.', '🎳', '2.5 a 3 horas', '$$ Moderado', 'Bolera favorita de la ciudad', 'El que gane cada ronda pide un deseo o un beso.'),
(2, 'Carrera de Karts a Toda Velocidad', 'Aventura', 'Adrenalina pura compitiendo juntos en la pista de Go-Karts y fotos en el podio.', '🏎️', '2 horas', '$$ Moderado', 'Pista de Karts', 'Tómense una foto con los cascos puestos antes de arrancar.'),
(3, 'Parque de Diversiones y Rueda de la Fortuna', 'Aventura', 'Montañas rusas, carros chocones, algodón de azúcar y atardecer en la rueda de la fortuna.', '🎡', '4 a 5 horas', '$$$ Especial', 'Parque de diversiones', 'Intenten ganar un peluche en los juegos de feria.'),
(4, 'Cita de Cine, Palomitas y Cena Romántica', 'Romántico', 'Elijan una película que ambos quieran ver, compartan palomitas y salgan a cenar.', '🍿', '3.5 horas', '$$ Moderado', 'Cine favorito', 'Guarden las entradas como recuerdo de la función.'),
(5, 'Picnic Romántico al Atardecer', 'Romántico', 'Escapada al aire libre con manta, fresas con chocolate, tabla de quesos y música.', '🌅', '3 horas', '$$ Moderado', 'Parque o jardín tranquilo', 'Lleven una carta escrita a mano para leerla al caer el sol.');

-- Tabla que almacena las citas agendadas y su álbum de hasta 10 fotografías
CREATE TABLE IF NOT EXISTS citas_programadas (
  id INT AUTO_INCREMENT PRIMARY KEY,                     -- Identificador único autoincremental de la cita agendada
  plan_id INT NOT NULL DEFAULT 1,                        -- Referencia al plan asociado en `planes_sugeridos`
  titulo_cita VARCHAR(160) NOT NULL,                     -- Nombre personalizado asignado a la cita
  fecha DATE NOT NULL,                                   -- Fecha programada en formato YYYY-MM-DD
  hora VARCHAR(20) NOT NULL,                             -- Hora programada en formato HH:MM
  lugar VARCHAR(160) NOT NULL,                           -- Punto de encuentro o restaurante elegido
  estado VARCHAR(30) NOT NULL DEFAULT 'Programada',      -- Estado actual de la cita ('Programada' o 'Completada')
  calificacion INT NOT NULL DEFAULT 5,                   -- Valoración en estrellas de 1 a 5
  bitacora_recuerdo TEXT,                                -- Nota o dedicatoria escrita sobre la experiencia
  fotos_json LONGTEXT,                                   -- Arreglo JSON con las fotografías del álbum de recuerdos
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP  -- Fecha y hora exacta de creación del registro
);

-- ============================================================================
-- 3. TABLAS: gestor_tareas y gestor_eventos (Proyecto: Gestor de Tareas Node.js)
-- ============================================================================
CREATE TABLE IF NOT EXISTS gestor_tareas (
  id VARCHAR(64) PRIMARY KEY,                            -- UUID único de la tarea registrada
  descripcion VARCHAR(255) NOT NULL,                     -- Texto descriptivo de la actividad por realizar
  completada TINYINT(1) NOT NULL DEFAULT 0,              -- Indicador booleano (0 = pendiente, 1 = completada)
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP  -- Fecha y hora de creación de la tarea
);

-- Precarga 3 tareas técnicas de verificación
INSERT IGNORE INTO gestor_tareas (id, descripcion, completada) VALUES
('t-node-001', 'Configurar conexión a base de datos relacional SQL y endpoints REST', 1),
('t-node-002', 'Sincronizar persistencia híbrida entre servidor y navegador', 1),
('t-node-003', 'Validar suite de pruebas automatizadas con node:test', 0);

-- Tabla de bitácora de auditoría de eventos (equivalente relacional de eventos.ndjson)
CREATE TABLE IF NOT EXISTS gestor_eventos (
  id INT AUTO_INCREMENT PRIMARY KEY,                     -- Secuencia incremental del evento de auditoría
  ts DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,        -- Marca de tiempo exacta del evento
  tipo VARCHAR(60) NOT NULL,                             -- Tipo de evento ('tarea:creada', 'tarea:completada', 'tarea:eliminada')
  tarea_id VARCHAR(64) NOT NULL,                         -- Identificador de la tarea afectada
  descripcion VARCHAR(255) DEFAULT ''                    -- Detalle adicional registrado en el evento
);

-- ============================================================================
-- 4. TABLA: finanzas_transacciones (Proyecto: Finanzas APP — Control COP)
-- ============================================================================
CREATE TABLE IF NOT EXISTS finanzas_transacciones (
  id BIGINT PRIMARY KEY,                                 -- Identificador numérico único (marca de tiempo o secuencia)
  concepto VARCHAR(180) NOT NULL,                        -- Descripción del movimiento financiero
  monto BIGINT NOT NULL,                                 -- Valor entero en pesos colombianos (COP)
  tipo VARCHAR(20) NOT NULL,                             -- Clasificación contable ('ingreso' o 'gasto')
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP  -- Fecha de registro del movimiento
);

-- Inserta los 4 movimientos financieros iniciales para el gráfico de dona en Canvas 2D
INSERT IGNORE INTO finanzas_transacciones (id, concepto, monto, tipo) VALUES
(101, 'Salario Desarrollo Full-Stack MEAN & SQL', 5800000, 'ingreso'),
(102, 'Consultoría Arquitectura API REST & Base de Datos', 1450000, 'ingreso'),
(103, 'Infraestructura Cloud, Dominio & Hosting BD', 380000, 'gasto'),
(104, 'Licencias JetBrains, Copilot & Herramientas Dev', 220000, 'gasto');

-- ============================================================================
-- 5. TABLA: kanban_tareas (Proyecto: Tablero Kanban Scrum)
-- ============================================================================
CREATE TABLE IF NOT EXISTS kanban_tareas (
  id VARCHAR(64) PRIMARY KEY,                            -- Identificador único de la tarjeta Scrum
  texto VARCHAR(255) NOT NULL,                           -- Historia de usuario o tarea del sprint
  columna VARCHAR(30) NOT NULL DEFAULT 'pendiente',      -- Columna actual ('pendiente', 'progreso', 'completado')
  orden INT NOT NULL DEFAULT 0,                          -- Posición vertical dentro de la columna
  actualizado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP -- Última vez que la tarjeta fue movida con Drag & Drop
);

-- Inserta las 4 historias de usuario iniciales del sprint
INSERT IGNORE INTO kanban_tareas (id, texto, columna, orden) VALUES
('k-1', 'Diseñar esquema relacional SQLite/MySQL/PostgreSQL y migraciones', 'completado', 1),
('k-2', 'Desplegar Portafolio Full-Stack en producción (Netlify + BD Real)', 'completado', 2),
('k-3', 'Integrar middleware de autenticación JWT y roles RBAC en BitShop', 'progreso', 1),
('k-4', 'Conectar sincronización en tiempo real en todos los módulos del portafolio', 'pendiente', 1);

-- ============================================================================
-- 6. TABLAS: bitshop_users y bitshop_products (Proyecto: BitShop REST API)
-- ============================================================================
CREATE TABLE IF NOT EXISTS bitshop_users (
  _id VARCHAR(64) PRIMARY KEY,                           -- Identificador único del usuario
  username VARCHAR(80) NOT NULL,                         -- Nombre de usuario visible en el panel
  email VARCHAR(120) NOT NULL UNIQUE,                    -- Correo electrónico único para autenticación JWT
  password_plain_demo VARCHAR(80) NOT NULL,              -- Credencial de acceso para demostración en el Studio
  phone VARCHAR(40) NOT NULL,                            -- Número telefónico de contacto
  role VARCHAR(20) NOT NULL DEFAULT 'client'             -- Rol de control de acceso RBAC ('admin' o 'client')
);

-- Inserta las cuentas demo de Administrador y Cliente
INSERT IGNORE INTO bitshop_users (_id, username, email, password_plain_demo, phone, role) VALUES
('usr-admin-01', 'admin_fredy', 'admin@bitshop.local', 'Admin123*', '3152388315', 'admin'),
('usr-client-01', 'cliente_demo', 'cliente@bitshop.local', 'Cliente123*', '3001234567', 'client');

-- Tabla del catálogo de productos tecnológicos protegidos por JWT
CREATE TABLE IF NOT EXISTS bitshop_products (
  _id VARCHAR(64) PRIMARY KEY,                           -- Identificador único del producto
  name VARCHAR(160) NOT NULL,                            -- Nombre comercial y especificaciones del equipo
  price BIGINT NOT NULL,                                 -- Precio unitario en pesos colombianos (COP)
  availableElements INT NOT NULL DEFAULT 10,             -- Unidades disponibles en inventario (stock)
  description TEXT                                       -- Descripción técnica del producto
);

-- Inserta los 4 productos tecnológicos iniciales del catálogo BitShop
INSERT IGNORE INTO bitshop_products (_id, name, price, availableElements, description) VALUES
('prod-bit-01', 'MacBook Pro 16" M3 Max (36GB RAM / 1TB NVMe)', 12450000, 8, 'Estación portátil para ingeniería de software, contenedores Docker y compilación rápida.'),
('prod-bit-02', 'Monitor Dell UltraSharp 34" Curved USB-C Hub', 3290000, 14, 'Panel IPS WQHD con calibración de color de fábrica y entrega de energía de 90W.'),
('prod-bit-03', 'Teclado Mecánico Keychron Q1 Pro Wireless QMK/VIA', 890000, 22, 'Chasis CNC de aluminio completo con switches táctiles lubricados y conexión Bluetooth 5.1.'),
('prod-bit-04', 'Silla Ergonómica Herman Miller Aeron Remastered', 5400000, 5, 'Soporte lumbar PostureFit SL diseñado para jornadas intensivas de desarrollo.');

-- ============================================================================
-- 7. TABLA: mongo_characters (Proyecto: MongoDB DBZ-V2 Playground)
-- ============================================================================
CREATE TABLE IF NOT EXISTS mongo_characters (
  _id VARCHAR(64) PRIMARY KEY,                           -- Identificador del documento del personaje
  name VARCHAR(100) NOT NULL,                            -- Nombre y transformación del guerrero
  species VARCHAR(60) NOT NULL,                          -- Especie para filtros $eq (Saiyan, Namekian, etc.)
  edad INT NOT NULL,                                     -- Edad del personaje en años
  powerLevel BIGINT NOT NULL                             -- Nivel de poder para consultas con operador $gte
);

-- Inserta la colección inicial DBZ-V2
INSERT IGNORE INTO mongo_characters (_id, name, species, edad, powerLevel) VALUES
('dbz-01', 'Son Goku (Ultra Instinct)', 'Saiyan', 44, 950000000),
('dbz-02', 'Vegeta (Ultra Ego)', 'Saiyan', 48, 940000000),
('dbz-03', 'Piccolo (Orange Form)', 'Namekian', 31, 780000000),
('dbz-04', 'Son Gohan (Beast Mode)', 'Saiyan', 27, 960000000),
('dbz-05', 'Broly (Full Power)', 'Saiyan', 48, 930000000);

-- ============================================================================
-- 8. TABLA: tienda_pedidos (Proyecto: BIT Shop E-Commerce)
-- ============================================================================
CREATE TABLE IF NOT EXISTS tienda_pedidos (
  id VARCHAR(64) PRIMARY KEY,                            -- Número de orden generada en el checkout (ej. ORD-123456)
  cliente VARCHAR(120) NOT NULL,                         -- Nombre del comprador
  items_json LONGTEXT NOT NULL,                          -- Detalle serializado en JSON de los productos y cantidades compradas
  total BIGINT NOT NULL,                                 -- Valor total liquidado en pesos colombianos (COP)
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP  -- Fecha y hora exacta de confirmación del pedido
);

-- ============================================================================
-- 9. TABLA: notesdb_notas (Proyecto: NotesDB — IndexedDB + Réplica SQL)
-- ============================================================================
CREATE TABLE IF NOT EXISTS notesdb_notas (
  id INT AUTO_INCREMENT PRIMARY KEY,                     -- Identificador autoincremental de la nota
  title VARCHAR(255) NOT NULL,                           -- Contenido editable de la nota técnica
  category VARCHAR(60) NOT NULL DEFAULT 'Trabajo',       -- Categoría ('Trabajo', 'Estudio', 'Idea')
  created_at VARCHAR(60) NOT NULL                        -- Fecha formateada de creación
);

-- Precarga 3 notas técnicas iniciales
INSERT IGNORE INTO notesdb_notas (id, title, category, created_at) VALUES
(1, 'Arquitectura RESTful con Node.js, Express y autenticación JWT en producción', 'Trabajo', '2026-11-26 10:00:00'),
(2, 'Persistencia híbrida: Base de Datos Relacional SQL + IndexedDB en el navegador', 'Estudio', '2026-11-26 11:30:00'),
(3, 'Diseño de componentes reactivos y calendario FullCalendar v6 en Angular 16 SPA', 'Idea', '2026-11-26 14:15:00');

-- ============================================================================
-- 10. TABLA: agenda_eventos (Proyecto: Procrastination Nightmare Angular 16 + FullCalendar)
-- ============================================================================
CREATE TABLE IF NOT EXISTS agenda_eventos (
  id VARCHAR(64) PRIMARY KEY,                            -- Identificador único del evento en el calendario
  title VARCHAR(180) NOT NULL,                           -- Título de la reunión Scrum, entrega o hito
  start_date VARCHAR(40) NOT NULL,                       -- Fecha ISO YYYY-MM-DD para renderizado en FullCalendar v6
  category VARCHAR(50) NOT NULL DEFAULT 'Sprint',        -- Etiqueta de clasificación ('Scrum', 'DevOps', 'Backend', 'Release')
  color VARCHAR(25) NOT NULL DEFAULT '#38bdf8'           -- Color hexadecimal de la píldora en el calendario
);

-- Inserta los 4 eventos iniciales del calendario de sprints
INSERT IGNORE INTO agenda_eventos (id, title, start_date, category, color) VALUES
('ev-101', 'Sprint Planning & Arquitectura Base de Datos SQL', '2026-11-26', 'Scrum', '#38bdf8'),
('ev-102', 'Despliegue Continuo (CI/CD) en Netlify Functions', '2026-11-27', 'DevOps', '#10b981'),
('ev-103', 'Code Review & Auditoría de Seguridad JWT / RBAC', '2026-11-28', 'Backend', '#a855f7'),
('ev-104', 'Demo Ejecutiva de Portafolio Full-Stack MEAN', '2026-11-30', 'Release', '#f59e0b');

-- ============================================================================
-- 11. TABLA: portfolio_kv_store (Sincronización de Módulos: proyectoBit, Carrito, SketchPad)
-- ============================================================================
CREATE TABLE IF NOT EXISTS portfolio_kv_store (
  clave VARCHAR(120) PRIMARY KEY,                        -- Clave única del módulo sincronizado (ej. `proyectobit_suite_state`)
  valor_json LONGTEXT NOT NULL,                          -- Estado completo serializado en formato JSON
  actualizado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP -- Fecha y hora de la última sincronización desde el cliente
);
