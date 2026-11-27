<?php

declare(strict_types=1);

namespace App\Models;

use App\Core\Database;

/**
 * ============================================================================
 * MODELO CLIENTE (app/Models/Cliente.php)
 * ============================================================================
 * Administra el directorio de clientes para selección rápida en el POS y
 * consulta de historial de facturación.
 * ============================================================================
 */
class Cliente
{
    private static bool $tableChecked = false;

    /**
     * Garantiza que la tabla `clientes` exista en MySQL (migración automática).
     */
    private static function ensureTable(\PDO $pdo): void
    {
        if (self::$tableChecked) {
            return;
        }
        $pdo->exec(
            "CREATE TABLE IF NOT EXISTS `clientes` (
                `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                `nombre` VARCHAR(150) NOT NULL,
                `documento` VARCHAR(50) NULL,
                `telefono` VARCHAR(30) NULL,
                `email` VARCHAR(120) NULL,
                `direccion` VARCHAR(200) NULL,
                `creado_en` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB"
        );
        self::$tableChecked = true;
    }

    /**
     * Lista todos los clientes ordenados alfabéticamente con filtro opcional.
     */
    public static function all(string $q = ''): array
    {
        $pdo = Database::getConnection();
        self::ensureTable($pdo);

        $sql = 'SELECT * FROM clientes';
        $params = [];
        if ($q !== '') {
            $sql .= ' WHERE nombre LIKE :q1 OR documento LIKE :q2 OR telefono LIKE :q3';
            $params = ['q1' => "%{$q}%", 'q2' => "%{$q}%", 'q3' => "%{$q}%"];
        }
        $sql .= ' ORDER BY nombre ASC';

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    /**
     * Registra un nuevo cliente y devuelve su ID generado.
     */
    public static function create(array $data): int
    {
        $pdo = Database::getConnection();
        self::ensureTable($pdo);
        $stmt = $pdo->prepare(
            'INSERT INTO clientes (nombre, documento, telefono, email, direccion)
             VALUES (:nombre, :documento, :telefono, :email, :direccion)'
        );
        $stmt->execute([
            'nombre' => trim($data['nombre']),
            'documento' => trim($data['documento'] ?? '') ?: null,
            'telefono' => trim($data['telefono'] ?? '') ?: null,
            'email' => trim($data['email'] ?? '') ?: null,
            'direccion' => trim($data['direccion'] ?? '') ?: null,
        ]);
        return (int)$pdo->lastInsertId();
    }

    /**
     * Actualiza los datos de contacto de un cliente existente.
     */
    public static function update(int $id, array $data): void
    {
        $pdo = Database::getConnection();
        self::ensureTable($pdo);
        $stmt = $pdo->prepare(
            'UPDATE clientes
             SET nombre = :nombre, documento = :documento, telefono = :telefono, email = :email, direccion = :direccion
             WHERE id = :id'
        );
        $stmt->execute([
            'id' => $id,
            'nombre' => trim($data['nombre']),
            'documento' => trim($data['documento'] ?? '') ?: null,
            'telefono' => trim($data['telefono'] ?? '') ?: null,
            'email' => trim($data['email'] ?? '') ?: null,
            'direccion' => trim($data['direccion'] ?? '') ?: null,
        ]);
    }

    /**
     * Elimina un cliente del directorio por su ID.
     */
    public static function delete(int $id): void
    {
        $pdo = Database::getConnection();
        self::ensureTable($pdo);
        $stmt = $pdo->prepare('DELETE FROM clientes WHERE id = :id');
        $stmt->execute(['id' => $id]);
    }
}
