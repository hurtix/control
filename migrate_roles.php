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

// Tabla de roles
Capsule::schema()->dropIfExists('roles');
Capsule::schema()->create('roles', function ($table) {
    $table->increments('id');
    $table->string('nombre')->unique(); // admin, ventas, produccion, despacho, tienda
    $table->string('descripcion');
    $table->boolean('activo')->default(true);
    $table->timestamps();
});

// Tabla de permisos
Capsule::schema()->dropIfExists('permisos');
Capsule::schema()->create('permisos', function ($table) {
    $table->increments('id');
    $table->string('endpoint'); // /pedidos, /produccion, etc.
    $table->string('metodo')->default('*'); // GET, POST, PUT, DELETE, *
    $table->string('descripcion');
    $table->timestamps();
});

// Tabla de relación roles-permisos
Capsule::schema()->dropIfExists('rol_permisos');
Capsule::schema()->create('rol_permisos', function ($table) {
    $table->increments('id');
    $table->integer('rol_id')->unsigned();
    $table->integer('permiso_id')->unsigned();
    $table->timestamps();
    
    $table->foreign('rol_id')->references('id')->on('roles')->onDelete('cascade');
    $table->foreign('permiso_id')->references('id')->on('permisos')->onDelete('cascade');
    $table->unique(['rol_id', 'permiso_id']);
});

// Tabla de usuarios (opcional para futuro)
Capsule::schema()->dropIfExists('usuarios');
Capsule::schema()->create('usuarios', function ($table) {
    $table->increments('id');
    $table->string('nombre');
    $table->string('email')->unique();
    $table->string('password');
    $table->integer('rol_id')->unsigned();
    $table->boolean('activo')->default(true);
    $table->timestamps();
    
    $table->foreign('rol_id')->references('id')->on('roles');
});

echo "Tablas de roles creadas exitosamente.\n";

// Insertar roles por defecto
$roles = [
    ['nombre' => 'admin', 'descripcion' => 'Administrador del sistema'],
    ['nombre' => 'ventas', 'descripcion' => 'Personal de ventas'],
    ['nombre' => 'produccion', 'descripcion' => 'Personal de producción'],
    ['nombre' => 'despacho', 'descripcion' => 'Personal de despacho'],
    ['nombre' => 'tienda', 'descripcion' => 'Personal de tienda'],
];

foreach ($roles as $rol) {
    Capsule::table('roles')->insert(array_merge($rol, [
        'created_at' => date('Y-m-d H:i:s'),
        'updated_at' => date('Y-m-d H:i:s')
    ]));
}

echo "Roles por defecto insertados.\n";

// Insertar permisos por defecto
$permisos = [
    ['endpoint' => '/pedidos', 'descripcion' => 'Gestión de pedidos'],
    ['endpoint' => '/produccion', 'descripcion' => 'Gestión de producción'],
    ['endpoint' => '/despacho', 'descripcion' => 'Gestión de despachos'],
    ['endpoint' => '/recepcion', 'descripcion' => 'Gestión de recepciones'],
    ['endpoint' => '/alertas', 'descripcion' => 'Visualización de alertas'],
    ['endpoint' => '/maestros', 'descripcion' => 'Gestión de datos maestros'],
    ['endpoint' => '/traza', 'descripcion' => 'Trazabilidad de lotes'],
    ['endpoint' => '/reporte', 'descripcion' => 'Reportes del sistema'],
    ['endpoint' => '/opciones', 'descripcion' => 'Opciones para formularios'],
];

foreach ($permisos as $permiso) {
    Capsule::table('permisos')->insert(array_merge($permiso, [
        'metodo' => '*',
        'created_at' => date('Y-m-d H:i:s'),
        'updated_at' => date('Y-m-d H:i:s')
    ]));
}

echo "Permisos por defecto insertados.\n";

// Asignar permisos a roles (manteniendo la lógica actual)
$asignaciones = [
    // Admin tiene acceso a todo
    'admin' => ['pedidos', 'produccion', 'despacho', 'recepcion', 'alertas', 'maestros', 'traza', 'reporte', 'opciones'],
    // Ventas solo pedidos y opciones
    'ventas' => ['pedidos', 'opciones'],
    // Producción solo producción y opciones
    'produccion' => ['produccion', 'opciones'],
    // Despacho solo despacho y opciones
    'despacho' => ['despacho', 'opciones'],
    // Tienda solo recepción y opciones
    'tienda' => ['recepcion', 'opciones'],
];

foreach ($asignaciones as $rolNombre => $endpoints) {
    $rolId = Capsule::table('roles')->where('nombre', $rolNombre)->first()->id;
    
    foreach ($endpoints as $endpoint) {
        $permisoId = Capsule::table('permisos')->where('endpoint', "/$endpoint")->first()->id;
        
        Capsule::table('rol_permisos')->insert([
            'rol_id' => $rolId,
            'permiso_id' => $permisoId,
            'created_at' => date('Y-m-d H:i:s'),
            'updated_at' => date('Y-m-d H:i:s')
        ]);
    }
}

echo "Permisos asignados a roles exitosamente.\n";
echo "Sistema de roles dinámico configurado.\n";
