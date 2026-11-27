<?php

declare(strict_types=1);

/**
 * ============================================================================
 * FRONT CONTROLLER (public/index.php)
 * ============================================================================
 * Punto de entrada único de toda la aplicación web.
 * Se encarga de:
 *  1. Definir la ruta raíz del proyecto (BASE_PATH) y la URL base (BASE_URL)
 *     de forma compatible tanto con XAMPP (htdocs) como con php -S.
 *  2. Cargar la configuración general y zona horaria.
 *  3. Iniciar la sesión PHP para autenticación y mensajes flash.
 *  4. Registrar el autoloader PSR-4 para cargar clases bajo el namespace App\.
 *  5. Declarar todas las rutas GET/POST y despachar la petición actual.
 * ============================================================================
 */

define('BASE_PATH', dirname(__DIR__));

// Cálculo automático de BASE_URL para funcionar en htdocs o en servidor integrado
$scriptDir = rawurldecode(str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'] ?? '/')));
$requestPath = rawurldecode(parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/');
if (str_ends_with($scriptDir, '/public') && !str_starts_with($requestPath, $scriptDir)) {
    $scriptDir = substr($scriptDir, 0, -strlen('/public')) ?: '';
}
define('BASE_URL', $scriptDir === '/' ? '' : rtrim($scriptDir, '/'));

// Cargar configuración principal y zona horaria
$config = require BASE_PATH . '/config/config.php';
date_default_timezone_set($config['app']['timezone']);

// Cabeceras básicas de seguridad HTTP
header('X-Frame-Options: SAMEORIGIN');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: strict-origin-when-cross-origin');

// Iniciar sesión con cookies seguras si aún no está activa
if (session_status() === PHP_SESSION_NONE) {
    ini_set('session.use_strict_mode', '1');
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'httponly' => true,
        'samesite' => 'Lax',
        'secure' => (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off'),
    ]);
    session_start();
}

// Autoloader PSR-4: convierte App\Controllers\X -> /app/Controllers/X.php
spl_autoload_register(function (string $class): void {
    $prefix = 'App\\';
    if (!str_starts_with($class, $prefix)) {
        return;
    }
    $relative = substr($class, strlen($prefix));
    $file = BASE_PATH . '/app/' . str_replace('\\', '/', $relative) . '.php';
    if (file_exists($file)) {
        require_once $file;
    }
});

use App\Controllers\AuthController;
use App\Controllers\ClienteController;
use App\Controllers\ConfiguracionController;
use App\Controllers\DashboardController;
use App\Controllers\FacturaController;
use App\Controllers\InventarioController;
use App\Controllers\ProductoController;
use App\Controllers\ProveedorController;
use App\Controllers\UsuarioController;
use App\Core\Router;

$router = new Router();

// --- Ruta principal ---
$router->get('/', [DashboardController::class, 'index']);

// --- Módulo de Autenticación ---
$router->get('/login', [AuthController::class, 'showLogin']);
$router->post('/login', [AuthController::class, 'login']);
$router->get('/registro', [AuthController::class, 'showRegister']);
$router->post('/registro', [AuthController::class, 'register']);
$router->get('/perfil', [AuthController::class, 'showProfile']);
$router->post('/perfil/password', [AuthController::class, 'updatePassword']);
$router->post('/logout', [AuthController::class, 'logout']);

// --- Panel Principal (Dashboard) ---
$router->get('/dashboard', [DashboardController::class, 'index']);

// --- Módulo CRUD de Productos y Categorías ---
$router->get('/productos', [ProductoController::class, 'index']);
$router->get('/productos/exportar/pdf', [ProductoController::class, 'exportPdf']);
$router->get('/productos/exportar/excel', [ProductoController::class, 'exportExcel']);
$router->get('/productos/crear', [ProductoController::class, 'create']);
$router->post('/productos/guardar', [ProductoController::class, 'store']);
$router->get('/productos/editar/{id}', [ProductoController::class, 'edit']);
$router->post('/productos/actualizar/{id}', [ProductoController::class, 'update']);
$router->post('/productos/eliminar/{id}', [ProductoController::class, 'delete']);
$router->post('/categorias/guardar', [ProductoController::class, 'storeCategoria']);
$router->post('/categorias/actualizar/{id}', [ProductoController::class, 'updateCategoria']);
$router->post('/categorias/eliminar/{id}', [ProductoController::class, 'deleteCategoria']);

// --- Módulo de Entradas, Ajustes y Kardex de Inventario ---
$router->get('/inventario/entrada', [InventarioController::class, 'entrada']);
$router->post('/inventario/entrada', [InventarioController::class, 'storeEntrada']);
$router->get('/inventario/movimientos', [InventarioController::class, 'movimientos']);
$router->get('/inventario/movimientos/exportar/pdf', [InventarioController::class, 'exportMovimientosPdf']);
$router->get('/inventario/movimientos/exportar/excel', [InventarioController::class, 'exportMovimientosExcel']);

// --- Módulo de Facturación / Punto de Venta (POS) ---
$router->get('/facturas', [FacturaController::class, 'index']);
$router->get('/facturas/exportar/pdf', [FacturaController::class, 'exportPdf']);
$router->get('/facturas/exportar/excel', [FacturaController::class, 'exportExcel']);
$router->get('/facturas/cierre-caja', [FacturaController::class, 'cierreCaja']);
$router->get('/facturas/crear', [FacturaController::class, 'create']);
$router->post('/facturas/guardar', [FacturaController::class, 'store']);
$router->get('/facturas/{id}', [FacturaController::class, 'show']);
$router->post('/facturas/{id}/anular', [FacturaController::class, 'anular']);

// --- Directorios de Clientes y Proveedores ---
$router->get('/clientes', [ClienteController::class, 'index']);
$router->post('/clientes/guardar', [ClienteController::class, 'store']);
$router->post('/clientes/actualizar/{id}', [ClienteController::class, 'update']);
$router->post('/clientes/eliminar/{id}', [ClienteController::class, 'delete']);

$router->get('/proveedores', [ProveedorController::class, 'index']);
$router->post('/proveedores/guardar', [ProveedorController::class, 'store']);
$router->post('/proveedores/actualizar/{id}', [ProveedorController::class, 'update']);
$router->post('/proveedores/eliminar/{id}', [ProveedorController::class, 'delete']);

// --- Módulo de Administración de Usuarios, Permisos y Configuración ---
$router->get('/usuarios', [UsuarioController::class, 'index']);
$router->post('/usuarios/guardar', [UsuarioController::class, 'store']);
$router->post('/usuarios/actualizar/{id}', [UsuarioController::class, 'update']);
$router->post('/usuarios/estado/{id}', [UsuarioController::class, 'toggleStatus']);
$router->get('/configuracion', [ConfiguracionController::class, 'index']);
$router->post('/configuracion/guardar', [ConfiguracionController::class, 'update']);
$router->get('/configuracion/backup', [ConfiguracionController::class, 'backup']);

// Despachar la petición HTTP actual hacia el controlador correspondiente
$router->dispatch($_SERVER['REQUEST_METHOD'] ?? 'GET', $_SERVER['REQUEST_URI'] ?? '/');
