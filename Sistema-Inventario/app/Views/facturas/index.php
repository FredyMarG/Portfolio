<?php

use App\Core\Auth;
use App\Core\Helpers;

/** @var array<int, array<string, mixed>> $facturas */
/** @var array{q: string, estado: string, fecha_desde: string, fecha_hasta: string} $filters */
/** @var int $page */
/** @var int $totalPages */
/** @var int $totalRegistros */
?>
<div class="d-flex flex-wrap justify-content-between align-items-end gap-2 mb-3">
    <form class="row g-2 flex-grow-1 align-items-end" method="GET" action="<?= Helpers::url('/facturas') ?>">
        <div class="col-12 col-md-3">
            <label class="form-label small text-muted mb-1">Buscar</label>
            <input type="text" name="q" class="form-control form-control-sm" value="<?= Helpers::e($filters['q']) ?>" placeholder="N° factura, cliente o doc...">
        </div>
        <div class="col-6 col-md-2">
            <label class="form-label small text-muted mb-1">Estado</label>
            <select name="estado" class="form-select form-select-sm">
                <option value="">Todos</option>
                <option value="emitida" <?= ($filters['estado'] === 'emitida') ? 'selected' : '' ?>>Emitida</option>
                <option value="anulada" <?= ($filters['estado'] === 'anulada') ? 'selected' : '' ?>>Anulada</option>
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
        <div class="col-auto d-flex gap-1">
            <button type="submit" class="btn btn-outline-primary btn-sm"><i class="bi bi-search"></i> Buscar</button>
            <a href="<?= Helpers::url('/facturas') ?>" class="btn btn-outline-secondary btn-sm">Limpiar</a>
        </div>
    </form>

    <div class="d-flex flex-wrap gap-2">
        <?php $queryStr = $_SERVER['QUERY_STRING'] ? '?' . $_SERVER['QUERY_STRING'] : ''; ?>
        <a href="<?= Helpers::url('/facturas/exportar/pdf') . $queryStr ?>" target="_blank" class="btn btn-outline-danger btn-sm">
            <i class="bi bi-file-earmark-pdf me-1"></i> PDF
        </a>
        <a href="<?= Helpers::url('/facturas/exportar/excel') . $queryStr ?>" class="btn btn-outline-success btn-sm">
            <i class="bi bi-file-earmark-excel me-1"></i> Excel
        </a>
        <?php if (Auth::can('facturas.create')): ?>
            <a href="<?= Helpers::url('/facturas/crear') ?>" class="btn btn-primary btn-sm">
                <i class="bi bi-cart-plus me-1"></i> Nueva Factura
            </a>
        <?php endif; ?>
    </div>
</div>

<div class="card">
    <div class="table-responsive">
        <table class="table table-hover mb-0">
            <thead class="table-light">
            <tr>
                <th>N° Factura</th>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>Método Pago</th>
                <th class="text-end">Total</th>
                <th>Estado</th>
                <th>Vendedor</th>
                <th class="text-end">Acción</th>
            </tr>
            </thead>
            <tbody>
            <?php if (empty($facturas)): ?>
                <tr><td colspan="8" class="text-center text-muted py-4">No hay facturas registradas.</td></tr>
            <?php else: ?>
                <?php foreach ($facturas as $f): ?>
                    <tr>
                        <td>
                            <a href="<?= Helpers::url('/facturas/' . (int)$f['id']) ?>" class="fw-bold text-decoration-none">
                                <?= Helpers::e($f['numero']) ?>
                            </a>
                        </td>
                        <td class="small text-muted"><?= date('d/m/Y H:i', strtotime($f['creado_en'])) ?></td>
                        <td>
                            <div class="fw-medium"><?= Helpers::e($f['cliente_nombre']) ?></div>
                            <?php if (!empty($f['cliente_documento'])): ?>
                                <div class="small text-muted"><?= Helpers::e($f['cliente_documento']) ?></div>
                            <?php endif; ?>
                        </td>
                        <td class="text-capitalize small"><?= Helpers::e($f['metodo_pago']) ?></td>
                        <td class="text-end fw-bold">
                            <?= Helpers::money($f['total'], $f['moneda'] ?? 'COP') ?>
                        </td>
                        <td>
                            <span class="badge <?= $f['estado'] === 'emitida' ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger' ?>">
                                <?= ucfirst(Helpers::e($f['estado'])) ?>
                            </span>
                        </td>
                        <td class="small"><?= Helpers::e($f['vendedor_nombre']) ?></td>
                        <td class="text-end">
                            <a href="<?= Helpers::url('/facturas/' . (int)$f['id']) ?>" class="btn btn-sm btn-outline-primary">
                                <i class="bi bi-eye"></i> Ver
                            </a>
                        </td>
                    </tr>
                <?php endforeach; ?>
            <?php endif; ?>
            </tbody>
        </table>
    </div>
    <?php if ($totalPages > 1): ?>
        <div class="card-footer bg-white d-flex flex-wrap justify-content-between align-items-center gap-2">
            <div class="small text-muted">Mostrando <?= count($facturas) ?> de <?= $totalRegistros ?> facturas (página <?= $page ?> de <?= $totalPages ?>)</div>
            <?= Helpers::renderPagination($page, $totalPages, '/facturas') ?>
        </div>
    <?php endif; ?>
</div>
