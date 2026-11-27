<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Auth;
use App\Core\Controller;
use App\Core\Database;
use App\Core\Helpers;
use App\Models\Configuracion;

/**
 * ============================================================================
 * CONTROLADOR DE CONFIGURACIÓN Y RESPALDO (app/Controllers/ConfiguracionController.php)
 * ============================================================================
 * Exclusivo para administradores (`usuarios.manage`). Permite configurar los
 * datos de la empresa para facturas/PDF y descargar respaldos `.sql`.
 * ============================================================================
 */
class ConfiguracionController extends Controller
{
    /**
     * Muestra el formulario de datos de la empresa y la sección de respaldo SQL.
     */
    public function index(): void
    {
        Auth::requirePermission('usuarios.manage');

        $this->render('configuracion/index', [
            'title' => 'Configuración de Empresa y Respaldo',
            'empresa' => Configuracion::get(),
        ]);
    }

    /**
     * Guarda los datos de la empresa validando CSRF y nombre obligatorio.
     */
    public function update(): void
    {
        Auth::requirePermission('usuarios.manage');
        Helpers::verifyCsrf();

        $nombreEmpresa = trim($_POST['nombre_empresa'] ?? '');
        if ($nombreEmpresa === '') {
            Helpers::flash('danger', 'El nombre de la empresa es obligatorio.');
            Helpers::redirect('/configuracion');
        }

        Configuracion::save($_POST);
        Helpers::flash('success', 'Datos de la empresa actualizados correctamente.');
        Helpers::redirect('/configuracion');
    }

    /**
     * Genera y descarga un respaldo completo (.sql) de la base de datos en PHP puro.
     */
    public function backup(): void
    {
        Auth::requirePermission('usuarios.manage');

        $pdo = Database::getConnection();
        $dbName = (string)$pdo->query('SELECT DATABASE()')->fetchColumn();
        $tables = $pdo->query('SHOW TABLES')->fetchAll(\PDO::FETCH_COLUMN);

        $filename = 'respaldo_' . ($dbName ?: 'bd') . '_' . date('Ymd_His') . '.sql';
        header('Content-Type: application/sql; charset=UTF-8');
        header('Content-Disposition: attachment; filename="' . $filename . '"');
        header('Cache-Control: max-age=0');

        echo "-- ============================================================================\n";
        echo "-- Respaldo de Base de Datos: {$dbName}\n";
        echo "-- Generado: " . date('Y-m-d H:i:s') . "\n";
        echo "-- ============================================================================\n\n";
        echo "SET FOREIGN_KEY_CHECKS=0;\n\n";

        foreach ($tables as $table) {
            $safeTable = str_replace('`', '``', (string)$table);
            $createRow = $pdo->query("SHOW CREATE TABLE `{$safeTable}`")->fetch(\PDO::FETCH_NUM);
            $createSql = $createRow[1] ?? '';

            echo "-- Estructura de tabla `{$safeTable}`\n";
            echo "DROP TABLE IF EXISTS `{$safeTable}`;\n";
            echo $createSql . ";\n\n";

            $rows = $pdo->query("SELECT * FROM `{$safeTable}`")->fetchAll(\PDO::FETCH_ASSOC);
            if (!empty($rows)) {
                $cols = array_map(fn($c) => '`' . str_replace('`', '``', (string)$c) . '`', array_keys($rows[0]));
                $colList = implode(', ', $cols);

                echo "-- Datos de tabla `{$safeTable}`\n";
                foreach ($rows as $row) {
                    $vals = array_map(function ($val) use ($pdo): string {
                        if ($val === null) {
                            return 'NULL';
                        }
                        return $pdo->quote((string)$val);
                    }, array_values($row));
                    echo "INSERT INTO `{$safeTable}` ({$colList}) VALUES (" . implode(', ', $vals) . ");\n";
                }
                echo "\n";
            }
        }

        echo "SET FOREIGN_KEY_CHECKS=1;\n";
        exit;
    }
}
