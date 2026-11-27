<?php

declare(strict_types=1);

namespace App\Models;

use App\Core\Database;
use RuntimeException;

/**
 * ============================================================================
 * MODELO PRODUCTO (app/Models/Producto.php)
 * ============================================================================
 * Gestiona el CRUD de productos, consultas con filtros, alertas de stock bajo
 * y las operaciones transaccionales de ingreso/ajuste de inventario.
 * ============================================================================
 */
class Producto
{
    /**
     * Lista productos aplicando filtros opcionales:
     *  - q: búsqueda parcial por nombre o código SKU.
     *  - categoria_id: filtro por categoría.
     *  - activo: '1' o '0'.
     *  - stock_bajo: true para mostrar productos con stock <= stock_minimo.
     *  - con_stock: true para mostrar solo productos con stock > 0 (POS).
     */
    public static function all(array $filters = []): array
    {
        $pdo = Database::getConnection();
        $where = [];
        $params = [];

        if (!empty($filters['q'])) {
            $where[] = '(p.nombre LIKE :q1 OR p.codigo LIKE :q2)';
            $params['q1'] = '%' . $filters['q'] . '%';
            $params['q2'] = '%' . $filters['q'] . '%';
        }
        if (!empty($filters['categoria_id'])) {
            $where[] = 'p.categoria_id = :categoria_id';
            $params['categoria_id'] = (int)$filters['categoria_id'];
        }
        if (isset($filters['activo']) && $filters['activo'] !== '') {
            $where[] = 'p.activo = :activo';
            $params['activo'] = (int)$filters['activo'];
        }
        if (!empty($filters['stock_bajo'])) {
            $where[] = 'p.stock <= p.stock_minimo';
        }
        if (!empty($filters['con_stock'])) {
            $where[] = 'p.stock > 0';
        }

        $sql = 'SELECT p.*, c.nombre AS categoria_nombre
                FROM productos p
                LEFT JOIN categorias c ON c.id = p.categoria_id';
        if ($where) {
            $sql .= ' WHERE ' . implode(' AND ', $where);
        }
        $sql .= ' ORDER BY p.id DESC';

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    /**
     * Obtiene un producto por su ID incluyendo el nombre de su categoría.
     */
    public static function find(int $id): ?array
    {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare(
            'SELECT p.*, c.nombre AS categoria_nombre
             FROM productos p
             LEFT JOIN categorias c ON c.id = p.categoria_id
             WHERE p.id = :id LIMIT 1'
        );
        $stmt->execute(['id' => $id]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    /**
     * Verifica si ya existe un producto con el código SKU indicado
     * (permite excluir un ID al editar).
     */
    public static function findByCodigo(string $codigo, ?int $excludeId = null): ?array
    {
        $pdo = Database::getConnection();
        $sql = 'SELECT id FROM productos WHERE codigo = :codigo';
        $params = ['codigo' => $codigo];
        if ($excludeId !== null) {
            $sql .= ' AND id != :exclude_id';
            $params['exclude_id'] = $excludeId;
        }
        $stmt = $pdo->prepare($sql . ' LIMIT 1');
        $stmt->execute($params);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    /**
     * Crea un nuevo producto dentro de una transacción SQL.
     * Si el stock inicial > 0, registra automáticamente el movimiento en el Kardex.
     */
    public static function create(array $data, int $usuarioId): int
    {
        $pdo = Database::getConnection();
        $pdo->beginTransaction();

        try {
            $stmt = $pdo->prepare(
                'INSERT INTO productos (codigo, nombre, descripcion, categoria_id, precio_compra, precio_venta, stock, stock_minimo, unidad, activo)
                 VALUES (:codigo, :nombre, :descripcion, :categoria_id, :precio_compra, :precio_venta, :stock, :stock_minimo, :unidad, :activo)'
            );
            $stockInicial = max(0, (int)$data['stock']);
            $stmt->execute([
                'codigo' => trim($data['codigo']),
                'nombre' => trim($data['nombre']),
                'descripcion' => trim($data['descripcion'] ?? ''),
                'categoria_id' => !empty($data['categoria_id']) ? (int)$data['categoria_id'] : null,
                'precio_compra' => (float)$data['precio_compra'],
                'precio_venta' => (float)$data['precio_venta'],
                'stock' => $stockInicial,
                'stock_minimo' => max(0, (int)($data['stock_minimo'] ?? 5)),
                'unidad' => trim($data['unidad'] ?? 'Unidad') ?: 'Unidad',
                'activo' => (int)($data['activo'] ?? 1),
            ]);

            $productId = (int)$pdo->lastInsertId();

            // Registrar movimiento inicial en Kardex si arranca con existencias
            if ($stockInicial > 0) {
                $mov = $pdo->prepare(
                    'INSERT INTO movimientos_inventario (producto_id, usuario_id, tipo, cantidad, stock_anterior, stock_nuevo, costo_unitario, referencia, motivo)
                     VALUES (:producto_id, :usuario_id, :tipo, :cantidad, :stock_anterior, :stock_nuevo, :costo_unitario, :referencia, :motivo)'
                );
                $mov->execute([
                    'producto_id' => $productId,
                    'usuario_id' => $usuarioId,
                    'tipo' => 'entrada',
                    'cantidad' => $stockInicial,
                    'stock_anterior' => 0,
                    'stock_nuevo' => $stockInicial,
                    'costo_unitario' => (float)$data['precio_compra'],
                    'referencia' => 'STOCK-INICIAL',
                    'motivo' => 'Registro inicial de producto',
                ]);
            }

            $pdo->commit();
            return $productId;
        } catch (\Throwable $e) {
            $pdo->rollBack();
            throw $e;
        }
    }

    /**
     * Actualiza los datos maestros del producto (el stock se modifica vía ingresos o ventas).
     */
    public static function update(int $id, array $data): void
    {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare(
            'UPDATE productos
             SET codigo = :codigo,
                 nombre = :nombre,
                 descripcion = :descripcion,
                 categoria_id = :categoria_id,
                 precio_compra = :precio_compra,
                 precio_venta = :precio_venta,
                 stock_minimo = :stock_minimo,
                 unidad = :unidad,
                 activo = :activo
             WHERE id = :id'
        );
        $stmt->execute([
            'id' => $id,
            'codigo' => trim($data['codigo']),
            'nombre' => trim($data['nombre']),
            'descripcion' => trim($data['descripcion'] ?? ''),
            'categoria_id' => !empty($data['categoria_id']) ? (int)$data['categoria_id'] : null,
            'precio_compra' => (float)$data['precio_compra'],
            'precio_venta' => (float)$data['precio_venta'],
            'stock_minimo' => max(0, (int)($data['stock_minimo'] ?? 5)),
            'unidad' => trim($data['unidad'] ?? 'Unidad') ?: 'Unidad',
            'activo' => (int)($data['activo'] ?? 1),
        ]);
    }

    /**
     * Elimina un producto si no tiene facturas asociadas; de lo contrario,
     * realiza un borrado lógico (activo = 0) para no romper el historial contable.
     */
    public static function delete(int $id): void
    {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare('SELECT COUNT(*) FROM detalle_facturas WHERE producto_id = :id');
        $stmt->execute(['id' => $id]);

        if ((int)$stmt->fetchColumn() > 0) {
            $upd = $pdo->prepare('UPDATE productos SET activo = 0 WHERE id = :id');
            $upd->execute(['id' => $id]);
            return;
        }

        $pdo->beginTransaction();
        try {
            $pdo->prepare('DELETE FROM movimientos_inventario WHERE producto_id = :id')->execute(['id' => $id]);
            $pdo->prepare('DELETE FROM productos WHERE id = :id')->execute(['id' => $id]);
            $pdo->commit();
        } catch (\Throwable $e) {
            $pdo->rollBack();
            throw $e;
        }
    }

    /**
     * Registra un ingreso de mercancía (suma al stock) o un ajuste manual (+/-).
     * Utiliza bloqueo pesimista (FOR UPDATE) para evitar condiciones de carrera.
     */
    public static function modifyStock(
        int $productoId,
        int $usuarioId,
        string $tipo,
        int $cantidad,
        ?float $costoUnitario = null,
        ?string $referencia = null,
        ?string $motivo = null
    ): array {
        if ($cantidad <= 0) {
            throw new RuntimeException('La cantidad debe ser mayor a cero.');
        }

        $allowedTypes = ['entrada', 'ajuste_positivo', 'ajuste_negativo'];
        if (!in_array($tipo, $allowedTypes, true)) {
            throw new RuntimeException('Tipo de movimiento no válido.');
        }

        $pdo = Database::getConnection();
        $pdo->beginTransaction();

        try {
            // Bloqueamos la fila del producto mientras actualizamos el stock
            $stmt = $pdo->prepare('SELECT id, nombre, stock, precio_compra FROM productos WHERE id = :id FOR UPDATE');
            $stmt->execute(['id' => $productoId]);
            $producto = $stmt->fetch();

            if (!$producto) {
                throw new RuntimeException('El producto seleccionado no existe.');
            }

            $stockAnterior = (int)$producto['stock'];
            $delta = ($tipo === 'ajuste_negativo') ? -$cantidad : $cantidad;
            $stockNuevo = $stockAnterior + $delta;

            if ($stockNuevo < 0) {
                throw new RuntimeException("Stock insuficiente para realizar el ajuste negativo. Stock actual: {$stockAnterior}.");
            }

            // Si es un ingreso con nuevo costo unitario, actualizamos también precio_compra
            if ($costoUnitario !== null && $costoUnitario > 0 && $tipo === 'entrada') {
                $upd = $pdo->prepare('UPDATE productos SET stock = :stock, precio_compra = :costo WHERE id = :id');
                $upd->execute([
                    'stock' => $stockNuevo,
                    'costo' => $costoUnitario,
                    'id' => $productoId,
                ]);
            } else {
                $upd = $pdo->prepare('UPDATE productos SET stock = :stock WHERE id = :id');
                $upd->execute([
                    'stock' => $stockNuevo,
                    'id' => $productoId,
                ]);
            }

            // Guardar registro de auditoría en movimientos_inventario
            $mov = $pdo->prepare(
                'INSERT INTO movimientos_inventario (producto_id, usuario_id, tipo, cantidad, stock_anterior, stock_nuevo, costo_unitario, referencia, motivo)
                 VALUES (:producto_id, :usuario_id, :tipo, :cantidad, :stock_anterior, :stock_nuevo, :costo_unitario, :referencia, :motivo)'
            );
            $mov->execute([
                'producto_id' => $productoId,
                'usuario_id' => $usuarioId,
                'tipo' => $tipo,
                'cantidad' => $cantidad,
                'stock_anterior' => $stockAnterior,
                'stock_nuevo' => $stockNuevo,
                'costo_unitario' => $costoUnitario,
                'referencia' => $referencia ? trim($referencia) : null,
                'motivo' => $motivo ? trim($motivo) : null,
            ]);

            $pdo->commit();
            return [
                'producto' => $producto['nombre'],
                'stock_anterior' => $stockAnterior,
                'stock_nuevo' => $stockNuevo,
            ];
        } catch (\Throwable $e) {
            $pdo->rollBack();
            throw $e;
        }
    }

    /**
     * Obtiene los productos activos cuyo stock actual es igual o inferior al mínimo.
     */
    public static function lowStock(int $limit = 10): array
    {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare(
            'SELECT p.*, c.nombre AS categoria_nombre
             FROM productos p
             LEFT JOIN categorias c ON c.id = p.categoria_id
             WHERE p.activo = 1 AND p.stock <= p.stock_minimo
             ORDER BY p.stock ASC
             LIMIT :lim'
        );
        $stmt->bindValue(':lim', $limit, \PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    /**
     * Calcula indicadores globales de inventario para el Dashboard.
     */
    public static function stats(): array
    {
        $pdo = Database::getConnection();
        return $pdo->query(
            'SELECT
                COUNT(*) AS total_productos,
                SUM(CASE WHEN activo = 1 THEN 1 ELSE 0 END) AS activos,
                SUM(CASE WHEN activo = 1 AND stock <= stock_minimo THEN 1 ELSE 0 END) AS stock_bajo,
                COALESCE(SUM(CASE WHEN activo = 1 THEN stock ELSE 0 END), 0) AS unidades_totales,
                COALESCE(SUM(CASE WHEN activo = 1 THEN stock * precio_compra ELSE 0 END), 0) AS valor_inventario
             FROM productos'
        )->fetch();
    }
}
