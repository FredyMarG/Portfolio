<?php

declare(strict_types=1);

namespace App\Core;

/**
 * ============================================================================
 * CLASE BASE CONTROLLER (app/Core/Controller.php)
 * ============================================================================
 * Clase abstracta de la que heredan todos los controladores MVC.
 * Provee métodos para renderizar vistas dentro de un layout (main, auth o none)
 * y para devolver respuestas JSON cuando sea necesario.
 * ============================================================================
 */
abstract class Controller
{
    /**
     * Renderiza una vista PHP ubicada en app/Views/ dentro del layout especificado.
     *
     * @param string $view   Ruta relativa de la vista sin extensión (ej. 'productos/index').
     * @param array  $data   Variables asociativas que estarán disponibles en la vista.
     * @param string $layout Nombre del layout en app/Views/layouts/ ('main', 'auth', 'none').
     */
    protected function render(string $view, array $data = [], string $layout = 'main'): void
    {
        extract($data, EXTR_SKIP);
        $viewFile = BASE_PATH . '/app/Views/' . $view . '.php';

        if (!file_exists($viewFile)) {
            throw new \RuntimeException("Vista no encontrada: {$view}");
        }

        // Capturar el HTML generado por la vista en la variable $content
        ob_start();
        require $viewFile;
        $content = ob_get_clean();

        if ($layout === 'none') {
            echo $content;
            return;
        }

        $layoutFile = BASE_PATH . '/app/Views/layouts/' . $layout . '.php';
        if (!file_exists($layoutFile)) {
            throw new \RuntimeException("Layout no encontrado: {$layout}");
        }

        require $layoutFile;
    }

    /**
     * Emite una respuesta JSON estructurada con código de estado HTTP.
     */
    protected function json(array $data, int $status = 200): never
    {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data, JSON_UNESCAPED_UNICODE);
        exit;
    }
}
