<?php

use App\Core\Helpers;

/** @var array<int, array<string, mixed>> $movimientos */
/** @var array<int, array<string, mixed>> $productos */
/** @var array<string, mixed> $filters */
/** @var int $page */
/** @var int $totalPages */
/** @var int $totalRegistros */
$tipoLabels = [
    'entrada' => ['Entrada', 'bg-success-subtle text-success'],
    'venta' => ['Venta', 'bg-primary-subtle text-primary'],
    'ajuste_positivo' => ['Ajuste (+)', 'bg-info-subtle text-info'],
    'ajuste_negativo' => ['Ajuste (-)', 'bg-warning-subtle text-warning'],
    'anulacion' => ['Anulación', 'bg-danger-subtle text-danger'],
];
?>
<div class="card mb-3">
    <div class="card-body">
        <form class="row g-2 align-items-end" method="GET" action="<?= Helpers::url('/inventario/movimientos') ?>">
            <div class="col-md-3">
                <label class="form-label small text-muted mb-1">Producto</label>
                <select name="producto_id" class="form-select form-select-sm">
                    <option value="">Todos los productos</option>
                    <?php foreach ($productos as $p): ?>
                        <option value="<?= (int)$p['id'] ?>" <?= ((string)$filters['producto_id'] === (string)$p['id']) ? 'selected' : '' ?>>
                            [<?= Helpers::e($p['codigo']) ?>] <?= Helpers::e($p['nombre']) ?>
                        </option>
                    <?php endforeach; ?>
                </select>
            </div>
            <div class="col-md-2">
                <label class="form-label small text-muted mb-1">Tipo</label>
                <select name="tipo" class="form-select form-select-sm">
                    <option value="">Todos los tipos</option>
                    <?php foreach ($tipoLabels as $key => [$label, $_]): ?>
                        <option value="<?= $key ?>" <?= ($filters['tipo'] === $key) ? 'selected' : '' ?>><?= $label ?></option>
                    <?php endforeach; ?>
                </select>
            </div>
            <div class="col-6 col-md-2">
                <label class="form-label small text-muted mb-1">Desde</label>
                <input type="date" name="fecha_desde" class="form-control form-control-sm" value="<?= Helpers::e($filters['fecha_desde'] ?? '') ?>">
            </div>
            <div class="col-6 col-md-2">
                <label class="form-label small text-muted mb-1">Hasta</label>
                <input type="date" name="fecha_hasta" class="form-control form-control-sm" value="<?= Helpers::e($filters['fecha_hasta'] ?? '') ?>">
            </div>
            <div class="col-md-3 d-flex flex-wrap gap-1">
                <button type="submit" class="btn btn-primary btn-sm"><i class="bi bi-filter me-1"></i> Filtrar</button>
                <a href="<?= Helpers::url('/inventario/movimientos') ?>" class="btn btn-outline-secondary btn-sm">Limpiar</a>
                <?php $queryStr = $_SERVER['QUERY_STRING'] ? '?' . $_SERVER['QUERY_STRING'] : ''; ?>
                <a href="<?= Helpers::url('/inventario/movimientos/exportar/pdf') . $queryStr ?>" target="_blank" class="btn btn-outline-danger btn-sm">
                    <i class="bi bi-file-earmark-pdf"></i> PDF
                </a>
                <a href="<?= Helpers::url('/inventario/movimientos/exportar/excel') . $queryStr ?>" class="btn btn-outline-success btn-sm">
                    <i class="bi bi-file-earmark-excel"></i> Excel
                </a>
            </div>
        </form>
    </div>
</div>

<div class="card">
    <div class="table-responsive">
        <table class="table table-hover mb-0">
            <thead class="table-light">
            <tr>
                <th>Fecha</th>
                <th>Producto</th>
                <th>Tipo</th>
                <th class="text-center">Cantidad</th>
                <th class="text-center">Anterior</th>
                <th class="text-center">Nuevo</th>
                <th>Referencia / Motivo</th>
                <th>Responsable</th>
            </tr>
            </thead>
            <tbody>
            <?php if (empty($movimientos)): ?>
                <tr><td colspan="8" class="text-center text-muted py-4">No hay movimientos registrados.</td></tr>
            <?php else: ?>
                <?php foreach ($movimientos as $m): ?>
                    <?php [$label, $badgeClass] = $tipoLabels[$m['tipo']] ?? [$m['tipo'], 'bg-secondary-subtle text-secondary']; ?>
                    <tr>
                        <td class="small text-muted"><?= date('d/m/Y H:i', strtotime($m['creado_en'])) ?></td>
                        <td>
                            <div class="fw-semibold"><?= Helpers::e($m['producto_nombre']) ?></div>
                            <div class="small text-muted"><?= Helpers::e($m['producto_codigo']) ?></div>
                        </td>
                        <td><span class="badge <?= $badgeClass ?>"><?= $label ?></span></td>
                        <td class="text-center fw-semibold"><?= (int)$m['cantidad'] ?></td>
                        <td class="text-center text-muted"><?= (int)$m['stock_anterior'] ?></td>
                        <td class="text-center fw-bold"><?= (int)$m['stock_nuevo'] ?></td>
                        <td class="small">
                            <?php if ($m['referencia']): ?>
                                <code><?= Helpers::e($m['referencia']) ?></code>
                            <?php endif; ?>
                            <?= Helpers::e($m['motivo'] ?? '') ?>
                        </td>
                        <td class="small"><?= Helpers::e($m['usuario_nombre']) ?></td>
                    </tr>
                <?php endforeach; ?>
            <?php endif; ?>
            </tbody>
        </table>
    </div>
    <?php if ($totalPages > 1): ?>
        <div class="card-footer bg-white d-flex flex-wrap justify-content-between align-items-center gap-2">
            <div class="small text-muted">Mostrando <?= count($movimientos) ?> de <?= $totalRegistros ?> movimientos (página <?= $page ?> de <?= $totalPages ?>)</div>
            <?= Helpers::renderPagination($page, $totalPages, '/inventario/movimientos') ?>
        </div>
    <?php endif; ?>
</div>
