<?php
use Illuminate\Database\Capsule\Manager as Capsule;
use Illuminate\Database\Eloquent\Model;

class Lote extends Model {
    protected $table = 'lotes';
    public $timestamps = true;
    protected $fillable = ['codigo_lote', 'producto', 'cantidad_inicial', 'pedido_id', 'estado'];
    
    public function pedido() {
        return $this->belongsTo(Pedido::class);
    }
    
    public function producciones() {
        return $this->hasMany(Produccion::class);
    }
    
    public function despachos() {
        return $this->hasMany(Despacho::class);
    }
    
    public function recepciones() {
        return $this->hasMany(Recepcion::class);
    }
}

class Pedido extends Model {
    protected $table = 'pedidos';
    public $timestamps = true;
    protected $fillable = ['producto', 'cantidad_solicitada', 'fecha_pedido', 'fecha_requerida', 'tienda', 'estado'];
    
    public function lotes() {
        return $this->hasMany(Lote::class);
    }
}

class Produccion extends Model {
    protected $table = 'produccion';
    public $timestamps = true;
    protected $fillable = ['lote_id', 'cantidad_producida', 'fecha', 'turno', 'empleado'];
    
    public function lote() {
        return $this->belongsTo(Lote::class);
    }
}

class Despacho extends Model {
    protected $table = 'despacho';
    public $timestamps = true;
    protected $fillable = ['lote_id', 'cantidad_despachada', 'fecha'];
    
    public function lote() {
        return $this->belongsTo(Lote::class);
    }
}

class Recepcion extends Model {
    protected $table = 'recepcion';
    public $timestamps = true;
    protected $fillable = ['lote_id', 'cantidad_recibida', 'fecha', 'confirmado'];
    
    public function lote() {
        return $this->belongsTo(Lote::class);
    }
}

class Maestro extends Model {
    protected $table = 'maestros';
    public $timestamps = true;
    protected $fillable = ['tipo', 'nombre', 'activo'];
}

// Configuración de la base de datos
$capsule = new Capsule;
$capsule->addConnection([
    'driver'    => 'sqlite',
    'database'  => __DIR__ . '/database.sqlite',
    'prefix'    => '',
]);

$capsule->setAsGlobal();
$capsule->bootEloquent();
