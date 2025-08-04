<?php
require 'vendor/autoload.php';

use Illuminate\Database\Capsule\Manager as Capsule;

// Configuración de la base de datos
$capsule = new Capsule;
$capsule->addConnection([
    'driver'    => 'sqlite',
    'database'  => __DIR__ . '/database.sqlite',
    'prefix'    => '',
]);

$capsule->setAsGlobal();
$capsule->bootEloquent();

echo "Poblando datos maestros...\n";

// Función para insertar o actualizar maestros
function insertarMaestro($tipo, $nombre) {
    $existing = Capsule::table('maestros')
        ->where('tipo', $tipo)
        ->where('nombre', $nombre)
        ->first();
    
    if (!$existing) {
        Capsule::table('maestros')->insert([
            'tipo' => $tipo,
            'nombre' => $nombre,
            'activo' => true,
            'created_at' => date('Y-m-d H:i:s'),
            'updated_at' => date('Y-m-d H:i:s')
        ]);
        echo "- $tipo agregado: $nombre\n";
        return true;
    } else {
        echo "- $tipo ya existe: $nombre\n";
        return false;
    }
}

// Productos
echo "\nProductos:\n";
$productos = ['Pan Integral', 'Galleta', 'Pastel de Pollo', 'Croissant'];
foreach ($productos as $producto) {
    insertarMaestro('producto', $producto);
}

// Tiendas
echo "\nTiendas:\n";
$tiendas = ['Campanario', 'Centro', 'Terraplaza'];
foreach ($tiendas as $tienda) {
    insertarMaestro('tienda', $tienda);
}

// Turnos
echo "\nTurnos:\n";
$turnos = ['Mañana', 'Tarde'];
foreach ($turnos as $turno) {
    insertarMaestro('turno', $turno);
}

// Empleados
echo "\nEmpleados:\n";
$empleados = ['Juan', 'Pedro', 'Carolina', 'Nancy'];
foreach ($empleados as $empleado) {
    insertarMaestro('empleado', $empleado);
}

echo "\nSeeding completado.\n";
