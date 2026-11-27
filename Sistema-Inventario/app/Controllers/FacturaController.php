<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Auth;
use App\Core\Controller;
use App\Core\Helpers;
use App\Core\ReportExporter;
use App\Models\Cliente;
use App\Models\Configuracion;
use App\Models\Factura;
use App\Models\Producto;

/**
 * ============================================================================
 * CONTROLADOR DE FACTURACIÓN (app/Controllers/FacturaController.php)
 * ============================================================================
 * Gestiona el punto de venta (POS), la emisión de facturas con descuento
 * automático de inventario, la visualización/impresión y la anulación.
 * ============================================================================
 */
class FacturaController extends Controller
{
    private function getFilters(): array
    {
        return [
            'q' => trim($_GET['q'] ?? ''),
            'estado' => $_GET['estado'] ?? '',
            'fecha_desde' => trim($_GET['fecha_desde'] ?? ''),
            'fecha_hasta' => trim($_GET['fecha_hasta'] ?? ''),
        ];
    }

    /**
     * Listado de facturas emitidas y anuladas con buscador y rango de fechas.
     */
    public function index(): void
    {
        Auth::requirePermission('facturas.view');

        $filters = $this->getFilters();
        $pag = Helpers::paginate(Factura::all($filters), 15);

        $this->render('facturas/index', [
            'title' => 'Historial de Facturas',
            'facturas' => $pag['items'],
            'page' => $pag['page'],
            'totalPages' => $pag['totalPages'],
            'totalRegistros' => $pag['total'],
            'filters' => $filters,
        ]);
    }

    /**
     * Exporta el historial de facturas (con filtros activos) a Excel (.xls).
     */
    public function exportExcel(): void
    {
        Auth::requirePermission('facturas.view');
        $facturas = Factura::all($this->getFilters());
        [$headers, $rows] = $this->formatFacturasRows($facturas, true);

        ReportExporter::toExcel('facturas_' . date('Ymd_His'), 'Facturas', $headers, $rows);
    }

    /**
     * Exporta el historial de facturas (con filtros activos) a PDF.
     */
    public function exportPdf(): void
    {
        Auth::requirePermission('facturas.view');
        $facturas = Factura::all($this->getFilters());
        [$headers, $rows] = $this->formatFacturasRows($facturas, false);
        $widths = [76, 84, 155, 76, 48, 92, 62, 110];

        ReportExporter::toPdf(
            'facturas_' . date('Ymd_His'),
            'Reporte de Facturas Emitidas y Anuladas',
            'Total de facturas: ' . count($facturas),
            $headers,
            $rows,
            $widths
        );
    }

    /**
     * Prepara encabezados y filas normalizadas para exportación de facturas.
     */
    private function formatFacturasRows(array $facturas, bool $numericTotal): array
    {
        $headers = ['N° Factura', 'Fecha', 'Cliente', 'Método Pago', 'Moneda', 'Total', 'Estado', 'Vendedor'];
        $rows = array_map(function (array $f) use ($numericTotal): array {
            $moneda = $f['moneda'] ?? 'COP';
            return [
                $f['numero'],
                date('d/m/Y H:i', strtotime($f['creado_en'])),
                $f['cliente_nombre'],
                ucfirst((string)$f['metodo_pago']),
                $moneda,
                $numericTotal ? (float)$f['total'] : Helpers::money($f['total'], $moneda),
                ucfirst((string)$f['estado']),
                $f['vendedor_nombre'],
            ];
        }, $facturas);

        return [$headers, $rows];
    }

    /**
     * Muestra la interfaz de Punto de Venta (POS) con productos con stock > 0.
     */
    public function create(): void
    {
        Auth::requirePermission('facturas.create');

        $config = require BASE_PATH . '/config/config.php';
        $empresa = Configuracion::get();
        $productos = Producto::all(['activo' => 1, 'con_stock' => true]);

        $this->render('facturas/crear', [
            'title' => 'Nueva Factura / Punto de Venta',
            'productos' => $productos,
            'clientes' => Cliente::all(),
            'tasaUsd' => (float)($empresa['tasa_usd'] ?? 4200.0),
            'defaultTaxRate' => $config['app']['default_tax_rate'],
        ]);
    }

    /**
     * Muestra el reporte diario de cierre/arqueo de caja por método y moneda.
     */
    public function cierreCaja(): void
    {
        Auth::requirePermission('facturas.view');

        $fecha = trim($_GET['fecha'] ?? date('Y-m-d'));
        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $fecha)) {
            $fecha = date('Y-m-d');
        }

        $this->render('facturas/cierre_caja', [
            'title' => 'Cierre de Caja Diario',
            'fecha' => $fecha,
            'cierre' => Factura::cierreCaja($fecha),
        ]);
    }

    /**
     * Procesa la venta enviada desde el POS, consolida cantidades repetidas,
     * descuenta el stock en MySQL y redirige al comprobante generado.
     */
    public function store(): void
    {
        Auth::requirePermission('facturas.create');
        Helpers::verifyCsrf();

        $productoIds = $_POST['producto_id'] ?? [];
        $cantidades = $_POST['cantidad'] ?? [];

        // Agrupar ítems por producto_id para evitar duplicados en el detalle
        $items = [];
        foreach ($productoIds as $idx => $prodId) {
            $pid = (int)$prodId;
            $qty = (int)($cantidades[$idx] ?? 0);
            if ($pid > 0 && $qty > 0) {
                if (isset($items[$pid])) {
                    $items[$pid]['cantidad'] += $qty;
                } else {
                    $items[$pid] = [
                        'producto_id' => $pid,
                        'cantidad' => $qty,
                    ];
                }
            }
        }

        try {
            $facturaId = Factura::createInvoice(Auth::id(), $_POST, array_values($items));
            Helpers::flash('success', 'Factura generada exitosamente y stock descontado del inventario.');
            Helpers::redirect('/facturas/' . $facturaId);
        } catch (\Throwable $e) {
            Helpers::flash('danger', $e->getMessage());
            Helpers::redirect('/facturas/crear');
        }
    }

    /**
     * Muestra el detalle imprimible de una factura específica.
     */
    public function show(string $id): void
    {
        Auth::requirePermission('facturas.view');
        $factura = Factura::find((int)$id);
        if (!$factura) {
            Helpers::flash('danger', 'Factura no encontrada.');
            Helpers::redirect('/facturas');
        }

        $this->render('facturas/ver', [
            'title' => 'Factura ' . $factura['numero'],
            'factura' => $factura,
            'empresa' => Configuracion::get(),
        ]);
    }

    /**
     * Anula una factura (solo Admin) y devuelve las unidades al inventario.
     */
    public function anular(string $id): void
    {
        Auth::requirePermission('facturas.anular');
        Helpers::verifyCsrf();

        $facturaId = (int)$id;
        try {
            Factura::cancelInvoice($facturaId, Auth::id());
            Helpers::flash('success', 'Factura anulada y stock devuelto al inventario.');
        } catch (\Throwable $e) {
            Helpers::flash('danger', $e->getMessage());
        }

        Helpers::redirect('/facturas/' . $facturaId);
    }
}
