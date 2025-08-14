<?php include 'header.php'; ?>

<?php include 'auth-header.php'; ?>

<main class="bg-white">

<!-- Sección de Inventario Final -->
<div id="seccion-inventario" class="mt-8">
    <h2>Inventario Final Diario</h2>
    <p class="text-sm text-gray-600 mb-4">
        Registra el conteo de productos al final del día. Solo usuarios de tienda pueden acceder a esta función.
    </p>

    <div class="flex gap-4 mb-6">
        <div>
            <label class="label">Fecha y Hora</label>
            <input class="input fecha-auto" type="datetime-local" id="fecha-inventario" readonly>
        </div>
        <div>
            <label class="label">Tienda</label>
            <select class="select" id="select-tienda-inventario">
                <option value="">-- Seleccionar tienda --</option>
            </select>
        </div>
    </div>

    <div id="inventario-productos-container">
        <form id="form-inventario">
            <div class="mb-4">
                <h3 class="text-lg font-semibold mb-3">Productos por Familia</h3>
                <div id="tabla-inventario-container" class="border border-gray-200 p-4 rounded-lg">
                    <div id="inventario-controles" class="flex justify-between items-center mb-4" style="display: none;">
                        <div class="flex gap-2">
                            <button type="button" id="btn-guardar-progreso" class="btn-outline">
                                Guardar Progreso
                            </button>
                            <button type="button" id="btn-limpiar-progreso" class="btn-destructive">
                                Limpiar Todo
                            </button>
                        </div>
                        <div id="indicador-progreso" class="text-sm text-gray-600">
                            <span id="productos-completados">0</span> de <span id="productos-totales">0</span> productos completados
                        </div>
                    </div>

                    <table id="tabla-inventario" class="table" style="display: none;">
                        <thead>
                            <tr class="bg-gray-50">
                                <th>Familia</th>
                                <th>Producto</th>
                                <th>Cantidad</th>
                            </tr>
                        </thead>
                        <tbody id="productos-inventario-tbody">
                            <!-- Los productos se cargarán automáticamente aquí -->
                        </tbody>
                    </table>
                    <div id="loading-productos" class="text-center py-8 text-gray-500">
                        Selecciona una tienda para cargar los productos...
                    </div>
                </div>
            </div>
            <button type="button" onclick="document.getElementById('dialog-resumen').showModal()" class="btn-outline">Ver resumen</button>
                </form>

                <dialog id="dialog-resumen" class="dialog w-full sm:max-w-[425px] max-h-[612px]" aria-labelledby="dialog-resumen-title" aria-describedby="dialog-resumen-description" onclick="if (event.target === this) this.close()">
                    <article>
                        <header>
                            <h2 id="dialog-resumen-title">¿Confirmar registro de inventario?</h2>
                        </header>
                        <section id="dialog-resumen-section">
                            <!-- Aquí se insertará el resumen dinámicamente -->
                        </section>
                        <footer>
                            <button class="btn-outline" onclick="this.closest('dialog').close()">Cancel</button>
                            <button class="btn" type="submit" id="btn-registrar-inventario-dialog">
                                Registrar Inventario
                            </button>
                        </footer>
                    </article>
                </dialog>
        </form>

        <div id="result-inventario" class="result mt-4"></div>
    </div>
</div>
</main>
<?php include 'footer.php'; ?>