<?php

use App\Core\Auth;
use App\Core\Helpers;

/** @var array<int, array<string, mixed>> $productos */
/** @var array<int, array<string, mixed>> $proveedores */
/** @var array<int, array<string, mixed>> $ultimasEntradas */
/** @var int $selectedId */
?>
<div class="row g-4">
    <div class="col-12 col-lg-5">
        <div class="card">
            <div class="card-header bg-white py-3">
                <h2 class="h6 mb-0 fw-bold">
                    <i class="bi bi-box-arrow-in-down text-success me-2"></i>Modificar / Ingresar Stock
                </h2>
            </div>
            <div class="card-body">
                <form action="<?= Helpers::url('/inventario/entrada') ?>" method="POST">
                    <?= Helpers::csrfField() ?>

                    <div class="mb-3">
                        <label class="form-label fw-medium">Producto *</label>
                        <select name="producto_id" id="productoSelect" class="form-select" required>
                            <option value="">-- Selecciona un producto --</option>
                            <?php foreach ($productos as $p): ?>
                                <option value="<?= (int)$p['id'] ?>"
                                        data-stock="<?= (int)$p['stock'] ?>"
                                        data-costo="<?= Helpers::e((string)$p['precio_compra']) ?>"
                                        <?= ($selectedId === (int)$p['id']) ? 'selected' : '' ?>>
                                    [<?= Helpers::e($p['codigo']) ?>] <?= Helpers::e($p['nombre']) ?> (Stock: <?= (int)$p['stock'] ?>)
                                </option>
                            <?php endforeach; ?>
                        </select>
                    </div>

                    <div class="row g-3 mb-3">
                        <div class="col-md-6">
                            <label class="form-label fw-medium">Tipo de Movimiento *</label>
                            <select name="tipo" class="form-select" required>
                                <option value="entrada">Ingreso de mercancía (+)</option>
                                <?php if (Auth::can('inventario.ajuste')): ?>
                                    <option value="ajuste_positivo">Ajuste positivo (+)</option>
                                    <option value="ajuste_negativo">Ajuste negativo (-)</option>
                                <?php endif; ?>
                            </select>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label fw-medium">Cantidad *</label>
                            <input type="number" name="cantidad" min="1" class="form-control" placeholder="Ej: 10" required>
                        </div>
                    </div>

                    <div class="row g-3 mb-3">
                        <div class="col-md-6">
                            <label class="form-label fw-medium">Costo Unitario (opcional)</label>
                            <input type="number" step="0.01" min="0" name="costo_unitario" id="costoInput" class="form-control" placeholder="Actualiza precio compra">
                        </div>
                        <div class="col-md-6">
                            <label class="form-label fw-medium">Referencia / Factura Compra</label>
                            <input type="text" name="referencia" class="form-control" placeholder="Ej: OC-2026-01">
                        </div>
                    </div>

                    <div class="mb-3">
                        <label class="form-label fw-medium">Proveedor (opcional)</label>
                        <select name="proveedor_id" class="form-select">
                            <option value="">-- Sin proveedor --</option>
                            <?php foreach ($proveedores as $pr): ?>
                                <option value="<?= (int)$pr['id'] ?>"><?= Helpers::e($pr['nombre']) ?></option>
                            <?php endforeach; ?>
                        </select>
                    </div>

                    <div class="mb-4">
                        <label class="form-label fw-medium">Motivo / Observación</label>
                        <input type="text" name="motivo" class="form-control" placeholder="Ej: Reposición de proveedor">
                    </div>

                    <button type="submit" class="btn btn-success w-100 fw-semibold">
                        <i class="bi bi-check2-circle me-1"></i> Aplicar Movimiento al Inventario
                    </button>
                </form>
            </div>
        </div>
    </div>

    <div class="col-12 col-lg-7">
        <div class="card">
            <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                <h2 class="h6 mb-0 fw-bold">Últimos Ingresos Registrados</h2>
                <?php if (Auth::can('inventario.movimientos')): ?>
                    <a href="<?= Helpers::url('/inventario/movimientos') ?>" class="btn btn-sm btn-outline-secondary">Ver Kardex completo</a>
                <?php endif; ?>
            </div>
            <div class="table-responsive">
                <table class="table table-hover mb-0">
                    <thead class="table-light">
                    <tr>
                        <th>Fecha</th>
                        <th>Producto</th>
                        <th class="text-center">Cant.</th>
                        <th class="text-center">Stock</th>
                        <th>Ref.</th>
                        <th>Usuario</th>
                    </tr>
                    </thead>
                    <tbody>
                    <?php if (empty($ultimasEntradas)): ?>
                        <tr><td colspan="6" class="text-center text-muted py-4">Sin ingresos registrados aún.</td></tr>
                    <?php else: ?>
                        <?php foreach ($ultimasEntradas as $m): ?>
                            <tr>
                                <td class="small text-muted"><?= date('d/m/Y H:i', strtotime($m['creado_en'])) ?></td>
                                <td>
                                    <div class="fw-semibold"><?= Helpers::e($m['producto_nombre']) ?></div>
                                    <div class="small text-muted"><?= Helpers::e($m['producto_codigo']) ?></div>
                                </td>
                                <td class="text-center"><span class="badge bg-success-subtle text-success">+<?= (int)$m['cantidad'] ?></span></td>
                                <td class="text-center small"><?= (int)$m['stock_anterior'] ?> → <strong><?= (int)$m['stock_nuevo'] ?></strong></td>
                                <td class="small"><?= Helpers::e($m['referencia'] ?? '-') ?></td>
                                <td class="small"><?= Helpers::e($m['usuario_nombre']) ?></td>
                            </tr>
                        <?php endforeach; ?>
                    <?php endif; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>

<script>
document.getElementById('productoSelect')?.addEventListener('change', function () {
    const opt = this.options[this.selectedIndex];
    const costoInput = document.getElementById('costoInput');
    if (opt && opt.dataset.costo && costoInput) {
        costoInput.value = opt.dataset.costo;
    }
});
</script>
