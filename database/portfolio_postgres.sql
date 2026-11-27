-- ============================================================================
-- BASE DE DATOS RELACIONAL UNIFICADA DEL PORTAFOLIO — FREDY MARTINEZ (PostgreSQL)
-- (database/portfolio_postgres.sql)
-- ============================================================================
-- Propósito:
--   Crear e inicializar todas las tablas relacionales y datos semilla (seed)
--   para PostgreSQL 14+, Netlify Database, Supabase, Neon, Railway y Render.
--   Comentado tabla por tabla y columna por columna en español.
-- ============================================================================

-- 1. TABLA: turismo_destinos (Proyecto: Turismo MEAN — Destinos de Colombia)
CREATE TABLE IF NOT EXISTS turismo_destinos (
  id VARCHAR(36) PRIMARY KEY,                            -- Identificador único del destino turístico
  nombre VARCHAR(140) NOT NULL,                          -- Nombre oficial del destino turístico
  ciudad VARCHAR(90) NOT NULL,                           -- Ciudad o región en Colombia
  descripcion TEXT NOT NULL,                             -- Descripción detallada de la experiencia
  precio NUMERIC(12, 2) NOT NULL DEFAULT 0,              -- Precio del plan en pesos colombianos (COP)
  calificacion NUMERIC(3, 1) NOT NULL DEFAULT 5.0,       -- Calificación en estrellas (1.0 a 5.0)
  fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP -- Fecha de creación del registro
);

-- Inserta los 5 destinos iniciales evitando colisiones por llave primaria (ON CONFLICT DO NOTHING)
INSERT INTO turismo_destinos (id, nombre, ciudad, descripcion, precio, calificacion) VALUES
('65f1a1000000000000000001', 'Parque Nacional Natural Tayrona', 'Santa Marta', 'Playas cristalinas rodeadas de selva tropical y senderos ancestrales en la Sierra Nevada.', 980000, 4.9),
('65f1a1000000000000000002', 'Ciudad Amurallada & Islas del Rosario', 'Cartagena', 'Recorrido histórico colonial, gastronomía caribeña y pasadía en aguas turquesas.', 1250000, 4.8),
('65f1a1000000000000000003', 'Valle de Cocora & Paisaje Cafetero', 'Salento', 'Caminata entre palmas de cera gigantes, degustación de café de origen y pueblos patrimoniales.', 760000, 4.9),
('65f1a1000000000000000004', 'Mar de los Siete Colores & Johnny Cay', 'San Andrés', 'Snorkel en arrecifes de coral, acuario natural y cultura isleña.', 1490000, 4.7),
('65f1a1000000000000000005', 'Piedra del Peñol & Embalse de Guatapé', 'Guatapé', 'Ascenso de 740 escalones con vista panorámica 360° de la represa y zócalos coloridos.', 620000, 4.8)
ON CONFLICT (id) DO NOTHING;

-- 2. TABLAS: planes_sugeridos y citas_programadas (Proyecto: App de Citas)
CREATE TABLE IF NOT EXISTS planes_sugeridos (
  id SERIAL PRIMARY KEY,                                 -- Identificador autoincremental en PostgreSQL
  titulo VARCHAR(160) NOT NULL,                          -- Nombre del plan romántico o de aventura
  categoria VARCHAR(40) NOT NULL,                        -- Categoría temática del plan
  descripcion TEXT NOT NULL,                             -- Detalle de la actividad sugerida
  icono VARCHAR(20) NOT NULL DEFAULT '💖',               -- Emoji representativo del plan
  duracion_estimada VARCHAR(60) NOT NULL,                -- Duración estimada de la cita
  presupuesto VARCHAR(60) NOT NULL,                      -- Rango de presupuesto estimado
  lugar_sugerido VARCHAR(140) NOT NULL,                  -- Lugar recomendado para la cita
  tips_romanticos TEXT NOT NULL,                         -- Recomendación especial para la pareja
  color_acento VARCHAR(20) NOT NULL DEFAULT '#f43f5e'    -- Color visual de la tarjeta
);

CREATE TABLE IF NOT EXISTS citas_programadas (
  id SERIAL PRIMARY KEY,                                 -- Identificador autoincremental de la cita agendada
  plan_id INTEGER NOT NULL DEFAULT 1,                    -- ID del plan base seleccionado
  titulo_cita VARCHAR(160) NOT NULL,                     -- Título personalizado de la cita
  fecha VARCHAR(20) NOT NULL,                            -- Fecha agendada (YYYY-MM-DD)
  hora VARCHAR(20) NOT NULL,                             -- Hora agendada (HH:MM)
  lugar VARCHAR(160) NOT NULL,                           -- Lugar acordado para la cita
  estado VARCHAR(30) NOT NULL DEFAULT 'Programada',      -- Estado ('Programada' o 'Completada')
  calificacion INTEGER NOT NULL DEFAULT 5,               -- Calificación de la experiencia (1 a 5)
  bitacora_recuerdo TEXT DEFAULT '',                     -- Recuerdo o nota escrita por la pareja
  fotos_json TEXT DEFAULT '[]',                          -- Arreglo JSON con las fotos del álbum
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP -- Marca de tiempo de creación
);

-- 3. TABLAS: gestor_tareas y gestor_eventos (Proyecto: Gestor de Tareas Node.js)
CREATE TABLE IF NOT EXISTS gestor_tareas (
  id VARCHAR(64) PRIMARY KEY,                            -- Identificador único de la tarea
  descripcion VARCHAR(255) NOT NULL,                     -- Descripción de la tarea
  completada BOOLEAN NOT NULL DEFAULT FALSE,             -- Estado booleano de completitud
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP -- Fecha de registro
);

INSERT INTO gestor_tareas (id, descripcion, completada) VALUES
('t-node-001', 'Configurar conexión a base de datos relacional SQL y endpoints REST', TRUE),
('t-node-002', 'Sincronizar persistencia híbrida entre servidor y navegador', TRUE),
('t-node-003', 'Validar suite de pruebas automatizadas con node:test', FALSE)
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS gestor_eventos (
  id SERIAL PRIMARY KEY,                                 -- Identificador secuencial del evento de auditoría
  ts TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,       -- Marca de tiempo del evento
  tipo VARCHAR(60) NOT NULL,                             -- Tipo de acción ejecutada
  tarea_id VARCHAR(64) NOT NULL,                         -- ID de la tarea asociada
  descripcion VARCHAR(255) DEFAULT ''                    -- Descripción registrada en auditoría
);

-- 4. TABLA: finanzas_transacciones (Proyecto: Finanzas APP)
CREATE TABLE IF NOT EXISTS finanzas_transacciones (
  id BIGINT PRIMARY KEY,                                 -- Identificador único de la transacción financiera
  concepto VARCHAR(180) NOT NULL,                        -- Concepto del ingreso o gasto
  monto BIGINT NOT NULL,                                 -- Valor en pesos colombianos (COP)
  tipo VARCHAR(20) NOT NULL,                             -- Tipo de movimiento ('ingreso' o 'gasto')
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP -- Fecha de registro contable
);

INSERT INTO finanzas_transacciones (id, concepto, monto, tipo) VALUES
(101, 'Salario Desarrollo Full-Stack MEAN & SQL', 5800000, 'ingreso'),
(102, 'Consultoría Arquitectura API REST & Base de Datos', 1450000, 'ingreso'),
(103, 'Infraestructura Cloud, Dominio & Hosting BD', 380000, 'gasto'),
(104, 'Licencias JetBrains, Copilot & Herramientas Dev', 220000, 'gasto')
ON CONFLICT (id) DO NOTHING;

-- 5. TABLA: kanban_tareas (Proyecto: Tablero Kanban Scrum)
CREATE TABLE IF NOT EXISTS kanban_tareas (
  id VARCHAR(64) PRIMARY KEY,                            -- Identificador único de la tarjeta Kanban
  texto VARCHAR(255) NOT NULL,                           -- Descripción de la historia de usuario
  columna VARCHAR(30) NOT NULL DEFAULT 'pendiente',      -- Columna del flujo Scrum ('pendiente', 'progreso', 'completado')
  orden INTEGER NOT NULL DEFAULT 0,                      -- Orden de aparición en la columna
  actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP -- Última actualización Drag & Drop
);

INSERT INTO kanban_tareas (id, texto, columna, orden) VALUES
('k-1', 'Diseñar esquema relacional SQLite/MySQL/PostgreSQL y migraciones', 'completado', 1),
('k-2', 'Desplegar Portafolio Full-Stack en producción (Netlify + BD Real)', 'completado', 2),
('k-3', 'Integrar middleware de autenticación JWT y roles RBAC en BitShop', 'progreso', 1),
('k-4', 'Conectar sincronización en tiempo real en todos los módulos del portafolio', 'pendiente', 1)
ON CONFLICT (id) DO NOTHING;

-- 6. TABLAS: bitshop_users y bitshop_products (Proyecto: BitShop REST API)
CREATE TABLE IF NOT EXISTS bitshop_users (
  _id VARCHAR(64) PRIMARY KEY,                           -- Identificador único del usuario
  username VARCHAR(80) NOT NULL,                         -- Nombre de usuario
  email VARCHAR(120) NOT NULL UNIQUE,                    -- Correo electrónico único para login JWT
  password_plain_demo VARCHAR(80) NOT NULL,              -- Contraseña configurada para el entorno demo
  phone VARCHAR(40) NOT NULL,                            -- Teléfono de contacto
  role VARCHAR(20) NOT NULL DEFAULT 'client'             -- Rol RBAC ('admin' o 'client')
);

INSERT INTO bitshop_users (_id, username, email, password_plain_demo, phone, role) VALUES
('usr-admin-01', 'admin_fredy', 'admin@bitshop.local', 'Admin123*', '3152388315', 'admin'),
('usr-client-01', 'cliente_demo', 'cliente@bitshop.local', 'Cliente123*', '3001234567', 'client')
ON CONFLICT (_id) DO NOTHING;

CREATE TABLE IF NOT EXISTS bitshop_products (
  _id VARCHAR(64) PRIMARY KEY,                           -- Identificador único del producto
  name VARCHAR(160) NOT NULL,                            -- Nombre del producto tecnológico
  price BIGINT NOT NULL,                                 -- Precio en pesos colombianos (COP)
  availableElements INTEGER NOT NULL DEFAULT 10,         -- Cantidad disponible en inventario
  description TEXT                                       -- Especificaciones técnicas
);

INSERT INTO bitshop_products (_id, name, price, availableElements, description) VALUES
('prod-bit-01', 'MacBook Pro 16" M3 Max (36GB RAM / 1TB NVMe)', 12450000, 8, 'Estación portátil para ingeniería de software, contenedores Docker y compilación rápida.'),
('prod-bit-02', 'Monitor Dell UltraSharp 34" Curved USB-C Hub', 3290000, 14, 'Panel IPS WQHD con calibración de color de fábrica y entrega de energía de 90W.'),
('prod-bit-03', 'Teclado Mecánico Keychron Q1 Pro Wireless QMK/VIA', 890000, 22, 'Chasis CNC de aluminio completo con switches táctiles lubricados y conexión Bluetooth 5.1.'),
('prod-bit-04', 'Silla Ergonómica Herman Miller Aeron Remastered', 5400000, 5, 'Soporte lumbar PostureFit SL diseñado para jornadas intensivas de desarrollo.')
ON CONFLICT (_id) DO NOTHING;

-- 7. TABLA: mongo_characters (Proyecto: MongoDB DBZ-V2 Playground)
CREATE TABLE IF NOT EXISTS mongo_characters (
  _id VARCHAR(64) PRIMARY KEY,                           -- Identificador del documento
  name VARCHAR(100) NOT NULL,                            -- Nombre del guerrero DBZ
  species VARCHAR(60) NOT NULL,                          -- Especie (Saiyan, Namekian)
  edad INTEGER NOT NULL,                                 -- Edad en años
  powerLevel BIGINT NOT NULL                             -- Nivel de poder numérico
);

INSERT INTO mongo_characters (_id, name, species, edad, powerLevel) VALUES
('dbz-01', 'Son Goku (Ultra Instinct)', 'Saiyan', 44, 950000000),
('dbz-02', 'Vegeta (Ultra Ego)', 'Saiyan', 48, 940000000),
('dbz-03', 'Piccolo (Orange Form)', 'Namekian', 31, 780000000),
('dbz-04', 'Son Gohan (Beast Mode)', 'Saiyan', 27, 960000000),
('dbz-05', 'Broly (Full Power)', 'Saiyan', 48, 930000000)
ON CONFLICT (_id) DO NOTHING;

-- 8. TABLA: tienda_pedidos (Proyecto: BIT Shop E-Commerce)
CREATE TABLE IF NOT EXISTS tienda_pedidos (
  id VARCHAR(64) PRIMARY KEY,                            -- Código de orden de compra
  cliente VARCHAR(120) NOT NULL,                         -- Nombre del cliente
  items_json TEXT NOT NULL,                              -- Productos comprados en formato JSON
  total BIGINT NOT NULL,                                 -- Total pagado en COP
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP -- Fecha de la compra
);

-- 9. TABLA: notesdb_notas (Proyecto: NotesDB)
CREATE TABLE IF NOT EXISTS notesdb_notas (
  id SERIAL PRIMARY KEY,                                 -- ID autoincremental de la nota
  title VARCHAR(255) NOT NULL,                           -- Texto de la nota
  category VARCHAR(60) NOT NULL DEFAULT 'Trabajo',       -- Categoría asignada
  created_at VARCHAR(60) NOT NULL                        -- Fecha de creación
);

-- 10. TABLA: agenda_eventos (Proyecto: Procrastination Nightmare Angular 16 + FullCalendar)
CREATE TABLE IF NOT EXISTS agenda_eventos (
  id VARCHAR(64) PRIMARY KEY,                            -- ID único del evento
  title VARCHAR(180) NOT NULL,                           -- Título del evento o sprint
  start_date VARCHAR(40) NOT NULL,                       -- Fecha de inicio (YYYY-MM-DD)
  category VARCHAR(50) NOT NULL DEFAULT 'Sprint',        -- Categoría del evento
  color VARCHAR(25) NOT NULL DEFAULT '#38bdf8'           -- Color visual en el calendario
);

INSERT INTO agenda_eventos (id, title, start_date, category, color) VALUES
('ev-101', 'Sprint Planning & Arquitectura Base de Datos SQL', '2026-11-26', 'Scrum', '#38bdf8'),
('ev-102', 'Despliegue Continuo (CI/CD) en Netlify Functions', '2026-11-27', 'DevOps', '#10b981'),
('ev-103', 'Code Review & Auditoría de Seguridad JWT / RBAC', '2026-11-28', 'Backend', '#a855f7'),
('ev-104', 'Demo Ejecutiva de Portafolio Full-Stack MEAN', '2026-11-30', 'Release', '#f59e0b')
ON CONFLICT (id) DO NOTHING;

-- 11. TABLA: portfolio_kv_store (Sincronización clave-valor de módulos)
CREATE TABLE IF NOT EXISTS portfolio_kv_store (
  clave VARCHAR(120) PRIMARY KEY,                        -- Identificador único del módulo
  valor_json TEXT NOT NULL,                              -- Payload JSON sincronizado
  actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP -- Última fecha de sincronización
);
