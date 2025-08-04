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

echo "Agregando permisos para gestión de roles...\n";

// Permisos adicionales para gestión de roles
$nuevosPermisos = [
    ['/roles', '*', 'Gestión de roles'],
    ['/permisos', '*', 'Gestión de permisos'],
];

foreach ($nuevosPermisos as $permiso) {
    // Verificar si ya existe
    $existe = Capsule::table('permisos')
        ->where('endpoint', $permiso[0])
        ->where('metodo', $permiso[1])
        ->exists();
    
    if (!$existe) {
        $permisoId = Capsule::table('permisos')->insertGetId([
            'endpoint' => $permiso[0],
            'metodo' => $permiso[1],
            'descripcion' => $permiso[2],
            'created_at' => date('Y-m-d H:i:s'),
            'updated_at' => date('Y-m-d H:i:s')
        ]);
        
        // Asignar automáticamente al admin
        $adminId = Capsule::table('roles')->where('nombre', 'admin')->first()->id;
        Capsule::table('rol_permisos')->insert([
            'rol_id' => $adminId,
            'permiso_id' => $permisoId,
            'created_at' => date('Y-m-d H:i:s'),
            'updated_at' => date('Y-m-d H:i:s')
        ]);
        
        echo "✓ Agregado permiso: {$permiso[0]} ({$permiso[1]}) - {$permiso[2]}\n";
    } else {
        echo "- Ya existe: {$permiso[0]} ({$permiso[1]})\n";
    }
}

echo "Permisos de roles configurados correctamente.\n";
