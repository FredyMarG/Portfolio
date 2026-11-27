<?php use App\Core\Helpers; ?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>403 - Acceso Denegado</title>
    <link rel="icon" type="image/svg+xml" href="<?= Helpers::favicon('/403') ?>">
    <link rel="stylesheet" href="<?= Helpers::url('/assets/css/app.css') ?>">
</head>
<body class="bg-light d-flex align-items-center justify-content-center min-vh-100">
    <div class="card shadow-sm p-4 text-center" style="max-width: 440px;">
        <div class="display-4 text-danger fw-bold">403</div>
        <h2 class="h5 mt-2">Acceso Denegado</h2>
        <p class="text-muted">No tienes permisos suficientes para acceder a este módulo.</p>
        <a href="<?= Helpers::url('/dashboard') ?>" class="btn btn-primary">Volver al Panel</a>
    </div>
</body>
</html>
