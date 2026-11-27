<?php use App\Core\Helpers; ?>
<div class="card auth-card">
    <div class="card-body p-4 p-md-5">
        <div class="text-center mb-4">
            <div class="d-inline-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary rounded-circle mb-3" style="width: 56px; height: 56px;">
                <i class="bi bi-person-plus-fill fs-3"></i>
            </div>
            <h2 class="h4 fw-bold mb-1">Crear Cuenta</h2>
            <p class="text-muted small mb-0">Regístrate en StockFlow Pro para acceder al sistema</p>
        </div>

        <form action="<?= Helpers::url('/registro') ?>" method="POST">
            <?= Helpers::csrfField() ?>

            <div class="mb-3">
                <label for="nombre" class="form-label fw-medium">Nombre completo</label>
                <div class="input-group">
                    <span class="input-group-text"><i class="bi bi-person"></i></span>
                    <input type="text" class="form-control" id="nombre" name="nombre" placeholder="Tu nombre" required autofocus>
                </div>
            </div>

            <div class="mb-3">
                <label for="email" class="form-label fw-medium">Correo electrónico</label>
                <div class="input-group">
                    <span class="input-group-text"><i class="bi bi-envelope"></i></span>
                    <input type="email" class="form-control" id="email" name="email" placeholder="correo@ejemplo.com" required>
                </div>
            </div>

            <div class="mb-3">
                <label for="password" class="form-label fw-medium">Contraseña</label>
                <div class="input-group">
                    <span class="input-group-text"><i class="bi bi-lock"></i></span>
                    <input type="password" class="form-control" id="password" name="password" placeholder="Mínimo 6 caracteres" minlength="6" required>
                </div>
            </div>

            <div class="mb-4">
                <label for="password_confirm" class="form-label fw-medium">Confirmar contraseña</label>
                <div class="input-group">
                    <span class="input-group-text"><i class="bi bi-lock-fill"></i></span>
                    <input type="password" class="form-control" id="password_confirm" name="password_confirm" placeholder="Repite tu contraseña" minlength="6" required>
                </div>
            </div>

            <button type="submit" class="btn btn-primary w-100 py-2 fw-semibold">
                <i class="bi bi-person-check me-1"></i> Registrarme
            </button>
        </form>

        <div class="text-center mt-3 small">
            ¿Ya tienes una cuenta?
            <a href="<?= Helpers::url('/login') ?>" class="fw-semibold text-decoration-none">Inicia sesión aquí</a>
        </div>
    </div>
</div>
