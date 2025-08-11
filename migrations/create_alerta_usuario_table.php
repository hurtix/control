<?php
require __DIR__ . '/../vendor/autoload.php';
require __DIR__ . '/../models.php';

use Illuminate\Database\Capsule\Manager as DB;

try {
    echo "=== MIGRACIÓN TABLA alerta_usuario ===\n\n";

    if (!DB::schema()->hasTable('alerta_usuario')) {
        DB::schema()->create('alerta_usuario', function ($table) {
            $table->increments('id');
            $table->integer('alerta_id')->unsigned();
            $table->integer('usuario_id')->unsigned();
            $table->boolean('read')->default(false);
            $table->timestamps();
            // $table->foreign('alerta_id')->references('id')->on('alertas')->onDelete('cascade');
            // $table->foreign('usuario_id')->references('id')->on('usuarios')->onDelete('cascade');
        });
        echo "✓ Tabla alerta_usuario creada\n";
    } else {
        echo "- Tabla alerta_usuario ya existe\n";
    }

    echo "\n=== MIGRACIÓN alerta_usuario COMPLETADA ===\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
}
