<?php include 'header.php'; ?>

<?php include 'auth-header.php'; ?>

<main>


<!-- <h1>Control de Panadería</h1> -->

<div>
    <h2>Trazabilidad</h2>
    <div class="flex flex-col lg:flex-row gap-x-4">
        <div class="w-full lg:w-1/6">
            <form id="form-traza">
                <div class="grid gap-3">
                    <label class="label">Lote</label>
                    <select class="select w-full" name="lote" id="select-lote-traza">
                        <option value="">-- Seleccionar lote --</option>
                    </select>
                    <button class="btn" type="submit">Consultar Trazabilidad</button>
                </div>
                <div class="endpoint">GET /traza/lote/{lote_id}</div>
            </form>
        </div>
        <div class="w-full lg:w-5/6">
            <div id="result-traza" class="result card p-4 min-h-[400px]"></div>
        </div>
    </div>
</div>

</main>
<?php include 'footer.php'; ?>