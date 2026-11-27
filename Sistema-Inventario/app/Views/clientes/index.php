<?php

use App\Core\Auth;
use App\Core\Helpers;

/** @var array<int, array<string, mixed>> $clientes */
/** @var int $page */
/** @var int $totalPages */
/** @var int $totalRegistros */
/** @var string $q */
?>
<div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
    <form class="d-flex gap-2" method="GET" action="<?= Helpers::url('/clientes') ?>">
        <input type="text" name="q" class="form-control form-control-sm" value="<?= Helpers::e($q) ?>" placeholder="Buscar por nombre, documento o teléfono..." style="min-width: 260px;">
        <button type="submit" class="btn btn-outline-primary btn-sm"><i class="bi bi-search"></i></button>
    </form>

    <?php if (Auth::can('facturas.create')): ?>
        <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#modalCliente" id="btnNuevoCliente">
            <i class="bi bi-person-plus me-1"></i> Nuevo Cliente
        </button>
    <?php endif; ?>
</div>

<div class="card">
    <div class="table-responsive">
        <table class="table table-hover mb-0">
            <thead class="table-light">
            <tr>
                <th>Nombre / Razón Social</th>
                <th>Documento / NIT</th>
                <th>Teléfono</th>
                <th>Correo</th>
                <th>Dirección</th>
                <th class="text-end">Acción</th>
            </tr>
            </thead>
            <tbody>
            <?php if (empty($clientes)): ?>
                <tr><td colspan="6" class="text-center text-muted py-4">No hay clientes registrados.</td></tr>
            <?php else: ?>
                <?php foreach ($clientes as $c): ?>
                    <tr>
                        <td class="fw-semibold"><?= Helpers::e($c['nombre']) ?></td>
                        <td><?= Helpers::e($c['documento'] ?? '-') ?></td>
                        <td><?= Helpers::e($c['telefono'] ?? '-') ?></td>
                        <td class="small"><?= Helpers::e($c['email'] ?? '-') ?></td>
                        <td class="small text-muted"><?= Helpers::e($c['direccion'] ?? '-') ?></td>
                        <td class="text-end">
                            <?php if (Auth::can('facturas.create')): ?>
                                <button type="button" class="btn btn-outline-primary btn-sm py-0 px-2 btn-edit-cli"
                                        data-bs-toggle="modal" data-bs-target="#modalCliente"
                                        data-id="<?= (int)$c['id'] ?>"
                                        data-nombre="<?= Helpers::e($c['nombre']) ?>"
                                        data-documento="<?= Helpers::e($c['documento'] ?? '') ?>"
                                        data-telefono="<?= Helpers::e($c['telefono'] ?? '') ?>"
                                        data-email="<?= Helpers::e($c['email'] ?? '') ?>"
                                        data-direccion="<?= Helpers::e($c['direccion'] ?? '') ?>">
                                    <i class="bi bi-pencil"></i>
                                </button>
                                <form action="<?= Helpers::url('/clientes/eliminar/' . (int)$c['id']) ?>" method="POST" class="d-inline"
                                      onsubmit="return confirm('¿Eliminar este cliente del directorio?');">
                                    <?= Helpers::csrfField() ?>
                                    <button type="submit" class="btn btn-outline-danger btn-sm py-0 px-2">
                                        <i class="bi bi-trash"></i>
                                    </button>
                                </form>
                            <?php endif; ?>
                        </td>
                    </tr>
                <?php endforeach; ?>
            <?php endif; ?>
            </tbody>
        </table>
    </div>
    <?php if ($totalPages > 1): ?>
        <div class="card-footer bg-white d-flex flex-wrap justify-content-between align-items-center gap-2">
            <div class="small text-muted">Mostrando <?= count($clientes) ?> de <?= $totalRegistros ?> clientes (página <?= $page ?> de <?= $totalPages ?>)</div>
            <?= Helpers::renderPagination($page, $totalPages, '/clientes') ?>
        </div>
    <?php endif; ?>
</div>

<?php if (Auth::can('facturas.create')): ?>
<div class="modal fade" id="modalCliente" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog">
        <form class="modal-content" id="formCliente" action="<?= Helpers::url('/clientes/guardar') ?>" method="POST">
            <?= Helpers::csrfField() ?>
            <div class="modal-header">
                <h5 class="modal-title" id="cliModalTitle">Nuevo Cliente</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
                <div class="mb-3">
                    <label class="form-label">Nombre / Razón Social *</label>
                    <input type="text" name="nombre" id="cliNombre" class="form-control" required>
                </div>
                <div class="row g-2 mb-3">
                    <div class="col-md-6">
                        <label class="form-label">Documento / NIT</label>
                        <input type="text" name="documento" id="cliDocumento" class="form-control">
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Teléfono</label>
                        <input type="text" name="telefono" id="cliTelefono" class="form-control">
                    </div>
                </div>
                <div class="mb-3">
                    <label class="form-label">Correo electrónico</label>
                    <input type="email" name="email" id="cliEmail" class="form-control">
                </div>
                <div class="mb-0">
                    <label class="form-label">Dirección</label>
                    <input type="text" name="direccion" id="cliDireccion" class="form-control">
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
    const form = document.getElementById('formCliente');
    const title = document.getElementById('cliModalTitle');
    const createUrl = '<?= Helpers::url('/clientes/guardar') ?>';
    const updateUrl = '<?= Helpers::url('/clientes/actualizar/') ?>';

    document.getElementById('btnNuevoCliente')?.addEventListener('click', () => {
        form.action = createUrl;
        title.textContent = 'Nuevo Cliente';
        form.reset();
    });

    document.querySelectorAll('.btn-edit-cli').forEach(btn => {
        btn.addEventListener('click', () => {
            const d = btn.dataset;
            form.action = updateUrl + d.id;
            title.textContent = 'Editar Cliente';
            document.getElementById('cliNombre').value = d.nombre;
            document.getElementById('cliDocumento').value = d.documento;
            document.getElementById('cliTelefono').value = d.telefono;
            document.getElementById('cliEmail').value = d.email;
            document.getElementById('cliDireccion').value = d.direccion;
        });
    });
})();
</script>
<?php endif; ?>
