<?php
require_once 'vendor/autoload.php';
require_once 'models.php';

try {
    // Agregar permisos faltantes para lotes
    $permisos = [
        [
            'endpoint' => '/lotes/pendientes',
            'metodo' => 'GET',
            'descripcion' => 'Ver lotes pendientes'
        ],
        [
            'endpoint' => '/lotes/todos',
            'metodo' => 'GET', 
            'descripcion' => 'Ver todos los lotes'
        ],
        [
            'endpoint' => '/lotes/*',
            'metodo' => '*',
            'descripcion' => 'Gestión completa de lotes'
        ]
    ];

    foreach ($permisos as $permisoData) {
        // Verificar si ya existe
        $existe = Permiso::where('endpoint', $permisoData['endpoint'])
                         ->where('metodo', $permisoData['metodo'])
                         ->first();
                         
        if (!$existe) {
            $permiso = Permiso::create($permisoData);
            echo "Permiso creado: {$permiso->endpoint} ({$permiso->metodo})\n";
            
            // Asignar a todos los roles
            $roles = Rol::where('activo', true)->get();
            foreach ($roles as $rol) {
                $rol->permisos()->attach($permiso->id);
                echo "  - Asignado al rol: {$rol->nombre}\n";
            }
        } else {
            echo "Permiso ya existe: {$permisoData['endpoint']}\n";
        }
    }
    
    echo "\nPermisos configurados correctamente.\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
