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
    
    echo "Agregando columna DNI a la tabla usuarios...\n";
    
    // Verificar si la columna DNI ya existe
    $columns = $pdo->query("PRAGMA table_info(usuarios)")->fetchAll();
    $dniExists = false;
    foreach ($columns as $column) {
        if ($column['name'] === 'dni') {
            $dniExists = true;
            break;
        }
    }
    
    if (!$dniExists) {
        $pdo->beginTransaction();
        
        // Obtener datos actuales
        $usuarios = $pdo->query("SELECT * FROM usuarios")->fetchAll(PDO::FETCH_ASSOC);
        
        // Crear tabla temporal con la nueva estructura
        $pdo->exec("CREATE TABLE usuarios_temp (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            dni VARCHAR(8) UNIQUE NOT NULL,
            nombre VARCHAR(255) NOT NULL,
            password VARCHAR(255) NOT NULL,
            rol_id INTEGER NOT NULL,
            empleado_id INTEGER NULL,
            activo BOOLEAN NOT NULL DEFAULT 1,
            created_at DATETIME,
            updated_at DATETIME,
            FOREIGN KEY (rol_id) REFERENCES roles (id),
            FOREIGN KEY (empleado_id) REFERENCES maestros (id)
        )");
        
        // Insertar datos con DNIs temporales
        foreach ($usuarios as $index => $usuario) {
            $dniTemporal = str_pad($index + 10000000, 8, '0', STR_PAD_LEFT);
            $stmt = $pdo->prepare("INSERT INTO usuarios_temp (id, dni, nombre, password, rol_id, empleado_id, activo, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $usuario['id'],
                $dniTemporal,
                $usuario['nombre'],
                $usuario['password'],
                $usuario['rol_id'],
                $usuario['empleado_id'],
                $usuario['activo'],
                $usuario['created_at'],
                $usuario['updated_at']
            ]);
        }
        
        // Eliminar tabla original y renombrar la temporal
        $pdo->exec("DROP TABLE usuarios");
        $pdo->exec("ALTER TABLE usuarios_temp RENAME TO usuarios");
        
        $pdo->commit();
        
        echo "Columna DNI agregada exitosamente.\n";
        echo "DNIs temporales asignados a usuarios existentes (formato: 10000000, 10000001, etc.).\n";
        echo "IMPORTANTE: Actualiza los DNIs reales de cada usuario desde la interfaz web.\n";
    } else {
        echo "La columna DNI ya existe en la tabla usuarios.\n";
    }
    
} catch (Exception $e) {
    if (isset($pdo)) {
        $pdo->rollBack();
    }
    echo "Error: " . $e->getMessage() . "\n";
}
?>
