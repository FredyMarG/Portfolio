-- ============================================================================
-- MIGRACIÓN AUTOMÁTICA NETLIFY DATABASE (PostgreSQL)
-- (netlify/database/migrations/20261126000000_init_portfolio.sql)
-- ============================================================================
-- Propósito:
--   Aplicar automáticamente el esquema relacional en Netlify Database durante
--   el despliegue continuo del portafolio. Comentado tabla por tabla en español.
-- ============================================================================

-- 1. Tabla de destinos turísticos para Turismo MEAN
CREATE TABLE IF NOT EXISTS turismo_destinos (
  id VARCHAR(36) PRIMARY KEY,                            -- Identificador único del destino
  nombre VARCHAR(140) NOT NULL,                          -- Nombre del destino turístico
  ciudad VARCHAR(90) NOT NULL,                           -- Ciudad o departamento
  descripcion TEXT NOT NULL,                             -- Descripción de la experiencia
  precio NUMERIC(12, 2) NOT NULL DEFAULT 0,              -- Precio en pesos colombianos (COP)
  calificacion NUMERIC(3, 1) NOT NULL DEFAULT 5.0,       -- Calificación promedio (1.0 a 5.0)
  fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP -- Fecha de creación
);

-- 2. Tabla de movimientos contables para Finanzas APP
CREATE TABLE IF NOT EXISTS finanzas_transacciones (
  id BIGINT PRIMARY KEY,                                 -- ID único de la transacción
  concepto VARCHAR(180) NOT NULL,                        -- Descripción del ingreso o gasto
  monto BIGINT NOT NULL,                                 -- Monto entero en COP
  tipo VARCHAR(20) NOT NULL,                             -- 'ingreso' o 'gasto'
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP -- Fecha de registro
);

-- 3. Tabla de tarjetas ágiles para Tablero Kanban Scrum
CREATE TABLE IF NOT EXISTS kanban_tareas (
  id VARCHAR(64) PRIMARY KEY,                            -- ID único de la tarea Kanban
  texto VARCHAR(255) NOT NULL,                           -- Descripción de la historia de usuario
  columna VARCHAR(30) NOT NULL DEFAULT 'pendiente',      -- Columna ('pendiente', 'progreso', 'completado')
  orden INTEGER NOT NULL DEFAULT 0,                      -- Posición dentro de la columna
  actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP -- Fecha de última modificación
);

-- 4. Tabla de tareas para Gestor de Tareas Node.js
CREATE TABLE IF NOT EXISTS gestor_tareas (
  id VARCHAR(64) PRIMARY KEY,                            -- UUID de la tarea
  descripcion VARCHAR(255) NOT NULL,                     -- Texto de la tarea
  completada BOOLEAN NOT NULL DEFAULT FALSE,             -- Estado completado/pendiente
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP -- Fecha de creación
);

-- 5. Tabla de catálogo de productos para BitShop REST API
CREATE TABLE IF NOT EXISTS bitshop_products (
  _id VARCHAR(64) PRIMARY KEY,                           -- ID único del producto
  name VARCHAR(160) NOT NULL,                            -- Nombre del producto
  price BIGINT NOT NULL,                                 -- Precio unitario en COP
  availableElements INTEGER NOT NULL DEFAULT 10,         -- Stock disponible
  description TEXT                                       -- Descripción del producto
);

-- 6. Tabla de personajes para MongoDB DBZ-V2 Playground
CREATE TABLE IF NOT EXISTS mongo_characters (
  _id VARCHAR(64) PRIMARY KEY,                           -- ID del personaje
  name VARCHAR(100) NOT NULL,                            -- Nombre del guerrero
  species VARCHAR(60) NOT NULL,                          -- Especie (Saiyan, Namekian)
  edad INTEGER NOT NULL,                                 -- Edad
  powerLevel BIGINT NOT NULL                             -- Nivel de poder
);

-- 7. Tabla de eventos de calendario para Procrastination Nightmare Angular 16 + FullCalendar
CREATE TABLE IF NOT EXISTS agenda_eventos (
  id VARCHAR(64) PRIMARY KEY,                            -- ID único del evento
  title VARCHAR(180) NOT NULL,                           -- Título del evento
  start_date VARCHAR(40) NOT NULL,                       -- Fecha YYYY-MM-DD
  category VARCHAR(50) NOT NULL DEFAULT 'Sprint',        -- Categoría del evento
  color VARCHAR(25) NOT NULL DEFAULT '#38bdf8'           -- Color hexadecimal en el calendario
);

-- 8. Almacén clave-valor para sincronización de módulos (Suite 7 módulos, Carrito, NotesDB, SketchPad)
CREATE TABLE IF NOT EXISTS portfolio_kv_store (
  clave VARCHAR(120) PRIMARY KEY,                        -- Clave identificadora del módulo
  valor_json TEXT NOT NULL,                              -- Datos serializados en JSON
  actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP -- Marca de tiempo de actualización
);
