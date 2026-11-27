<?php

use App\Core\Helpers;

/** @var array<int, array<string, mixed>> $proveedores */
/** @var int $page */
/** @var int $totalPages */
/** @var int $totalRegistros */
/** @var string $q */
?>
<div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
    <form class="d-flex gap-2" method="GET" action="<?= Helpers::url('/proveedores') ?>">
        <input type="text" name="q" class="form-control form-control-sm" value="<?= Helpers::e($q) ?>" placeholder="Buscar por nombre, NIT o teléfono..." style="min-width: 260px;">
        <button type="submit" class="btn btn-outline-primary btn-sm"><i class="bi bi-search"></i></button>
    </form>

    <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#modalProveedor" id="btnNuevoProveedor">
        <i class="bi bi-plus-lg me-1"></i> Nuevo Proveedor
    </button>
</div>

<div class="card">
    <div class="table-responsive">
        <table class="table table-hover mb-0">
            <thead class="table-light">
            <tr>
                <th>Nombre / Empresa</th>
                <th>NIT / RUC</th>
                <th>Teléfono</th>
                <th>Correo</th>
                <th>Dirección</th>
                <th class="text-end">Acción</th>
            </tr>
            </thead>
            <tbody>
            <?php if (empty($proveedores)): ?>
                <tr><td colspan="6" class="text-center text-muted py-4">No hay proveedores registrados.</td></tr>
            <?php else: ?>
                <?php foreach ($proveedores as $pr): ?>
                    <tr>
                        <td class="fw-semibold"><?= Helpers::e($pr['nombre']) ?></td>
                        <td><?= Helpers::e($pr['nit'] ?? '-') ?></td>
                        <td><?= Helpers::e($pr['telefono'] ?? '-') ?></td>
                        <td class="small"><?= Helpers::e($pr['email'] ?? '-') ?></td>
                        <td class="small text-muted"><?= Helpers::e($pr['direccion'] ?? '-') ?></td>
                        <td class="text-end">
                            <button type="button" class="btn btn-outline-primary btn-sm py-0 px-2 btn-edit-prov"
                                    data-bs-toggle="modal" data-bs-target="#modalProveedor"
                                    data-id="<?= (int)$pr['id'] ?>"
                                    data-nombre="<?= Helpers::e($pr['nombre']) ?>"
                                    data-nit="<?= Helpers::e($pr['nit'] ?? '') ?>"
                                    data-telefono="<?= Helpers::e($pr['telefono'] ?? '') ?>"
                                    data-email="<?= Helpers::e($pr['email'] ?? '') ?>"
                                    data-direccion="<?= Helpers::e($pr['direccion'] ?? '') ?>">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <form action="<?= Helpers::url('/proveedores/eliminar/' . (int)$pr['id']) ?>" method="POST" class="d-inline"
                                  onsubmit="return confirm('¿Eliminar este proveedor?');">
                                <?= Helpers::csrfField() ?>
                                <button type="submit" class="btn btn-outline-danger btn-sm py-0 px-2">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </form>
                        </td>
                    </tr>
                <?php endforeach; ?>
            <?php endif; ?>
            </tbody>
        </table>
    </div>
    <?php if ($totalPages > 1): ?>
        <div class="card-footer bg-white d-flex flex-wrap justify-content-between align-items-center gap-2">
            <div class="small text-muted">Mostrando <?= count($proveedores) ?> de <?= $totalRegistros ?> proveedores (página <?= $page ?> de <?= $totalPages ?>)</div>
            <?= Helpers::renderPagination($page, $totalPages, '/proveedores') ?>
        </div>
    <?php endif; ?>
</div>

<div class="modal fade" id="modalProveedor" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog">
        <form class="modal-content" id="formProveedor" action="<?= Helpers::url('/proveedores/guardar') ?>" method="POST">
            <?= Helpers::csrfField() ?>
            <div class="modal-header">
                <h5 class="modal-title" id="provModalTitle">Nuevo Proveedor</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
                <div class="mb-3">
                    <label class="form-label">Nombre / Empresa *</label>
                    <input type="text" name="nombre" id="provNombre" class="form-control" required>
                </div>
                <div class="row g-2 mb-3">
                    <div class="col-md-6">
                        <label class="form-label">NIT / RUC</label>
                        <input type="text" name="nit" id="provNit" class="form-control">
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Teléfono</label>
                        <input type="text" name="telefono" id="provTelefono" class="form-control">
                    </div>
                </div>
                <div class="mb-3">
                    <label class="form-label">Correo electrónico</label>
                    <input type="email" name="email" id="provEmail" class="form-control">
                </div>
                <div class="mb-0">
                    <label class="form-label">Dirección</label>
                    <input type="text" name="direccion" id="provDireccion" class="form-control">
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                <button type="submit" class="btn btn-primary">Guardar</button>
            </div>
        </form>
    </div>
</div>
<script>
(() => {
    const form = document.getElementById('formProveedor');
    const title = document.getElementById('provModalTitle');
    const createUrl = '<?= Helpers::url('/proveedores/guardar') ?>';
    const updateUrl = '<?= Helpers::url('/proveedores/actualizar/') ?>';

    document.getElementById('btnNuevoProveedor')?.addEventListener('click', () => {
        form.action = createUrl;
        title.textContent = 'Nuevo Proveedor';
        form.reset();
    });

    document.querySelectorAll('.btn-edit-prov').forEach(btn => {
        btn.addEventListener('click', () => {
            const d = btn.dataset;
            form.action = updateUrl + d.id;
            title.textContent = 'Editar Proveedor';
            document.getElementById('provNombre').value = d.nombre;
            document.getElementById('provNit').value = d.nit;
            document.getElementById('provTelefono').value = d.telefono;
            document.getElementById('provEmail').value = d.email;
            document.getElementById('provDireccion').value = d.direccion;
        });
    });
})();
</script>
