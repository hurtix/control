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
    echo "=== ELIMINANDO COLUMNA EMAIL DE USUARIOS ===\n\n";
    
    // Verificar si la columna email existe
    $hasEmail = Capsule::schema()->hasColumn('usuarios', 'email');
    
    if ($hasEmail) {
        // SQLite no soporta DROP COLUMN directamente, necesitamos recrear la tabla
        echo "Recreando tabla usuarios sin columna email...\n";
        
        // Crear tabla temporal
        Capsule::schema()->create('usuarios_temp', function ($table) {
            $table->increments('id');
            $table->string('nombre');
            $table->string('password');
            $table->integer('rol_id');
            $table->integer('empleado_id')->nullable();
            $table->boolean('activo')->default(true);
            $table->timestamps();
        });
        
        // Copiar datos (excluyendo email)
        $usuarios = Capsule::table('usuarios')->get();
        foreach ($usuarios as $usuario) {
            Capsule::table('usuarios_temp')->insert([
                'id' => $usuario->id,
                'nombre' => $usuario->nombre,
                'password' => $usuario->password,
                'rol_id' => $usuario->rol_id,
                'empleado_id' => $usuario->empleado_id,
                'activo' => $usuario->activo,
                'created_at' => $usuario->created_at,
                'updated_at' => $usuario->updated_at,
            ]);
        }
        
        // Eliminar tabla original y renombrar temporal
        Capsule::schema()->drop('usuarios');
        Capsule::schema()->rename('usuarios_temp', 'usuarios');
        
        echo "Columna email eliminada exitosamente\n\n";
    } else {
        echo "La columna email no existe en la tabla usuarios\n\n";
    }
    
    // Mostrar estructura actual
    $usuarios = Usuario::all();
    echo "Usuarios actuales:\n";
    foreach ($usuarios as $usuario) {
        echo "- ID: {$usuario->id}, Nombre: {$usuario->nombre}, Rol: {$usuario->rol_id}\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
