# StockFlow Pro — Sistema de Inventario y Facturación (PHP MVC + MySQL + Bootstrap 5 + Sass)

## Arquitectura del Proyecto (Archivo por Archivo)

- `.htaccess` y `public/.htaccess`: Reglas Apache `mod_rewrite` para servir la aplicación directamente desde `htdocs` sin exponer carpetas internas (`/app`, `/config`, `/database`).
- `config/config.php`: Configuración global (zona horaria, IVA por defecto, credenciales de MySQL).
- `database/bd.sql`: Script SQL completo para crear la base de datos `bd`, sus 7 tablas relacionales (`roles`, `usuarios`, `categorias`, `productos`, `movimientos_inventario`, `facturas`, `detalle_facturas`) y datos iniciales de prueba.
- `public/index.php`: *Front Controller* — inicializa sesiones, autoloader PSR-4, calcula `BASE_URL` automáticamente y registra todas las rutas del sistema.
- `app/Core/`:
  - `Database.php`: Conexión PDO Singleton a MySQL con sentencias preparadas nativas.
  - `Auth.php`: Gestión de sesión y matriz de permisos RBAC (`admin`, `vendedor`, `almacen`).
  - `Helpers.php`: Generación de URLs, protección CSRF, mensajes flash y escape XSS.
  - `Controller.php`: Clase base para renderizar vistas dentro de layouts y respuestas JSON.
  - `Router.php`: Enrutador HTTP GET/POST con parámetros dinámicos (`{id}`).
- `app/Models/`:
  - `Usuario.php`: Consultas de usuarios, roles y cifrado de contraseñas con `password_hash`.
  - `Categoria.php`: Listado y creación de categorías de productos.
  - `Producto.php`: CRUD de productos, filtros, alertas de stock bajo e ingresos/ajustes con bloqueo `FOR UPDATE`.
  - `Movimiento.php`: Consulta del historial de movimientos (Kardex).
  - `Factura.php`: Creación transaccional de facturas (valida y descuenta stock automáticamente), impresión y anulación con devolución de stock.
- `app/Controllers/`:
  - `AuthController.php`, `DashboardController.php`, `ProductoController.php`, `InventarioController.php`, `FacturaController.php`, `UsuarioController.php`.
- `app/Views/`: Vistas HTML/PHP con Bootstrap 5 (`layouts/`, `auth/`, `dashboard/`, `productos/`, `inventario/`, `facturas/`, `usuarios/`, `errors/`).
- `src/scss/` y `public/assets/`: Código fuente Sass (`_variables.scss`, `_layout.scss`, `_components.scss`, `_print.scss`, `app.scss`) ya compilado en `public/assets/css/app.css`, junto con Bootstrap 5 y Bootstrap Icons en `public/assets/vendor/`.

---

## Despliegue en XAMPP (`htdocs` y MySQL / phpMyAdmin)

1. **Copiar el proyecto a `htdocs`**:
   Copia la carpeta del proyecto dentro de `C:\xampp\htdocs\sistema-inventario` (puedes renombrar la carpeta sin espacios si lo prefieres; `.htaccess` y `BASE_URL` se adaptan automáticamente).

2. **Iniciar Apache y MySQL**:
   Abre **XAMPP Control Panel** e inicia los módulos **Apache** y **MySQL**.

3. **Subir la base de datos a MySQL**:
   - **Opción A (phpMyAdmin)**: Abre `http://localhost/phpmyadmin`, ve a la pestaña **Importar**, selecciona `database/bd.sql` y haz clic en **Importar**.
   - **Opción B (Consola)**:
     ```powershell
     C:\xampp\mysql\bin\mysql.exe -u root < "C:\xampp\htdocs\sistema-inventario\database\bd.sql"
     ```
   *(Si tu MySQL tiene contraseña en `root`, edítala en `config/config.php`.)*

4. **Acceder al sistema**:
   Abre en tu navegador:
   - `http://localhost/sistema-inventario/`

---

## Credenciales de Prueba (contraseña: `admin123`)
| Rol | Correo | Permisos |
|---|---|---|
| **Administrador** | `admin@inventario.local` | Acceso total (CRUD productos, ingresos, facturación, anulación, Kardex, usuarios) |
| **Vendedor** | `vendedor@inventario.local` | Dashboard, consulta de productos, facturación (POS) e historial de facturas |
| **Almacén** | `almacen@inventario.local` | Dashboard, CRUD de productos, ingresos/ajustes de stock y Kardex |
