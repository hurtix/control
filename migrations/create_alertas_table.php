<?php
// Migración incremental para crear la tabla de alertas sin borrar datos existentes
require __DIR__ . '/../vendor/autoload.php';

use Illuminate\Database\Capsule\Manager as Capsule;

$capsule = new Capsule;
$capsule->addConnection([
    'driver'    => 'sqlite',
    'database'  => __DIR__ . '/../database.sqlite',
    'prefix'    => '',
]);
$capsule->setAsGlobal();
$capsule->bootEloquent();

if (!Capsule::schema()->hasTable('alertas')) {
    Capsule::schema()->create('alertas', function ($table) {
        $table->increments('id');
        $table->timestamp('fecha')->useCurrent();
        $table->string('fase');
        $table->string('tipo');
        $table->string('mensaje');
        $table->boolean('read')->default(false);
        $table->timestamps();
    });
    echo "Tabla 'alertas' creada exitosamente.\n";
} else {
    echo "La tabla 'alertas' ya existe.\n";
}
