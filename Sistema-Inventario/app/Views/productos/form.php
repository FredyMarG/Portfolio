<?php

use App\Core\Helpers;

/** @var array<string, mixed>|null $producto */
/** @var array<int, array<string, mixed>> $categorias */
$isEdit = $producto !== null;
$action = $isEdit
    ? Helpers::url('/productos/actualizar/' . (int)$producto['id'])
    : Helpers::url('/productos/guardar');
?>
<div class="card" style="max-width: 820px;">
    <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
        <h2 class="h6 mb-0 fw-bold"><?= $isEdit ? 'Editar Producto' : 'Registrar Nuevo Producto' ?></h2>
        <a href="<?= Helpers::url('/productos') ?>" class="btn btn-sm btn-outline-secondary">Volver</a>
    </div>
    <div class="card-body">
        <form action="<?= $action ?>" method="POST">
            <?= Helpers::csrfField() ?>
            <div class="row g-3">
                <div class="col-md-4">
                    <label class="form-label fw-medium">Código / SKU *</label>
                    <input type="text" name="codigo" class="form-control" value="<?= Helpers::e($producto['codigo'] ?? '') ?>" required>
                </div>
                <div class="col-md-8">
                    <label class="form-label fw-medium">Nombre del Producto *</label>
                    <input type="text" name="nombre" class="form-control" value="<?= Helpers::e($producto['nombre'] ?? '') ?>" required>
                </div>

                <div class="col-md-6">
                    <label class="form-label fw-medium">Categoría</label>
                    <select name="categoria_id" class="form-select">
                        <option value="">-- Sin categoría --</option>
                        <?php foreach ($categorias as $cat): ?>
                            <option value="<?= (int)$cat['id'] ?>" <?= ((int)($producto['categoria_id'] ?? 0) === (int)$cat['id']) ? 'selected' : '' ?>>
                                <?= Helpers::e($cat['nombre']) ?>
                            </option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <div class="col-md-6">
                    <label class="form-label fw-medium">Unidad de Medida</label>
                    <input type="text" name="unidad" class="form-control" value="<?= Helpers::e($producto['unidad'] ?? 'Unidad') ?>" placeholder="Ej: Unidad, Caja, Kg">
                </div>

                <div class="col-md-3">
                    <label class="form-label fw-medium">Precio Compra *</label>
                    <input type="number" step="0.01" min="0" name="precio_compra" class="form-control" value="<?= Helpers::e((string)($producto['precio_compra'] ?? '0.00')) ?>" required>
                </div>
                <div class="col-md-3">
                    <label class="form-label fw-medium">Precio Venta *</label>
                    <input type="number" step="0.01" min="0" name="precio_venta" class="form-control" value="<?= Helpers::e((string)($producto['precio_venta'] ?? '0.00')) ?>" required>
                </div>

                <?php if (!$isEdit): ?>
                    <div class="col-md-3">
                        <label class="form-label fw-medium">Stock Inicial *</label>
                        <input type="number" min="0" name="stock" class="form-control" value="0" required>
                    </div>
                <?php else: ?>
                    <div class="col-md-3">
                        <label class="form-label fw-medium">Stock Actual</label>
                        <input type="text" class="form-control bg-light" value="<?= (int)$producto['stock'] ?> (usar Ingresos)" disabled>
                    </div>
                <?php endif; ?>

                <div class="col-md-3">
                    <label class="form-label fw-medium">Stock Mínimo</label>
                    <input type="number" min="0" name="stock_minimo" class="form-control" value="<?= (int)($producto['stock_minimo'] ?? 5) ?>">
                </div>

                <div class="col-12">
                    <label class="form-label fw-medium">Descripción</label>
                    <textarea name="descripcion" class="form-control" rows="2"><?= Helpers::e($producto['descripcion'] ?? '') ?></textarea>
                </div>

                <div class="col-md-4">
                    <label class="form-label fw-medium">Estado</label>
                    <select name="activo" class="form-select">
                        <option value="1" <?= ((int)($producto['activo'] ?? 1) === 1) ? 'selected' : '' ?>>Activo</option>
                        <option value="0" <?= ((int)($producto['activo'] ?? 1) === 0) ? 'selected' : '' ?>>Inactivo</option>
                    </select>
                </div>
            </div>

            <div class="mt-4 d-flex gap-2">
                <button type="submit" class="btn btn-primary">
                    <i class="bi bi-check-lg me-1"></i> <?= $isEdit ? 'Guardar Cambios' : 'Crear Producto' ?>
                </button>
                <a href="<?= Helpers::url('/productos') ?>" class="btn btn-outline-secondary">Cancelar</a>
            </div>
        </form>
    </div>
</div>
