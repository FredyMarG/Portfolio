<?php

use App\Core\Auth;
use App\Core\Helpers;

/** @var array<string, mixed> $prodStats */
/** @var array<string, mixed> $factStats */
/** @var array<int, array<string, mixed>> $lowStock */
/** @var array<int, array<string, mixed>> $recentMovements */
/** @var array<int, array<string, mixed>> $recentInvoices */
?>
<div class="row g-3 mb-4">
    <div class="col-12 col-sm-6 col-xl-3">
        <div class="card stat-card h-100">
            <div class="card-body d-flex align-items-center justify-content-between">
                <div>
                    <div class="text-muted small fw-semibold">Productos Activos</div>
                    <div class="h3 fw-bold mb-0"><?= (int)($prodStats['activos'] ?? 0) ?></div>
                    <div class="small text-muted"><?= (int)($prodStats['unidades_totales'] ?? 0) ?> unidades en stock</div>
                </div>
                <div class="stat-icon bg-primary bg-opacity-10 text-primary">
                    <i class="bi bi-box-seam"></i>
                </div>
            </div>
        </div>
    </div>

    <div class="col-12 col-sm-6 col-xl-3">
        <div class="card stat-card h-100">
            <div class="card-body d-flex align-items-center justify-content-between">
                <div>
                    <div class="text-muted small fw-semibold">Stock Bajo</div>
                    <div class="h3 fw-bold mb-0 text-warning"><?= (int)($prodStats['stock_bajo'] ?? 0) ?></div>
                    <div class="small text-muted">Requieren reposición</div>
                </div>
                <div class="stat-icon bg-warning bg-opacity-15 text-warning">
                    <i class="bi bi-exclamation-triangle"></i>
                </div>
            </div>
        </div>
    </div>

    <div class="col-12 col-sm-6 col-xl-3">
        <div class="card stat-card h-100">
            <div class="card-body d-flex align-items-center justify-content-between">
                <div>
                    <div class="text-muted small fw-semibold">Ventas de Hoy</div>
                    <div class="h5 fw-bold mb-0 text-success"><?= Helpers::money($factStats['ventas_hoy_cop'] ?? 0, 'COP') ?></div>
                    <div class="small fw-semibold text-primary"><?= Helpers::money($factStats['ventas_hoy_usd'] ?? 0, 'USD') ?></div>
                    <div class="small text-muted"><?= (int)($factStats['facturas_hoy'] ?? 0) ?> facturas emitidas</div>
                </div>
                <div class="stat-icon bg-success bg-opacity-10 text-success">
                    <i class="bi bi-cash-coin"></i>
                </div>
            </div>
        </div>
    </div>

    <div class="col-12 col-sm-6 col-xl-3">
        <div class="card stat-card h-100">
            <div class="card-body d-flex align-items-center justify-content-between">
                <div>
                    <div class="text-muted small fw-semibold">Valor Inventario (Costo)</div>
                    <div class="h3 fw-bold mb-0"><?= Helpers::money($prodStats['valor_inventario'] ?? 0) ?></div>
                    <div class="small text-muted"><?= (int)($factStats['total_facturas'] ?? 0) ?> facturas totales</div>
                </div>
                <div class="stat-icon bg-info bg-opacity-10 text-info">
                    <i class="bi bi-graph-up-arrow"></i>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Accesos Rápidos -->
<div class="d-flex flex-wrap gap-2 mb-4">
    <?php if (Auth::can('facturas.create')): ?>
        <a href="<?= Helpers::url('/facturas/crear') ?>" class="btn btn-primary">
            <i class="bi bi-cart-plus me-1"></i> Nueva Factura (Venta)
        </a>
    <?php endif; ?>
    <?php if (Auth::can('inventario.entrada')): ?>
        <a href="<?= Helpers::url('/inventario/entrada') ?>" class="btn btn-success">
            <i class="bi bi-box-arrow-in-down me-1"></i> Registrar Ingreso de Stock
        </a>
    <?php endif; ?>
    <?php if (Auth::can('productos.create')): ?>
        <a href="<?= Helpers::url('/productos/crear') ?>" class="btn btn-outline-primary">
            <i class="bi bi-plus-circle me-1"></i> Nuevo Producto
        </a>
    <?php endif; ?>
</div>

<div class="row g-4">
    <!-- Alertas de Stock Bajo -->
    <div class="col-12 col-lg-6">
        <div class="card h-100">
            <div class="card-header bg-white d-flex justify-content-between align-items-center py-3">
                <h2 class="h6 mb-0 fw-bold"><i class="bi bi-exclamation-circle text-warning me-2"></i>Productos con Stock Bajo</h2>
                <a href="<?= Helpers::url('/productos?stock_bajo=1') ?>" class="btn btn-sm btn-outline-secondary">Ver todos</a>
            </div>
            <div class="table-responsive">
                <table class="table table-hover mb-0">
                    <thead>
                    <tr>
                        <th>Producto</th>
                        <th class="text-center">Stock</th>
                        <th class="text-center">Mínimo</th>
                        <th></th>
                    </tr>
                    </thead>
                    <tbody>
                    <?php if (empty($lowStock)): ?>
                        <tr><td colspan="4" class="text-center text-muted py-4">Todos los productos tienen stock suficiente.</td></tr>
                    <?php else: ?>
                        <?php foreach ($lowStock as $p): ?>
                            <tr>
                                <td>
                                    <div class="fw-semibold"><?= Helpers::e($p['nombre']) ?></div>
                                    <div class="small text-muted"><?= Helpers::e($p['codigo']) ?></div>
                                </td>
                                <td class="text-center">
                                    <span class="badge <?= (int)$p['stock'] === 0 ? 'badge-stock-out' : 'badge-stock-low' ?>">
                                        <?= (int)$p['stock'] ?>
                                    </span>
                                </td>
                                <td class="text-center text-muted"><?= (int)$p['stock_minimo'] ?></td>
                                <td class="text-end">
                                    <?php if (Auth::can('inventario.entrada')): ?>
                                        <a href="<?= Helpers::url('/inventario/entrada?producto_id=' . (int)$p['id']) ?>" class="btn btn-sm btn-outline-success">
                                            <i class="bi bi-plus-lg"></i> Ingresar
                                        </a>
                                    <?php endif; ?>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    <?php endif; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <!-- Últimas Facturas o Movimientos -->
    <div class="col-12 col-lg-6">
        <?php if (!empty($recentInvoices)): ?>
            <div class="card h-100">
                <div class="card-header bg-white d-flex justify-content-between align-items-center py-3">
                    <h2 class="h6 mb-0 fw-bold"><i class="bi bi-receipt text-primary me-2"></i>Últimas Facturas</h2>
                    <a href="<?= Helpers::url('/facturas') ?>" class="btn btn-sm btn-outline-secondary">Ver todas</a>
                </div>
                <div class="table-responsive">
                    <table class="table table-hover mb-0">
                        <thead>
                        <tr>
                            <th>Número</th>
                            <th>Cliente</th>
                            <th class="text-end">Total</th>
                            <th>Estado</th>
                        </tr>
                        </thead>
                        <tbody>
                        <?php foreach ($recentInvoices as $f): ?>
                            <tr>
                                <td>
                                    <a href="<?= Helpers::url('/facturas/' . (int)$f['id']) ?>" class="fw-semibold text-decoration-none">
                                        <?= Helpers::e($f['numero']) ?>
                                    </a>
                                </td>
                                <td><?= Helpers::e($f['cliente_nombre']) ?></td>
                                <td class="text-end fw-semibold"><?= Helpers::money($f['total'], $f['moneda'] ?? 'COP') ?></td>
                                <td>
                                    <span class="badge <?= $f['estado'] === 'emitida' ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger' ?>">
                                        <?= ucfirst(Helpers::e($f['estado'])) ?>
                                    </span>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            </div>
        <?php elseif (!empty($recentMovements)): ?>
            <div class="card h-100">
                <div class="card-header bg-white d-flex justify-content-between align-items-center py-3">
                    <h2 class="h6 mb-0 fw-bold"><i class="bi bi-arrow-left-right text-primary me-2"></i>Movimientos Recientes</h2>
                    <a href="<?= Helpers::url('/inventario/movimientos') ?>" class="btn btn-sm btn-outline-secondary">Ver Kardex</a>
                </div>
                <div class="table-responsive">
                    <table class="table table-hover mb-0">
                        <thead>
                        <tr>
                            <th>Producto</th>
                            <th>Tipo</th>
                            <th class="text-center">Cantidad</th>
                            <th class="text-center">Nuevo Stock</th>
                        </tr>
                        </thead>
                        <tbody>
                        <?php foreach ($recentMovements as $m): ?>
                            <tr>
                                <td><?= Helpers::e($m['producto_nombre']) ?></td>
                                <td><span class="badge bg-secondary-subtle text-secondary"><?= Helpers::e($m['tipo']) ?></span></td>
                                <td class="text-center"><?= (int)$m['cantidad'] ?></td>
                                <td class="text-center fw-semibold"><?= (int)$m['stock_nuevo'] ?></td>
                            </tr>
                        <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            </div>
        <?php endif; ?>
    </div>
</div>
