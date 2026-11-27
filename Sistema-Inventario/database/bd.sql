-- ============================================================================
-- ESQUEMA DE BASE DE DATOS MYSQL / MARIADB (database/bd.sql)
-- Sistema de Inventario y Facturación - StockFlow Pro
-- Compatible con phpMyAdmin (Importar) y MySQL/MariaDB CLI (XAMPP).
-- ============================================================================

CREATE DATABASE IF NOT EXISTS `bd`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `bd`;

-- 1. Roles y permisos
CREATE TABLE IF NOT EXISTS `roles` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `nombre` VARCHAR(30) NOT NULL UNIQUE,
  `descripcion` VARCHAR(150) NOT NULL
) ENGINE=InnoDB;

-- 2. Usuarios
CREATE TABLE IF NOT EXISTS `usuarios` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `nombre` VARCHAR(120) NOT NULL,
  `email` VARCHAR(120) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `rol_id` INT UNSIGNED NOT NULL,
  `activo` TINYINT(1) NOT NULL DEFAULT 1,
  `creado_en` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_usuarios_rol` FOREIGN KEY (`rol_id`) REFERENCES `roles`(`id`)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 3. Categorías de productos
CREATE TABLE IF NOT EXISTS `categorias` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `nombre` VARCHAR(80) NOT NULL UNIQUE,
  `descripcion` VARCHAR(255) NULL
) ENGINE=InnoDB;

-- 4. Productos
CREATE TABLE IF NOT EXISTS `productos` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `codigo` VARCHAR(50) NOT NULL UNIQUE,
  `nombre` VARCHAR(150) NOT NULL,
  `descripcion` TEXT NULL,
  `categoria_id` INT UNSIGNED NULL,
  `precio_compra` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `precio_venta` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `stock` INT NOT NULL DEFAULT 0,
  `stock_minimo` INT NOT NULL DEFAULT 5,
  `unidad` VARCHAR(30) NOT NULL DEFAULT 'Unidad',
  `activo` TINYINT(1) NOT NULL DEFAULT 1,
  `creado_en` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_productos_nombre` (`nombre`),
  INDEX `idx_productos_activo` (`activo`),
  CONSTRAINT `fk_productos_categoria` FOREIGN KEY (`categoria_id`) REFERENCES `categorias`(`id`)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

-- 5. Movimientos de inventario (Entradas, Ventas, Ajustes, Anulaciones)
CREATE TABLE IF NOT EXISTS `movimientos_inventario` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `producto_id` INT UNSIGNED NOT NULL,
  `usuario_id` INT UNSIGNED NOT NULL,
  `tipo` ENUM('entrada', 'venta', 'ajuste_positivo', 'ajuste_negativo', 'anulacion') NOT NULL,
  `cantidad` INT NOT NULL,
  `stock_anterior` INT NOT NULL,
  `stock_nuevo` INT NOT NULL,
  `costo_unitario` DECIMAL(12,2) NULL,
  `referencia` VARCHAR(100) NULL,
  `motivo` VARCHAR(255) NULL,
  `creado_en` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_mov_producto` (`producto_id`),
  INDEX `idx_mov_tipo` (`tipo`),
  INDEX `idx_mov_fecha` (`creado_en`),
  CONSTRAINT `fk_mov_producto` FOREIGN KEY (`producto_id`) REFERENCES `productos`(`id`)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT `fk_mov_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 6. Facturas (Cabecera)
CREATE TABLE IF NOT EXISTS `facturas` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `numero` VARCHAR(30) NOT NULL UNIQUE,
  `usuario_id` INT UNSIGNED NOT NULL,
  `cliente_nombre` VARCHAR(150) NOT NULL DEFAULT 'Consumidor Final',
  `cliente_documento` VARCHAR(50) NULL,
  `cliente_telefono` VARCHAR(30) NULL,
  `cliente_email` VARCHAR(120) NULL,
  `metodo_pago` ENUM('efectivo', 'tarjeta', 'transferencia') NOT NULL DEFAULT 'efectivo',
  `moneda` ENUM('COP', 'USD') NOT NULL DEFAULT 'COP',
  `cliente_id` INT UNSIGNED NULL,
  `subtotal` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `impuesto_porcentaje` DECIMAL(5,2) NOT NULL DEFAULT 19.00,
  `impuesto_monto` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `descuento` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `total` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `monto_recibido` DECIMAL(12,2) NULL,
  `cambio` DECIMAL(12,2) NULL,
  `estado` ENUM('emitida', 'anulada') NOT NULL DEFAULT 'emitida',
  `notas` TEXT NULL,
  `creado_en` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_facturas_fecha` (`creado_en`),
  INDEX `idx_facturas_estado` (`estado`),
  CONSTRAINT `fk_facturas_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 7. Detalle de Facturas
CREATE TABLE IF NOT EXISTS `detalle_facturas` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `factura_id` INT UNSIGNED NOT NULL,
  `producto_id` INT UNSIGNED NOT NULL,
  `cantidad` INT NOT NULL,
  `precio_unitario` DECIMAL(12,2) NOT NULL,
  `subtotal` DECIMAL(12,2) NOT NULL,
  CONSTRAINT `fk_det_factura` FOREIGN KEY (`factura_id`) REFERENCES `facturas`(`id`)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT `fk_det_producto` FOREIGN KEY (`producto_id`) REFERENCES `productos`(`id`)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 8. Configuración de la empresa
CREATE TABLE IF NOT EXISTS `configuracion` (
  `id` TINYINT UNSIGNED PRIMARY KEY,
  `nombre_empresa` VARCHAR(150) NOT NULL DEFAULT 'StockFlow Pro',
  `nit` VARCHAR(50) NULL,
  `direccion` VARCHAR(200) NULL,
  `telefono` VARCHAR(50) NULL,
  `email` VARCHAR(120) NULL,
  `pie_factura` VARCHAR(255) NULL DEFAULT 'Gracias por su compra.',
  `tasa_usd` DECIMAL(12,2) NOT NULL DEFAULT 4200.00,
  `actualizado_en` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

INSERT IGNORE INTO `configuracion` (`id`, `nombre_empresa`, `pie_factura`, `tasa_usd`) VALUES
  (1, 'StockFlow Pro', 'Gracias por su compra.', 4200.00);

-- 9. Directorio de Clientes
CREATE TABLE IF NOT EXISTS `clientes` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `nombre` VARCHAR(150) NOT NULL,
  `documento` VARCHAR(50) NULL,
  `telefono` VARCHAR(30) NULL,
  `email` VARCHAR(120) NULL,
  `direccion` VARCHAR(200) NULL,
  `creado_en` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 10. Proveedores
CREATE TABLE IF NOT EXISTS `proveedores` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `nombre` VARCHAR(150) NOT NULL,
  `nit` VARCHAR(50) NULL,
  `telefono` VARCHAR(30) NULL,
  `email` VARCHAR(120) NULL,
  `direccion` VARCHAR(200) NULL,
  `creado_en` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Datos iniciales
INSERT IGNORE INTO `roles` (`id`, `nombre`, `descripcion`) VALUES
  (1, 'admin', 'Administrador con acceso total al sistema'),
  (2, 'vendedor', 'Vendedor / Cajero con acceso a facturación y consulta de productos'),
  (3, 'almacen', 'Almacenista con acceso a CRUD de productos y entradas de inventario');

-- Contraseña por defecto para todos los usuarios demo: admin123
-- Hash generado con password_hash('admin123', PASSWORD_BCRYPT)
INSERT IGNORE INTO `usuarios` (`id`, `nombre`, `email`, `password_hash`, `rol_id`, `activo`) VALUES
  (1, 'Administrador Principal', 'admin@inventario.local', '$2y$10$EXA8rfn98BOI9q6UBa.GKeMqCaCo0nZYPMv9zf391Zi1ZK9J2zwi2', 1, 1),
  (2, 'Carlos Vendedor', 'vendedor@inventario.local', '$2y$10$EXA8rfn98BOI9q6UBa.GKeMqCaCo0nZYPMv9zf391Zi1ZK9J2zwi2', 2, 1),
  (3, 'Laura Almacén', 'almacen@inventario.local', '$2y$10$EXA8rfn98BOI9q6UBa.GKeMqCaCo0nZYPMv9zf391Zi1ZK9J2zwi2', 3, 1);

INSERT IGNORE INTO `categorias` (`id`, `nombre`, `descripcion`) VALUES
  (1, 'Electrónica', 'Equipos, accesorios y periféricos'),
  (2, 'Oficina', 'Papelería y suministros de oficina'),
  (3, 'Hogar', 'Artículos para el hogar'),
  (4, 'General', 'Productos varios');

INSERT IGNORE INTO `productos` (`id`, `codigo`, `nombre`, `descripcion`, `categoria_id`, `precio_compra`, `precio_venta`, `stock`, `stock_minimo`, `unidad`, `activo`) VALUES
  (1, 'PROD-001', 'Teclado Mecánico RGB', 'Teclado USB switch azul retroiluminado', 1, 135000.00, 220000.00, 25, 5, 'Unidad', 1),
  (2, 'PROD-002', 'Mouse Inalámbrico Ergonómico', 'Mouse óptico 2.4GHz recargable', 1, 48000.00, 89000.00, 40, 8, 'Unidad', 1),
  (3, 'PROD-003', 'Monitor LED 24" Full HD', 'Monitor IPS 75Hz HDMI/VGA', 1, 450000.00, 680000.00, 8, 3, 'Unidad', 1),
  (4, 'PROD-004', 'Resma Papel Carta 500h', 'Papel bond 75g blanco', 2, 16500.00, 26000.00, 60, 10, 'Paquete', 1),
  (5, 'PROD-005', 'Silla Ergonómica de Oficina', 'Silla con soporte lumbar ajustable', 2, 340000.00, 549000.00, 4, 5, 'Unidad', 1);
