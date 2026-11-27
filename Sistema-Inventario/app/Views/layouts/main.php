<?php

use App\Core\Auth;
use App\Core\Helpers;

/** @var string $title */
/** @var string $content */
$currentPath = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
$user = Auth::user();
$flashes = Helpers::getFlashes();
$isActive = static fn(string $prefix): string => str_contains($currentPath, $prefix) ? 'active' : '';
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= Helpers::e($title ?? 'Sistema de Inventario') ?> | StockFlow Pro</title>
    <link rel="icon" type="image/svg+xml" href="<?= Helpers::favicon() ?>">
    <link rel="stylesheet" href="<?= Helpers::url('/assets/vendor/bootstrap-icons/bootstrap-icons.min.css') ?>">
    <link rel="stylesheet" href="<?= Helpers::url('/assets/css/app.css') ?>">
</head>
<body>
<div class="app-wrapper">
    <!-- Sidebar -->
    <aside class="app-sidebar" id="appSidebar">
        <a href="<?= Helpers::url('/dashboard') ?>" class="sidebar-brand">
            <i class="bi bi-box-seam-fill"></i>
            <span>StockFlow Pro</span>
        </a>

        <nav class="sidebar-nav">
            <div class="nav-section-title">Principal</div>
            <a href="<?= Helpers::url('/dashboard') ?>" class="nav-link <?= $isActive('/dashboard') ?>">
                <i class="bi bi-speedometer2"></i>
                <span>Dashboard</span>
            </a>

            <?php if (Auth::can('productos.view')): ?>
                <div class="nav-section-title">Inventario</div>
                <a href="<?= Helpers::url('/productos') ?>" class="nav-link <?= $isActive('/productos') ?>">
                    <i class="bi bi-grid-fill"></i>
                    <span>Productos</span>
                </a>
            <?php endif; ?>

            <?php if (Auth::can('inventario.entrada')): ?>
                <a href="<?= Helpers::url('/inventario/entrada') ?>" class="nav-link <?= $isActive('/inventario/entrada') ?>">
                    <i class="bi bi-box-arrow-in-down"></i>
                    <span>Ingresos de Stock</span>
                </a>
                <a href="<?= Helpers::url('/proveedores') ?>" class="nav-link <?= $isActive('/proveedores') ?>">
                    <i class="bi bi-truck"></i>
                    <span>Proveedores</span>
                </a>
            <?php endif; ?>

            <?php if (Auth::can('inventario.movimientos')): ?>
                <a href="<?= Helpers::url('/inventario/movimientos') ?>" class="nav-link <?= $isActive('/inventario/movimientos') ?>">
                    <i class="bi bi-arrow-left-right"></i>
                    <span>Movimientos (Kardex)</span>
                </a>
            <?php endif; ?>

            <?php if (Auth::can('facturas.view') || Auth::can('facturas.create')): ?>
                <div class="nav-section-title">Ventas</div>
                <?php if (Auth::can('facturas.create')): ?>
                    <a href="<?= Helpers::url('/facturas/crear') ?>" class="nav-link <?= $isActive('/facturas/crear') ?>">
                        <i class="bi bi-cart-plus-fill"></i>
                        <span>Nueva Factura (POS)</span>
                    </a>
                <?php endif; ?>
                <?php if (Auth::can('facturas.view')): ?>
                    <a href="<?= Helpers::url('/facturas') ?>" class="nav-link <?= (str_contains($currentPath, '/facturas') && !str_contains($currentPath, '/facturas/crear') && !str_contains($currentPath, '/facturas/cierre-caja')) ? 'active' : '' ?>">
                        <i class="bi bi-receipt-cutoff"></i>
                        <span>Facturas Emitidas</span>
                    </a>
                    <a href="<?= Helpers::url('/facturas/cierre-caja') ?>" class="nav-link <?= $isActive('/facturas/cierre-caja') ?>">
                        <i class="bi bi-calculator"></i>
                        <span>Cierre de Caja</span>
                    </a>
                    <a href="<?= Helpers::url('/clientes') ?>" class="nav-link <?= $isActive('/clientes') ?>">
                        <i class="bi bi-person-lines-fill"></i>
                        <span>Clientes</span>
                    </a>
                <?php endif; ?>
            <?php endif; ?>

            <?php if (Auth::can('usuarios.manage')): ?>
                <div class="nav-section-title">Administración</div>
                <a href="<?= Helpers::url('/usuarios') ?>" class="nav-link <?= $isActive('/usuarios') ?>">
                    <i class="bi bi-people-fill"></i>
                    <span>Usuarios y Permisos</span>
                </a>
                <a href="<?= Helpers::url('/configuracion') ?>" class="nav-link <?= $isActive('/configuracion') ?>">
                    <i class="bi bi-building-gear"></i>
                    <span>Empresa y Respaldo</span>
                </a>
            <?php endif; ?>
        </nav>

        <div class="sidebar-footer">
            <div class="fw-semibold text-white"><?= Helpers::e($user['nombre'] ?? '') ?></div>
            <div class="text-capitalize small">Rol: <?= Helpers::e($user['rol'] ?? '') ?></div>
        </div>
    </aside>

    <!-- Main -->
    <div class="app-main">
        <header class="app-topbar">
            <div class="d-flex align-items-center gap-3">
                <button class="btn btn-outline-secondary btn-sm d-lg-none" type="button" id="sidebarToggle">
                    <i class="bi bi-list fs-5"></i>
                </button>
                <h1 class="h5 mb-0 fw-semibold">
                    <i class="bi <?= Helpers::pageIcon() ?> me-2"></i><?= Helpers::e($title ?? 'Panel') ?>
                </h1>
            </div>

            <div class="d-flex align-items-center gap-3">
                <a href="<?= Helpers::url('/perfil') ?>" class="btn btn-outline-secondary btn-sm" title="Mi Perfil">
                    <i class="bi bi-person-circle me-1"></i>Mi Perfil
                </a>
                <span class="badge bg-primary-subtle text-primary border border-primary-subtle text-capitalize px-2 py-1">
                    <i class="bi bi-shield-check me-1"></i><?= Helpers::e($user['rol'] ?? '') ?>
                </span>
                <form action="<?= Helpers::url('/logout') ?>" method="POST" class="m-0">
                    <?= Helpers::csrfField() ?>
                    <button type="submit" class="btn btn-outline-danger btn-sm">
                        <i class="bi bi-box-arrow-right me-1"></i>Salir
                    </button>
                </form>
            </div>
        </header>

        <main class="app-content">
            <?php foreach ($flashes as $flash): ?>
                <div class="alert alert-<?= Helpers::e($flash['type']) ?> alert-dismissible fade show shadow-sm" role="alert">
                    <?= Helpers::e($flash['message']) ?>
                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Cerrar"></button>
                </div>
            <?php endforeach; ?>

            <?= $content ?>
        </main>
    </div>
</div>

<script src="<?= Helpers::url('/assets/vendor/bootstrap/js/bootstrap.bundle.min.js') ?>"></script>
<script>
document.getElementById('sidebarToggle')?.addEventListener('click', () => {
    document.getElementById('appSidebar')?.classList.toggle('show');
});
</script>
</body>
</html>
