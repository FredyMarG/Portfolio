<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Auth;
use App\Core\Controller;
use App\Core\Helpers;
use App\Models\Usuario;

/**
 * ============================================================================
 * CONTROLADOR DE AUTENTICACIÓN (app/Controllers/AuthController.php)
 * ============================================================================
 * Maneja el formulario de acceso, la verificación de credenciales contra MySQL
 * (password_verify) y el cierre seguro de sesión.
 * ============================================================================
 */
class AuthController extends Controller
{
    /**
     * Muestra la pantalla de inicio de sesión (si ya está autenticado, redirige).
     */
    public function showLogin(): void
    {
        if (Auth::check()) {
            Helpers::redirect('/dashboard');
        }
        $this->render('auth/login', ['title' => 'Iniciar Sesión'], 'auth');
    }

    /**
     * Procesa el formulario POST /login validando CSRF, contraseña y estado activo.
     */
    public function login(): void
    {
        Helpers::verifyCsrf();

        // Bloqueo temporal tras 5 intentos fallidos consecutivos
        $attemptData = $_SESSION['login_attempts'] ?? ['count' => 0, 'blocked_until' => 0];
        if ($attemptData['blocked_until'] > time()) {
            $wait = $attemptData['blocked_until'] - time();
            Helpers::flash('danger', "Demasiados intentos fallidos. Espera {$wait} segundos antes de volver a intentar.");
            Helpers::redirect('/login');
        }

        $email = trim($_POST['email'] ?? '');
        $password = $_POST['password'] ?? '';

        if ($email === '' || $password === '') {
            Helpers::flash('danger', 'Ingresa tu correo y contraseña.');
            Helpers::redirect('/login');
        }

        $user = Usuario::findByEmail($email);
        if (!$user || !password_verify($password, $user['password_hash'])) {
            $attemptData['count'] = ($attemptData['count'] ?? 0) + 1;
            if ($attemptData['count'] >= 5) {
                $attemptData['blocked_until'] = time() + 60;
                $attemptData['count'] = 0;
            }
            $_SESSION['login_attempts'] = $attemptData;
            Helpers::flash('danger', 'Credenciales incorrectas.');
            Helpers::redirect('/login');
        }

        if (!(int)$user['activo']) {
            Helpers::flash('danger', 'Tu cuenta está desactivada. Contacta al administrador.');
            Helpers::redirect('/login');
        }

        unset($_SESSION['login_attempts']);
        Auth::login($user);
        Helpers::flash('success', 'Bienvenido, ' . $user['nombre'] . '.');
        Helpers::redirect('/dashboard');
    }

    /**
     * Muestra el formulario público de registro de nuevos usuarios.
     */
    public function showRegister(): void
    {
        if (Auth::check()) {
            Helpers::redirect('/dashboard');
        }
        $this->render('auth/register', ['title' => 'Crear Cuenta'], 'auth');
    }

    /**
     * Procesa el registro público POST /registro asignando el rol estándar (vendedor).
     */
    public function register(): void
    {
        Helpers::verifyCsrf();

        $nombre = trim($_POST['nombre'] ?? '');
        $email = trim($_POST['email'] ?? '');
        $password = $_POST['password'] ?? '';
        $passwordConfirm = $_POST['password_confirm'] ?? '';

        if ($nombre === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            Helpers::flash('danger', 'Ingresa un nombre y un correo electrónico válido.');
            Helpers::redirect('/registro');
        }

        if (strlen($password) < 6) {
            Helpers::flash('danger', 'La contraseña debe tener al menos 6 caracteres.');
            Helpers::redirect('/registro');
        }

        if ($password !== $passwordConfirm) {
            Helpers::flash('danger', 'Las contraseñas no coinciden.');
            Helpers::redirect('/registro');
        }

        if (Usuario::findByEmail($email)) {
            Helpers::flash('danger', 'Ya existe una cuenta registrada con ese correo electrónico.');
            Helpers::redirect('/registro');
        }

        Usuario::create([
            'nombre' => $nombre,
            'email' => $email,
            'password' => $password,
            'rol_id' => 2, // Rol estándar: vendedor
            'activo' => 1,
        ]);

        Helpers::flash('success', 'Cuenta creada correctamente. Ahora puedes iniciar sesión.');
        Helpers::redirect('/login');
    }

    /**
     * Muestra el perfil del usuario autenticado y formulario de cambio de contraseña.
     */
    public function showProfile(): void
    {
        Auth::requireLogin();
        $this->render('auth/perfil', [
            'title' => 'Mi Perfil',
            'user' => Auth::user(),
        ]);
    }

    /**
     * Actualiza la contraseña del usuario autenticado validando la contraseña actual.
     */
    public function updatePassword(): void
    {
        Auth::requireLogin();
        Helpers::verifyCsrf();

        $current = $_POST['current_password'] ?? '';
        $newPass = $_POST['new_password'] ?? '';
        $confirm = $_POST['confirm_password'] ?? '';

        if (strlen($newPass) < 6) {
            Helpers::flash('danger', 'La nueva contraseña debe tener al menos 6 caracteres.');
            Helpers::redirect('/perfil');
        }

        if ($newPass !== $confirm) {
            Helpers::flash('danger', 'La confirmación de contraseña no coincide.');
            Helpers::redirect('/perfil');
        }

        $sessionUser = Auth::user();
        $dbUser = Usuario::findByEmail($sessionUser['email']);
        if (!$dbUser || !password_verify($current, $dbUser['password_hash'])) {
            Helpers::flash('danger', 'Tu contraseña actual es incorrecta.');
            Helpers::redirect('/perfil');
        }

        Usuario::update((int)$dbUser['id'], [
            'nombre' => $dbUser['nombre'],
            'email' => $dbUser['email'],
            'password' => $newPass,
            'rol_id' => $dbUser['rol_id'],
            'activo' => $dbUser['activo'],
        ]);

        Helpers::flash('success', 'Tu contraseña se actualizó correctamente.');
        Helpers::redirect('/perfil');
    }

    /**
     * Cierra la sesión actual mediante POST /logout protegido con CSRF.
     */
    public function logout(): void
    {
        Helpers::verifyCsrf();
        Auth::logout();
        session_start();
        Helpers::flash('info', 'Has cerrado sesión correctamente.');
        Helpers::redirect('/login');
    }
}
