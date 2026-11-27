<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Auth;
use App\Core\Controller;
use App\Core\Helpers;
use App\Models\Usuario;

/**
 * ============================================================================
 * CONTROLADOR DE USUARIOS (app/Controllers/UsuarioController.php)
 * ============================================================================
 * Exclusivo para administradores (`usuarios.manage`). Permite crear cuentas,
 * asignar roles/permisos y activar o desactivar usuarios.
 * ============================================================================
 */
class UsuarioController extends Controller
{
    /**
     * Lista todos los usuarios y describe los roles disponibles.
     */
    public function index(): void
    {
        Auth::requirePermission('usuarios.manage');

        $this->render('usuarios/index', [
            'title' => 'Gestión de Usuarios y Permisos',
            'usuarios' => Usuario::all(),
            'roles' => Usuario::getRoles(),
        ]);
    }

    /**
     * Registra un nuevo usuario validando correo único y longitud de contraseña.
     */
    public function store(): void
    {
        Auth::requirePermission('usuarios.manage');
        Helpers::verifyCsrf();

        $nombre = trim($_POST['nombre'] ?? '');
        $email = trim($_POST['email'] ?? '');
        $password = $_POST['password'] ?? '';
        $rolId = (int)($_POST['rol_id'] ?? 2);

        if ($nombre === '' || $email === '' || strlen($password) < 6) {
            Helpers::flash('danger', 'Nombre, correo y contraseña (mínimo 6 caracteres) son obligatorios.');
            Helpers::redirect('/usuarios');
        }

        if (Usuario::findByEmail($email)) {
            Helpers::flash('danger', 'Ya existe un usuario con ese correo electrónico.');
            Helpers::redirect('/usuarios');
        }

        Usuario::create([
            'nombre' => $nombre,
            'email' => $email,
            'password' => $password,
            'rol_id' => $rolId,
            'activo' => isset($_POST['activo']) ? 1 : 0,
        ]);

        Helpers::flash('success', "Usuario '{$nombre}' creado correctamente.");
        Helpers::redirect('/usuarios');
    }

    /**
     * Actualiza un usuario existente; impide que el administrador se desactive a sí mismo.
     */
    public function update(string $id): void
    {
        Auth::requirePermission('usuarios.manage');
        Helpers::verifyCsrf();

        $userId = (int)$id;
        $usuario = Usuario::findById($userId);
        if (!$usuario) {
            Helpers::flash('danger', 'Usuario no encontrado.');
            Helpers::redirect('/usuarios');
        }

        $nombre = trim($_POST['nombre'] ?? '');
        $email = trim($_POST['email'] ?? '');
        if ($nombre === '' || $email === '') {
            Helpers::flash('danger', 'Nombre y correo son obligatorios.');
            Helpers::redirect('/usuarios');
        }

        $existing = Usuario::findByEmail($email);
        if ($existing && (int)$existing['id'] !== $userId) {
            Helpers::flash('danger', 'Otro usuario ya usa ese correo.');
            Helpers::redirect('/usuarios');
        }

        $activo = isset($_POST['activo']) ? 1 : 0;
        if ($userId === Auth::id() && $activo === 0) {
            Helpers::flash('danger', 'No puedes desactivar tu propia cuenta.');
            Helpers::redirect('/usuarios');
        }

        Usuario::update($userId, [
            'nombre' => $nombre,
            'email' => $email,
            'password' => $_POST['password'] ?? '',
            'rol_id' => (int)($_POST['rol_id'] ?? $usuario['rol_id']),
            'activo' => $activo,
        ]);

        Helpers::flash('success', "Usuario '{$nombre}' actualizado.");
        Helpers::redirect('/usuarios');
    }

    /**
     * Activa o desactiva rápidamente un usuario (solo administradores).
     */
    public function toggleStatus(string $id): void
    {
        Auth::requirePermission('usuarios.manage');
        Helpers::verifyCsrf();

        $userId = (int)$id;
        $usuario = Usuario::findById($userId);
        if (!$usuario) {
            Helpers::flash('danger', 'Usuario no encontrado.');
            Helpers::redirect('/usuarios');
        }

        if ($userId === Auth::id()) {
            Helpers::flash('danger', 'No puedes desactivar tu propia cuenta.');
            Helpers::redirect('/usuarios');
        }

        $nuevoEstado = (int)$usuario['activo'] ? 0 : 1;
        Usuario::setActive($userId, $nuevoEstado);

        $accion = $nuevoEstado ? 'activado' : 'desactivado';
        Helpers::flash('success', "Usuario '{$usuario['nombre']}' {$accion} correctamente.");
        Helpers::redirect('/usuarios');
    }
}
