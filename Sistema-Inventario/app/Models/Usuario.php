<?php

declare(strict_types=1);

namespace App\Models;

use App\Core\Database;

/**
 * ============================================================================
 * MODELO USUARIO (app/Models/Usuario.php)
 * ============================================================================
 * Gestiona las consultas y operaciones CRUD sobre la tabla `usuarios` y
 * su relación con `roles` para autenticación y administración de permisos.
 * ============================================================================
 */
class Usuario
{
    /**
     * Busca un usuario por su correo electrónico e incluye los datos de su rol.
     * Utilizado principalmente durante el proceso de inicio de sesión.
     */
    public static function findByEmail(string $email): ?array
    {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare(
            'SELECT u.*, r.nombre AS rol_nombre, r.descripcion AS rol_descripcion
             FROM usuarios u
             INNER JOIN roles r ON r.id = u.rol_id
             WHERE u.email = :email
             LIMIT 1'
        );
        $stmt->execute(['email' => $email]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    /**
     * Obtiene un usuario por su ID sin exponer el hash de contraseña.
     */
    public static function findById(int $id): ?array
    {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare(
            'SELECT u.id, u.nombre, u.email, u.rol_id, u.activo, u.creado_en,
                    r.nombre AS rol_nombre, r.descripcion AS rol_descripcion
             FROM usuarios u
             INNER JOIN roles r ON r.id = u.rol_id
             WHERE u.id = :id
             LIMIT 1'
        );
        $stmt->execute(['id' => $id]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    /**
     * Lista todos los usuarios registrados junto con el nombre de su rol.
     */
    public static function all(): array
    {
        $pdo = Database::getConnection();
        return $pdo->query(
            'SELECT u.id, u.nombre, u.email, u.rol_id, u.activo, u.creado_en,
                    r.nombre AS rol_nombre, r.descripcion AS rol_descripcion
             FROM usuarios u
             INNER JOIN roles r ON r.id = u.rol_id
             ORDER BY u.id ASC'
        )->fetchAll();
    }

    /**
     * Obtiene el catálogo completo de roles disponibles en el sistema.
     */
    public static function getRoles(): array
    {
        $pdo = Database::getConnection();
        return $pdo->query('SELECT * FROM roles ORDER BY id ASC')->fetchAll();
    }

    /**
     * Crea un nuevo usuario cifrando su contraseña con BCRYPT.
     *
     * @return int ID del usuario recién insertado.
     */
    public static function create(array $data): int
    {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare(
            'INSERT INTO usuarios (nombre, email, password_hash, rol_id, activo)
             VALUES (:nombre, :email, :password_hash, :rol_id, :activo)'
        );
        $stmt->execute([
            'nombre' => $data['nombre'],
            'email' => $data['email'],
            'password_hash' => password_hash($data['password'], PASSWORD_BCRYPT),
            'rol_id' => (int)$data['rol_id'],
            'activo' => (int)($data['activo'] ?? 1),
        ]);
        return (int)$pdo->lastInsertId();
    }

    /**
     * Actualiza los datos de un usuario existente; solo cambia la contraseña
     * si se proporciona una nueva no vacía.
     */
    public static function update(int $id, array $data): void
    {
        $pdo = Database::getConnection();
        $fields = 'nombre = :nombre, email = :email, rol_id = :rol_id, activo = :activo';
        $params = [
            'id' => $id,
            'nombre' => $data['nombre'],
            'email' => $data['email'],
            'rol_id' => (int)$data['rol_id'],
            'activo' => (int)($data['activo'] ?? 1),
        ];

        if (!empty($data['password'])) {
            $fields .= ', password_hash = :password_hash';
            $params['password_hash'] = password_hash($data['password'], PASSWORD_BCRYPT);
        }

        $stmt = $pdo->prepare("UPDATE usuarios SET {$fields} WHERE id = :id");
        $stmt->execute($params);
    }

    /**
     * Activa o desactiva la cuenta de un usuario.
     */
    public static function setActive(int $id, int $activo): void
    {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare('UPDATE usuarios SET activo = :activo WHERE id = :id');
        $stmt->execute([
            'id' => $id,
            'activo' => $activo ? 1 : 0,
        ]);
    }
}
