<?php

use App\Core\Auth;
use App\Core\Helpers;

/** @var array<int, array<string, mixed>> $productos */
/** @var array<int, array<string, mixed>> $categorias */
/** @var array<string, mixed> $filters */
/** @var int $page */
/** @var int $totalPages */
/** @var int $totalRegistros */
?>
<div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
    <form class="row g-2 flex-grow-1" method="GET" action="<?= Helpers::url('/productos') ?>">
        <div class="col-12 col-md-4">
            <input type="text" class="form-control" name="q" value="<?= Helpers::e($filters['q']) ?>" placeholder="Buscar por código o nombre...">
        </div>
        <div class="col-6 col-md-3">
            <select class="form-select" name="categoria_id">
                <option value="">Todas las categorías</option>
                <?php foreach ($categorias as $cat): ?>
                    <option value="<?= (int)$cat['id'] ?>" <?= ((string)$filters['categoria_id'] === (string)$cat['id']) ? 'selected' : '' ?>>
                        <?= Helpers::e($cat['nombre']) ?>
                    </option>
                <?php endforeach; ?>
            </select>
        </div>
        <div class="col-6 col-md-2">
            <select class="form-select" name="activo">
                <option value="">Todos</option>
                <option value="1" <?= ($filters['activo'] === '1') ? 'selected' : '' ?>>Activos</option>
                <option value="0" <?= ($filters['activo'] === '0') ? 'selected' : '' ?>>Inactivos</option>
            </select>
        </div>
        <div class="col-auto d-flex align-items-center gap-2">
            <div class="form-check">
                <input class="form-check-input" type="checkbox" name="stock_bajo" value="1" id="stockBajo" <?= $filters['stock_bajo'] ? 'checked' : '' ?>>
                <label class="form-check-label small" for="stockBajo">Stock bajo</label>
            </div>
            <button type="submit" class="btn btn-outline-primary"><i class="bi bi-search"></i></button>
        </div>
    </form>

    <div class="d-flex flex-wrap gap-2">
        <?php $queryStr = $_SERVER['QUERY_STRING'] ? '?' . $_SERVER['QUERY_STRING'] : ''; ?>
        <a href="<?= Helpers::url('/productos/exportar/pdf') . $queryStr ?>" target="_blank" class="btn btn-outline-danger" title="Exportar inventario a PDF">
            <i class="bi bi-file-earmark-pdf me-1"></i> PDF
        </a>
        <a href="<?= Helpers::url('/productos/exportar/excel') . $queryStr ?>" class="btn btn-outline-success" title="Exportar inventario a Excel">
            <i class="bi bi-file-earmark-excel me-1"></i> Excel
        </a>
        <?php if (Auth::can('productos.create')): ?>
            <button type="button" class="btn btn-outline-secondary" data-bs-toggle="modal" data-bs-target="#modalCategoria">
                <i class="bi bi-tags me-1"></i> Categoría
            </button>
            <a href="<?= Helpers::url('/productos/crear') ?>" class="btn btn-primary">
                <i class="bi bi-plus-lg me-1"></i> Nuevo Producto
            </a>
        <?php endif; ?>
    </div>
</div>

<div class="card">
    <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
            <tr>
                <th>Código</th>
                <th>Producto</th>
                <th>Categoría</th>
                <th class="text-end">P. Compra</th>
                <th class="text-end">P. Venta</th>
                <th class="text-center">Stock</th>
                <th>Estado</th>
                <th class="text-end">Acciones</th>
            </tr>
            </thead>
            <tbody>
            <?php if (empty($productos)): ?>
                <tr>
                    <td colspan="8" class="text-center py-4 text-muted">No se encontraron productos.</td>
                </tr>
            <?php else: ?>
                <?php foreach ($productos as $p): ?>
                    <?php
                    $stock = (int)$p['stock'];
                    $min = (int)$p['stock_minimo'];
                    $stockBadge = $stock === 0 ? 'badge-stock-out' : ($stock <= $min ? 'badge-stock-low' : 'badge-stock-ok');
                    ?>
                    <tr>
                        <td><code><?= Helpers::e($p['codigo']) ?></code></td>
                        <td>
                            <div class="fw-semibold"><?= Helpers::e($p['nombre']) ?></div>
                            <?php if (!empty($p['descripcion'])): ?>
                                <div class="small text-muted text-truncate" style="max-width: 260px;">
                                    <?= Helpers::e($p['descripcion']) ?>
                                </div>
                            <?php endif; ?>
                        </td>
                        <td><?= Helpers::e($p['categoria_nombre'] ?? 'Sin categoría') ?></td>
                        <td class="text-end"><?= Helpers::money($p['precio_compra']) ?></td>
                        <td class="text-end fw-semibold"><?= Helpers::money($p['precio_venta']) ?></td>
                        <td class="text-center">
                            <span class="badge <?= $stockBadge ?> px-2 py-1">
                                <?= $stock ?> <?= Helpers::e($p['unidad']) ?>
                            </span>
                        </td>
                        <td>
                            <span class="badge <?= (int)$p['activo'] ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary' ?>">
                                <?= (int)$p['activo'] ? 'Activo' : 'Inactivo' ?>
                            </span>
                        </td>
                        <td class="text-end">
                            <div class="btn-group btn-group-sm">
                                <?php if (Auth::can('inventario.entrada')): ?>
                                    <a href="<?= Helpers::url('/inventario/entrada?producto_id=' . (int)$p['id']) ?>"
                                       class="btn btn-outline-success" title="Ingresar Stock">
                                        <i class="bi bi-box-arrow-in-down"></i>
                                    </a>
                                <?php endif; ?>
                                <?php if (Auth::can('productos.edit')): ?>
                                    <a href="<?= Helpers::url('/productos/editar/' . (int)$p['id']) ?>"
                                       class="btn btn-outline-primary" title="Editar">
                                        <i class="bi bi-pencil"></i>
                                    </a>
                                <?php endif; ?>
                                <?php if (Auth::can('productos.delete')): ?>
                                    <form action="<?= Helpers::url('/productos/eliminar/' . (int)$p['id']) ?>" method="POST"
                                          class="d-inline" onsubmit="return confirm('¿Eliminar o desactivar este producto?');">
                                        <?= Helpers::csrfField() ?>
                                        <button type="submit" class="btn btn-outline-danger" title="Eliminar">
                                            <i class="bi bi-trash"></i>
                                        </button>
                                    </form>
                                <?php endif; ?>
                            </div>
                        </td>
                    </tr>
                <?php endforeach; ?>
            <?php endif; ?>
            </tbody>
        </table>
    </div>
    <?php if ($totalPages > 1): ?>
        <div class="card-footer bg-white d-flex flex-wrap justify-content-between align-items-center gap-2">
            <div class="small text-muted">Mostrando <?= count($productos) ?> de <?= $totalRegistros ?> productos (página <?= $page ?> de <?= $totalPages ?>)</div>
            <?= Helpers::renderPagination($page, $totalPages, '/productos') ?>
        </div>
    <?php endif; ?>
</div>

<?php if (Auth::can('productos.create')): ?>
<div class="modal fade" id="modalCategoria" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="catModalTitle">Gestionar Categorías</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
                <form id="formCategoria" action="<?= Helpers::url('/categorias/guardar') ?>" method="POST" class="border rounded p-3 mb-3 bg-light">
                    <?= Helpers::csrfField() ?>
                    <div class="row g-2 align-items-end">
                        <div class="col-md-4">
                            <label class="form-label small fw-medium mb-1">Nombre *</label>
                            <input type="text" name="nombre" id="catNombre" class="form-control form-control-sm" required>
                        </div>
                        <div class="col-md-5">
                            <label class="form-label small fw-medium mb-1">Descripción</label>
                            <input type="text" name="descripcion" id="catDescripcion" class="form-control form-control-sm" placeholder="Opcional">
                        </div>
                        <div class="col-md-3 d-flex gap-1">
                            <button type="submit" class="btn btn-primary btn-sm flex-grow-1" id="catSubmitBtn">Guardar</button>
                            <button type="button" class="btn btn-outline-secondary btn-sm d-none" id="catCancelEdit">Cancelar</button>
                        </div>
                    </div>
                </form>

                <div class="table-responsive" style="max-height: 260px; overflow-y: auto;">
                    <table class="table table-sm table-hover align-middle mb-0">
                        <thead class="table-light">
                        <tr>
                            <th>Nombre</th>
                            <th>Descripción</th>
                            <th class="text-end">Acción</th>
                        </tr>
                        </thead>
                        <tbody>
                        <?php foreach ($categorias as $cat): ?>
                            <tr>
                                <td class="fw-semibold"><?= Helpers::e($cat['nombre']) ?></td>
                                <td class="small text-muted"><?= Helpers::e($cat['descripcion'] ?? '-') ?></td>
                                <td class="text-end">
                                    <button type="button" class="btn btn-outline-primary btn-sm py-0 px-2 btn-edit-cat"
                                            data-id="<?= (int)$cat['id'] ?>"
                                            data-nombre="<?= Helpers::e($cat['nombre']) ?>"
                                            data-descripcion="<?= Helpers::e($cat['descripcion'] ?? '') ?>">
                                        <i class="bi bi-pencil"></i>
                                    </button>
                                    <form action="<?= Helpers::url('/categorias/eliminar/' . (int)$cat['id']) ?>" method="POST" class="d-inline"
                                          onsubmit="return confirm('¿Eliminar esta categoría? Los productos asociados quedarán sin categoría.');">
                                        <?= Helpers::csrfField() ?>
                                        <button type="submit" class="btn btn-outline-danger btn-sm py-0 px-2">
                                            <i class="bi bi-trash"></i>
                                        </button>
                                    </form>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</div>
<script>
(() => {
    const form = document.getElementById('formCategoria');
    const nombre = document.getElementById('catNombre');
    const desc = document.getElementById('catDescripcion');
    const submitBtn = document.getElementById('catSubmitBtn');
    const cancelBtn = document.getElementById('catCancelEdit');
    const createAction = '<?= Helpers::url('/categorias/guardar') ?>';
    const updateBase = '<?= Helpers::url('/categorias/actualizar/') ?>';

    const resetCatForm = () => {
        form.action = createAction;
        nombre.value = '';
        desc.value = '';
        submitBtn.textContent = 'Guardar';
        cancelBtn.classList.add('d-none');
    };

    document.querySelectorAll('.btn-edit-cat').forEach(btn => {
        btn.addEventListener('click', () => {
            form.action = updateBase + btn.dataset.id;
            nombre.value = btn.dataset.nombre;
            desc.value = btn.dataset.descripcion;
            submitBtn.textContent = 'Actualizar';
            cancelBtn.classList.remove('d-none');
            nombre.focus();
        });
    });

    cancelBtn?.addEventListener('click', resetCatForm);
})();
</script>
<?php endif; ?>
