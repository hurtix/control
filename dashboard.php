<?php include 'header.php'; ?>

<?php include 'auth-header.php'; ?>

<main>
<div class="grid grid-cols-4 gap-8 [&_.card]:p-0 [&_.card_a]:p-8 [&_.card_a]:font-bold">
    <div class="card"><a href="/pedidos.php">Pedidos</a></div>
    <div class="card"><a href="/produccion.php">Produccion</a></div>
    <div class="card"><a href="/despacho.php">Despacho</a></div>
    <div class="card"><a href="/recepcion.php">Recepcion</a></div>
    <div class="card"><a href="/inventario.php">Inventario</a></div>
    <div class="card"><a href="/trazabilidad.php">Trazabilidad</a></div>
    <div class="card"><a href="/reportes.php">Reportes</a></div>
    <div class="card"><a href="/ajustes.php">Ajustes</a></div>
</div>
</main>
<?php include 'footer.php'; ?>