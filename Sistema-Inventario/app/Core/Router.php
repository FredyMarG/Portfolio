<?php

declare(strict_types=1);

namespace App\Core;

/**
 * ============================================================================
 * CLASE ROUTER (app/Core/Router.php)
 * ============================================================================
 * Enrutador HTTP ligero para el patrón MVC.
 * Registra rutas GET y POST con parámetros dinámicos (ej. /productos/editar/{id}),
 * limpia el prefijo BASE_URL (para compatibilidad con htdocs) y ejecuta el método
 * del controlador correspondiente, o muestra la vista 404 si no hay coincidencia.
 * ============================================================================
 */
class Router
{
    /** @var array<int, array{method: string, regex: string, handler: array}> */
    private array $routes = [];

    /**
     * Registra una ruta HTTP GET.
     */
    public function get(string $pattern, array $handler): void
    {
        $this->addRoute('GET', $pattern, $handler);
    }

    /**
     * Registra una ruta HTTP POST.
     */
    public function post(string $pattern, array $handler): void
    {
        $this->addRoute('POST', $pattern, $handler);
    }

    /**
     * Convierte un patrón con placeholders {param} en una expresión regular nombrada.
     */
    private function addRoute(string $method, string $pattern, array $handler): void
    {
        $regex = preg_replace('#\{([a-zA-Z0-9_]+)\}#', '(?P<$1>[^/]+)', $pattern);
        $regex = '#^' . $regex . '$#';
        $this->routes[] = [
            'method' => $method,
            'regex' => $regex,
            'handler' => $handler,
        ];
    }

    /**
     * Resuelve la petición HTTP actual contra las rutas registradas e invoca el controlador.
     */
    public function dispatch(string $method, string $uri): void
    {
        $path = rawurldecode(parse_url($uri, PHP_URL_PATH) ?: '/');
        $base = rawurldecode(defined('BASE_URL') ? rtrim(BASE_URL, '/') : '');

        // Eliminar el prefijo de carpeta cuando se ejecuta dentro de htdocs
        if ($base !== '' && str_starts_with($path, $base)) {
            $path = substr($path, strlen($base)) ?: '/';
        }
        if ($path !== '/' && str_ends_with($path, '/')) {
            $path = rtrim($path, '/');
        }

        foreach ($this->routes as $route) {
            if ($route['method'] !== $method) {
                continue;
            }
            if (preg_match($route['regex'], $path, $matches)) {
                $params = array_filter(
                    $matches,
                    fn($key) => !is_int($key),
                    ARRAY_FILTER_USE_KEY
                );
                [$controllerClass, $action] = $route['handler'];
                $controller = new $controllerClass();
                call_user_func_array([$controller, $action], $params);
                return;
            }
        }

        // Ninguna ruta coincidió: devolver página 404
        http_response_code(404);
        $title = 'Página no encontrada';
        require BASE_PATH . '/app/Views/errors/404.php';
    }
}
