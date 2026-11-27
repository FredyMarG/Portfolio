<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Auth;
use App\Core\Controller;
use App\Core\Helpers;
use App\Models\Cliente;

/**
 * ============================================================================
 * CONTROLADOR DE CLIENTES (app/Controllers/ClienteController.php)
 * ============================================================================
 * Gestiona el directorio de clientes para facturación rápida en el POS.
 * ============================================================================
 */
class ClienteController extends Controller
{
    /**
     * Lista los clientes paginados con buscador por nombre, documento o teléfono.
     */
    public function index(): void
    {
        Auth::requirePermission('facturas.view');

        $q = trim($_GET['q'] ?? '');
        $pag = Helpers::paginate(Cliente::all($q), 15);

        $this->render('clientes/index', [
            'title' => 'Directorio de Clientes',
            'clientes' => $pag['items'],
            'page' => $pag['page'],
            'totalPages' => $pag['totalPages'],
            'totalRegistros' => $pag['total'],
            'q' => $q,
        ]);
    }

    /**
     * Registra un nuevo cliente validando CSRF y nombre obligatorio.
     */
    public function store(): void
    {
        Auth::requirePermission('facturas.create');
        Helpers::verifyCsrf();

        $nombre = trim($_POST['nombre'] ?? '');
        if ($nombre === '') {
            Helpers::flash('danger', 'El nombre del cliente es obligatorio.');
            Helpers::redirect('/clientes');
        }

        Cliente::create($_POST);
        Helpers::flash('success', "Cliente '{$nombre}' registrado correctamente.");
        Helpers::redirect('/clientes');
    }

    /**
     * Actualiza los datos de un cliente existente.
     */
    public function update(string $id): void
    {
        Auth::requirePermission('facturas.create');
        Helpers::verifyCsrf();

        $nombre = trim($_POST['nombre'] ?? '');
        if ($nombre === '') {
            Helpers::flash('danger', 'El nombre del cliente es obligatorio.');
            Helpers::redirect('/clientes');
        }

        Cliente::update((int)$id, $_POST);
        Helpers::flash('success', "Cliente '{$nombre}' actualizado.");
        Helpers::redirect('/clientes');
    }

    /**
     * Elimina un cliente del directorio.
     */
    public function delete(string $id): void
    {
        Auth::requirePermission('facturas.create');
        Helpers::verifyCsrf();

        Cliente::delete((int)$id);
        Helpers::flash('success', 'Cliente eliminado.');
        Helpers::redirect('/clientes');
    }
}
