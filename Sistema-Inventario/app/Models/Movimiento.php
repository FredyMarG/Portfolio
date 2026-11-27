<?php

declare(strict_types=1);

namespace App\Models;

use App\Core\Database;

/**
 * ============================================================================
 * MODELO MOVIMIENTO (app/Models/Movimiento.php)
 * ============================================================================
 * Consulta el historial de movimientos (Kardex) generado automáticamente por
 * entradas de mercancía, ventas en facturación, ajustes y anulaciones.
 * ============================================================================
 */
class Movimiento
{
    /**
     * Lista movimientos de inventario con filtros opcionales por producto o tipo.
     */
    public static function all(array $filters = [], int $limit = 100): array
    {
        $pdo = Database::getConnection();
        $where = [];
        $params = [];

        if (!empty($filters['producto_id'])) {
            $where[] = 'm.producto_id = :producto_id';
            $params['producto_id'] = (int)$filters['producto_id'];
        }
        if (!empty($filters['tipo'])) {
            $where[] = 'm.tipo = :tipo';
            $params['tipo'] = $filters['tipo'];
        }
        if (!empty($filters['fecha_desde'])) {
            $where[] = 'DATE(m.creado_en) >= :fecha_desde';
            $params['fecha_desde'] = $filters['fecha_desde'];
        }
        if (!empty($filters['fecha_hasta'])) {
            $where[] = 'DATE(m.creado_en) <= :fecha_hasta';
            $params['fecha_hasta'] = $filters['fecha_hasta'];
        }

        $sql = 'SELECT m.*, p.codigo AS producto_codigo, p.nombre AS producto_nombre, u.nombre AS usuario_nombre
                FROM movimientos_inventario m
                INNER JOIN productos p ON p.id = m.producto_id
                INNER JOIN usuarios u ON u.id = m.usuario_id';
        if ($where) {
            $sql .= ' WHERE ' . implode(' AND ', $where);
        }
        $sql .= ' ORDER BY m.id DESC LIMIT :lim';

        $stmt = $pdo->prepare($sql);
        foreach ($params as $key => $val) {
            $stmt->bindValue(':' . $key, $val);
        }
        $stmt->bindValue(':lim', $limit, \PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }
}
