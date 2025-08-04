<?php
require_once 'vendor/autoload.php';
require_once 'models.php';

try {
    echo "=== AGREGANDO PERMISOS PARA USUARIOS ===\n\n";
    
    // Agregar permisos para usuarios
    $permisos = [
        [
            'endpoint' => '/usuarios',
            'metodo' => 'GET',
            'descripcion' => 'Listar usuarios'
        ],
        [
            'endpoint' => '/usuarios',
            'metodo' => 'POST',
            'descripcion' => 'Crear usuario'
        ],
        [
            'endpoint' => '/usuarios/*',
            'metodo' => '*',
            'descripcion' => 'Gestión completa de usuarios'
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
            
            // Asignar solo al rol admin por defecto (los usuarios son sensibles)
            $adminRol = Rol::where('nombre', 'admin')->first();
            if ($adminRol) {
                $adminRol->permisos()->attach($permiso->id);
                echo "  - Asignado al rol: admin\n";
            }
            
        } else {
            echo "Permiso ya existe: {$permisoData['endpoint']}\n";
        }
    }
    
    echo "\nPermisos de usuarios configurados correctamente.\n";
    echo "Solo el rol 'admin' tiene acceso por defecto.\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
