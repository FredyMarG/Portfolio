-- ============================================================================
-- BASE DE DATOS RELACIONAL UNIFICADA DEL PORTAFOLIO — FREDY MARTINEZ (MySQL / MariaDB)
-- ============================================================================
-- Compatible con: MySQL 8+, MariaDB 10.5+, Railway, Clever Cloud, PlanetScale, XAMPP (phpMyAdmin)
-- Instrucciones: Importar este archivo directamente en tu servidor MySQL.

CREATE DATABASE IF NOT EXISTS portafolio_fredy CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE portafolio_fredy;

-- 1. TURISMO MEAN (Destinos Turísticos de Colombia)
CREATE TABLE IF NOT EXISTS turismo_destinos (
  id VARCHAR(36) PRIMARY KEY,
  nombre VARCHAR(140) NOT NULL,
  ciudad VARCHAR(90) NOT NULL,
  descripcion TEXT NOT NULL,
  precio DECIMAL(12, 2) NOT NULL DEFAULT 0,
  calificacion DECIMAL(3, 1) NOT NULL DEFAULT 5.0,
  fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT IGNORE INTO turismo_destinos (id, nombre, ciudad, descripcion, precio, calificacion) VALUES
('65f1a1000000000000000001', 'Parque Nacional Natural Tayrona', 'Santa Marta', 'Playas cristalinas rodeadas de selva tropical y senderos ancestrales en la Sierra Nevada.', 980000, 4.9),
('65f1a1000000000000000002', 'Ciudad Amurallada & Islas del Rosario', 'Cartagena', 'Recorrido histórico colonial, gastronomía caribeña y pasadía en aguas turquesas.', 1250000, 4.8),
('65f1a1000000000000000003', 'Valle de Cocora & Paisaje Cafetero', 'Salento', 'Caminata entre palmas de cera gigantes, degustación de café de origen y pueblos patrimoniales.', 760000, 4.9),
('65f1a1000000000000000004', 'Mar de los Siete Colores & Johnny Cay', 'San Andrés', 'Snorkel en arrecifes de coral, acuario natural y cultura isleña.', 1490000, 4.7),
('65f1a1000000000000000005', 'Piedra del Peñol & Embalse de Guatapé', 'Guatapé', 'Ascenso de 740 escalones con vista panorámica 360° de la represa y zócalos coloridos.', 620000, 4.8);

-- 2. APP DE CITAS (Amour & Planes)
CREATE TABLE IF NOT EXISTS planes_sugeridos (
  id INT AUTO_INCREMENT PRIMARY KEY,
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

INSERT IGNORE INTO planes_sugeridos (id, titulo, categoria, descripcion, icono, duracion_estimada, presupuesto, lugar_sugerido, tips_romanticos) VALUES
(1, 'Tarde de Bolos, Retos y Malteadas', 'Divertido', 'Compitan en las pistas de bolos, hagan apuestas tiernas por cada chuza y cierren compartiendo malteadas.', '🎳', '2.5 a 3 horas', '$$ Moderado', 'Bolera favorita de la ciudad', 'El que gane cada ronda pide un deseo o un beso.'),
(2, 'Carrera de Karts a Toda Velocidad', 'Aventura', 'Adrenalina pura compitiendo juntos en la pista de Go-Karts y fotos en el podio.', '🏎️', '2 horas', '$$ Moderado', 'Pista de Karts', 'Tómense una foto con los cascos puestos antes de arrancar.'),
(3, 'Parque de Diversiones y Rueda de la Fortuna', 'Aventura', 'Montañas rusas, carros chocones, algodón de azúcar y atardecer en la rueda de la fortuna.', '🎡', '4 a 5 horas', '$$$ Especial', 'Parque de diversiones', 'Intenten ganar un peluche en los juegos de feria.'),
(4, 'Cita de Cine, Palomitas y Cena Romántica', 'Romántico', 'Elijan una película que ambos quieran ver, compartan palomitas y salgan a cenar.', '🍿', '3.5 horas', '$$ Moderado', 'Cine favorito', 'Guarden las entradas como recuerdo de la función.'),
(5, 'Picnic Romántico al Atardecer', 'Romántico', 'Escapada al aire libre con manta, fresas con chocolate, tabla de quesos y música.', '🌅', '3 horas', '$$ Moderado', 'Parque o jardín tranquilo', 'Lleven una carta escrita a mano para leerla al caer el sol.');

CREATE TABLE IF NOT EXISTS citas_programadas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  plan_id INT NOT NULL DEFAULT 1,
  titulo_cita VARCHAR(160) NOT NULL,
  fecha DATE NOT NULL,
  hora VARCHAR(20) NOT NULL,
  lugar VARCHAR(160) NOT NULL,
  estado VARCHAR(30) NOT NULL DEFAULT 'Programada',
  calificacion INT NOT NULL DEFAULT 5,
  bitacora_recuerdo TEXT,
  fotos_json LONGTEXT,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. GESTOR DE TAREAS NODE.JS
CREATE TABLE IF NOT EXISTS gestor_tareas (
  id VARCHAR(64) PRIMARY KEY,
  descripcion VARCHAR(255) NOT NULL,
  completada TINYINT(1) NOT NULL DEFAULT 0,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT IGNORE INTO gestor_tareas (id, descripcion, completada) VALUES
('t-node-001', 'Configurar conexión a base de datos relacional SQL y endpoints REST', 1),
('t-node-002', 'Sincronizar persistencia híbrida entre servidor y navegador', 1),
('t-node-003', 'Validar suite de pruebas automatizadas con node:test', 0);

CREATE TABLE IF NOT EXISTS gestor_eventos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ts DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  tipo VARCHAR(60) NOT NULL,
  tarea_id VARCHAR(64) NOT NULL,
  descripcion VARCHAR(255) DEFAULT ''
);

-- 4. FINANZAS APP (Control de Ingresos y Gastos COP)
CREATE TABLE IF NOT EXISTS finanzas_transacciones (
  id BIGINT PRIMARY KEY,
  concepto VARCHAR(180) NOT NULL,
  monto BIGINT NOT NULL,
  tipo VARCHAR(20) NOT NULL,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT IGNORE INTO finanzas_transacciones (id, concepto, monto, tipo) VALUES
(101, 'Salario Desarrollo Full-Stack MEAN & SQL', 5800000, 'ingreso'),
(102, 'Consultoría Arquitectura API REST & Base de Datos', 1450000, 'ingreso'),
(103, 'Infraestructura Cloud, Dominio & Hosting BD', 380000, 'gasto'),
(104, 'Licencias JetBrains, Copilot & Herramientas Dev', 220000, 'gasto');

-- 5. TABLERO KANBAN SCRUM
CREATE TABLE IF NOT EXISTS kanban_tareas (
  id VARCHAR(64) PRIMARY KEY,
  texto VARCHAR(255) NOT NULL,
  columna VARCHAR(30) NOT NULL DEFAULT 'pendiente',
  orden INT NOT NULL DEFAULT 0,
  actualizado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT IGNORE INTO kanban_tareas (id, texto, columna, orden) VALUES
('k-1', 'Diseñar esquema relacional SQLite/MySQL/PostgreSQL y migraciones', 'completado', 1),
('k-2', 'Desplegar Portafolio Full-Stack en producción (Netlify + BD Real)', 'completado', 2),
('k-3', 'Integrar middleware de autenticación JWT y roles RBAC en BitShop', 'progreso', 1),
('k-4', 'Conectar sincronización en tiempo real en todos los módulos del portafolio', 'pendiente', 1);

-- 6. BITSHOP REST API (Usuarios JWT + Productos)
CREATE TABLE IF NOT EXISTS bitshop_users (
  _id VARCHAR(64) PRIMARY KEY,
  username VARCHAR(80) NOT NULL,
  email VARCHAR(120) NOT NULL UNIQUE,
  password_plain_demo VARCHAR(80) NOT NULL,
  phone VARCHAR(40) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'client'
);

INSERT IGNORE INTO bitshop_users (_id, username, email, password_plain_demo, phone, role) VALUES
('usr-admin-01', 'admin_fredy', 'admin@bitshop.local', 'Admin123*', '3152388315', 'admin'),
('usr-client-01', 'cliente_demo', 'cliente@bitshop.local', 'Cliente123*', '3001234567', 'client');

CREATE TABLE IF NOT EXISTS bitshop_products (
  _id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(160) NOT NULL,
  price BIGINT NOT NULL,
  availableElements INT NOT NULL DEFAULT 10,
  description TEXT
);

INSERT IGNORE INTO bitshop_products (_id, name, price, availableElements, description) VALUES
('prod-bit-01', 'MacBook Pro 16" M3 Max (36GB RAM / 1TB NVMe)', 12450000, 8, 'Estación portátil para ingeniería de software, contenedores Docker y compilación rápida.'),
('prod-bit-02', 'Monitor Dell UltraSharp 34" Curved USB-C Hub', 3290000, 14, 'Panel IPS WQHD con calibración de color de fábrica y entrega de energía de 90W.'),
('prod-bit-03', 'Teclado Mecánico Keychron Q1 Pro Wireless QMK/VIA', 890000, 22, 'Chasis CNC de aluminio completo con switches táctiles lubricados y conexión Bluetooth 5.1.'),
('prod-bit-04', 'Silla Ergonómica Herman Miller Aeron Remastered', 5400000, 5, 'Soporte lumbar PostureFit SL diseñado para jornadas intensivas de desarrollo.');

-- 7. MONGODB DBZ-V2 PLAYGROUND
CREATE TABLE IF NOT EXISTS mongo_characters (
  _id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  species VARCHAR(60) NOT NULL,
  edad INT NOT NULL,
  powerLevel BIGINT NOT NULL
);

INSERT IGNORE INTO mongo_characters (_id, name, species, edad, powerLevel) VALUES
('dbz-01', 'Son Goku (Ultra Instinct)', 'Saiyan', 44, 950000000),
('dbz-02', 'Vegeta (Ultra Ego)', 'Saiyan', 48, 940000000),
('dbz-03', 'Piccolo (Orange Form)', 'Namekian', 31, 780000000),
('dbz-04', 'Son Gohan (Beast Mode)', 'Saiyan', 27, 960000000),
('dbz-05', 'Broly (Full Power)', 'Saiyan', 48, 930000000);

-- 8. TIENDA ONLINE (BIT Shop Pedidos & Carrito)
CREATE TABLE IF NOT EXISTS tienda_pedidos (
  id VARCHAR(64) PRIMARY KEY,
  cliente VARCHAR(120) NOT NULL,
  items_json LONGTEXT NOT NULL,
  total BIGINT NOT NULL,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 9. NOTESDB (Sincronización Servidor + IndexedDB)
CREATE TABLE IF NOT EXISTS notesdb_notas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(60) NOT NULL DEFAULT 'Trabajo',
  created_at VARCHAR(60) NOT NULL
);

INSERT IGNORE INTO notesdb_notas (id, title, category, created_at) VALUES
(1, 'Arquitectura RESTful con Node.js, Express y autenticación JWT en producción', 'Trabajo', '2026-11-26 10:00:00'),
(2, 'Persistencia híbrida: Base de Datos Relacional SQL + IndexedDB en el navegador', 'Estudio', '2026-11-26 11:30:00'),
(3, 'Diseño de componentes reactivos y calendario FullCalendar v6 en Angular 16 SPA', 'Idea', '2026-11-26 14:15:00');

-- 10. AGENDA & CALENDARIO (Procrastination Nightmare Angular 16 + FullCalendar)
CREATE TABLE IF NOT EXISTS agenda_eventos (
  id VARCHAR(64) PRIMARY KEY,
  title VARCHAR(180) NOT NULL,
  start_date VARCHAR(40) NOT NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'Sprint',
  color VARCHAR(25) NOT NULL DEFAULT '#38bdf8'
);

INSERT IGNORE INTO agenda_eventos (id, title, start_date, category, color) VALUES
('ev-101', 'Sprint Planning & Arquitectura Base de Datos SQL', '2026-11-26', 'Scrum', '#38bdf8'),
('ev-102', 'Despliegue Continuo (CI/CD) en Netlify Functions', '2026-11-27', 'DevOps', '#10b981'),
('ev-103', 'Code Review & Auditoría de Seguridad JWT / RBAC', '2026-11-28', 'Backend', '#a855f7'),
('ev-104', 'Demo Ejecutiva de Portafolio Full-Stack MEAN', '2026-11-30', 'Release', '#f59e0b');

-- 11. ALMACÉN CLAVE-VALOR PARA SINCRONIZACIÓN DE MÓDULOS (proyectoBit, Favoritos CineSearch, Rick&Morty, SketchPad, ts_api)
CREATE TABLE IF NOT EXISTS portfolio_kv_store (
  clave VARCHAR(120) PRIMARY KEY,
  valor_json LONGTEXT NOT NULL,
  actualizado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
