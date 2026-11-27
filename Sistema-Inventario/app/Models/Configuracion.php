<?php

declare(strict_types=1);

namespace App\Models;

use App\Core\Database;

/**
 * ============================================================================
 * MODELO CONFIGURACION (app/Models/Configuracion.php)
 * ============================================================================
 * Gestiona los datos de la empresa (nombre, NIT, dirección, teléfono y pie
 * de factura) para mostrarlos en comprobantes impresos y reportes PDF.
 * ============================================================================
 */
class Configuracion
{
    private static bool $tableChecked = false;

    /**
     * Garantiza que la tabla `configuracion` exista con su registro inicial.
     */
    private static function ensureTable(\PDO $pdo): void
    {
        if (self::$tableChecked) {
            return;
        }

        $pdo->exec(
            "CREATE TABLE IF NOT EXISTS `configuracion` (
                `id` TINYINT UNSIGNED PRIMARY KEY,
                `nombre_empresa` VARCHAR(150) NOT NULL DEFAULT 'StockFlow Pro',
                `nit` VARCHAR(50) NULL,
                `direccion` VARCHAR(200) NULL,
                `telefono` VARCHAR(50) NULL,
                `email` VARCHAR(120) NULL,
                `pie_factura` VARCHAR(255) NULL DEFAULT 'Gracias por su compra.',
                `tasa_usd` DECIMAL(12,2) NOT NULL DEFAULT 4200.00,
                `actualizado_en` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB"
        );

        $col = $pdo->query("SHOW COLUMNS FROM configuracion LIKE 'tasa_usd'")->fetch();
        if (!$col) {
            $pdo->exec("ALTER TABLE configuracion ADD COLUMN tasa_usd DECIMAL(12,2) NOT NULL DEFAULT 4200.00 AFTER pie_factura");
        }

        $pdo->exec(
            "INSERT IGNORE INTO `configuracion` (`id`, `nombre_empresa`, `pie_factura`, `tasa_usd`)
             VALUES (1, 'StockFlow Pro', 'Gracias por su compra.', 4200.00)"
        );

        self::$tableChecked = true;
    }

    /**
     * Obtiene la configuración actual de la empresa.
     */
    public static function get(): array
    {
        $pdo = Database::getConnection();
        self::ensureTable($pdo);
        $row = $pdo->query('SELECT * FROM configuracion WHERE id = 1 LIMIT 1')->fetch();
        return $row ?: [
            'id' => 1,
            'nombre_empresa' => 'StockFlow Pro',
            'nit' => '',
            'direccion' => '',
            'telefono' => '',
            'email' => '',
            'pie_factura' => 'Gracias por su compra.',
            'tasa_usd' => 4200.00,
        ];
    }

    /**
     * Actualiza los datos configurables de la empresa.
     */
    public static function save(array $data): void
    {
        $pdo = Database::getConnection();
        self::ensureTable($pdo);
        $tasaUsd = max(1.0, round((float)($data['tasa_usd'] ?? 4200.0), 2));
        $stmt = $pdo->prepare(
            'UPDATE configuracion
             SET nombre_empresa = :nombre_empresa,
                 nit = :nit,
                 direccion = :direccion,
                 telefono = :telefono,
                 email = :email,
                 pie_factura = :pie_factura,
                 tasa_usd = :tasa_usd
             WHERE id = 1'
        );
        $stmt->execute([
            'nombre_empresa' => trim($data['nombre_empresa'] ?? '') ?: 'StockFlow Pro',
            'nit' => trim($data['nit'] ?? '') ?: null,
            'direccion' => trim($data['direccion'] ?? '') ?: null,
            'telefono' => trim($data['telefono'] ?? '') ?: null,
            'email' => trim($data['email'] ?? '') ?: null,
            'pie_factura' => trim($data['pie_factura'] ?? '') ?: null,
            'tasa_usd' => $tasaUsd,
        ]);
    }
}
