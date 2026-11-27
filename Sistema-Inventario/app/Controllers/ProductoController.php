<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Auth;
use App\Core\Controller;
use App\Core\Helpers;
use App\Core\ReportExporter;
use App\Models\Categoria;
use App\Models\Producto;

/**
 * ============================================================================
 * CONTROLADOR DE PRODUCTOS (app/Controllers/ProductoController.php)
 * ============================================================================
 * Implementa el módulo CRUD completo de productos y creación de categorías,
 * validando permisos RBAC y tokens CSRF en cada operación de escritura.
 * ============================================================================
 */
class ProductoController extends Controller
{
    private function getFilters(): array
    {
        return [
            'q' => trim($_GET['q'] ?? ''),
            'categoria_id' => $_GET['categoria_id'] ?? '',
            'activo' => $_GET['activo'] ?? '',
            'stock_bajo' => !empty($_GET['stock_bajo']),
        ];
    }

    /**
     * Listado de productos con búsqueda por texto, categoría, estado y stock bajo.
     */
    public function index(): void
    {
        Auth::requirePermission('productos.view');

        $filters = $this->getFilters();
        $pag = Helpers::paginate(Producto::all($filters), 15);
        $categorias = Categoria::all();

        $this->render('productos/index', [
            'title' => 'Catálogo de Productos',
            'productos' => $pag['items'],
            'page' => $pag['page'],
            'totalPages' => $pag['totalPages'],
            'totalRegistros' => $pag['total'],
            'categorias' => $categorias,
            'filters' => $filters,
        ]);
    }

    /**
     * Exporta el inventario actual (con filtros activos) a Excel (.xls).
     */
    public function exportExcel(): void
    {
        Auth::requirePermission('productos.view');
        $productos = Producto::all($this->getFilters());

        $headers = ['Código', 'Producto', 'Categoría', 'P. Compra', 'P. Venta', 'Stock', 'Stock Mín.', 'Unidad', 'Estado'];
        $rows = array_map(fn(array $p) => [
            $p['codigo'],
            $p['nombre'],
            $p['categoria_nombre'] ?? 'Sin categoría',
            (float)$p['precio_compra'],
            (float)$p['precio_venta'],
            (int)$p['stock'],
            (int)$p['stock_minimo'],
            $p['unidad'],
            (int)$p['activo'] ? 'Activo' : 'Inactivo',
        ], $productos);

        ReportExporter::toExcel('inventario_productos_' . date('Ymd_His'), 'Inventario', $headers, $rows);
    }

    /**
     * Exporta el inventario actual (con filtros activos) a PDF.
     */
    public function exportPdf(): void
    {
        Auth::requirePermission('productos.view');
        $productos = Producto::all($this->getFilters());

        $headers = ['Código', 'Producto', 'Categoría', 'P. Compra', 'P. Venta', 'Stock', 'Mín.', 'Unidad', 'Estado'];
        $widths = [72, 185, 105, 72, 72, 55, 45, 72, 62];
        $rows = array_map(fn(array $p) => [
            $p['codigo'],
            $p['nombre'],
            $p['categoria_nombre'] ?? 'Sin categoría',
            Helpers::money($p['precio_compra']),
            Helpers::money($p['precio_venta']),
            (string)(int)$p['stock'],
            (string)(int)$p['stock_minimo'],
            $p['unidad'],
            (int)$p['activo'] ? 'Activo' : 'Inactivo',
        ], $productos);

        ReportExporter::toPdf(
            'inventario_productos_' . date('Ymd_His'),
            'Reporte de Inventario de Productos',
            'Total de productos: ' . count($productos),
            $headers,
            $rows,
            $widths
        );
    }

    /**
     * Muestra el formulario de creación de producto.
     */
    public function create(): void
    {
        Auth::requirePermission('productos.create');
        $this->render('productos/form', [
            'title' => 'Nuevo Producto',
            'producto' => null,
            'categorias' => Categoria::all(),
        ]);
    }

    /**
     * Guarda un nuevo producto verificando unicidad del código SKU.
     */
    public function store(): void
    {
        Auth::requirePermission('productos.create');
        Helpers::verifyCsrf();

        $data = $_POST;
        $codigo = trim($data['codigo'] ?? '');
        $nombre = trim($data['nombre'] ?? '');

        if ($codigo === '' || $nombre === '') {
            Helpers::flash('danger', 'El código SKU y el nombre del producto son obligatorios.');
            Helpers::redirect('/productos/crear');
        }

        if ((float)($data['precio_compra'] ?? 0) < 0 || (float)($data['precio_venta'] ?? 0) < 0 || (int)($data['stock'] ?? 0) < 0 || (int)($data['stock_minimo'] ?? 0) < 0) {
            Helpers::flash('danger', 'Los precios y cantidades de stock no pueden ser negativos.');
            Helpers::redirect('/productos/crear');
        }

        if (Producto::findByCodigo($codigo)) {
            Helpers::flash('danger', "Ya existe un producto con el código '{$codigo}'.");
            Helpers::redirect('/productos/crear');
        }

        Producto::create($data, Auth::id());
        Helpers::flash('success', "Producto '{$nombre}' creado correctamente.");
        Helpers::redirect('/productos');
    }

    /**
     * Muestra el formulario de edición para un producto existente.
     */
    public function edit(string $id): void
    {
        Auth::requirePermission('productos.edit');
        $producto = Producto::find((int)$id);
        if (!$producto) {
            Helpers::flash('danger', 'Producto no encontrado.');
            Helpers::redirect('/productos');
        }

        $this->render('productos/form', [
            'title' => 'Editar Producto',
            'producto' => $producto,
            'categorias' => Categoria::all(),
        ]);
    }

    /**
     * Actualiza la ficha del producto validando que el SKU no colisione con otro.
     */
    public function update(string $id): void
    {
        Auth::requirePermission('productos.edit');
        Helpers::verifyCsrf();

        $prodId = (int)$id;
        $producto = Producto::find($prodId);
        if (!$producto) {
            Helpers::flash('danger', 'Producto no encontrado.');
            Helpers::redirect('/productos');
        }

        $codigo = trim($_POST['codigo'] ?? '');
        $nombre = trim($_POST['nombre'] ?? '');
        if ($codigo === '' || $nombre === '') {
            Helpers::flash('danger', 'El código SKU y el nombre del producto son obligatorios.');
            Helpers::redirect("/productos/editar/{$prodId}");
        }

        if ((float)($_POST['precio_compra'] ?? 0) < 0 || (float)($_POST['precio_venta'] ?? 0) < 0 || (int)($_POST['stock_minimo'] ?? 0) < 0) {
            Helpers::flash('danger', 'Los precios y el stock mínimo no pueden ser negativos.');
            Helpers::redirect("/productos/editar/{$prodId}");
        }

        if (Producto::findByCodigo($codigo, $prodId)) {
            Helpers::flash('danger', "Otro producto ya utiliza el código '{$codigo}'.");
            Helpers::redirect("/productos/editar/{$prodId}");
        }

        Producto::update($prodId, $_POST);
        Helpers::flash('success', "Producto '{$nombre}' actualizado correctamente.");
        Helpers::redirect('/productos');
    }

    /**
     * Elimina o desactiva un producto (si posee historial en facturas).
     */
    public function delete(string $id): void
    {
        Auth::requirePermission('productos.delete');
        Helpers::verifyCsrf();

        $prodId = (int)$id;
        $producto = Producto::find($prodId);
        if ($producto) {
            Producto::delete($prodId);
            Helpers::flash('success', "Producto '{$producto['nombre']}' eliminado o desactivado.");
        }
        Helpers::redirect('/productos');
    }

    /**
     * Crea una nueva categoría desde el modal rápido del catálogo.
     */
    public function storeCategoria(): void
    {
        Auth::requirePermission('productos.create');
        Helpers::verifyCsrf();

        $nombre = trim($_POST['nombre'] ?? '');
        if ($nombre === '') {
            Helpers::flash('danger', 'El nombre de la categoría es obligatorio.');
            Helpers::redirect('/productos');
        }

        try {
            Categoria::create($nombre, $_POST['descripcion'] ?? null);
            Helpers::flash('success', "Categoría '{$nombre}' agregada.");
        } catch (\Throwable $e) {
            Helpers::flash('danger', 'No se pudo crear la categoría (posiblemente ya existe).');
        }
        Helpers::redirect('/productos');
    }

    /**
     * Actualiza el nombre y descripción de una categoría existente.
     */
    public function updateCategoria(string $id): void
    {
        Auth::requirePermission('productos.create');
        Helpers::verifyCsrf();

        $nombre = trim($_POST['nombre'] ?? '');
        if ($nombre === '') {
            Helpers::flash('danger', 'El nombre de la categoría es obligatorio.');
            Helpers::redirect('/productos');
        }

        try {
            Categoria::update((int)$id, $nombre, $_POST['descripcion'] ?? null);
            Helpers::flash('success', "Categoría '{$nombre}' actualizada.");
        } catch (\Throwable $e) {
            Helpers::flash('danger', 'No se pudo actualizar la categoría (posiblemente ese nombre ya existe).');
        }
        Helpers::redirect('/productos');
    }

    /**
     * Elimina una categoría (los productos quedan sin categoría asignada).
     */
    public function deleteCategoria(string $id): void
    {
        Auth::requirePermission('productos.create');
        Helpers::verifyCsrf();

        Categoria::delete((int)$id);
        Helpers::flash('success', 'Categoría eliminada correctamente.');
        Helpers::redirect('/productos');
    }
}
