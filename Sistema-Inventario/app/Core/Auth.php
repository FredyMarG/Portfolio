<?php

declare(strict_types=1);

namespace App\Core;

/**
 * ============================================================================
 * CLASE AUTH (app/Core/Auth.php)
 * ============================================================================
 * Administra la autenticación de usuarios en sesión y el Control de Acceso
 * Basado en Roles (RBAC). Cada rol tiene una lista explícita de permisos
 * que se validan tanto en los controladores (backend) como en las vistas.
 * ============================================================================
 */
class Auth
{
    /**
     * Matriz de permisos asignados a cada rol del sistema.
     */
    private const ROLE_PERMISSIONS = [
        'admin' => [
            'dashboard.view',
            'productos.view',
            'productos.create',
            'productos.edit',
            'productos.delete',
            'inventario.entrada',
            'inventario.ajuste',
            'inventario.movimientos',
            'facturas.view',
            'facturas.create',
            'facturas.anular',
            'usuarios.manage',
        ],
        'vendedor' => [
            'dashboard.view',
            'productos.view',
            'facturas.view',
            'facturas.create',
        ],
        'almacen' => [
            'dashboard.view',
            'productos.view',
            'productos.create',
            'productos.edit',
            'inventario.entrada',
            'inventario.ajuste',
            'inventario.movimientos',
        ],
    ];

    /**
     * Indica si existe un usuario autenticado en la sesión actual.
     */
    public static function check(): bool
    {
        return isset($_SESSION['user']) && !empty($_SESSION['user']['id']);
    }

    /**
     * Devuelve los datos del usuario autenticado o null si no hay sesión.
     */
    public static function user(): ?array
    {
        return $_SESSION['user'] ?? null;
    }

    /**
     * Devuelve el ID numérico del usuario en sesión.
     */
    public static function id(): ?int
    {
        return isset($_SESSION['user']['id']) ? (int)$_SESSION['user']['id'] : null;
    }

    /**
     * Devuelve el nombre del rol del usuario en sesión (ej. 'admin', 'vendedor').
     */
    public static function role(): string
    {
        return $_SESSION['user']['rol'] ?? '';
    }

    /**
     * Inicia sesión para un usuario validado y regenera el ID de sesión
     * para prevenir ataques de fijación de sesión (Session Fixation).
     */
    public static function login(array $user): void
    {
        session_regenerate_id(true);
        $_SESSION['user'] = [
            'id' => (int)$user['id'],
            'nombre' => $user['nombre'],
            'email' => $user['email'],
            'rol' => $user['rol_nombre'],
            'rol_descripcion' => $user['rol_descripcion'] ?? '',
        ];
    }

    /**
     * Cierra la sesión actual, limpia variables y expira la cookie de sesión.
     */
    public static function logout(): void
    {
        $_SESSION = [];
        if (ini_get('session.use_cookies')) {
            $params = session_get_cookie_params();
            setcookie(
                session_name(),
                '',
                time() - 42000,
                $params['path'],
                $params['domain'],
                $params['secure'],
                $params['httponly']
            );
        }
        session_destroy();
    }

    /**
     * Verifica si el usuario autenticado posee un permiso específico.
     */
    public static function can(string $permission): bool
    {
        if (!self::check()) {
            return false;
        }
        $role = self::role();
        $permissions = self::ROLE_PERMISSIONS[$role] ?? [];
        return in_array($permission, $permissions, true);
    }

    /**
     * Verifica si el rol del usuario pertenece a la lista indicada.
     */
    public static function hasRole(array $roles): bool
    {
        return self::check() && in_array(self::role(), $roles, true);
    }

    /**
     * Middleware de autenticación: redirige al login si no ha iniciado sesión.
     */
    public static function requireLogin(): void
    {
        if (!self::check()) {
            Helpers::flash('warning', 'Debes iniciar sesión para acceder al sistema.');
            Helpers::redirect('/login');
        }

        // Verificar que la cuenta siga activa en MySQL (por si fue desactivada)
        $dbUser = \App\Models\Usuario::findById((int)self::id());
        if (!$dbUser || !(int)$dbUser['activo']) {
            self::logout();
            session_start();
            Helpers::flash('danger', 'Tu cuenta ha sido desactivada. Contacta al administrador.');
            Helpers::redirect('/login');
        }

        // Sincronizar rol y nombre por si el administrador los actualizó
        $_SESSION['user']['nombre'] = $dbUser['nombre'];
        $_SESSION['user']['rol'] = $dbUser['rol_nombre'];
        $_SESSION['user']['rol_descripcion'] = $dbUser['rol_descripcion'] ?? '';
    }

    /**
     * Middleware de autorización: exige sesión activa y un permiso concreto.
     * Si el usuario no tiene permiso, responde con HTTP 403.
     */
    public static function requirePermission(string $permission): void
    {
        self::requireLogin();
        if (!self::can($permission)) {
            http_response_code(403);
            $title = 'Acceso denegado';
            require BASE_PATH . '/app/Views/errors/403.php';
            exit;
        }
    }
}
