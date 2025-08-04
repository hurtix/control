<?php
require_once 'vendor/autoload.php';
require_once 'models.php';

try {
    echo "=== VERIFICACIÓN DE PERMISOS DE LOTES ===\n\n";
    
    // Buscar permisos de lotes
    $permisosLotes = Permiso::where('endpoint', 'like', '%lotes%')->get();
    
    echo "Permisos de lotes encontrados:\n";
    foreach ($permisosLotes as $permiso) {
        echo "- ID: {$permiso->id}, Endpoint: {$permiso->endpoint}, Método: {$permiso->metodo}\n";
    }
    
    echo "\n=== ASIGNACIONES ACTUALES ===\n";
    
    $roles = Rol::with('permisos')->get();
    foreach ($roles as $rol) {
        echo "\nRol: {$rol->nombre}\n";
        $permisosDelRol = $rol->permisos->where('endpoint', 'like', '%lotes%');
        if ($permisosDelRol->count() > 0) {
            foreach ($permisosDelRol as $permiso) {
                echo "  - {$permiso->endpoint} ({$permiso->metodo})\n";
            }
        } else {
            echo "  - No tiene permisos de lotes\n";
        }
    }
    
    echo "\n=== ASIGNANDO PERMISOS FALTANTES ===\n";
    
    foreach ($roles as $rol) {
        foreach ($permisosLotes as $permiso) {
            if (!$rol->permisos->contains($permiso->id)) {
                $rol->permisos()->attach($permiso->id);
                echo "Asignado {$permiso->endpoint} al rol {$rol->nombre}\n";
            }
        }
    }
    
    echo "\nCompleto!\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
