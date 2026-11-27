<?php

declare(strict_types=1);

namespace App\Models;

use App\Core\Database;
use RuntimeException;

/**
 * ============================================================================
 * MODELO FACTURA (app/Models/Factura.php)
 * ============================================================================
 * Gestiona la emisión de facturas (POS), el descuento atómico de stock al
 * vender, la consulta de comprobantes y la anulación con devolución de stock.
 * ============================================================================
 */
class Factura
{
    private static bool $monedaChecked = false;

    /**
     * Garantiza que la columna `moneda` exista en `facturas` (migración automática segura).
     */
    private static function ensureMonedaColumn(\PDO $pdo): void
    {
        if (self::$monedaChecked) {
            return;
        }
        $exists = $pdo->query("SHOW COLUMNS FROM facturas LIKE 'moneda'")->fetch();
        if (!$exists) {
            $pdo->exec("ALTER TABLE facturas ADD COLUMN moneda ENUM('COP', 'USD') NOT NULL DEFAULT 'COP' AFTER metodo_pago");
        }
        $extraCols = [
            'cliente_id' => 'ALTER TABLE facturas ADD COLUMN cliente_id INT UNSIGNED NULL AFTER moneda',
            'monto_recibido' => 'ALTER TABLE facturas ADD COLUMN monto_recibido DECIMAL(12,2) NULL AFTER total',
            'cambio' => 'ALTER TABLE facturas ADD COLUMN cambio DECIMAL(12,2) NULL AFTER monto_recibido',
        ];
        foreach ($extraCols as $col => $sql) {
            if (!$pdo->query("SHOW COLUMNS FROM facturas LIKE '{$col}'")->fetch()) {
                $pdo->exec($sql);
            }
        }
        self::$monedaChecked = true;
    }

    /**
     * Lista las facturas registradas con filtros por texto o estado.
     */
    public static function all(array $filters = []): array
    {
        $pdo = Database::getConnection();
        self::ensureMonedaColumn($pdo);
        $where = [];
        $params = [];

        if (!empty($filters['q'])) {
            $where[] = '(f.numero LIKE :q1 OR f.cliente_nombre LIKE :q2 OR f.cliente_documento LIKE :q3)';
            $params['q1'] = '%' . $filters['q'] . '%';
            $params['q2'] = '%' . $filters['q'] . '%';
            $params['q3'] = '%' . $filters['q'] . '%';
        }
        if (!empty($filters['estado'])) {
            $where[] = 'f.estado = :estado';
            $params['estado'] = $filters['estado'];
        }
        if (!empty($filters['fecha_desde'])) {
            $where[] = 'DATE(f.creado_en) >= :fecha_desde';
            $params['fecha_desde'] = $filters['fecha_desde'];
        }
        if (!empty($filters['fecha_hasta'])) {
            $where[] = 'DATE(f.creado_en) <= :fecha_hasta';
            $params['fecha_hasta'] = $filters['fecha_hasta'];
        }

        $sql = 'SELECT f.*, u.nombre AS vendedor_nombre
                FROM facturas f
                INNER JOIN usuarios u ON u.id = f.usuario_id';
        if ($where) {
            $sql .= ' WHERE ' . implode(' AND ', $where);
        }
        $sql .= ' ORDER BY f.id DESC';

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    /**
     * Obtiene una factura completa (cabecera + líneas de detalle).
     */
    public static function find(int $id): ?array
    {
        $pdo = Database::getConnection();
        self::ensureMonedaColumn($pdo);
        $stmt = $pdo->prepare(
            'SELECT f.*, u.nombre AS vendedor_nombre
             FROM facturas f
             INNER JOIN usuarios u ON u.id = f.usuario_id
             WHERE f.id = :id LIMIT 1'
        );
        $stmt->execute(['id' => $id]);
        $factura = $stmt->fetch();
        if (!$factura) {
            return null;
        }

        $det = $pdo->prepare(
            'SELECT d.*, p.codigo, p.nombre AS producto_nombre, p.unidad
             FROM detalle_facturas d
             INNER JOIN productos p ON p.id = d.producto_id
             WHERE d.factura_id = :factura_id
             ORDER BY d.id ASC'
        );
        $det->execute(['factura_id' => $id]);
        $factura['items'] = $det->fetchAll();

        return $factura;
    }

    /**
     * Crea una factura completa dentro de una transacción ACID:
     *  1. Bloquea cada producto (FOR UPDATE) y verifica que haya stock suficiente.
     *  2. Calcula subtotal, descuento, IVA y total desde precios reales de BD.
     *  3. Inserta la cabecera en `facturas` y las líneas en `detalle_facturas`.
     *  4. Resta automáticamente la cantidad vendida de `productos.stock`.
     *  5. Registra el movimiento de salida ('venta') en `movimientos_inventario`.
     *
     * @return int ID de la factura generada.
     */
    public static function createInvoice(int $usuarioId, array $header, array $items): int
    {
        $clienteNombre = trim($header['cliente_nombre'] ?? '');
        if ($clienteNombre === '') {
            throw new RuntimeException('El nombre del cliente es obligatorio para emitir la factura.');
        }

        if (empty($items)) {
            throw new RuntimeException('Debes agregar al menos un producto a la factura.');
        }

        $pdo = Database::getConnection();
        self::ensureMonedaColumn($pdo);

        $moneda = strtoupper(trim($header['moneda'] ?? 'COP')) === 'USD' ? 'USD' : 'COP';
        $tasaUsd = max(1.0, (float)(Configuracion::get()['tasa_usd'] ?? 4200.0));

        $pdo->beginTransaction();

        try {
            $subtotalFactura = 0.0;
            $preparedItems = [];

            $lockStmt = $pdo->prepare('SELECT id, codigo, nombre, precio_venta, stock, activo FROM productos WHERE id = :id FOR UPDATE');

            foreach ($items as $item) {
                $productoId = (int)($item['producto_id'] ?? 0);
                $cantidad = (int)($item['cantidad'] ?? 0);

                if ($productoId <= 0 || $cantidad <= 0) {
                    throw new RuntimeException('Cantidad o producto inválido en el detalle.');
                }

                $lockStmt->execute(['id' => $productoId]);
                $producto = $lockStmt->fetch();

                if (!$producto || !(int)$producto['activo']) {
                    throw new RuntimeException("El producto ID {$productoId} no existe o está inactivo.");
                }

                $stockActual = (int)$producto['stock'];
                if ($stockActual < $cantidad) {
                    throw new RuntimeException(
                        "Stock insuficiente para '{$producto['nombre']}'. Disponible: {$stockActual}, solicitado: {$cantidad}."
                    );
                }

                $precioBase = (float)$producto['precio_venta'];
                $precioUnitario = $moneda === 'USD' ? round($precioBase / $tasaUsd, 2) : $precioBase;
                $lineaSubtotal = round($precioUnitario * $cantidad, 2);
                $subtotalFactura += $lineaSubtotal;

                $preparedItems[] = [
                    'producto_id' => $productoId,
                    'cantidad' => $cantidad,
                    'precio_unitario' => $precioUnitario,
                    'subtotal' => $lineaSubtotal,
                    'stock_anterior' => $stockActual,
                    'stock_nuevo' => $stockActual - $cantidad,
                ];
            }

            // Cálculos financieros finales
            $descuento = max(0.0, round((float)($header['descuento'] ?? 0), 2));
            if ($descuento > $subtotalFactura) {
                $descuento = $subtotalFactura;
            }
            $baseImponible = max(0.0, $subtotalFactura - $descuento);
            $impuestoPorcentaje = max(0.0, min(100.0, (float)($header['impuesto_porcentaje'] ?? 19.0)));
            $impuestoMonto = round($baseImponible * ($impuestoPorcentaje / 100), 2);
            $total = round($baseImponible + $impuestoMonto, 2);

            // Generar número correlativo de factura (ej. FAC-000001)
            $nextId = (int)$pdo->query('SELECT COALESCE(MAX(id), 0) + 1 FROM facturas')->fetchColumn();
            $numero = 'FAC-' . str_pad((string)$nextId, 6, '0', STR_PAD_LEFT);

            $metodoPago = in_array($header['metodo_pago'] ?? '', ['efectivo', 'tarjeta', 'transferencia'], true)
                ? $header['metodo_pago']
                : 'efectivo';
            $clienteId = !empty($header['cliente_id']) ? (int)$header['cliente_id'] : null;

            $montoRecibido = null;
            $cambio = null;
            if ($metodoPago === 'efectivo' && isset($header['monto_recibido']) && $header['monto_recibido'] !== '') {
                $montoRecibido = round((float)$header['monto_recibido'], 2);
                if ($montoRecibido < $total) {
                    throw new RuntimeException('El monto recibido en efectivo no puede ser menor al total de la factura.');
                }
                $cambio = round($montoRecibido - $total, 2);
            }

            $insFactura = $pdo->prepare(
                'INSERT INTO facturas (numero, usuario_id, cliente_id, cliente_nombre, cliente_documento, cliente_telefono, cliente_email, metodo_pago, moneda, subtotal, impuesto_porcentaje, impuesto_monto, descuento, total, monto_recibido, cambio, estado, notas)
                 VALUES (:numero, :usuario_id, :cliente_id, :cliente_nombre, :cliente_documento, :cliente_telefono, :cliente_email, :metodo_pago, :moneda, :subtotal, :impuesto_porcentaje, :impuesto_monto, :descuento, :total, :monto_recibido, :cambio, :estado, :notas)'
            );
            $insFactura->execute([
                'numero' => $numero,
                'usuario_id' => $usuarioId,
                'cliente_id' => $clienteId,
                'cliente_nombre' => $clienteNombre,
                'cliente_documento' => trim($header['cliente_documento'] ?? '') ?: null,
                'cliente_telefono' => trim($header['cliente_telefono'] ?? '') ?: null,
                'cliente_email' => trim($header['cliente_email'] ?? '') ?: null,
                'metodo_pago' => $metodoPago,
                'moneda' => $moneda,
                'subtotal' => round($subtotalFactura, 2),
                'impuesto_porcentaje' => $impuestoPorcentaje,
                'impuesto_monto' => $impuestoMonto,
                'descuento' => $descuento,
                'total' => $total,
                'monto_recibido' => $montoRecibido,
                'cambio' => $cambio,
                'estado' => 'emitida',
                'notas' => trim($header['notas'] ?? '') ?: null,
            ]);

            $facturaId = (int)$pdo->lastInsertId();

            $insDet = $pdo->prepare(
                'INSERT INTO detalle_facturas (factura_id, producto_id, cantidad, precio_unitario, subtotal)
                 VALUES (:factura_id, :producto_id, :cantidad, :precio_unitario, :subtotal)'
            );
            $updStock = $pdo->prepare('UPDATE productos SET stock = :stock WHERE id = :id');
            $insMov = $pdo->prepare(
                'INSERT INTO movimientos_inventario (producto_id, usuario_id, tipo, cantidad, stock_anterior, stock_nuevo, referencia, motivo)
                 VALUES (:producto_id, :usuario_id, :tipo, :cantidad, :stock_anterior, :stock_nuevo, :referencia, :motivo)'
            );

            foreach ($preparedItems as $item) {
                $insDet->execute([
                    'factura_id' => $facturaId,
                    'producto_id' => $item['producto_id'],
                    'cantidad' => $item['cantidad'],
                    'precio_unitario' => $item['precio_unitario'],
                    'subtotal' => $item['subtotal'],
                ]);

                // Restar la cantidad vendida del inventario
                $updStock->execute([
                    'stock' => $item['stock_nuevo'],
                    'id' => $item['producto_id'],
                ]);

                // Registrar salida en el Kardex
                $insMov->execute([
                    'producto_id' => $item['producto_id'],
                    'usuario_id' => $usuarioId,
                    'tipo' => 'venta',
                    'cantidad' => $item['cantidad'],
                    'stock_anterior' => $item['stock_anterior'],
                    'stock_nuevo' => $item['stock_nuevo'],
                    'referencia' => $numero,
                    'motivo' => 'Salida por facturación',
                ]);
            }

            $pdo->commit();
            return $facturaId;
        } catch (\Throwable $e) {
            $pdo->rollBack();
            throw $e;
        }
    }

    /**
     * Anula una factura emitida y devuelve automáticamente todas las unidades
     * vendidas al inventario, dejando trazabilidad en el Kardex.
     */
    public static function cancelInvoice(int $facturaId, int $usuarioId): void
    {
        $pdo = Database::getConnection();
        self::ensureMonedaColumn($pdo);
        $pdo->beginTransaction();

        try {
            $stmt = $pdo->prepare('SELECT * FROM facturas WHERE id = :id FOR UPDATE');
            $stmt->execute(['id' => $facturaId]);
            $factura = $stmt->fetch();

            if (!$factura) {
                throw new RuntimeException('Factura no encontrada.');
            }
            if ($factura['estado'] === 'anulada') {
                throw new RuntimeException('Esta factura ya fue anulada.');
            }

            $detStmt = $pdo->prepare('SELECT * FROM detalle_facturas WHERE factura_id = :factura_id');
            $detStmt->execute(['factura_id' => $facturaId]);
            $items = $detStmt->fetchAll();

            $lockProd = $pdo->prepare('SELECT stock FROM productos WHERE id = :id FOR UPDATE');
            $updProd = $pdo->prepare('UPDATE productos SET stock = :stock WHERE id = :id');
            $insMov = $pdo->prepare(
                'INSERT INTO movimientos_inventario (producto_id, usuario_id, tipo, cantidad, stock_anterior, stock_nuevo, referencia, motivo)
                 VALUES (:producto_id, :usuario_id, :tipo, :cantidad, :stock_anterior, :stock_nuevo, :referencia, :motivo)'
            );

            foreach ($items as $item) {
                $lockProd->execute(['id' => $item['producto_id']]);
                $stockAnterior = (int)$lockProd->fetchColumn();
                $stockNuevo = $stockAnterior + (int)$item['cantidad'];

                $updProd->execute([
                    'stock' => $stockNuevo,
                    'id' => $item['producto_id'],
                ]);

                $insMov->execute([
                    'producto_id' => $item['producto_id'],
                    'usuario_id' => $usuarioId,
                    'tipo' => 'anulacion',
                    'cantidad' => (int)$item['cantidad'],
                    'stock_anterior' => $stockAnterior,
                    'stock_nuevo' => $stockNuevo,
                    'referencia' => $factura['numero'],
                    'motivo' => 'Devolución de stock por anulación de factura',
                ]);
            }

            $pdo->prepare("UPDATE facturas SET estado = 'anulada' WHERE id = :id")->execute(['id' => $facturaId]);
            $pdo->commit();
        } catch (\Throwable $e) {
            $pdo->rollBack();
            throw $e;
        }
    }

    /**
     * Obtiene métricas de facturación (totales e ingresos del día) para el Dashboard.
     */
    public static function stats(): array
    {
        $pdo = Database::getConnection();
        self::ensureMonedaColumn($pdo);
        return $pdo->query(
            "SELECT
                COUNT(CASE WHEN estado = 'emitida' THEN 1 END) AS total_facturas,
                COALESCE(SUM(CASE WHEN estado = 'emitida' AND moneda = 'COP' THEN total ELSE 0 END), 0) AS ingresos_cop,
                COALESCE(SUM(CASE WHEN estado = 'emitida' AND moneda = 'USD' THEN total ELSE 0 END), 0) AS ingresos_usd,
                COUNT(CASE WHEN estado = 'emitida' AND DATE(creado_en) = CURDATE() THEN 1 END) AS facturas_hoy,
                COALESCE(SUM(CASE WHEN estado = 'emitida' AND moneda = 'COP' AND DATE(creado_en) = CURDATE() THEN total ELSE 0 END), 0) AS ventas_hoy_cop,
                COALESCE(SUM(CASE WHEN estado = 'emitida' AND moneda = 'USD' AND DATE(creado_en) = CURDATE() THEN total ELSE 0 END), 0) AS ventas_hoy_usd
             FROM facturas"
        )->fetch();
    }

    /**
     * Genera el resumen de cierre de caja para una fecha específica.
     */
    public static function cierreCaja(string $fecha): array
    {
        $pdo = Database::getConnection();
        self::ensureMonedaColumn($pdo);

        $stmt = $pdo->prepare(
            "SELECT metodo_pago, moneda, COUNT(*) AS cantidad, COALESCE(SUM(total), 0) AS total
             FROM facturas
             WHERE estado = 'emitida' AND DATE(creado_en) = :fecha
             GROUP BY metodo_pago, moneda
             ORDER BY metodo_pago ASC, moneda ASC"
        );
        $stmt->execute(['fecha' => $fecha]);
        $desglose = $stmt->fetchAll();

        $countsStmt = $pdo->prepare(
            "SELECT
                COUNT(CASE WHEN estado = 'emitida' THEN 1 END) AS emitidas,
                COUNT(CASE WHEN estado = 'anulada' THEN 1 END) AS anuladas
             FROM facturas
             WHERE DATE(creado_en) = :fecha"
        );
        $countsStmt->execute(['fecha' => $fecha]);
        $counts = $countsStmt->fetch() ?: ['emitidas' => 0, 'anuladas' => 0];

        $totales = ['COP' => 0.0, 'USD' => 0.0];
        foreach ($desglose as $row) {
            $m = $row['moneda'] === 'USD' ? 'USD' : 'COP';
            $totales[$m] += (float)$row['total'];
        }

        return [
            'desglose' => $desglose,
            'totales' => $totales,
            'emitidas' => (int)$counts['emitidas'],
            'anuladas' => (int)$counts['anuladas'],
        ];
    }
}
