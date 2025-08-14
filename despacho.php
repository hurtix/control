<?php include 'header.php'; ?>

<?php include 'auth-header.php'; ?>

<main class="bg-white">

<h2>Registrar Despacho</h2>
<form id="form-despacho">
    <div class="flex justify-end">
        <div class="grid gap-3">
            <label class="label">Fecha y hora a registrar</label>
            <input class="input" type="text" name="fecha" readonly class="fecha-auto">
            <input type="hidden" name="lote_id" id="input-lote-id-despacho" required>
        </div>
    </div>
    <div class="flex gap-x-4">
        <div class="w-1/3">
            <h3>Seleccionar Lote</h3>
            <div id="lotes-despacho-cards-container" class="lotes-cards-container border p-4 rounded-lg bg-gray-100"></div>
        </div>

        <div id="distribucion-despacho-container" class="w-2/3" style="display: none;">
            <h3>Distribución Automática</h3>
            <p style="color: #666; font-size: 0.9em; margin-bottom: 1em;">
                Las cantidades se distribuirán automáticamente entre las tiendas según las proporciones del pedido original.
            </p>
            <div id="distribucion-despacho-lista"></div>
            <label>Observaciones <textarea class="textarea" name="observaciones"
                    placeholder="Observaciones adicionales (opcional)"></textarea></label>
            <button class="btn mt-4" type="submit" id="btn-despachar-lote">Despachar Automáticamente</button>
        </div>
    </div>
    <!-- Campo de empleado oculto que se llenará automáticamente -->
    <input type="hidden" name="empleado" id="select-empleado-despacho">


    <div class="endpoint">POST /despacho (distribución automática)</div>
</form>
<div id="result-despacho" class="result"></div>

</main>
<?php include 'footer.php'; ?>