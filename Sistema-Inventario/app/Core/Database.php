<?php

declare(strict_types=1);

namespace App\Core;

use PDO;
use PDOException;
use RuntimeException;

/**
 * ============================================================================
 * CLASE DATABASE (app/Core/Database.php)
 * ============================================================================
 * Gestiona la conexión única (patrón Singleton) hacia MySQL mediante PDO.
 * Garantiza reutilización de la conexión durante todo el ciclo de vida
 * de la petición HTTP y activa el modo de excepciones para manejo seguro
 * de errores y transacciones SQL.
 * ============================================================================
 */
class Database
{
    /** @var PDO|null Instancia única compartida de conexión PDO */
    private static ?PDO $instance = null;

    /**
     * Retorna la conexión PDO activa hacia MySQL o la crea si aún no existe.
     *
     * @throws RuntimeException Si falla la conexión con el servidor MySQL.
     */
    public static function getConnection(): PDO
    {
        if (self::$instance !== null) {
            return self::$instance;
        }

        $config = require BASE_PATH . '/config/config.php';
        $db = $config['db'];

        $dsn = sprintf(
            'mysql:host=%s;port=%s;dbname=%s;charset=%s',
            $db['host'],
            $db['port'],
            $db['name'],
            $db['charset']
        );

        try {
            self::$instance = new PDO($dsn, $db['user'], $db['pass'], [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION, // Lanza excepciones ante errores SQL
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,       // Retorna arreglos asociativos por defecto
                PDO::ATTR_EMULATE_PREPARES   => false,                  // Usa sentencias preparadas nativas (anti-SQLi)
            ]);
        } catch (PDOException $e) {
            throw new RuntimeException('Error de conexión a MySQL: ' . $e->getMessage(), 0, $e);
        }

        return self::$instance;
    }
}
