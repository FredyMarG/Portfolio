<?php use App\Core\Helpers; ?>
<div class="card auth-card">
    <div class="card-body p-4 p-md-5">
        <div class="text-center mb-4">
            <div class="d-inline-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary rounded-circle mb-3" style="width: 56px; height: 56px;">
                <i class="bi bi-box-seam-fill fs-3"></i>
            </div>
            <h2 class="h4 fw-bold mb-1">StockFlow Pro</h2>
            <p class="text-muted small mb-0">Inicia sesión para gestionar el inventario y facturación</p>
        </div>

        <form action="<?= Helpers::url('/login') ?>" method="POST" autocomplete="off">
            <?= Helpers::csrfField() ?>

            <div class="mb-3">
                <label for="email" class="form-label fw-medium">Correo electrónico</label>
                <div class="input-group">
                    <span class="input-group-text"><i class="bi bi-envelope"></i></span>
                    <input type="email" class="form-control" id="email" name="email" placeholder="correo@ejemplo.com" autocomplete="off" required autofocus>
                </div>
            </div>

            <div class="mb-4">
                <label for="password" class="form-label fw-medium">Contraseña</label>
                <div class="input-group">
                    <span class="input-group-text"><i class="bi bi-lock"></i></span>
                    <input type="password" class="form-control" id="password" name="password" placeholder="••••••••" autocomplete="new-password" required>
                </div>
            </div>

            <button type="submit" class="btn btn-primary w-100 py-2 fw-semibold">
                <i class="bi bi-box-arrow-in-right me-1"></i> Ingresar
            </button>
        </form>

        <div class="text-center mt-3 small">
            ¿No tienes cuenta?
            <a href="<?= Helpers::url('/registro') ?>" class="fw-semibold text-decoration-none">Regístrate aquí</a>
        </div>
    </div>
</div>
