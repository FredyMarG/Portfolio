<?php

declare(strict_types=1);

namespace App\Models;

use App\Core\Database;

/**
 * ============================================================================
 * MODELO PROVEEDOR (app/Models/Proveedor.php)
 * ============================================================================
 * Administra el directorio de proveedores para asociarlos a las entradas
 * de mercancía en el inventario.
 * ============================================================================
 */
class Proveedor
{
    private static bool $tableChecked = false;

    /**
     * Garantiza que la tabla `proveedores` exista en MySQL (migración automática).
     */
    private static function ensureTable(\PDO $pdo): void
    {
        if (self::$tableChecked) {
            return;
        }
        $pdo->exec(
            "CREATE TABLE IF NOT EXISTS `proveedores` (
                `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                `nombre` VARCHAR(150) NOT NULL,
                `nit` VARCHAR(50) NULL,
                `telefono` VARCHAR(30) NULL,
                `email` VARCHAR(120) NULL,
                `direccion` VARCHAR(200) NULL,
                `creado_en` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB"
        );
        self::$tableChecked = true;
    }

    /**
     * Lista todos los proveedores ordenados alfabéticamente con filtro opcional.
     */
    public static function all(string $q = ''): array
    {
        $pdo = Database::getConnection();
        self::ensureTable($pdo);

        $sql = 'SELECT * FROM proveedores';
        $params = [];
        if ($q !== '') {
            $sql .= ' WHERE nombre LIKE :q1 OR nit LIKE :q2 OR telefono LIKE :q3';
            $params = ['q1' => "%{$q}%", 'q2' => "%{$q}%", 'q3' => "%{$q}%"];
        }
        $sql .= ' ORDER BY nombre ASC';

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    /**
     * Registra un nuevo proveedor y devuelve su ID generado.
     */
    public static function create(array $data): int
    {
        $pdo = Database::getConnection();
        self::ensureTable($pdo);
        $stmt = $pdo->prepare(
            'INSERT INTO proveedores (nombre, nit, telefono, email, direccion)
             VALUES (:nombre, :nit, :telefono, :email, :direccion)'
        );
        $stmt->execute([
            'nombre' => trim($data['nombre']),
            'nit' => trim($data['nit'] ?? '') ?: null,
            'telefono' => trim($data['telefono'] ?? '') ?: null,
            'email' => trim($data['email'] ?? '') ?: null,
            'direccion' => trim($data['direccion'] ?? '') ?: null,
        ]);
        return (int)$pdo->lastInsertId();
    }

    /**
     * Actualiza los datos de un proveedor existente.
     */
    public static function update(int $id, array $data): void
    {
        $pdo = Database::getConnection();
        self::ensureTable($pdo);
        $stmt = $pdo->prepare(
            'UPDATE proveedores
             SET nombre = :nombre, nit = :nit, telefono = :telefono, email = :email, direccion = :direccion
             WHERE id = :id'
        );
        $stmt->execute([
            'id' => $id,
            'nombre' => trim($data['nombre']),
            'nit' => trim($data['nit'] ?? '') ?: null,
            'telefono' => trim($data['telefono'] ?? '') ?: null,
            'email' => trim($data['email'] ?? '') ?: null,
            'direccion' => trim($data['direccion'] ?? '') ?: null,
        ]);
    }

    /**
     * Elimina un proveedor del directorio por su ID.
     */
    public static function delete(int $id): void
    {
        $pdo = Database::getConnection();
        self::ensureTable($pdo);
        $stmt = $pdo->prepare('DELETE FROM proveedores WHERE id = :id');
        $stmt->execute(['id' => $id]);
    }
}
