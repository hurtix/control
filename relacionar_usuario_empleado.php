<?php
require __DIR__ . '/vendor/autoload.php';

use Illuminate\Database\Capsule\Manager as Capsule;

$capsule = new Capsule;
$capsule->addConnection([
    'driver' => 'sqlite',
    'database' => __DIR__ . '/database.sqlite',
    'prefix' => '',
]);
$capsule->setAsGlobal();
$capsule->bootEloquent();

require_once 'models.php';

try {
    echo "=== AGREGANDO RELACIÓN USUARIO-EMPLEADO ===\n\n";
    
    // Verificar si la columna ya existe
    $hasColumn = Capsule::schema()->hasColumn('usuarios', 'empleado_id');
    
    if (!$hasColumn) {
        // Agregar columna empleado_id a usuarios (opcional)
        Capsule::schema()->table('usuarios', function ($table) {
            $table->integer('empleado_id')->nullable()->after('rol_id');
        });
        echo "Columna empleado_id agregada a la tabla usuarios\n\n";
    } else {
        echo "La columna empleado_id ya existe en la tabla usuarios\n\n";
    }
    
    // Mostrar empleados disponibles para asociar
    $empleados = Maestro::where('tipo', 'empleado')->where('activo', true)->get();
    echo "Empleados disponibles para asociar:\n";
    foreach ($empleados as $empleado) {
        echo "- ID: {$empleado->id}, Nombre: {$empleado->nombre}\n";
    }
    
    echo "\nAhora puedes:\n";
    echo "1. Crear usuarios que sean empleados (asociados)\n";
    echo "2. Crear usuarios que NO sean empleados (solo acceso al sistema)\n";
    echo "3. Los empleados siguen siendo datos maestros independientes\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
