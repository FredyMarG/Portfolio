<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Auth;
use App\Core\Controller;
use App\Core\Helpers;
use App\Core\ReportExporter;
use App\Models\Movimiento;
use App\Models\Producto;
use App\Models\Proveedor;

/**
 * ============================================================================
 * CONTROLADOR DE INVENTARIO (app/Controllers/InventarioController.php)
 * ============================================================================
 * Gestiona la modificación de cantidades de productos que ingresan (entradas
 * por compra o reposición), ajustes manuales y la consulta del Kardex.
 * ============================================================================
 */
class InventarioController extends Controller
{
    /**
     * Muestra el formulario de ingreso de mercancía y los últimos ingresos.
     */
    public function entrada(): void
    {
        Auth::requirePermission('inventario.entrada');

        $productos = Producto::all(['activo' => 1]);
        $ultimasEntradas = Movimiento::all(['tipo' => 'entrada'], 15);

        $this->render('inventario/entrada', [
            'title' => 'Ingreso de Mercancía',
            'productos' => $productos,
            'proveedores' => Proveedor::all(),
            'ultimasEntradas' => $ultimasEntradas,
            'selectedId' => (int)($_GET['producto_id'] ?? 0),
        ]);
    }

    /**
     * Procesa el ingreso o ajuste de stock modificando la cantidad en MySQL
     * y registrando la trazabilidad en `movimientos_inventario`.
     */
    public function storeEntrada(): void
    {
        Auth::requirePermission('inventario.entrada');
        Helpers::verifyCsrf();

        $productoId = (int)($_POST['producto_id'] ?? 0);
        $cantidad = (int)($_POST['cantidad'] ?? 0);
        $tipo = $_POST['tipo'] ?? 'entrada';
        $costo = $_POST['costo_unitario'] !== '' ? (float)$_POST['costo_unitario'] : null;
        $referencia = trim($_POST['referencia'] ?? '');
        $motivo = trim($_POST['motivo'] ?? '');
        $proveedorId = (int)($_POST['proveedor_id'] ?? 0);
        if ($proveedorId > 0 && $tipo === 'entrada') {
            foreach (Proveedor::all() as $prov) {
                if ((int)$prov['id'] === $proveedorId) {
                    $motivo = 'Proveedor: ' . $prov['nombre'] . ($motivo !== '' ? ' · ' . $motivo : '');
                    break;
                }
            }
        }

        if (!in_array($tipo, ['entrada', 'ajuste_positivo', 'ajuste_negativo'], true)) {
            $tipo = 'entrada';
        }
        if ($tipo !== 'entrada' && !Auth::can('inventario.ajuste')) {
            Helpers::flash('danger', 'No tienes permiso para realizar ajustes manuales.');
            Helpers::redirect('/inventario/entrada');
        }

        try {
            $res = Producto::modifyStock(
                $productoId,
                Auth::id(),
                $tipo,
                $cantidad,
                $costo,
                $referencia,
                $motivo
            );
            Helpers::flash(
                'success',
                "Inventario actualizado para '{$res['producto']}': {$res['stock_anterior']} → {$res['stock_nuevo']} unidades."
            );
        } catch (\Throwable $e) {
            Helpers::flash('danger', $e->getMessage());
        }

        Helpers::redirect('/inventario/entrada');
    }

    private function getMovimientosFilters(): array
    {
        return [
            'producto_id' => $_GET['producto_id'] ?? '',
            'tipo' => $_GET['tipo'] ?? '',
            'fecha_desde' => trim($_GET['fecha_desde'] ?? ''),
            'fecha_hasta' => trim($_GET['fecha_hasta'] ?? ''),
        ];
    }

    /**
     * Muestra el historial completo de movimientos (Kardex) con filtros.
     */
    public function movimientos(): void
    {
        Auth::requirePermission('inventario.movimientos');

        $filters = $this->getMovimientosFilters();
        $pag = Helpers::paginate(Movimiento::all($filters, 2000), 20);

        $this->render('inventario/movimientos', [
            'title' => 'Historial de Movimientos (Kardex)',
            'movimientos' => $pag['items'],
            'page' => $pag['page'],
            'totalPages' => $pag['totalPages'],
            'totalRegistros' => $pag['total'],
            'productos' => Producto::all(),
            'filters' => $filters,
        ]);
    }

    /**
     * Exporta el historial de movimientos (Kardex) a Excel (.xls).
     */
    public function exportMovimientosExcel(): void
    {
        Auth::requirePermission('inventario.movimientos');
        $movimientos = Movimiento::all($this->getMovimientosFilters(), 2000);
        [$headers, $rows] = $this->formatMovimientosRows($movimientos);

        ReportExporter::toExcel('movimientos_kardex_' . date('Ymd_His'), 'Movimientos', $headers, $rows);
    }

    /**
     * Exporta el historial de movimientos (Kardex) a PDF.
     */
    public function exportMovimientosPdf(): void
    {
        Auth::requirePermission('inventario.movimientos');
        $movimientos = Movimiento::all($this->getMovimientosFilters(), 2000);
        [$headers, $rows] = $this->formatMovimientosRows($movimientos);
        $widths = [82, 70, 145, 72, 50, 50, 50, 145, 86];

        ReportExporter::toPdf(
            'movimientos_kardex_' . date('Ymd_His'),
            'Reporte de Movimientos de Inventario (Kardex)',
            'Total de movimientos: ' . count($movimientos),
            $headers,
            $rows,
            $widths
        );
    }

    /**
     * Prepara encabezados y filas normalizadas para exportación de movimientos.
     */
    private function formatMovimientosRows(array $movimientos): array
    {
        $tipoLabels = [
            'entrada' => 'Entrada',
            'venta' => 'Venta',
            'ajuste_positivo' => 'Ajuste (+)',
            'ajuste_negativo' => 'Ajuste (-)',
            'anulacion' => 'Anulación',
        ];

        $headers = ['Fecha', 'Código', 'Producto', 'Tipo', 'Cantidad', 'Anterior', 'Nuevo', 'Referencia / Motivo', 'Responsable'];
        $rows = array_map(function (array $m) use ($tipoLabels): array {
            $ref = trim(($m['referencia'] ?? '') . ' ' . ($m['motivo'] ?? ''));
            return [
                date('d/m/Y H:i', strtotime($m['creado_en'])),
                $m['producto_codigo'],
                $m['producto_nombre'],
                $tipoLabels[$m['tipo']] ?? $m['tipo'],
                (int)$m['cantidad'],
                (int)$m['stock_anterior'],
                (int)$m['stock_nuevo'],
                $ref !== '' ? $ref : '-',
                $m['usuario_nombre'],
            ];
        }, $movimientos);

        return [$headers, $rows];
    }
}
