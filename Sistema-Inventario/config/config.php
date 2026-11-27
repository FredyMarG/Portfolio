<?php

declare(strict_types=1);

/**
 * ============================================================================
 * ARCHIVO DE CONFIGURACIÓN GENERAL (config/config.php)
 * ============================================================================
 * Centraliza los parámetros de la aplicación y las credenciales de MySQL.
 * En XAMPP por defecto el usuario es 'root' y la contraseña está vacía ('').
 * También permite sobrescribir valores mediante variables de entorno.
 * ============================================================================
 */

return [
    'app' => [
        'name' => 'StockFlow Pro',
        'subtitle' => 'Sistema de Inventario y Facturación',
        'currency' => '$',
        'default_tax_rate' => 19.0,          // Porcentaje de IVA por defecto en facturación
        'timezone' => 'America/Bogota',      // Zona horaria para fechas de facturas y kardex
    ],
    'db' => [
        'host' => getenv('DB_HOST') ?: 'localhost',
        'port' => getenv('DB_PORT') ?: '3306',
        'name' => getenv('DB_NAME') ?: 'bd',
        'user' => getenv('DB_USER') ?: 'root',
        'pass' => getenv('DB_PASS') ?: '',
        'charset' => 'utf8mb4',
    ],
];
