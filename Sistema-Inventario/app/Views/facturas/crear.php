<?php

use App\Core\Helpers;

/** @var array<int, array<string, mixed>> $productos */
/** @var array<int, array<string, mixed>> $clientes */
/** @var float $tasaUsd */
/** @var float $defaultTaxRate */
?>
<form action="<?= Helpers::url('/facturas/guardar') ?>" method="POST" id="posForm">
    <?= Helpers::csrfField() ?>
    <div class="row g-4">
        <!-- Catálogo disponible -->
        <div class="col-12 col-lg-5">
            <div class="card h-100">
                <div class="card-header bg-white py-3">
                    <h2 class="h6 mb-2 fw-bold"><i class="bi bi-box-seam me-2 text-primary"></i>Productos Disponibles</h2>
                    <input type="text" id="posSearch" class="form-control form-control-sm" placeholder="Código (Enter para agregar) o nombre...">
                </div>
                <div class="card-body p-2 pos-product-list" id="posProductList">
                    <?php if (empty($productos)): ?>
                        <div class="text-center text-muted py-5">No hay productos con stock disponible.</div>
                    <?php else: ?>
                        <?php foreach ($productos as $p): ?>
                            <div class="pos-product-item border rounded p-2 mb-2 d-flex justify-content-between align-items-center"
                                 data-id="<?= (int)$p['id'] ?>"
                                 data-codigo="<?= Helpers::e($p['codigo']) ?>"
                                 data-nombre="<?= Helpers::e($p['nombre']) ?>"
                                 data-precio="<?= (float)$p['precio_venta'] ?>"
                                 data-stock="<?= (int)$p['stock'] ?>">
                                <div>
                                    <div class="fw-semibold small"><?= Helpers::e($p['nombre']) ?></div>
                                    <div class="text-muted" style="font-size: 0.78rem;">
                                        <code><?= Helpers::e($p['codigo']) ?></code> · Stock: <strong><?= (int)$p['stock'] ?></strong>
                                    </div>
                                </div>
                                <div class="text-end">
                                    <div class="fw-bold text-primary small pos-product-price"><?= Helpers::money($p['precio_venta']) ?></div>
                                    <button type="button" class="btn btn-sm btn-outline-primary py-0 px-2 mt-1 btn-add-item">
                                        <i class="bi bi-plus"></i> Agregar
                                    </button>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </div>
            </div>
        </div>

        <!-- Carrito y Datos del Cliente -->
        <div class="col-12 col-lg-7">
            <div class="card mb-3">
                <div class="card-header bg-white py-3">
                    <h2 class="h6 mb-0 fw-bold"><i class="bi bi-person-vcard me-2 text-primary"></i>Datos del Cliente</h2>
                </div>
                <div class="card-body">
                    <div class="row g-2">
                        <?php if (!empty($clientes)): ?>
                            <div class="col-12">
                                <label class="form-label small fw-medium">Cliente guardado (opcional)</label>
                                <select id="clientSelect" name="cliente_id" class="form-select form-select-sm">
                                    <option value="">-- Escribir cliente manualmente --</option>
                                    <?php foreach ($clientes as $cli): ?>
                                        <option value="<?= (int)$cli['id'] ?>"
                                                data-nombre="<?= Helpers::e($cli['nombre']) ?>"
                                                data-documento="<?= Helpers::e($cli['documento'] ?? '') ?>"
                                                data-telefono="<?= Helpers::e($cli['telefono'] ?? '') ?>"
                                                data-email="<?= Helpers::e($cli['email'] ?? '') ?>">
                                            <?= Helpers::e($cli['nombre']) ?><?= !empty($cli['documento']) ? ' (' . Helpers::e($cli['documento']) . ')' : '' ?>
                                        </option>
                                    <?php endforeach; ?>
                                </select>
                            </div>
                        <?php endif; ?>
                        <div class="col-md-6">
                            <label class="form-label small fw-medium">Nombre / Razón Social *</label>
                            <input type="text" name="cliente_nombre" id="clienteNombreInput" class="form-control form-control-sm" placeholder="Nombre del cliente" required>
                        </div>
                        <div class="col-md-3">
                            <label class="form-label small fw-medium">Documento / NIT</label>
                            <input type="text" name="cliente_documento" id="clienteDocInput" class="form-control form-control-sm" placeholder="Opcional">
                        </div>
                        <div class="col-md-3">
                            <label class="form-label small fw-medium">Método de Pago</label>
                            <select name="metodo_pago" id="paymentMethodSelect" class="form-select form-select-sm">
                                <option value="efectivo">Efectivo</option>
                                <option value="tarjeta">Tarjeta</option>
                                <option value="transferencia">Transferencia</option>
                            </select>
                        </div>
                        <div class="col-md-3">
                            <label class="form-label small fw-medium">Moneda (TRM <?= number_format($tasaUsd, 0, ',', '.') ?>)</label>
                            <select name="moneda" id="currencySelect" class="form-select form-select-sm">
                                <option value="COP" selected>COP (Peso Colombiano)</option>
                                <option value="USD">USD (Dólar)</option>
                            </select>
                        </div>
                        <div class="col-md-3">
                            <label class="form-label small fw-medium">Teléfono</label>
                            <input type="text" name="cliente_telefono" id="clienteTelInput" class="form-control form-control-sm" placeholder="Opcional">
                        </div>
                        <div class="col-md-3">
                            <label class="form-label small fw-medium">Correo</label>
                            <input type="email" name="cliente_email" id="clienteEmailInput" class="form-control form-control-sm" placeholder="Opcional">
                        </div>
                        <div class="col-md-3">
                            <label class="form-label small fw-medium">Notas</label>
                            <input type="text" name="notas" class="form-control form-control-sm" placeholder="Observaciones">
                        </div>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                    <h2 class="h6 mb-0 fw-bold"><i class="bi bi-cart3 me-2 text-primary"></i>Detalle de Factura</h2>
                    <span class="badge bg-secondary-subtle text-secondary" id="cartCount">0 ítems</span>
                </div>
                <div class="table-responsive">
                    <table class="table table-sm align-middle mb-0">
                        <thead class="table-light">
                        <tr>
                            <th>Producto</th>
                            <th style="width: 115px;">Cantidad</th>
                            <th class="text-end">Precio</th>
                            <th class="text-end">Subtotal</th>
                            <th style="width: 40px;"></th>
                        </tr>
                        </thead>
                        <tbody id="cartBody">
                        <tr id="emptyCartRow">
                            <td colspan="5" class="text-center text-muted py-4">Haz clic en un producto de la izquierda para agregarlo.</td>
                        </tr>
                        </tbody>
                    </table>
                </div>

                <div class="card-footer bg-white">
                    <div class="row g-2 align-items-center mb-2">
                        <div class="col-6 col-md-4">
                            <label class="form-label small mb-0">IVA (%)</label>
                            <input type="number" step="0.01" min="0" max="100" name="impuesto_porcentaje" id="taxRateInput"
                                   class="form-control form-control-sm" value="<?= (float)$defaultTaxRate ?>">
                        </div>
                        <div class="col-6 col-md-4">
                            <label class="form-label small mb-0" id="discountLabel">Descuento (COP $)</label>
                            <input type="number" step="0.01" min="0" name="descuento" id="discountInput"
                                   class="form-control form-control-sm" value="0">
                        </div>
                        <div class="col-12 col-md-4 text-md-end mt-3 mt-md-0">
                            <div class="small text-muted">Subtotal: <span id="lblSubtotal">COP $0.00</span></div>
                            <div class="small text-muted">Impuesto: <span id="lblTax">COP $0.00</span></div>
                            <div class="h5 fw-bold text-primary mb-0">Total: <span id="lblTotal">COP $0.00</span></div>
                        </div>
                    </div>

                    <div class="row g-2 align-items-center mb-2 pt-2 border-top" id="cashBox">
                        <div class="col-6 col-md-4">
                            <label class="form-label small mb-0">Recibido en efectivo</label>
                            <input type="number" step="0.01" min="0" name="monto_recibido" id="cashReceivedInput"
                                   class="form-control form-control-sm" placeholder="Opcional">
                        </div>
                        <div class="col-6 col-md-8 text-end">
                            <div class="small text-muted">Cambio / Devuelta:</div>
                            <div class="fw-bold text-success" id="lblChange">COP $0.00</div>
                        </div>
                    </div>

                    <button type="submit" class="btn btn-primary w-100 fw-semibold mt-2" id="btnSubmitInvoice" disabled>
                        <i class="bi bi-receipt-cutoff me-1"></i> Emitir Factura y Descontar Stock
                    </button>
                </div>
            </div>
        </div>
    </div>
</form>

<script>
(() => {
    const cart = new Map();
    const cartBody = document.getElementById('cartBody');
    const emptyCartRow = document.getElementById('emptyCartRow');
    const tasaUsd = <?= json_encode(max(1.0, (float)$tasaUsd)) ?>;
    const taxRateInput = document.getElementById('taxRateInput');
    const discountInput = document.getElementById('discountInput');
    const currencySelect = document.getElementById('currencySelect');
    const paymentMethodSelect = document.getElementById('paymentMethodSelect');
    const cashBox = document.getElementById('cashBox');
    const cashReceivedInput = document.getElementById('cashReceivedInput');
    const lblChange = document.getElementById('lblChange');
    const discountLabel = document.getElementById('discountLabel');
    const btnSubmit = document.getElementById('btnSubmitInvoice');
    const cartCount = document.getElementById('cartCount');

    const getCurrency = () => currencySelect?.value || 'COP';
    const unitPrice = (baseCop) => getCurrency() === 'USD' ? Math.round((baseCop / tasaUsd) * 100) / 100 : baseCop;
    const fmt = (n) => getCurrency() + ' $' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const escapeHtml = (str) => String(str).replace(/[&<>"']/g, (m) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[m]));

    function recalc() {
        let subtotal = 0;
        let totalItems = 0;
        cart.forEach(item => {
            subtotal += unitPrice(item.precio) * item.cantidad;
            totalItems += item.cantidad;
        });

        let descuento = Math.max(0, parseFloat(discountInput.value) || 0);
        if (descuento > subtotal) descuento = subtotal;
        const base = Math.max(0, subtotal - descuento);
        const taxRate = Math.max(0, parseFloat(taxRateInput.value) || 0);
        const tax = base * (taxRate / 100);
        const total = base + tax;

        document.getElementById('lblSubtotal').textContent = fmt(subtotal);
        document.getElementById('lblTax').textContent = fmt(tax);
        document.getElementById('lblTotal').textContent = fmt(total);

        if (cashReceivedInput && lblChange) {
            const received = parseFloat(cashReceivedInput.value);
            if (!isNaN(received) && cashReceivedInput.value !== '') {
                const diff = received - total;
                lblChange.textContent = fmt(Math.max(0, diff));
                lblChange.className = diff >= 0 ? 'fw-bold text-success' : 'fw-bold text-danger';
            } else {
                lblChange.textContent = fmt(0);
                lblChange.className = 'fw-bold text-success';
            }
        }

        cartCount.textContent = `${totalItems} ítem${totalItems === 1 ? '' : 's'}`;
        btnSubmit.disabled = cart.size === 0;
    }

    function renderCart() {
        cartBody.innerHTML = '';
        if (cart.size === 0) {
            cartBody.appendChild(emptyCartRow);
            recalc();
            return;
        }

        cart.forEach((item, id) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    <div class="fw-semibold small">${escapeHtml(item.nombre)}</div>
                    <div class="text-muted" style="font-size: 0.75rem;">Disp: ${item.stock}</div>
                    <input type="hidden" name="producto_id[]" value="${id}">
                </td>
                <td>
                    <input type="number" name="cantidad[]" class="form-control form-control-sm qty-input"
                           min="1" max="${item.stock}" value="${item.cantidad}" data-id="${id}">
                </td>
                <td class="text-end small">${fmt(unitPrice(item.precio))}</td>
                <td class="text-end fw-semibold small">${fmt(unitPrice(item.precio) * item.cantidad)}</td>
                <td class="text-end">
                    <button type="button" class="btn btn-sm btn-link text-danger p-0 btn-remove" data-id="${id}">
                        <i class="bi bi-x-lg"></i>
                    </button>
                </td>
            `;
            cartBody.appendChild(tr);
        });

        cartBody.querySelectorAll('.qty-input').forEach(inp => {
            inp.addEventListener('change', (e) => {
                const id = e.target.dataset.id;
                const item = cart.get(id);
                let val = parseInt(e.target.value, 10) || 1;
                if (val < 1) val = 1;
                if (val > item.stock) {
                    val = item.stock;
                    alert(`Stock máximo disponible para ${item.nombre}: ${item.stock}`);
                }
                item.cantidad = val;
                renderCart();
            });
        });

        cartBody.querySelectorAll('.btn-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                cart.delete(id);
                renderCart();
            });
        });

        recalc();
    }

    document.querySelectorAll('.pos-product-item').forEach(el => {
        el.addEventListener('click', () => {
            const id = el.dataset.id;
            const stock = parseInt(el.dataset.stock, 10);
            const existing = cart.get(id);
            if (existing) {
                if (existing.cantidad < stock) {
                    existing.cantidad += 1;
                } else {
                    alert(`No hay más stock disponible para ${existing.nombre}.`);
                    return;
                }
            } else {
                cart.set(id, {
                    nombre: el.dataset.nombre,
                    precio: parseFloat(el.dataset.precio),
                    stock: stock,
                    cantidad: 1
                });
            }
            renderCart();
        });
    });

    const posSearch = document.getElementById('posSearch');
    posSearch?.addEventListener('input', (e) => {
        const term = e.target.value.trim().toLowerCase();
        document.querySelectorAll('.pos-product-item').forEach(el => {
            const text = (el.dataset.codigo + ' ' + el.dataset.nombre).toLowerCase();
            el.style.display = text.includes(term) ? '' : 'none';
        });
    });

    posSearch?.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter') return;
        e.preventDefault();
        const term = posSearch.value.trim().toLowerCase();
        if (term === '') return;

        const items = Array.from(document.querySelectorAll('.pos-product-item'));
        const exact = items.find(el => el.dataset.codigo.toLowerCase() === term);
        const visible = items.filter(el => el.style.display !== 'none');
        const target = exact || (visible.length === 1 ? visible[0] : null);
        if (target) {
            target.click();
            posSearch.value = '';
            items.forEach(el => { el.style.display = ''; });
        }
    });

    document.getElementById('clientSelect')?.addEventListener('change', (e) => {
        const opt = e.target.selectedOptions[0];
        if (!opt || !opt.value) return;
        document.getElementById('clienteNombreInput').value = opt.dataset.nombre || '';
        document.getElementById('clienteDocInput').value = opt.dataset.documento || '';
        document.getElementById('clienteTelInput').value = opt.dataset.telefono || '';
        document.getElementById('clienteEmailInput').value = opt.dataset.email || '';
    });

    paymentMethodSelect?.addEventListener('change', () => {
        const isCash = paymentMethodSelect.value === 'efectivo';
        if (cashBox) {
            cashBox.style.display = isCash ? '' : 'none';
        }
        if (!isCash && cashReceivedInput) {
            cashReceivedInput.value = '';
            recalc();
        }
    });

    const updateCatalogPrices = () => {
        document.querySelectorAll('.pos-product-item').forEach(el => {
            const priceEl = el.querySelector('.pos-product-price');
            if (priceEl) {
                priceEl.textContent = fmt(unitPrice(parseFloat(el.dataset.precio)));
            }
        });
    };

    taxRateInput.addEventListener('input', recalc);
    discountInput.addEventListener('input', recalc);
    cashReceivedInput?.addEventListener('input', recalc);
    currencySelect?.addEventListener('change', () => {
        if (discountLabel) {
            discountLabel.textContent = `Descuento (${getCurrency()} $)`;
        }
        updateCatalogPrices();
        renderCart();
    });

    document.getElementById('posForm')?.addEventListener('submit', (e) => {
        const clienteNombre = document.getElementById('clienteNombreInput')?.value.trim() ?? '';
        if (clienteNombre === '') {
            e.preventDefault();
            alert('El nombre del cliente es obligatorio para crear la factura.');
            document.getElementById('clienteNombreInput')?.focus();
            return;
        }
        if (cart.size === 0) {
            e.preventDefault();
            alert('Debes agregar al menos un producto para crear la factura.');
        }
    });
})();
</script>
