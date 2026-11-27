<?php

use App\Core\Helpers;

/** @var string $title */
/** @var string $content */
$flashes = Helpers::getFlashes();
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= Helpers::e($title ?? 'Iniciar Sesión') ?> | StockFlow Pro</title>
    <link rel="icon" type="image/svg+xml" href="<?= Helpers::favicon() ?>">
    <link rel="stylesheet" href="<?= Helpers::url('/assets/vendor/bootstrap-icons/bootstrap-icons.min.css') ?>">
    <link rel="stylesheet" href="<?= Helpers::url('/assets/css/app.css') ?>">
</head>
<body class="auth-page">
    <div class="w-100" style="max-width: 420px;">
        <?php foreach ($flashes as $flash): ?>
            <div class="alert alert-<?= Helpers::e($flash['type']) ?> alert-dismissible fade show shadow-sm" role="alert">
                <?= Helpers::e($flash['message']) ?>
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Cerrar"></button>
            </div>
        <?php endforeach; ?>

        <?= $content ?>
    </div>

    <script src="<?= Helpers::url('/assets/vendor/bootstrap/js/bootstrap.bundle.min.js') ?>"></script>
</body>
</html>
