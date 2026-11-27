<?php

declare(strict_types=1);

namespace App\Core;

/**
 * ============================================================================
 * CLASE HELPERS (app/Core/Helpers.php)
 * ============================================================================
 * Conjunto de utilidades estáticas transversales para la aplicación:
 *  - Generación de URLs relativas a BASE_URL y redirecciones HTTP.
 *  - Escapado HTML contra ataques XSS.
 *  - Formateo monetario.
 *  - Mensajes Flash en sesión (alertas temporales entre redirecciones).
 *  - Generación y validación de tokens anti-CSRF para formularios POST.
 * ============================================================================
 */
class Helpers
{
    /**
     * Construye una URL completa anteponiendo BASE_URL (soporta subcarpetas de htdocs).
     */
    public static function url(string $path = ''): string
    {
        $base = defined('BASE_URL') ? str_replace(' ', '%20', rtrim(BASE_URL, '/')) : '';
        $path = '/' . ltrim($path, '/');
        return $base . ($path === '/' ? '' : $path);
    }

    /**
     * Redirige al navegador hacia una ruta interna y finaliza la ejecución.
     */
    public static function redirect(string $path): never
    {
        header('Location: ' . self::url($path));
        exit;
    }

    /**
     * Escapa cadenas para impresión segura en HTML (prevención de XSS).
     */
    public static function e(?string $value): string
    {
        return htmlspecialchars((string)$value, ENT_QUOTES, 'UTF-8');
    }

    /**
     * Formatea un valor numérico como moneda (COP o USD) con dos decimales.
     */
    public static function money(float|int|string $amount, string $currency = 'COP'): string
    {
        $code = strtoupper(trim($currency)) === 'USD' ? 'USD' : 'COP';
        return $code . ' $' . number_format((float)$amount, 2, '.', ',');
    }

    /**
     * Almacena un mensaje flash en sesión para mostrarlo tras una redirección.
     *
     * @param string $type    Clase Bootstrap: success, danger, warning, info.
     * @param string $message Texto a mostrar al usuario.
     */
    public static function flash(string $type, string $message): void
    {
        $_SESSION['flash'][] = [
            'type' => $type,
            'message' => $message,
        ];
    }

    /**
     * Obtiene y limpia todos los mensajes flash pendientes de la sesión.
     */
    public static function getFlashes(): array
    {
        $flashes = $_SESSION['flash'] ?? [];
        unset($_SESSION['flash']);
        return $flashes;
    }

    /**
     * Obtiene o genera el token CSRF único de la sesión actual.
     */
    public static function csrfToken(): string
    {
        if (empty($_SESSION['csrf_token'])) {
            $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
        }
        return $_SESSION['csrf_token'];
    }

    /**
     * Retorna el input HTML oculto con el token CSRF para insertar en formularios.
     */
    public static function csrfField(): string
    {
        return '<input type="hidden" name="_csrf" value="' . self::e(self::csrfToken()) . '">';
    }

    /**
     * Valida en tiempo constante el token CSRF enviado por POST.
     * Detiene la petición con código 419 si el token es inválido o ausente.
     */
    public static function verifyCsrf(): void
    {
        $token = $_POST['_csrf'] ?? '';
        if (empty($token) || empty($_SESSION['csrf_token']) || !hash_equals($_SESSION['csrf_token'], $token)) {
            http_response_code(419);
            die('Token CSRF inválido o expirado. Por favor recarga la página.');
        }
    }

    /**
     * Devuelve el ícono Bootstrap y el favicon SVG dinámico acorde a la pestaña/ruta actual.
     *
     * @return array{bi: string, bg: string, svg: string}
     */
    private static function resolveTabIcon(?string $path = null): array
    {
        if ($path === null) {
            $uriPath = rawurldecode(parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/');
            $base = rawurldecode(defined('BASE_URL') ? rtrim(BASE_URL, '/') : '');
            if ($base !== '' && str_starts_with($uriPath, $base)) {
                $uriPath = substr($uriPath, strlen($base)) ?: '/';
            }
            $path = $uriPath;
        }

        // Tabla de íconos por prefijo de ruta (los más específicos primero)
        $map = [
            '/inventario/entrada' => [
                'bi' => 'bi-box-arrow-in-down text-success',
                'bg' => '#198754',
                'svg' => '<path d="M12 3v10m0 0l-4-4m4 4l4-4M4 15v3a2 2 0 002 2h12a2 2 0 002-2v-3" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
            ],
            '/inventario/movimientos' => [
                'bi' => 'bi-arrow-left-right text-warning',
                'bg' => '#d97706',
                'svg' => '<path d="M7 8h11m0 0l-3-3m3 3l-3 3M17 16H6m0 0l3-3m-3 3l3 3" stroke="#fff" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
            ],
            '/facturas/crear' => [
                'bi' => 'bi-cart-plus-fill text-primary',
                'bg' => '#6f42c1',
                'svg' => '<path d="M4 5h2l2.2 9h9.2l2-6H7.5M9 18.5a1 1 0 100 2 1 1 0 000-2zm8 0a1 1 0 100 2 1 1 0 000-2z" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
            ],
            '/facturas/cierre-caja' => [
                'bi' => 'bi-calculator text-success',
                'bg' => '#198754',
                'svg' => '<path d="M6 3h12a1 1 0 011 1v16a1 1 0 01-1 1H6a1 1 0 01-1-1V4a1 1 0 011-1zm2 4h8v3H8V7zm0 6h2m3 0h2m-7 4h2m3 0h2" stroke="#fff" stroke-width="2" stroke-linecap="round" fill="none"/>',
            ],
            '/clientes' => [
                'bi' => 'bi-person-lines-fill text-primary',
                'bg' => '#0284c7',
                'svg' => '<path d="M9 11a3 3 0 100-6 3 3 0 000 6zm-5 8c0-2.8 2.2-5 5-5s5 2.2 5 5m2-10h4m-4 4h4m-4 4h3" stroke="#fff" stroke-width="2" stroke-linecap="round" fill="none"/>',
            ],
            '/proveedores' => [
                'bi' => 'bi-truck text-warning',
                'bg' => '#ea580c',
                'svg' => '<path d="M3 7h11v8H3V7zm11 3h4l3 3v2h-7v-5zM7 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm10 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" stroke="#fff" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
            ],
            '/facturas' => [
                'bi' => 'bi-receipt-cutoff text-secondary',
                'bg' => '#334155',
                'svg' => '<path d="M6 4h12v16l-3-2-3 2-3-2-3 2V4zm3 4h6m-6 4h6m-6 4h4" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
            ],
            '/productos' => [
                'bi' => 'bi-grid-fill text-info',
                'bg' => '#0891b2',
                'svg' => '<path d="M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm10 0h6v6h-6v-6z" fill="#fff"/>',
            ],
            '/usuarios' => [
                'bi' => 'bi-people-fill text-danger',
                'bg' => '#db2777',
                'svg' => '<path d="M9 11a3 3 0 100-6 3 3 0 000 6zm7 1a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM4 19c0-2.8 2.2-5 5-5s5 2.2 5 5m2-5c2.2 0 4 1.8 4 4" stroke="#fff" stroke-width="2" stroke-linecap="round" fill="none"/>',
            ],
            '/configuracion' => [
                'bi' => 'bi-building-gear text-primary',
                'bg' => '#475569',
                'svg' => '<path d="M4 20V6a2 2 0 012-2h6a2 2 0 012 2v14M14 10h4a2 2 0 012 2v8M8 8h2m-2 4h2m-2 4h2m6-2h2" stroke="#fff" stroke-width="2" stroke-linecap="round" fill="none"/>',
            ],
            '/login' => [
                'bi' => 'bi-box-arrow-in-right text-primary',
                'bg' => '#0d6efd',
                'svg' => '<path d="M7 11V8a5 5 0 0110 0v3m-9 0h8a2 2 0 012 2v5a2 2 0 01-2 2H8a2 2 0 01-2-2v-5a2 2 0 012-2z" stroke="#fff" stroke-width="2" stroke-linecap="round" fill="none"/>',
            ],
            '/registro' => [
                'bi' => 'bi-person-plus-fill text-primary',
                'bg' => '#6610f2',
                'svg' => '<path d="M10 11a3.5 3.5 0 100-7 3.5 3.5 0 000 7zM4 19c0-3 2.7-5 6-5s6 2 6 5m3-10v4m-2-2h4" stroke="#fff" stroke-width="2" stroke-linecap="round" fill="none"/>',
            ],
            '/perfil' => [
                'bi' => 'bi-person-circle text-primary',
                'bg' => '#0d6efd',
                'svg' => '<path d="M12 12a4 4 0 100-8 4 4 0 000 8zm-7 8c0-3.3 3.1-5.5 7-5.5s7 2.2 7 5.5" stroke="#fff" stroke-width="2" stroke-linecap="round" fill="none"/>',
            ],
            '/403' => [
                'bi' => 'bi-shield-exclamation text-danger',
                'bg' => '#dc3545',
                'svg' => '<path d="M12 4l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V7l7-3zm0 5v4m0 3h.01" stroke="#fff" stroke-width="2.1" stroke-linecap="round" fill="none"/>',
            ],
            '/404' => [
                'bi' => 'bi-exclamation-triangle text-secondary',
                'bg' => '#6c757d',
                'svg' => '<path d="M12 4L3 19h18L12 4zm0 6v4m0 3h.01" stroke="#fff" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
            ],
        ];

        foreach ($map as $prefix => $meta) {
            if (str_starts_with($path, $prefix)) {
                return $meta;
            }
        }

        // Por defecto (Dashboard / Inicio): ícono de inventario/panel
        return [
            'bi' => 'bi-speedometer2 text-primary',
            'bg' => '#0d6efd',
            'svg' => '<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3zm0 0v9m0 0l8-4.5M12 12L4 7.5" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
        ];
    }

    /**
     * Retorna un data URI SVG para usar como favicon dinámico según la pestaña.
     */
    public static function favicon(?string $path = null): string
    {
        $meta = self::resolveTabIcon($path);
        $svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">'
            . '<rect width="24" height="24" rx="6" fill="' . $meta['bg'] . '"/>'
            . $meta['svg']
            . '</svg>';
        return 'data:image/svg+xml,' . rawurlencode($svg);
    }

    /**
     * Retorna las clases Bootstrap Icons correspondientes a la pestaña actual.
     */
    public static function pageIcon(?string $path = null): string
    {
        return self::resolveTabIcon($path)['bi'];
    }

    /**
     * Pagina un arreglo en memoria y devuelve los elementos de la página actual.
     *
     * @return array{items: array, page: int, totalPages: int, total: int}
     */
    public static function paginate(array $items, int $perPage = 15): array
    {
        $total = count($items);
        $totalPages = max(1, (int)ceil($total / max(1, $perPage)));
        $page = max(1, min($totalPages, (int)($_GET['page'] ?? 1)));
        $offset = ($page - 1) * $perPage;

        return [
            'items' => array_slice($items, $offset, $perPage),
            'page' => $page,
            'totalPages' => $totalPages,
            'total' => $total,
        ];
    }

    /**
     * Renderiza controles de paginación Bootstrap 5 preservando los filtros GET actuales.
     */
    public static function renderPagination(int $page, int $totalPages, string $basePath): string
    {
        if ($totalPages <= 1) {
            return '';
        }

        $query = $_GET;
        $buildUrl = static function (int $p) use ($query, $basePath): string {
            $query['page'] = $p;
            return self::url($basePath) . '?' . http_build_query($query);
        };

        $html = '<nav aria-label="Paginación"><ul class="pagination pagination-sm justify-content-end mb-0">';
        $prevDisabled = $page <= 1 ? ' disabled' : '';
        $html .= '<li class="page-item' . $prevDisabled . '"><a class="page-link" href="' . self::e($buildUrl(max(1, $page - 1))) . '">&laquo;</a></li>';

        $start = max(1, $page - 2);
        $end = min($totalPages, $page + 2);
        for ($i = $start; $i <= $end; $i++) {
            $active = $i === $page ? ' active' : '';
            $html .= '<li class="page-item' . $active . '"><a class="page-link" href="' . self::e($buildUrl($i)) . '">' . $i . '</a></li>';
        }

        $nextDisabled = $page >= $totalPages ? ' disabled' : '';
        $html .= '<li class="page-item' . $nextDisabled . '"><a class="page-link" href="' . self::e($buildUrl(min($totalPages, $page + 1))) . '">&raquo;</a></li>';
        $html .= '</ul></nav>';

        return $html;
    }
}
