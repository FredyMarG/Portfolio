<?php

use App\Core\Auth;
use App\Core\Helpers;

/** @var array<int, array<string, mixed>> $roles */
/** @var array<int, array<string, mixed>> $usuarios */
?>
<div class="d-flex justify-content-between align-items-center mb-3">
    <p class="text-muted mb-0">Administra los usuarios y sus permisos de acceso por rol.</p>
    <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#modalNuevoUsuario">
        <i class="bi bi-person-plus me-1"></i> Nuevo Usuario
    </button>
</div>

<div class="row g-3 mb-4">
    <?php foreach ($roles as $r): ?>
        <div class="col-md-4">
            <div class="card h-100">
                <div class="card-body">
                    <span class="badge bg-primary text-capitalize mb-2"><?= Helpers::e($r['nombre']) ?></span>
                    <div class="small text-muted"><?= Helpers::e($r['descripcion']) ?></div>
                </div>
            </div>
        </div>
    <?php endforeach; ?>
</div>

<div class="card">
    <div class="table-responsive">
        <table class="table table-hover mb-0">
            <thead class="table-light">
            <tr>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Creado</th>
                <th class="text-end">Acción</th>
            </tr>
            </thead>
            <tbody>
            <?php foreach ($usuarios as $u): ?>
                <tr>
                    <td class="fw-semibold"><?= Helpers::e($u['nombre']) ?></td>
                    <td><?= Helpers::e($u['email']) ?></td>
                    <td><span class="badge bg-primary-subtle text-primary text-capitalize"><?= Helpers::e($u['rol_nombre']) ?></span></td>
                    <td>
                        <span class="badge <?= (int)$u['activo'] ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary' ?>">
                            <?= (int)$u['activo'] ? 'Activo' : 'Inactivo' ?>
                        </span>
                    </td>
                    <td class="small text-muted"><?= date('d/m/Y', strtotime($u['creado_en'])) ?></td>
                    <td class="text-end">
                        <div class="d-inline-flex gap-1">
                            <button type="button" class="btn btn-sm btn-outline-primary btn-edit-user"
                                    data-bs-toggle="modal" data-bs-target="#modalEditarUsuario"
                                    data-id="<?= (int)$u['id'] ?>"
                                    data-nombre="<?= Helpers::e($u['nombre']) ?>"
                                    data-email="<?= Helpers::e($u['email']) ?>"
                                    data-rol="<?= (int)$u['rol_id'] ?>"
                                    data-activo="<?= (int)$u['activo'] ?>">
                                <i class="bi bi-pencil"></i> Editar
                            </button>
                            <?php if ((int)$u['id'] !== Auth::id()): ?>
                                <form action="<?= Helpers::url('/usuarios/estado/' . (int)$u['id']) ?>" method="POST" class="d-inline"
                                      onsubmit="return confirm('¿Seguro que deseas <?= (int)$u['activo'] ? 'desactivar' : 'activar' ?> este usuario?');">
                                    <?= Helpers::csrfField() ?>
                                    <button type="submit" class="btn btn-sm <?= (int)$u['activo'] ? 'btn-outline-danger' : 'btn-outline-success' ?>">
                                        <i class="bi <?= (int)$u['activo'] ? 'bi-person-slash' : 'bi-person-check' ?>"></i>
                                        <?= (int)$u['activo'] ? 'Desactivar' : 'Activar' ?>
                                    </button>
                                </form>
                            <?php endif; ?>
                        </div>
                    </td>
                </tr>
            <?php endforeach; ?>
            </tbody>
        </table>
    </div>
</div>

<!-- Modal Nuevo Usuario -->
<div class="modal fade" id="modalNuevoUsuario" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog">
        <form class="modal-content" action="<?= Helpers::url('/usuarios/guardar') ?>" method="POST">
            <?= Helpers::csrfField() ?>
            <div class="modal-header">
                <h5 class="modal-title">Crear Usuario</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
                <div class="mb-3">
                    <label class="form-label">Nombre completo *</label>
                    <input type="text" name="nombre" class="form-control" required>
                </div>
                <div class="mb-3">
                    <label class="form-label">Correo electrónico *</label>
                    <input type="email" name="email" class="form-control" required>
                </div>
                <div class="mb-3">
                    <label class="form-label">Contraseña (mín. 6 caracteres) *</label>
                    <input type="password" name="password" minlength="6" class="form-control" required>
                </div>
                <div class="mb-3">
                    <label class="form-label">Rol / Permisos *</label>
                    <select name="rol_id" class="form-select" required>
                        <?php foreach ($roles as $r): ?>
                            <option value="<?= (int)$r['id'] ?>"><?= ucfirst(Helpers::e($r['nombre'])) ?> - <?= Helpers::e($r['descripcion']) ?></option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" name="activo" value="1" id="newActive" checked>
                    <label class="form-check-label" for="newActive">Usuario activo</label>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                <button type="submit" class="btn btn-primary">Crear Usuario</button>
            </div>
        </form>
    </div>
</div>

<!-- Modal Editar Usuario -->
<div class="modal fade" id="modalEditarUsuario" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog">
        <form class="modal-content" id="formEditUser" method="POST">
            <?= Helpers::csrfField() ?>
            <div class="modal-header">
                <h5 class="modal-title">Editar Usuario</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
                <div class="mb-3">
                    <label class="form-label">Nombre completo *</label>
                    <input type="text" name="nombre" id="editNombre" class="form-control" required>
                </div>
                <div class="mb-3">
                    <label class="form-label">Correo electrónico *</label>
                    <input type="email" name="email" id="editEmail" class="form-control" required>
                </div>
                <div class="mb-3">
                    <label class="form-label">Nueva contraseña (dejar vacío para mantener)</label>
                    <input type="password" name="password" minlength="6" class="form-control">
                </div>
                <div class="mb-3">
                    <label class="form-label">Rol / Permisos *</label>
                    <select name="rol_id" id="editRol" class="form-select" required>
                        <?php foreach ($roles as $r): ?>
                            <option value="<?= (int)$r['id'] ?>"><?= ucfirst(Helpers::e($r['nombre'])) ?></option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" name="activo" value="1" id="editActivo">
                    <label class="form-check-label" for="editActivo">Usuario activo</label>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                <button type="submit" class="btn btn-primary">Guardar Cambios</button>
            </div>
        </form>
    </div>
</div>

<script>
document.querySelectorAll('.btn-edit-user').forEach(btn => {
    btn.addEventListener('click', () => {
        const d = btn.dataset;
        document.getElementById('formEditUser').action = '<?= Helpers::url('/usuarios/actualizar/') ?>' + d.id;
        document.getElementById('editNombre').value = d.nombre;
        document.getElementById('editEmail').value = d.email;
        document.getElementById('editRol').value = d.rol;
        document.getElementById('editActivo').checked = d.activo === '1';
    });
});
</script>
