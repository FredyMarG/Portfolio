<?php

use App\Core\Helpers;

/** @var array<string, mixed> $user */
?>
<div class="row g-4">
    <div class="col-12 col-md-5">
        <div class="card">
            <div class="card-header bg-white py-3">
                <h2 class="h6 mb-0 fw-bold"><i class="bi bi-person-badge me-2 text-primary"></i>Información de Cuenta</h2>
            </div>
            <div class="card-body">
                <div class="mb-3">
                    <div class="text-muted small">Nombre</div>
                    <div class="fw-semibold"><?= Helpers::e($user['nombre'] ?? '') ?></div>
                </div>
                <div class="mb-3">
                    <div class="text-muted small">Correo electrónico</div>
                    <div class="fw-semibold"><?= Helpers::e($user['email'] ?? '') ?></div>
                </div>
                <div>
                    <div class="text-muted small">Rol asignado</div>
                    <span class="badge bg-primary text-capitalize"><?= Helpers::e($user['rol'] ?? '') ?></span>
                    <?php if (!empty($user['rol_descripcion'])): ?>
                        <div class="small text-muted mt-1"><?= Helpers::e($user['rol_descripcion']) ?></div>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </div>

    <div class="col-12 col-md-7">
        <div class="card">
            <div class="card-header bg-white py-3">
                <h2 class="h6 mb-0 fw-bold"><i class="bi bi-key me-2 text-primary"></i>Cambiar Contraseña</h2>
            </div>
            <div class="card-body">
                <form action="<?= Helpers::url('/perfil/password') ?>" method="POST">
                    <?= Helpers::csrfField() ?>

                    <div class="mb-3">
                        <label for="current_password" class="form-label fw-medium">Contraseña actual *</label>
                        <input type="password" class="form-control" id="current_password" name="current_password" required>
                    </div>

                    <div class="mb-3">
                        <label for="new_password" class="form-label fw-medium">Nueva contraseña (mín. 6 caracteres) *</label>
                        <input type="password" class="form-control" id="new_password" name="new_password" minlength="6" required>
                    </div>

                    <div class="mb-4">
                        <label for="confirm_password" class="form-label fw-medium">Confirmar nueva contraseña *</label>
                        <input type="password" class="form-control" id="confirm_password" name="confirm_password" minlength="6" required>
                    </div>

                    <button type="submit" class="btn btn-primary">
                        <i class="bi bi-check-lg me-1"></i> Actualizar Contraseña
                    </button>
                </form>
            </div>
        </div>
    </div>
</div>
