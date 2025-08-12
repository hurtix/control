<?php include 'header.php'; ?>

<?php include 'auth-header.php'; ?>

<main class="bg-white">
<h2 class="mb-4">Consultas y Reportes</h2>
<button class="btn-outline" onclick="consultar('pedidos')">Consultar Pedidos</button>
<button class="btn-outline" onclick="consultar('produccion')">Consultar Producción</button>
<button class="btn-outline" onclick="consultar('despacho')">Consultar Despachos</button>
<button class="btn-outline" onclick="consultar('recepcion')">Consultar Recepciones</button>
<button class="btn-outline" onclick="consultar('alertas')">Ver Alertas</button>
<div class="endpoint">GET /pedidos, /produccion, /despacho, /recepcion, /alertas</div>
<div id="result-consultas" class="result"></div>

</main>
<?php include 'footer.php'; ?>