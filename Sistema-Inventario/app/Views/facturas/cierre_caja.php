<?php

use App\Core\Helpers;

/** @var string $fecha */
/** @var array<string, mixed> $cierre */
?>
<div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4 no-print">
    <form class="d-flex align-items-center gap-2" method="GET" action="<?= Helpers::url('/facturas/cierre-caja') ?>">
        <label class="form-label mb-0 small fw-semibold">Fecha de corte:</label>
        <input type="date" name="fecha" class="form-control form-control-sm" value="<?= Helpers::e($fecha) ?>">
        <button type="submit" class="btn btn-primary btn-sm"><i class="bi bi-search me-1"></i> Consultar</button>
    </form>

    <button type="button" onclick="window.print()" class="btn btn-outline-secondary btn-sm">
        <i class="bi bi-printer me-1"></i> Imprimir Cierre
    </button>
</div>

<div class="row g-3 mb-4">
    <div class="col-md-4">
        <div class="card h-100">
            <div class="card-body">
                <div class="text-muted small fw-semibold">Total Recaudado (COP)</div>
                <div class="h4 fw-bold text-success mb-0"><?= Helpers::money($cierre['totales']['COP'], 'COP') ?></div>
            </div>
        </div>
    </div>
    <div class="col-md-4">
        <div class="card h-100">
            <div class="card-body">
                <div class="text-muted small fw-semibold">Total Recaudado (USD)</div>
                <div class="h4 fw-bold text-primary mb-0"><?= Helpers::money($cierre['totales']['USD'], 'USD') ?></div>
            </div>
        </div>
    </div>
    <div class="col-md-4">
        <div class="card h-100">
            <div class="card-body">
                <div class="text-muted small fw-semibold">Facturas del Día</div>
                <div class="h4 fw-bold mb-0"><?= (int)$cierre['emitidas'] ?> <span class="fs-6 fw-normal text-muted">emitidas</span></div>
                <div class="small text-danger"><?= (int)$cierre['anuladas'] ?> anuladas</div>
            </div>
        </div>
    </div>
</div>

<div class="card">
    <div class="card-header bg-white py-3">
        <h2 class="h6 mb-0 fw-bold"><i class="bi bi-calculator me-2 text-primary"></i>Desglose por Método de Pago y Moneda (<?= date('d/m/Y', strtotime($fecha)) ?>)</h2>
    </div>
    <div class="table-responsive">
        <table class="table table-hover mb-0">
            <thead class="table-light">
            <tr>
                <th>Método de Pago</th>
                <th>Moneda</th>
                <th class="text-center">Cantidad Facturas</th>
                <th class="text-end">Total Recaudado</th>
            </tr>
            </thead>
            <tbody>
            <?php if (empty($cierre['desglose'])): ?>
                <tr><td colspan="4" class="text-center text-muted py-4">No hubo facturas emitidas en esta fecha.</td></tr>
            <?php else: ?>
                <?php foreach ($cierre['desglose'] as $row): ?>
                    <tr>
                        <td class="text-capitalize fw-semibold"><?= Helpers::e($row['metodo_pago']) ?></td>
                        <td><span class="badge bg-secondary-subtle text-secondary"><?= Helpers::e($row['moneda']) ?></span></td>
                        <td class="text-center"><?= (int)$row['cantidad'] ?></td>
                        <td class="text-end fw-bold"><?= Helpers::money($row['total'], $row['moneda']) ?></td>
                    </tr>
                <?php endforeach; ?>
            <?php endif; ?>
            </tbody>
        </table>
    </div>
</div>
