-- ============================================================================
-- BASE DE DATOS RELACIONAL UNIFICADA DEL PORTAFOLIO — FREDY MARTINEZ (PostgreSQL)
-- ============================================================================
-- Compatible con: PostgreSQL 14+, Netlify Database, Supabase, Neon, Railway, Render

CREATE TABLE IF NOT EXISTS turismo_destinos (
  id VARCHAR(36) PRIMARY KEY,
  nombre VARCHAR(140) NOT NULL,
  ciudad VARCHAR(90) NOT NULL,
  descripcion TEXT NOT NULL,
  precio NUMERIC(12, 2) NOT NULL DEFAULT 0,
  calificacion NUMERIC(3, 1) NOT NULL DEFAULT 5.0,
  fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO turismo_destinos (id, nombre, ciudad, descripcion, precio, calificacion) VALUES
('65f1a1000000000000000001', 'Parque Nacional Natural Tayrona', 'Santa Marta', 'Playas cristalinas rodeadas de selva tropical y senderos ancestrales en la Sierra Nevada.', 980000, 4.9),
('65f1a1000000000000000002', 'Ciudad Amurallada & Islas del Rosario', 'Cartagena', 'Recorrido histórico colonial, gastronomía caribeña y pasadía en aguas turquesas.', 1250000, 4.8),
('65f1a1000000000000000003', 'Valle de Cocora & Paisaje Cafetero', 'Salento', 'Caminata entre palmas de cera gigantes, degustación de café de origen y pueblos patrimoniales.', 760000, 4.9),
('65f1a1000000000000000004', 'Mar de los Siete Colores & Johnny Cay', 'San Andrés', 'Snorkel en arrecifes de coral, acuario natural y cultura isleña.', 1490000, 4.7),
('65f1a1000000000000000005', 'Piedra del Peñol & Embalse de Guatapé', 'Guatapé', 'Ascenso de 740 escalones con vista panorámica 360° de la represa y zócalos coloridos.', 620000, 4.8)
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS planes_sugeridos (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(160) NOT NULL,
  categoria VARCHAR(40) NOT NULL,
  descripcion TEXT NOT NULL,
  icono VARCHAR(20) NOT NULL DEFAULT '💖',
  duracion_estimada VARCHAR(60) NOT NULL,
  presupuesto VARCHAR(60) NOT NULL,
  lugar_sugerido VARCHAR(140) NOT NULL,
  tips_romanticos TEXT NOT NULL,
  color_acento VARCHAR(20) NOT NULL DEFAULT '#f43f5e'
);

CREATE TABLE IF NOT EXISTS citas_programadas (
  id SERIAL PRIMARY KEY,
  plan_id INTEGER NOT NULL DEFAULT 1,
  titulo_cita VARCHAR(160) NOT NULL,
  fecha VARCHAR(20) NOT NULL,
  hora VARCHAR(20) NOT NULL,
  lugar VARCHAR(160) NOT NULL,
  estado VARCHAR(30) NOT NULL DEFAULT 'Programada',
  calificacion INTEGER NOT NULL DEFAULT 5,
  bitacora_recuerdo TEXT DEFAULT '',
  fotos_json TEXT DEFAULT '[]',
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS gestor_tareas (
  id VARCHAR(64) PRIMARY KEY,
  descripcion VARCHAR(255) NOT NULL,
  completada BOOLEAN NOT NULL DEFAULT FALSE,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO gestor_tareas (id, descripcion, completada) VALUES
('t-node-001', 'Configurar conexión a base de datos relacional SQL y endpoints REST', TRUE),
('t-node-002', 'Sincronizar persistencia híbrida entre servidor y navegador', TRUE),
('t-node-003', 'Validar suite de pruebas automatizadas con node:test', FALSE)
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS gestor_eventos (
  id SERIAL PRIMARY KEY,
  ts TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  tipo VARCHAR(60) NOT NULL,
  tarea_id VARCHAR(64) NOT NULL,
  descripcion VARCHAR(255) DEFAULT ''
);

CREATE TABLE IF NOT EXISTS finanzas_transacciones (
  id BIGINT PRIMARY KEY,
  concepto VARCHAR(180) NOT NULL,
  monto BIGINT NOT NULL,
  tipo VARCHAR(20) NOT NULL,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO finanzas_transacciones (id, concepto, monto, tipo) VALUES
(101, 'Salario Desarrollo Full-Stack MEAN & SQL', 5800000, 'ingreso'),
(102, 'Consultoría Arquitectura API REST & Base de Datos', 1450000, 'ingreso'),
(103, 'Infraestructura Cloud, Dominio & Hosting BD', 380000, 'gasto'),
(104, 'Licencias JetBrains, Copilot & Herramientas Dev', 220000, 'gasto')
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS kanban_tareas (
  id VARCHAR(64) PRIMARY KEY,
  texto VARCHAR(255) NOT NULL,
  columna VARCHAR(30) NOT NULL DEFAULT 'pendiente',
  orden INTEGER NOT NULL DEFAULT 0,
  actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO kanban_tareas (id, texto, columna, orden) VALUES
('k-1', 'Diseñar esquema relacional SQLite/MySQL/PostgreSQL y migraciones', 'completado', 1),
('k-2', 'Desplegar Portafolio Full-Stack en producción (Netlify + BD Real)', 'completado', 2),
('k-3', 'Integrar middleware de autenticación JWT y roles RBAC en BitShop', 'progreso', 1),
('k-4', 'Conectar sincronización en tiempo real en todos los módulos del portafolio', 'pendiente', 1)
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS bitshop_users (
  _id VARCHAR(64) PRIMARY KEY,
  username VARCHAR(80) NOT NULL,
  email VARCHAR(120) NOT NULL UNIQUE,
  password_plain_demo VARCHAR(80) NOT NULL,
  phone VARCHAR(40) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'client'
);

INSERT INTO bitshop_users (_id, username, email, password_plain_demo, phone, role) VALUES
('usr-admin-01', 'admin_fredy', 'admin@bitshop.local', 'Admin123*', '3152388315', 'admin'),
('usr-client-01', 'cliente_demo', 'cliente@bitshop.local', 'Cliente123*', '3001234567', 'client')
ON CONFLICT (_id) DO NOTHING;

CREATE TABLE IF NOT EXISTS bitshop_products (
  _id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(160) NOT NULL,
  price BIGINT NOT NULL,
  availableElements INTEGER NOT NULL DEFAULT 10,
  description TEXT
);

INSERT INTO bitshop_products (_id, name, price, availableElements, description) VALUES
('prod-bit-01', 'MacBook Pro 16" M3 Max (36GB RAM / 1TB NVMe)', 12450000, 8, 'Estación portátil para ingeniería de software, contenedores Docker y compilación rápida.'),
('prod-bit-02', 'Monitor Dell UltraSharp 34" Curved USB-C Hub', 3290000, 14, 'Panel IPS WQHD con calibración de color de fábrica y entrega de energía de 90W.'),
('prod-bit-03', 'Teclado Mecánico Keychron Q1 Pro Wireless QMK/VIA', 890000, 22, 'Chasis CNC de aluminio completo con switches táctiles lubricados y conexión Bluetooth 5.1.'),
('prod-bit-04', 'Silla Ergonómica Herman Miller Aeron Remastered', 5400000, 5, 'Soporte lumbar PostureFit SL diseñado para jornadas intensivas de desarrollo.')
ON CONFLICT (_id) DO NOTHING;

CREATE TABLE IF NOT EXISTS mongo_characters (
  _id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  species VARCHAR(60) NOT NULL,
  edad INTEGER NOT NULL,
  powerLevel BIGINT NOT NULL
);

INSERT INTO mongo_characters (_id, name, species, edad, powerLevel) VALUES
('dbz-01', 'Son Goku (Ultra Instinct)', 'Saiyan', 44, 950000000),
('dbz-02', 'Vegeta (Ultra Ego)', 'Saiyan', 48, 940000000),
('dbz-03', 'Piccolo (Orange Form)', 'Namekian', 31, 780000000),
('dbz-04', 'Son Gohan (Beast Mode)', 'Saiyan', 27, 960000000),
('dbz-05', 'Broly (Full Power)', 'Saiyan', 48, 930000000)
ON CONFLICT (_id) DO NOTHING;

CREATE TABLE IF NOT EXISTS tienda_pedidos (
  id VARCHAR(64) PRIMARY KEY,
  cliente VARCHAR(120) NOT NULL,
  items_json TEXT NOT NULL,
  total BIGINT NOT NULL,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notesdb_notas (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(60) NOT NULL DEFAULT 'Trabajo',
  created_at VARCHAR(60) NOT NULL
);

CREATE TABLE IF NOT EXISTS agenda_eventos (
  id VARCHAR(64) PRIMARY KEY,
  title VARCHAR(180) NOT NULL,
  start_date VARCHAR(40) NOT NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'Sprint',
  color VARCHAR(25) NOT NULL DEFAULT '#38bdf8'
);

INSERT INTO agenda_eventos (id, title, start_date, category, color) VALUES
('ev-101', 'Sprint Planning & Arquitectura Base de Datos SQL', '2026-11-26', 'Scrum', '#38bdf8'),
('ev-102', 'Despliegue Continuo (CI/CD) en Netlify Functions', '2026-11-27', 'DevOps', '#10b981'),
('ev-103', 'Code Review & Auditoría de Seguridad JWT / RBAC', '2026-11-28', 'Backend', '#a855f7'),
('ev-104', 'Demo Ejecutiva de Portafolio Full-Stack MEAN', '2026-11-30', 'Release', '#f59e0b')
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS portfolio_kv_store (
  clave VARCHAR(120) PRIMARY KEY,
  valor_json TEXT NOT NULL,
  actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
