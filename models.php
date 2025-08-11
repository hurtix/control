<?php
use Illuminate\Database\Capsule\Manager as Capsule;
use Illuminate\Database\Eloquent\Model;
// Modelo para alertas persistentes
class Alerta extends Model {
    protected $table = 'alertas';
    public $timestamps = true;
    protected $fillable = [
        'fecha',
        'fase',
        'tipo',
        'mensaje',
        'read'
    ];
}


class AlertaUsuario extends Model {
    protected $table = 'alerta_usuario';
    public $timestamps = true;
    protected $fillable = ['alerta_id', 'usuario_id', 'read'];

    public function alerta() {
        return $this->belongsTo(Alerta::class, 'alerta_id');
    }
    public function usuario() {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }
}

class Rol extends Model {
    protected $table = 'roles';
    public $timestamps = true;
    protected $fillable = ['nombre', 'descripcion', 'activo'];
    
    public function permisos() {
        return $this->belongsToMany(Permiso::class, 'rol_permisos', 'rol_id', 'permiso_id');
    }
    
    public function usuarios() {
        return $this->hasMany(Usuario::class);
    }
    
    public function tienePermiso($endpoint, $metodo = '*') {
        return $this->permisos()
            ->where('endpoint', $endpoint)
            ->where(function($query) use ($metodo) {
                $query->where('metodo', $metodo)->orWhere('metodo', '*');
            })
            ->exists();
    }
}

class Permiso extends Model {
    protected $table = 'permisos';
    public $timestamps = true;
    protected $fillable = ['endpoint', 'metodo', 'descripcion'];
    
    public function roles() {
        return $this->belongsToMany(Rol::class, 'rol_permisos', 'permiso_id', 'rol_id');
    }
}

class Usuario extends Model {
    protected $table = 'usuarios';
    public $timestamps = true;
    protected $fillable = ['empleado_id', 'password', 'rol_id', 'activo'];
    protected $hidden = ['password'];
    
    public function rol() {
        return $this->belongsTo(Rol::class);
    }
    
    public function empleado() {
        return $this->belongsTo(Maestro::class, 'empleado_id');
    }
}

class PedidoItem extends Model {
    protected $table = 'pedido_items';
    public $timestamps = true;
    protected $fillable = ['pedido_id', 'producto', 'tienda', 'cantidad_solicitada', 'cantidad_producida'];
    
    public function pedido() {
        return $this->belongsTo(Pedido::class);
    }
    
    public function despachos() {
        return $this->hasMany(Despacho::class);
    }
}

class Lote extends Model {
    protected $table = 'lotes';
    public $timestamps = true;
    protected $fillable = ['codigo_lote', 'pedido_id', 'estado'];
    
    public function pedido() {
        return $this->belongsTo(Pedido::class);
    }
    
    public function items() {
        return $this->hasMany(PedidoItem::class, 'pedido_id', 'pedido_id');
    }
    
    public function producciones() {
        return $this->hasMany(Produccion::class);
    }
    
    public function produccionItems() {
        return $this->hasMany(ProduccionItem::class);
    }
}

class Pedido extends Model {
    protected $table = 'pedidos';
    public $timestamps = true;
    protected $fillable = ['fecha_pedido', 'fecha_requerida', 'estado', 'empleado'];
    
    public function items() {
        return $this->hasMany(PedidoItem::class);
    }
    
    public function lote() {
        return $this->hasOne(Lote::class);
    }
}

class ProduccionItem extends Model {
    protected $table = 'produccion_items';
    public $timestamps = true;
    protected $fillable = ['lote_id', 'producto', 'cantidad_producida', 'fecha', 'empleado'];
    
    public function lote() {
        return $this->belongsTo(Lote::class);
    }
    
    public function produccion() {
        return $this->belongsTo(Produccion::class, 'lote_id', 'lote_id');
    }
}

class Produccion extends Model {
    protected $table = 'produccion';
    public $timestamps = true;
    protected $fillable = ['lote_id', 'fecha', 'empleado', 'observaciones'];
    
    public function lote() {
        return $this->belongsTo(Lote::class);
    }
    
    public function items() {
        return $this->hasMany(ProduccionItem::class, 'lote_id', 'lote_id');
    }
}

class Despacho extends Model {
    protected $table = 'despacho';
    public $timestamps = true;
    protected $fillable = ['lote_id', 'producto', 'tienda', 'cantidad_despachada', 'fecha', 'empleado', 'observaciones'];
    
    public function lote() {
        return $this->belongsTo(Lote::class);
    }
    
    public function recepciones() {
        return $this->hasMany(Recepcion::class);
    }
}

class Recepcion extends Model {
    protected $table = 'recepcion';
    public $timestamps = true;
    protected $fillable = ['lote_id', 'producto', 'tienda', 'cantidad_recibida', 'fecha', 'confirmado', 'empleado', 'observaciones'];
    
    public function lote() {
        return $this->belongsTo(Lote::class);
    }
}

class Maestro extends Model {
    protected $table = 'maestros';
    public $timestamps = true;
    protected $fillable = ['tipo', 'nombre', 'dni', 'activo', 'familia_id'];
    
    public function familia() {
        return $this->belongsTo(FamiliaProducto::class, 'familia_id');
    }
}

class FamiliaProducto extends Model {
    protected $table = 'familias_productos';
    public $timestamps = true;
    protected $fillable = ['nombre', 'descripcion', 'activo'];
    
    public function productos() {
        return $this->hasMany(Maestro::class, 'familia_id')->where('tipo', 'producto');
    }
}

class InventarioInicial extends Model {
    protected $table = 'inventario_inicial';
    public $timestamps = true;
    protected $fillable = ['fecha', 'tienda_id', 'producto_id', 'cantidad_inicial', 'usuario_id', 'observaciones'];
    
    public function tienda() {
        return $this->belongsTo(Maestro::class, 'tienda_id');
    }
    
    public function producto() {
        return $this->belongsTo(Maestro::class, 'producto_id');
    }
    
    public function usuario() {
        return $this->belongsTo(Usuario::class);
    }
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
