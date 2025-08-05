<?php
require __DIR__ . '/../vendor/autoload.php';
require __DIR__ . '/../models.php';

use Illuminate\Database\Capsule\Manager as DB;

try {
    // Verificar si la tabla ya existe
    if (!DB::schema()->hasTable('usuarios_tiendas')) {
        // Crear la tabla usuarios_tiendas
        DB::schema()->create('usuarios_tiendas', function ($table) {
            $table->id();
            $table->unsignedBigInteger('usuario_id');
            $table->unsignedBigInteger('tienda_id');
            $table->timestamps();
            
            // Índices y claves foráneas
            $table->unique(['usuario_id', 'tienda_id']);
            $table->foreign('usuario_id')->references('id')->on('usuarios')->onDelete('cascade');
            $table->foreign('tienda_id')->references('id')->on('maestros')->onDelete('cascade');
        });
        
        echo "Tabla usuarios_tiendas creada correctamente.\n";
    } else {
        echo "La tabla usuarios_tiendas ya existe.\n";
    }
} catch (Exception $e) {
    echo "Error al crear la tabla usuarios_tiendas: " . $e->getMessage() . "\n";
}
