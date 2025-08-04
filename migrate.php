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

Capsule::schema()->dropIfExists('pedido_items');
Capsule::schema()->create('pedido_items', function ($table) {
    $table->increments('id');
    $table->integer('pedido_id'); // Referencia al pedido
    $table->string('producto');
    $table->string('tienda');
    $table->integer('cantidad_solicitada');
    $table->integer('cantidad_producida')->default(0);
    $table->timestamps();
});

Capsule::schema()->dropIfExists('lotes');
Capsule::schema()->create('lotes', function ($table) {
    $table->increments('id');
    $table->string('codigo_lote')->unique(); // Código único del lote
    $table->integer('pedido_id'); // Referencia al pedido
    $table->enum('estado', ['pendiente', 'en_produccion', 'producido', 'despachado', 'recibido'])->default('pendiente');
    $table->timestamps();
});

Capsule::schema()->dropIfExists('pedidos');
Capsule::schema()->create('pedidos', function ($table) {
    $table->increments('id');
    $table->date('fecha_pedido');
    $table->date('fecha_requerida');
    $table->enum('estado', ['pendiente', 'en_produccion', 'completado', 'cancelado'])->default('pendiente');
    $table->timestamps();
});

Capsule::schema()->dropIfExists('produccion_items');
Capsule::schema()->create('produccion_items', function ($table) {
    $table->increments('id');
    $table->integer('lote_id'); // Referencia al lote
    $table->string('producto'); // Producto específico
    $table->integer('cantidad_producida');
    $table->date('fecha');
    $table->string('turno');
    $table->string('empleado');
    $table->timestamps();
});

Capsule::schema()->dropIfExists('produccion');
Capsule::schema()->create('produccion', function ($table) {
    $table->increments('id');
    $table->integer('lote_id'); // Referencia al lote
    $table->date('fecha');
    $table->string('turno');
    $table->string('empleado');
    $table->text('observaciones')->nullable();
    $table->timestamps();
});

Capsule::schema()->dropIfExists('despacho');
Capsule::schema()->create('despacho', function ($table) {
    $table->increments('id');
    $table->integer('lote_id'); // Referencia al lote
    $table->string('producto'); // Producto despachado
    $table->string('tienda'); // Tienda destino
    $table->integer('cantidad_despachada'); // Cantidad despachada (basada en producción)
    $table->date('fecha');
    $table->string('empleado')->nullable(); // Quien despachó
    $table->text('observaciones')->nullable();
    $table->timestamps();
});

Capsule::schema()->dropIfExists('recepcion');
Capsule::schema()->create('recepcion', function ($table) {
    $table->increments('id');
    $table->integer('lote_id'); // Referencia al lote
    $table->string('producto'); // Producto recibido
    $table->string('tienda'); // Tienda que recibe
    $table->integer('cantidad_recibida');
    $table->date('fecha');
    $table->boolean('confirmado')->default(false);
    $table->string('empleado')->nullable(); // Quien recibió
    $table->text('observaciones')->nullable();
    $table->timestamps();
});

Capsule::schema()->dropIfExists('maestros');
Capsule::schema()->create('maestros', function ($table) {
    $table->increments('id');
    $table->string('tipo'); // 'producto', 'empleado', 'turno', 'tienda' (eliminado 'destino')
    $table->string('nombre');
    $table->boolean('activo')->default(true);
    $table->timestamps();
    $table->unique(['tipo', 'nombre']);
});

// Poblar la base de datos con datos iniciales
echo "Poblando datos iniciales...\n";

// Productos
$productos = ['Pan Integral', 'Galleta', 'Pastel de Pollo', 'Croissant'];
foreach ($productos as $producto) {
    $existing = Capsule::table('maestros')
        ->where('tipo', 'producto')
        ->where('nombre', $producto)
        ->first();
    
    if (!$existing) {
        Capsule::table('maestros')->insert([
            'tipo' => 'producto',
            'nombre' => $producto,
            'activo' => true,
            'created_at' => date('Y-m-d H:i:s'),
            'updated_at' => date('Y-m-d H:i:s')
        ]);
        echo "- Producto agregado: $producto\n";
    }
}

// Tiendas
$tiendas = ['Campanario', 'Centro', 'Terraplaza'];
foreach ($tiendas as $tienda) {
    $existing = Capsule::table('maestros')
        ->where('tipo', 'tienda')
        ->where('nombre', $tienda)
        ->first();
    
    if (!$existing) {
        Capsule::table('maestros')->insert([
            'tipo' => 'tienda',
            'nombre' => $tienda,
            'activo' => true,
            'created_at' => date('Y-m-d H:i:s'),
            'updated_at' => date('Y-m-d H:i:s')
        ]);
        echo "- Tienda agregada: $tienda\n";
    }
}

// Turnos
$turnos = ['Mañana', 'Tarde'];
foreach ($turnos as $turno) {
    $existing = Capsule::table('maestros')
        ->where('tipo', 'turno')
        ->where('nombre', $turno)
        ->first();
    
    if (!$existing) {
        Capsule::table('maestros')->insert([
            'tipo' => 'turno',
            'nombre' => $turno,
            'activo' => true,
            'created_at' => date('Y-m-d H:i:s'),
            'updated_at' => date('Y-m-d H:i:s')
        ]);
        echo "- Turno agregado: $turno\n";
    }
}

// Empleados
$empleados = ['Juan', 'Pedro', 'Carolina', 'Nancy'];
foreach ($empleados as $empleado) {
    $existing = Capsule::table('maestros')
        ->where('tipo', 'empleado')
        ->where('nombre', $empleado)
        ->first();
    
    if (!$existing) {
        Capsule::table('maestros')->insert([
            'tipo' => 'empleado',
            'nombre' => $empleado,
            'activo' => true,
            'created_at' => date('Y-m-d H:i:s'),
            'updated_at' => date('Y-m-d H:i:s')
        ]);
        echo "- Empleado agregado: $empleado\n";
    }
}

echo "Migración completada.\n";
