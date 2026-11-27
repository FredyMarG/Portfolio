<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Auth;
use App\Core\Controller;
use App\Core\Helpers;
use App\Models\Proveedor;

/**
 * ============================================================================
 * CONTROLADOR DE PROVEEDORES (app/Controllers/ProveedorController.php)
 * ============================================================================
 * Gestiona el directorio de proveedores para asociarlos a compras/entradas.
 * ============================================================================
 */
class ProveedorController extends Controller
{
    /**
     * Lista los proveedores paginados con buscador por nombre, NIT o teléfono.
     */
    public function index(): void
    {
        Auth::requirePermission('inventario.entrada');

        $q = trim($_GET['q'] ?? '');
        $pag = Helpers::paginate(Proveedor::all($q), 15);

        $this->render('proveedores/index', [
            'title' => 'Directorio de Proveedores',
            'proveedores' => $pag['items'],
            'page' => $pag['page'],
            'totalPages' => $pag['totalPages'],
            'totalRegistros' => $pag['total'],
            'q' => $q,
        ]);
    }

    /**
     * Registra un nuevo proveedor validando CSRF y nombre obligatorio.
     */
    public function store(): void
    {
        Auth::requirePermission('inventario.entrada');
        Helpers::verifyCsrf();

        $nombre = trim($_POST['nombre'] ?? '');
        if ($nombre === '') {
            Helpers::flash('danger', 'El nombre del proveedor es obligatorio.');
            Helpers::redirect('/proveedores');
        }

        Proveedor::create($_POST);
        Helpers::flash('success', "Proveedor '{$nombre}' registrado correctamente.");
        Helpers::redirect('/proveedores');
    }

    /**
     * Actualiza los datos de un proveedor existente.
     */
    public function update(string $id): void
    {
        Auth::requirePermission('inventario.entrada');
        Helpers::verifyCsrf();

        $nombre = trim($_POST['nombre'] ?? '');
        if ($nombre === '') {
            Helpers::flash('danger', 'El nombre del proveedor es obligatorio.');
            Helpers::redirect('/proveedores');
        }

        Proveedor::update((int)$id, $_POST);
        Helpers::flash('success', "Proveedor '{$nombre}' actualizado.");
        Helpers::redirect('/proveedores');
    }

    /**
     * Elimina un proveedor del directorio.
     */
    public function delete(string $id): void
    {
        Auth::requirePermission('inventario.entrada');
        Helpers::verifyCsrf();

        Proveedor::delete((int)$id);
        Helpers::flash('success', 'Proveedor eliminado.');
        Helpers::redirect('/proveedores');
    }
}
