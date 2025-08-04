<?php
// Script para agregar el campo empleado a la tabla pedidos
require 'vendor/autoload.php';
require 'models.php';

use Illuminate\Database\Capsule\Manager as Capsule;

echo "Iniciando migración para agregar campo 'empleado' a la tabla pedidos...\n";

try {
    if (!Capsule::schema()->hasColumn('pedidos', 'empleado')) {
        Capsule::schema()->table('pedidos', function ($table) {
            $table->string('empleado')->nullable()->after('estado');
        });
        echo "Campo 'empleado' agregado exitosamente a la tabla pedidos.\n";
    } else {
        echo "El campo 'empleado' ya existe en la tabla pedidos.\n";
    }
    
    echo "Migración completada con éxito.\n";
} catch (Exception $e) {
    echo "Error durante la migración: " . $e->getMessage() . "\n";
}
