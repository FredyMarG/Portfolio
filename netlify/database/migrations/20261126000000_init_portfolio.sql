-- ============================================================================
-- MIGRACIÓN AUTOMÁTICA NETLIFY DATABASE (PostgreSQL)
-- ============================================================================
CREATE TABLE IF NOT EXISTS turismo_destinos (
  id VARCHAR(36) PRIMARY KEY,
  nombre VARCHAR(140) NOT NULL,
  ciudad VARCHAR(90) NOT NULL,
  descripcion TEXT NOT NULL,
  precio NUMERIC(12, 2) NOT NULL DEFAULT 0,
  calificacion NUMERIC(3, 1) NOT NULL DEFAULT 5.0,
  fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS finanzas_transacciones (
  id BIGINT PRIMARY KEY,
  concepto VARCHAR(180) NOT NULL,
  monto BIGINT NOT NULL,
  tipo VARCHAR(20) NOT NULL,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS kanban_tareas (
  id VARCHAR(64) PRIMARY KEY,
  texto VARCHAR(255) NOT NULL,
  columna VARCHAR(30) NOT NULL DEFAULT 'pendiente',
  orden INTEGER NOT NULL DEFAULT 0,
  actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS gestor_tareas (
  id VARCHAR(64) PRIMARY KEY,
  descripcion VARCHAR(255) NOT NULL,
  completada BOOLEAN NOT NULL DEFAULT FALSE,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bitshop_products (
  _id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(160) NOT NULL,
  price BIGINT NOT NULL,
  availableElements INTEGER NOT NULL DEFAULT 10,
  description TEXT
);

CREATE TABLE IF NOT EXISTS mongo_characters (
  _id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  species VARCHAR(60) NOT NULL,
  edad INTEGER NOT NULL,
  powerLevel BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS agenda_eventos (
  id VARCHAR(64) PRIMARY KEY,
  title VARCHAR(180) NOT NULL,
  start_date VARCHAR(40) NOT NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'Sprint',
  color VARCHAR(25) NOT NULL DEFAULT '#38bdf8'
);

CREATE TABLE IF NOT EXISTS portfolio_kv_store (
  clave VARCHAR(120) PRIMARY KEY,
  valor_json TEXT NOT NULL,
  actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
