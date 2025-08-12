<?php include 'header.php'; ?>

<?php include 'auth-header.php'; ?>

<main class="bg-white">



<h2>Registrar Pedido</h2>
<form id="form-pedido">
    <div class="flex justify-start gap-x-8">
        <div class="grid gap-3">
            <label class="label">Fecha Pedido</label>
            <input class="input" type="text" name="fecha_pedido" readonly class="fecha-auto"></label>
        </div>
        <div class="grid gap-3">
            <label class="label">Fecha Requerida</label>
            <input class="input" type="date" name="fecha_requerida" required></label>
        </div>
    </div>

    <!-- Campo de empleado oculto que se llenará automáticamente -->
    <input type="hidden" name="empleado" id="select-empleado-pedido">
<div class="flex justify-between items-center my-4">
    <h3>Productos y Tiendas</h3>
    <button type="button" onclick="agregarProductoPedido()" class="btn-icon-outline rounded-full" data-tooltip="Añadir producto">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>
            </button>
    <!-- <button type="button" class="btn-outline" onclick="agregarProductoPedido()">+ Agregar Producto</button> -->
</div>
    <div class="table-container border border-gray-200 p-4 rounded-lg">
        <table class="pedidos-table table">
            <thead>
                <tr class="[&_th]:font-bold">
                    <th>Producto</th>
                    <th>Tiendas</th>
                    <th>Total</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody id="productos-tiendas-container">
                <tr class="producto-tienda-item">
                    <td>
                        <select class="producto-select select" onchange="actualizarTiendasProducto(this).catch(console.error)">>
                            <option value="">-- Seleccionar producto --</option>
                        </select>
                    </td>
                    <td class="tiendas-cantidades" style="visibility: hidden;">
                        <div class="tiendas-grid grid grid-cols-3 gap-x-8" id="tiendas-grid-0"></div>
                    </td>
                    <td class="producto-total" style="visibility: hidden;">
                        <span class="font-bold text-lg">0</span>
                    </td>
                    <td>
                        <button type="button" class="btn-sm-icon-destructive" onclick="removerProductoPedido(this)"><svg
                                viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <g fill="currentColor">
                                    <path fill-rule="evenodd" clip-rule="evenodd"
                                        d="M10.3 2.25h3.4q.3 0 .57.03c.7.11 1.32.55 1.64 1.18q.13.24.22.54l.1.34.04.09a1.25 1.25 0 0 0 1.23.82h3a.75.75 0 0 1 0 1.5h-17a.75.75 0 0 1 0-1.5h3.09a1.25 1.25 0 0 0 1.17-.91L7.87 4q.1-.3.22-.54c.32-.63.93-1.07 1.64-1.18q.25-.04.58-.03m-1.3 3 .18-.43.1-.3.14-.37a.8.8 0 0 1 .54-.4h4.08q.36.09.54.4c.03.04.05.1.14.37l.1.3.04.12q.05.15.13.31z" />
                                    <path
                                        d="M5.92 8.45a.75.75 0 1 0-1.5.1l.46 6.95c.09 1.28.16 2.32.32 3.13.17.85.45 1.55 1.04 2.1.6.56 1.32.8 2.17.91.83.11 1.87.11 3.15.11h.88c1.29 0 2.32 0 3.15-.1a3.7 3.7 0 0 0 2.17-.91c.59-.55.87-1.26 1.04-2.1.16-.82.23-1.86.32-3.14l.46-6.95a.75.75 0 0 0-1.5-.1l-.45 6.9a26 26 0 0 1-.3 3c-.14.67-.33 1.04-.6 1.3-.27.25-.65.41-1.34.5-.71.1-1.65.1-3 .1h-.78c-1.35 0-2.29 0-3-.1-.7-.09-1.07-.25-1.34-.5-.27-.26-.46-.62-.6-1.3-.14-.72-.2-1.65-.3-3z" />
                                    <path
                                        d="M9.43 10.25c.4-.04.78.26.82.68l.5 5a.75.75 0 0 1-1.5.14l-.5-5a.75.75 0 0 1 .68-.82m5.14 0c.42.04.72.41.68.82l-.5 5a.75.75 0 0 1-1.5-.14l.5-5a.75.75 0 0 1 .82-.68" />
                                </g>
                            </svg></button>
                    </td>
                </tr>
            </tbody>
            <tfoot>
                <tr class="font-bold bg-gray-100">
                    <td class="text-right pr-4">Totales c/tienda</td>
                    <td>
                        <div id="tiendas-totales-grid"></div>
                    </td>
                    <td><span id="gran-total" class="text-lg">0</span> unidades</td>
                    <td></td>
                </tr>
            </tfoot>
        </table>
    </div>
    <div class="flex justify-between mt-4">
        <button type="button" id="btn-guardar-progreso-pedidos" class="btn-outline">Guardar Progreso</button>
        <button type="button" id="btn-limpiar-progreso-pedidos" class="btn-destructive">Limpiar Todo</button>
        <button type="submit" class="btn">Registrar Pedido</button>
    </div>

    <div class="endpoint">POST /pedidos</div>
</form>
<div id="result-pedido" class="result"></div>


</main>
<?php include 'footer.php'; ?>