<?php include 'header.php'; ?>

<?php include 'auth-header.php'; ?>

<main>

<h2>Registrar Producción</h2>
<form id="form-produccion">
    <div class="flex justify-end">
        <div>
            <label class="label mb-1">Fecha y hora a registrar</label>
            <input class="input" type="text" name="fecha" readonly class="fecha-auto">
            <input type="hidden" name="lote_id" id="input-lote-id" required>
        </div>
    </div>
    <div class="flex gap-x-4">
        <div class="w-1/3">
            <h3>Seleccionar Lote</h3>
            <div id="lotes-cards-container" class="lotes-cards-container border p-4 rounded-lg bg-gray-100"></div>
        </div>

        <div id="productos-lote-container" class="w-2/3" style="display: none;">
            <h3 class="mb-4">Productos del Lote</h3>
            <div id="productos-lote-lista"></div>
            <div class="grid gap-3 mt-8">
                <label>Observaciones</label> <textarea class="textarea" name="observaciones"
                    placeholder="Observaciones adicionales (opcional)"></textarea>
            </div>
            <button type="submit" id="btn-registrar-produccion" class="btn mt-3" disabled>Registrar Producción</button>

        </div>
    </div>
    <!-- Campo de empleado oculto que se llenará automáticamente -->
    <input type="hidden" name="empleado" id="select-empleado">


    <div class="endpoint">POST /produccion</div>
</form>
<div id="result-produccion" class="result"></div>

</main>
<?php include 'footer.php'; ?>