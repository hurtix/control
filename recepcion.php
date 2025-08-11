<?php include 'header.php'; ?>

<?php include 'auth-header.php'; ?>

<main>

<h2>Registrar Recepción</h2>
<form id="form-recepcion">
    <div class="flex justify-end">
        <div class="grid gap-3">
            <label class="label">Fecha</label>
            <input class="input fecha-auto" type="text" name="fecha" readonly>
        </div>
    </div>
    <div class="flex gap-x-4">
        <div class="w-1/3">
            <label>Lote</label>
            <div id="lotes-recepcion-container" class="card-container max-h-[400px] overflow-scroll p-4 bg-gray-100 rounded-lg flex flex-col gap-3">
                <!-- Aquí se mostrarán los lotes disponibles para recepción -->
                <div class="spinner-container">
                    <div class="spinner"></div>
                    <p>Cargando lotes...</p>
                </div>
            </div>
            <input type="hidden" name="lote_id" id="lote-recepcion-selected">
        </div>
        <div class="w-2/3">
            <div id="tiendas-lote-container" style="display: none;">
                <input type="hidden" name="tienda" id="tienda-usuario-actual">
                <!-- La tienda se detectará automáticamente según el usuario -->
            </div>

            <div id="despachos-tienda-container" style="display: none;">
                <h3>Items a recibir por la tienda</h3>
                <p class="text-sm text-gray-600 mb-4">
                    Confirme las cantidades recibidas para esta tienda específica.
                </p>
                <div id="despachos-tienda-lista"></div>
                <label>Observaciones <textarea class="textarea" name="observaciones"
                        placeholder="Observaciones adicionales (opcional)"></textarea></label>
                <button class="btn mt-4" type="submit" id="btn-registrar-recepcion" disabled>Registrar Recepción de Tienda</button>
            </div>

        </div>

    </div>
    <!-- Campo de empleado oculto que se llenará automáticamente -->
    <input type="hidden" name="empleado" id="select-empleado-recepcion">


    <div class="endpoint">POST /recepcion (por tienda individual)</div>
</form>
<div id="result-recepcion" class="result"></div>

</main>
<?php include 'footer.php'; ?>