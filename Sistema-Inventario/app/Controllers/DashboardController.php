<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Auth;
use App\Core\Controller;
use App\Models\Factura;
use App\Models\Movimiento;
use App\Models\Producto;

/**
 * ============================================================================
 * CONTROLADOR DEL DASHBOARD (app/Controllers/DashboardController.php)
 * ============================================================================
 * Presenta el resumen ejecutivo del sistema según los permisos del rol:
 * métricas de inventario, ventas del día, alertas de stock bajo y actividad.
 * ============================================================================
 */
class DashboardController extends Controller
{
    /**
     * Muestra el panel principal (GET / o GET /dashboard).
     */
    public function index(): void
    {
        Auth::requirePermission('dashboard.view');

        $prodStats = Producto::stats();
        $factStats = Factura::stats();
        $lowStock = Producto::lowStock(8);
        $recentMovements = Auth::can('inventario.movimientos') ? Movimiento::all([], 8) : [];
        $recentInvoices = Auth::can('facturas.view') ? array_slice(Factura::all(), 0, 6) : [];

        $this->render('dashboard/index', [
            'title' => 'Panel Principal',
            'prodStats' => $prodStats,
            'factStats' => $factStats,
            'lowStock' => $lowStock,
            'recentMovements' => $recentMovements,
            'recentInvoices' => $recentInvoices,
        ]);
    }
}
