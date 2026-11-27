<?php

use App\Core\Auth;
use App\Core\Helpers;

/** @var array<string, mixed> $factura */
/** @var array<string, mixed> $empresa */
?>
<div class="d-flex justify-content-between align-items-center mb-3 no-print">
    <a href="<?= Helpers::url('/facturas') ?>" class="btn btn-outline-secondary btn-sm">
        <i class="bi bi-arrow-left me-1"></i> Volver al historial
    </a>
    <div class="d-flex gap-2">
        <button type="button" onclick="window.print()" class="btn btn-primary btn-sm">
            <i class="bi bi-printer me-1"></i> Imprimir Factura
        </button>
        <?php if ($factura['estado'] === 'emitida' && Auth::can('facturas.anular')): ?>
            <form action="<?= Helpers::url('/facturas/' . (int)$factura['id'] . '/anular') ?>" method="POST"
                  onsubmit="return confirm('¿Anular esta factura y devolver los productos al inventario?');">
                <?= Helpers::csrfField() ?>
                <button type="submit" class="btn btn-outline-danger btn-sm">
                    <i class="bi bi-x-circle me-1"></i> Anular Factura
                </button>
            </form>
        <?php endif; ?>
    </div>
</div>

<div class="invoice-box mx-auto" style="max-width: 860px;">
    <div class="row border-bottom pb-3 mb-4 align-items-center">
        <div class="col-6">
            <h2 class="h4 fw-bold text-primary mb-1"><?= Helpers::e($empresa['nombre_empresa'] ?? 'StockFlow Pro') ?></h2>
            <div class="small text-muted">Comprobante de Venta / Factura</div>
            <?php if (!empty($empresa['nit'])): ?>
                <div class="small text-muted">NIT/RUC: <?= Helpers::e($empresa['nit']) ?></div>
            <?php endif; ?>
            <?php if (!empty($empresa['direccion']) || !empty($empresa['telefono'])): ?>
                <div class="small text-muted">
                    <?= Helpers::e($empresa['direccion'] ?? '') ?>
                    <?= (!empty($empresa['direccion']) && !empty($empresa['telefono'])) ? ' · ' : '' ?>
                    <?= Helpers::e($empresa['telefono'] ?? '') ?>
                </div>
            <?php endif; ?>
        </div>
        <div class="col-6 text-end">
            <div class="h5 fw-bold mb-1"><?= Helpers::e($factura['numero']) ?></div>
            <div class="small text-muted">Fecha: <?= date('d/m/Y H:i', strtotime($factura['creado_en'])) ?></div>
            <span class="badge <?= $factura['estado'] === 'emitida' ? 'bg-success' : 'bg-danger' ?> mt-1">
                <?= strtoupper(Helpers::e($factura['estado'])) ?>
            </span>
        </div>
    </div>

    <div class="row mb-4 small">
        <div class="col-md-6">
            <div class="text-muted text-uppercase fw-semibold mb-1">Cliente</div>
            <div class="fw-bold"><?= Helpers::e($factura['cliente_nombre']) ?></div>
            <?php if (!empty($factura['cliente_documento'])): ?>
                <div>Doc/NIT: <?= Helpers::e($factura['cliente_documento']) ?></div>
            <?php endif; ?>
            <?php if (!empty($factura['cliente_telefono'])): ?>
                <div>Tel: <?= Helpers::e($factura['cliente_telefono']) ?></div>
            <?php endif; ?>
            <?php if (!empty($factura['cliente_email'])): ?>
                <div>Email: <?= Helpers::e($factura['cliente_email']) ?></div>
            <?php endif; ?>
        </div>
        <div class="col-md-6 text-md-end mt-3 mt-md-0">
            <div class="text-muted text-uppercase fw-semibold mb-1">Detalles</div>
            <div>Atendido por: <strong><?= Helpers::e($factura['vendedor_nombre']) ?></strong></div>
            <div>Método de pago: <span class="text-capitalize fw-semibold"><?= Helpers::e($factura['metodo_pago']) ?></span></div>
            <div>Moneda: <span class="badge bg-secondary-subtle text-secondary"><?= Helpers::e($factura['moneda'] ?? 'COP') ?></span></div>
        </div>
    </div>

    <div class="table-responsive mb-4">
        <table class="table table-bordered align-middle">
            <thead class="table-light">
            <tr>
                <th>Código</th>
                <th>Descripción</th>
                <th class="text-center">Cant.</th>
                <th class="text-end">Precio Unit.</th>
                <th class="text-end">Subtotal</th>
            </tr>
            </thead>
            <tbody>
            <?php $moneda = $factura['moneda'] ?? 'COP'; ?>
            <?php foreach ($factura['items'] as $item): ?>
                <tr>
                    <td><code><?= Helpers::e($item['codigo']) ?></code></td>
                    <td><?= Helpers::e($item['producto_nombre']) ?></td>
                    <td class="text-center"><?= (int)$item['cantidad'] ?> <?= Helpers::e($item['unidad']) ?></td>
                    <td class="text-end"><?= Helpers::money($item['precio_unitario'], $moneda) ?></td>
                    <td class="text-end fw-semibold"><?= Helpers::money($item['subtotal'], $moneda) ?></td>
                </tr>
            <?php endforeach; ?>
            </tbody>
        </table>
    </div>

    <div class="row justify-content-end">
        <div class="col-md-5">
            <table class="table table-sm mb-0">
                <tr>
                    <td class="text-muted">Subtotal:</td>
                    <td class="text-end"><?= Helpers::money($factura['subtotal'], $moneda) ?></td>
                </tr>
                <?php if ((float)$factura['descuento'] > 0): ?>
                    <tr>
                        <td class="text-muted">Descuento:</td>
                        <td class="text-end text-danger">-<?= Helpers::money($factura['descuento'], $moneda) ?></td>
                    </tr>
                <?php endif; ?>
                <tr>
                    <td class="text-muted">IVA (<?= number_format((float)$factura['impuesto_porcentaje'], 2) ?>%):</td>
                    <td class="text-end"><?= Helpers::money($factura['impuesto_monto'], $moneda) ?></td>
                </tr>
                <tr class="table-light">
                    <td class="fw-bold fs-5">Total:</td>
                    <td class="text-end fw-bold fs-5 text-primary"><?= Helpers::money($factura['total'], $moneda) ?></td>
                </tr>
                <?php if ($factura['monto_recibido'] !== null): ?>
                    <tr>
                        <td class="text-muted small">Recibido en efectivo:</td>
                        <td class="text-end small"><?= Helpers::money($factura['monto_recibido'], $moneda) ?></td>
                    </tr>
                    <tr>
                        <td class="text-muted small">Cambio / Devuelta:</td>
                        <td class="text-end small fw-semibold text-success"><?= Helpers::money($factura['cambio'] ?? 0, $moneda) ?></td>
                    </tr>
                <?php endif; ?>
            </table>
        </div>
    </div>

    <?php if (!empty($factura['notas'])): ?>
        <div class="mt-4 pt-3 border-top small text-muted">
            <strong>Notas:</strong> <?= Helpers::e($factura['notas']) ?>
        </div>
    <?php endif; ?>

    <?php if (!empty($empresa['pie_factura'])): ?>
        <div class="mt-4 pt-3 border-top text-center small text-muted">
            <?= Helpers::e($empresa['pie_factura']) ?>
        </div>
    <?php endif; ?>
</div>
