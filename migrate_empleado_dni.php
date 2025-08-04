<?php
require __DIR__ . '/vendor/autoload.php';
require __DIR__ . '/models.php';

try {
    // Conectar a la base de datos
    $capsule = new \Illuminate\Database\Capsule\Manager;
    $capsule->addConnection([
        'driver' => 'sqlite',
        'database' => __DIR__ . '/database.sqlite'
    ]);
    $capsule->setAsGlobal();
    $capsule->bootEloquent();
    
    $pdo = $capsule->getConnection()->getPdo();
    
    echo "Agregando columna DNI a la tabla maestros (empleados)...\n";
    
    // Verificar si la columna DNI ya existe en maestros
    $columns = $pdo->query("PRAGMA table_info(maestros)")->fetchAll();
    $dniExists = false;
    foreach ($columns as $column) {
        if ($column['name'] === 'dni') {
            $dniExists = true;
            break;
        }
    }
    
    if (!$dniExists) {
        $pdo->beginTransaction();
        
        // Obtener datos actuales de maestros
        $maestros = $pdo->query("SELECT * FROM maestros")->fetchAll(PDO::FETCH_ASSOC);
        
        // Crear tabla temporal con la nueva estructura
        $pdo->exec("CREATE TABLE maestros_temp (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tipo VARCHAR(50) NOT NULL,
            nombre VARCHAR(255) NOT NULL,
            dni VARCHAR(8) NULL,
            activo BOOLEAN NOT NULL DEFAULT 1,
            created_at DATETIME,
            updated_at DATETIME
        )");
        
        // Insertar datos existentes
        foreach ($maestros as $maestro) {
            $stmt = $pdo->prepare("INSERT INTO maestros_temp (id, tipo, nombre, dni, activo, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $maestro['id'],
                $maestro['tipo'],
                $maestro['nombre'],
                null, // DNI inicialmente null
                $maestro['activo'],
                $maestro['created_at'],
                $maestro['updated_at']
            ]);
        }
        
        // Eliminar tabla original y renombrar la temporal
        $pdo->exec("DROP TABLE maestros");
        $pdo->exec("ALTER TABLE maestros_temp RENAME TO maestros");
        
        $pdo->commit();
        
        echo "Columna DNI agregada exitosamente a la tabla maestros.\n";
        echo "Los empleados existentes tienen DNI = null. Se puede actualizar desde la interfaz.\n";
    } else {
        echo "La columna DNI ya existe en la tabla maestros.\n";
    }
    
    // Ahora vamos a simplificar la tabla usuarios
    echo "\nSimplificando tabla usuarios...\n";
    
    $pdo->beginTransaction();
    
    // Obtener datos actuales de usuarios
    $usuarios = $pdo->query("SELECT * FROM usuarios")->fetchAll(PDO::FETCH_ASSOC);
    
    // Crear tabla temporal con la nueva estructura simplificada
    $pdo->exec("CREATE TABLE usuarios_temp (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        empleado_id INTEGER NOT NULL,
        password VARCHAR(255) NOT NULL,
        rol_id INTEGER NOT NULL,
        activo BOOLEAN NOT NULL DEFAULT 1,
        created_at DATETIME,
        updated_at DATETIME,
        FOREIGN KEY (empleado_id) REFERENCES maestros (id),
        FOREIGN KEY (rol_id) REFERENCES roles (id)
    )");
    
    // Insertar datos existentes (solo los que tienen empleado_id)
    foreach ($usuarios as $usuario) {
        if ($usuario['empleado_id']) {
            $stmt = $pdo->prepare("INSERT INTO usuarios_temp (id, empleado_id, password, rol_id, activo, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $usuario['id'],
                $usuario['empleado_id'],
                $usuario['password'],
                $usuario['rol_id'],
                $usuario['activo'],
                $usuario['created_at'],
                $usuario['updated_at']
            ]);
        }
    }
    
    // Eliminar tabla original y renombrar la temporal
    $pdo->exec("DROP TABLE usuarios");
    $pdo->exec("ALTER TABLE usuarios_temp RENAME TO usuarios");
    
    $pdo->commit();
    
    echo "Tabla usuarios simplificada exitosamente.\n";
    echo "Solo se mantuvieron usuarios que tenían empleado asociado.\n";
    
} catch (Exception $e) {
    if (isset($pdo)) {
        $pdo->rollBack();
    }
    echo "Error: " . $e->getMessage() . "\n";
}
?>
