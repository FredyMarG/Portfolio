<?php

declare(strict_types=1);

namespace App\Models;

use App\Core\Database;

/**
 * ============================================================================
 * MODELO CATEGORIA (app/Models/Categoria.php)
 * ============================================================================
 * Administra las categorías para clasificar los productos del inventario.
 * ============================================================================
 */
class Categoria
{
    /**
     * Retorna todas las categorías ordenadas alfabéticamente.
     */
    public static function all(): array
    {
        $pdo = Database::getConnection();
        return $pdo->query('SELECT * FROM categorias ORDER BY nombre ASC')->fetchAll();
    }

    /**
     * Inserta una nueva categoría y devuelve su ID generado.
     */
    public static function create(string $nombre, ?string $descripcion = null): int
    {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare('INSERT INTO categorias (nombre, descripcion) VALUES (:nombre, :descripcion)');
        $stmt->execute([
            'nombre' => trim($nombre),
            'descripcion' => $descripcion ? trim($descripcion) : null,
        ]);
        return (int)$pdo->lastInsertId();
    }

    /**
     * Actualiza el nombre y descripción de una categoría existente.
     */
    public static function update(int $id, string $nombre, ?string $descripcion = null): void
    {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare('UPDATE categorias SET nombre = :nombre, descripcion = :descripcion WHERE id = :id');
        $stmt->execute([
            'id' => $id,
            'nombre' => trim($nombre),
            'descripcion' => $descripcion ? trim($descripcion) : null,
        ]);
    }

    /**
     * Elimina una categoría (los productos asociados quedan con categoria_id = NULL).
     */
    public static function delete(int $id): void
    {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare('DELETE FROM categorias WHERE id = :id');
        $stmt->execute(['id' => $id]);
    }
}
