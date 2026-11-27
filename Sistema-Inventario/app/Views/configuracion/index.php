<?php

use App\Core\Helpers;

/** @var array<string, mixed> $empresa */
?>
<div class="row g-4">
    <div class="col-12 col-lg-7">
        <div class="card">
            <div class="card-header bg-white py-3">
                <h2 class="h6 mb-0 fw-bold"><i class="bi bi-building me-2 text-primary"></i>Datos de la Empresa</h2>
            </div>
            <div class="card-body">
                <form action="<?= Helpers::url('/configuracion/guardar') ?>" method="POST">
                    <?= Helpers::csrfField() ?>

                    <div class="row g-3">
                        <div class="col-md-7">
                            <label class="form-label fw-medium">Nombre Comercial / Razón Social *</label>
                            <input type="text" name="nombre_empresa" class="form-control"
                                   value="<?= Helpers::e($empresa['nombre_empresa'] ?? 'StockFlow Pro') ?>" required>
                        </div>
                        <div class="col-md-5">
                            <label class="form-label fw-medium">NIT / RUC / Documento</label>
                            <input type="text" name="nit" class="form-control"
                                   value="<?= Helpers::e($empresa['nit'] ?? '') ?>" placeholder="Ej: 900.123.456-7">
                        </div>
                        <div class="col-md-6">
                            <label class="form-label fw-medium">Teléfono</label>
                            <input type="text" name="telefono" class="form-control"
                                   value="<?= Helpers::e($empresa['telefono'] ?? '') ?>" placeholder="Ej: +57 300 000 0000">
                        </div>
                        <div class="col-md-6">
                            <label class="form-label fw-medium">Correo Electrónico</label>
                            <input type="email" name="email" class="form-control"
                                   value="<?= Helpers::e($empresa['email'] ?? '') ?>" placeholder="contacto@empresa.com">
                        </div>
                        <div class="col-md-7">
                            <label class="form-label fw-medium">Dirección</label>
                            <input type="text" name="direccion" class="form-control"
                                   value="<?= Helpers::e($empresa['direccion'] ?? '') ?>" placeholder="Calle, número, ciudad">
                        </div>
                        <div class="col-md-5">
                            <label class="form-label fw-medium">Tasa USD (TRM en COP) *</label>
                            <input type="number" step="0.01" min="1" name="tasa_usd" class="form-control"
                                   value="<?= Helpers::e((string)($empresa['tasa_usd'] ?? '4200.00')) ?>" required>
                        </div>
                        <div class="col-12">
                            <label class="form-label fw-medium">Pie de Factura</label>
                            <input type="text" name="pie_factura" class="form-control"
                                   value="<?= Helpers::e($empresa['pie_factura'] ?? 'Gracias por su compra.') ?>">
                        </div>
                    </div>

                    <div class="mt-4">
                        <button type="submit" class="btn btn-primary">
                            <i class="bi bi-check-lg me-1"></i> Guardar Configuración
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <div class="col-12 col-lg-5">
        <div class="card">
            <div class="card-header bg-white py-3">
                <h2 class="h6 mb-0 fw-bold"><i class="bi bi-database-down me-2 text-success"></i>Respaldo de Base de Datos</h2>
            </div>
            <div class="card-body">
                <p class="text-muted small">
                    Descarga una copia completa en formato <code>.sql</code> con la estructura y todos los registros actuales de la base de datos <code>bd</code> (usuarios, productos, movimientos, facturas y configuración).
                </p>
                <a href="<?= Helpers::url('/configuracion/backup') ?>" class="btn btn-success w-100">
                    <i class="bi bi-download me-1"></i> Descargar Respaldo (.sql)
                </a>
            </div>
        </div>
    </div>
</div>
