<?php
require __DIR__ . '/../vendor/autoload.php';
require __DIR__ . '/../models.php';

use Illuminate\Database\Capsule\Manager as DB;

try {
    echo "=== CREANDO TABLAS DE INVENTARIO ===\n\n";
    
    // Tabla de familias de productos
    if (!DB::schema()->hasTable('familias_productos')) {
        DB::schema()->create('familias_productos', function ($table) {
            $table->id();
            $table->string('nombre')->unique(); // panaderia, bebidas, menaje, etc.
            $table->text('descripcion')->nullable();
            $table->boolean('activo')->default(true);
            $table->timestamps();
        });
        echo "✓ Tabla familias_productos creada\n";
    } else {
        echo "- Tabla familias_productos ya existe\n";
    }
    
    // Agregar columna familia_id a maestros (productos)
    if (!DB::schema()->hasColumn('maestros', 'familia_id')) {
        DB::schema()->table('maestros', function ($table) {
            $table->unsignedBigInteger('familia_id')->nullable()->after('tipo');
            $table->foreign('familia_id')->references('id')->on('familias_productos')->onDelete('set null');
        });
        echo "✓ Columna familia_id agregada a maestros\n";
    } else {
        echo "- Columna familia_id ya existe en maestros\n";
    }
    
    // Tabla de inventario inicial diario
    if (!DB::schema()->hasTable('inventario_inicial')) {
        DB::schema()->create('inventario_inicial', function ($table) {
            $table->id();
            $table->date('fecha');
            $table->unsignedBigInteger('tienda_id');
            $table->unsignedBigInteger('producto_id');
            $table->integer('cantidad_inicial');
            $table->unsignedBigInteger('usuario_id'); // Quien registró el conteo
            $table->text('observaciones')->nullable();
            $table->timestamps();
            
            // Índices y restricciones
            $table->unique(['fecha', 'tienda_id', 'producto_id'], 'unique_inventario_diario');
            $table->foreign('tienda_id')->references('id')->on('maestros')->onDelete('cascade');
            $table->foreign('producto_id')->references('id')->on('maestros')->onDelete('cascade');
            $table->foreign('usuario_id')->references('id')->on('usuarios')->onDelete('cascade');
        });
        echo "✓ Tabla inventario_inicial creada\n";
    } else {
        echo "- Tabla inventario_inicial ya existe\n";
    }
    
    // Insertar familias por defecto
    $familias = [
        ['nombre' => 'Panadería', 'descripcion' => 'Productos de panadería y repostería'],
        ['nombre' => 'Bebidas', 'descripcion' => 'Bebidas calientes y frías'],
        ['nombre' => 'Menaje', 'descripcion' => 'Utensilios y elementos de mesa'],
        ['nombre' => 'Café Empacado', 'descripcion' => 'Productos de café para llevar']
    ];
    
    foreach ($familias as $familia) {
        $existing = DB::table('familias_productos')
            ->where('nombre', $familia['nombre'])
            ->first();
            
        if (!$existing) {
            DB::table('familias_productos')->insert([
                'nombre' => $familia['nombre'],
                'descripcion' => $familia['descripcion'],
                'activo' => true,
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ]);
            echo "✓ Familia creada: {$familia['nombre']}\n";
        } else {
            echo "- Familia ya existe: {$familia['nombre']}\n";
        }
    }
    
    echo "\n=== MIGRACIÓN DE INVENTARIO COMPLETADA ===\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
}
