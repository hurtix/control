<?php
require __DIR__ . '/vendor/autoload.php';

require __DIR__ . '/models.php';
// Asegura que Maestro esté disponible en el scope global
if (!class_exists('Maestro')) {
    class_alias('Maestro', 'Maestro');
}

use Slim\Factory\AppFactory;
use Illuminate\Database\Capsule\Manager as DB;

$app = AppFactory::create();
$app->addBodyParsingMiddleware();

// Endpoint para crear una alerta

$app->post('/alertas', function ($request, $response) {
    session_start();
    if (!isset($_SESSION['user_id'])) {
        return $response->withStatus(401)->withHeader('Content-Type', 'application/json')
            ->write(json_encode(['error' => 'No autenticado']));
    }
    $data = $request->getParsedBody();
    $alerta = Alerta::create([
        'fecha' => $data['fecha'] ?? date('Y-m-d H:i:s'),
        'fase' => $data['fase'] ?? '',
        'tipo' => $data['tipo'] ?? 'warning',
        'mensaje' => $data['mensaje'] ?? '',
        'read' => false
    ]);
    // Relacionar alerta con usuario autenticado
    AlertaUsuario::create([
        'alerta_id' => $alerta->id,
        'usuario_id' => $_SESSION['user_id'],
        'leida' => false,
        'created_at' => date('Y-m-d H:i:s'),
        'updated_at' => date('Y-m-d H:i:s'),
    ]);
    $response->getBody()->write($alerta->toJson());
    return $response->withHeader('Content-Type', 'application/json')->withStatus(201);
});

// Endpoint para consultar todas las alertas

$app->post('/alertas/{id}/read', function ($request, $response, $args) {
    session_start();
    if (!isset($_SESSION['user_id'])) {
        return $response->withStatus(401)->withHeader('Content-Type', 'application/json')
            ->write(json_encode(['error' => 'No autenticado']));
    }
    $alertaUsuario = AlertaUsuario::where('alerta_id', $args['id'])
        ->where('usuario_id', $_SESSION['user_id'])
        ->first();
    if (!$alertaUsuario) {
        return $response->withStatus(404)->withHeader('Content-Type', 'application/json')
            ->write(json_encode(['error' => 'Alerta no encontrada para este usuario']));
    }
    $alertaUsuario->read = true;
    $alertaUsuario->updated_at = date('Y-m-d H:i:s');
    $alertaUsuario->save();
    $response->getBody()->write($alertaUsuario->toJson());
    return $response->withHeader('Content-Type', 'application/json');
});

$app->get('/alertas', function ($request, $response) {
    session_start();
    if (!isset($_SESSION['user_id'])) {
        return $response->withStatus(401)->withHeader('Content-Type', 'application/json')
            ->write(json_encode(['error' => 'No autenticado']));
    }
    $alertasUsuario = AlertaUsuario::with('alerta')
        ->where('usuario_id', $_SESSION['user_id'])
        ->orderByDesc('created_at')
        ->get();
    // Formatear respuesta para incluir datos de la alerta y el estado de lectura
    $result = $alertasUsuario->map(function($au) {
        $alerta = $au->alerta;
        return [
            'id' => $alerta->id,
            'fecha' => $alerta->fecha,
            'fase' => $alerta->fase,
            'tipo' => $alerta->tipo,
            'mensaje' => $alerta->mensaje,
            'read' => $au->read,
            'alerta_usuario_id' => $au->id,
            'created_at' => $au->created_at,
        ];
    });
    $response->getBody()->write($result->toJson());
    return $response->withHeader('Content-Type', 'application/json');
});

// Middleware para servir archivos estáticos
$app->add(function ($request, $handler) {
    $uri = $request->getUri();
    $path = $uri->getPath();
    
    // Verificar si es una solicitud de archivo estático
    if (preg_match('/^\/assets\/.*\.(css|js|png|jpg|jpeg|gif|ico|svg)$/', $path)) {
        $filePath = __DIR__ . $path;
        
        if (file_exists($filePath)) {
            // Determinar el tipo de contenido
            $extension = pathinfo($filePath, PATHINFO_EXTENSION);
            $contentTypes = [
                'css' => 'text/css',
                'js' => 'application/javascript',
                'png' => 'image/png',
                'jpg' => 'image/jpeg',
                'jpeg' => 'image/jpeg',
                'gif' => 'image/gif',
                'ico' => 'image/x-icon',
                'svg' => 'image/svg+xml'
            ];
            
            $contentType = $contentTypes[$extension] ?? 'application/octet-stream';
            
            $response = new \Slim\Psr7\Response();
            $response->getBody()->write(file_get_contents($filePath));
            return $response->withHeader('Content-Type', $contentType);
        }
    }
    
    return $handler->handle($request);
});

$app->add(function ($request, $handler) {
    $metodo = $request->getMethod();
    $ruta = $request->getUri()->getPath();
    error_log("Petición: $metodo $ruta");
    
    // Logging más detallado para depuración
    $headers = $request->getHeaders();
    if (isset($headers['X-Role'])) {
        error_log("X-Role: " . json_encode($headers['X-Role']));
    } else {
        error_log("No se recibió X-Role");
    }
    
    return $handler->handle($request);
});

$app->get('/', function ($request, $response, $args) {
    $html = file_get_contents(__DIR__ . '/index.html');
    $response->getBody()->write($html);
    return $response->withHeader('Content-Type', 'text/html');
});

$app->get('/index.html', function ($request, $response, $args) {
    $html = file_get_contents(__DIR__ . '/index.html');
    $response->getBody()->write($html);
    return $response->withHeader('Content-Type', 'text/html');
});

$app->get('/dashboard.html', function ($request, $response, $args) {
    $html = file_get_contents(__DIR__ . '/dashboard.html');
    $response->getBody()->write($html);
    return $response->withHeader('Content-Type', 'text/html');
});


$app->get('/dashboard.php', function ($request, $response, $args) {
    ob_start();
    include __DIR__ . '/dashboard.php';
    $html = ob_get_clean();
    $response->getBody()->write($html);
    return $response->withHeader('Content-Type', 'text/html');
});

$app->get('/login.html', function ($request, $response, $args) {
    $html = file_get_contents(__DIR__ . '/login.html');
    $response->getBody()->write($html);
    return $response->withHeader('Content-Type', 'text/html');
});

$app->get('/login.php', function ($request, $response, $args) {
    $html = file_get_contents(__DIR__ . '/login.php');
    $response->getBody()->write($html);
    return $response->withHeader('Content-Type', 'text/html');
});

// Gestión de pedidos
$app->post('/pedidos', function ($request, $response) {
    $data = $request->getParsedBody();
    error_log('Datos recibidos en /pedidos: ' . json_encode($data));
    
    // Crear el pedido principal
    $pedido = Pedido::create([
        'fecha_pedido' => $data['fecha_pedido'],
        'fecha_requerida' => $data['fecha_requerida'],
        'estado' => 'pendiente',
        'empleado' => isset($data['empleado']) ? $data['empleado'] : null
    ]);
    
    // Crear los ítems del pedido
    $items = [];
    foreach ($data['items'] as $itemData) {
        $item = PedidoItem::create([
            'pedido_id' => $pedido->id,
            'producto' => $itemData['producto'],
            'tienda' => $itemData['tienda'],
            'cantidad_solicitada' => $itemData['cantidad_solicitada']
        ]);
        $items[] = $item;
    }
    
    // Crear automáticamente un lote para este pedido
    $codigo_lote = 'L' . date('Ymd') . '-' . str_pad($pedido->id, 4, '0', STR_PAD_LEFT);
    $lote = Lote::create([

        'codigo_lote' => $codigo_lote,
        'pedido_id' => $pedido->id,
        'estado' => 'pendiente'
    ]);

    // Crear alerta persistente por nuevo lote
    $empleado = isset($data['empleado']) && $data['empleado'] ? $data['empleado'] : 'Un usuario';
    $alerta = Alerta::create([
        'fecha' => date('Y-m-d H:i:s'),
        'fase' => 'pedido',
        'tipo' => 'info',
        'mensaje' => $empleado . ' ha creado un nuevo lote (' . $codigo_lote . ') para el pedido #' . $pedido->id,
        'read' => false
    ]);
    // Relacionar alerta con todos los usuarios activos
    $usuarios = Usuario::where('activo', true)->get();
    foreach ($usuarios as $usuario) {
        AlertaUsuario::create([
            'alerta_id' => $alerta->id,
            'usuario_id' => $usuario->id,
            'read' => false,
            'created_at' => date('Y-m-d H:i:s'),
            'updated_at' => date('Y-m-d H:i:s'),
        ]);
    }
    
    // Cargar las relaciones para la respuesta
    $pedido->load('items', 'lote');
    
    $response->getBody()->write(json_encode(['pedido' => $pedido, 'lote' => $lote, 'items' => $items]));
    return $response->withHeader('Content-Type', 'application/json')->withStatus(201);
});

$app->get('/pedidos', function ($request, $response) {
    $query = Pedido::with(['items', 'lote']);
    $params = $request->getQueryParams();
    
    if (!empty($params['fecha_pedido'])) {
        $query->where('fecha_pedido', $params['fecha_pedido']);
    }
    if (!empty($params['estado'])) {
        $query->where('estado', $params['estado']);
    }
    
    $pedidos = $query->orderBy('fecha_pedido', 'desc')->get();
    $response->getBody()->write(json_encode($pedidos));
    return $response->withHeader('Content-Type', 'application/json');
});

$app->get('/pedidos/pendientes', function ($request, $response) {
    $pedidos = Pedido::with(['items', 'lote'])
        ->where('estado', 'pendiente')
        ->orWhere('estado', 'en_produccion')
        ->orderBy('fecha_requerida', 'asc')
        ->get();
    $response->getBody()->write(json_encode($pedidos));
    return $response->withHeader('Content-Type', 'application/json');
});

$app->get('/pedidos/{id}', function ($request, $response, $args) {
    $pedido = Pedido::with(['items', 'lote'])->find($args['id']);
    if (!$pedido) {
        $response->getBody()->write(json_encode(['error' => 'Pedido no encontrado']));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(404);
    }
    $response->getBody()->write(json_encode($pedido));
    return $response->withHeader('Content-Type', 'application/json');
});

$app->put('/pedidos/{id}/estado', function ($request, $response, $args) {
    $id = $args['id'];
    $data = $request->getParsedBody();
    
    $pedido = Pedido::find($id);
    if (!$pedido) {
        $response->getBody()->write(json_encode(['error' => 'Pedido no encontrado']));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(404);
    }
    
    $pedido->estado = $data['estado'];
    $pedido->save();
    
    $response->getBody()->write(json_encode($pedido));
    return $response->withHeader('Content-Type', 'application/json');
});

$app->get('/lotes', function ($request, $response) {
    $params = $request->getQueryParams();
    
    $query = Lote::with('pedido');
    
    if (isset($params['estado'])) {
        $query->where('estado', $params['estado']);
    }
    
    $lotes = $query->orderBy('created_at', 'desc')->get();
    $response->getBody()->write(json_encode($lotes));
    return $response->withHeader('Content-Type', 'application/json');
});

$app->get('/lotes/pendientes', function ($request, $response) {
    $lotes = Lote::with(['pedido.items'])
                 ->where('estado', 'pendiente')
                 ->orWhere('estado', 'en_produccion')
                 ->orderBy('created_at', 'desc')
                 ->get();
    $response->getBody()->write(json_encode($lotes));
    return $response->withHeader('Content-Type', 'application/json');
});

$app->get('/lotes/producidos', function ($request, $response) {
    $lotes = Lote::with(['pedido.items'])
                 ->where('estado', 'producido')
                 ->orderBy('created_at', 'desc')
                 ->get();
    $response->getBody()->write(json_encode($lotes));
    return $response->withHeader('Content-Type', 'application/json');
});

// Registro de producción basado en pedidos
$app->post('/produccion', function ($request, $response) {
    $data = $request->getParsedBody();
    error_log('Datos recibidos en /produccion: ' . json_encode($data));
    
    // Verificar que el lote existe y está en estado válido
    $lote = Lote::with(['pedido.items'])->find($data['lote_id']);
    if (!$lote) {
        $response->getBody()->write(json_encode(['error' => 'Lote no encontrado']));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(404);
    }
    
    if ($lote->estado === 'producido' || $lote->estado === 'despachado' || $lote->estado === 'recibido') {
        $response->getBody()->write(json_encode(['error' => 'No se puede producir para un lote ya procesado']));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
    }
    
    // Actualizar estado del lote a "en_produccion" si está pendiente
    if ($lote->estado === 'pendiente') {
        $lote->estado = 'en_produccion';
        $lote->save();
    }
    
    // Crear registro principal de producción
    $produccion = Produccion::create([
        'lote_id' => $data['lote_id'],
        'fecha' => $data['fecha'],
        'empleado' => $data['empleado'],
        'observaciones' => $data['observaciones'] ?? null
    ]);
    
    // === SOLO GUARDAR PRODUCCION POR PRODUCTO ===
    $produccionItems = [];
    if (isset($data['productos']) && is_array($data['productos'])) {
        // Agrupar cantidades producidas por producto
        $producidasPorProducto = [];
        foreach ($data['productos'] as $productoData) {
            $producto = $productoData['producto'];
            $cantidad = (int)$productoData['cantidad_producida'];
            if (!isset($producidasPorProducto[$producto])) {
                $producidasPorProducto[$producto] = 0;
            }
            $producidasPorProducto[$producto] += $cantidad;
        }
        foreach ($producidasPorProducto as $producto => $cantidadTotal) {
            $item = ProduccionItem::create([
                'lote_id' => $data['lote_id'],
                'producto' => $producto,
                'cantidad_producida' => $cantidadTotal,
                'fecha' => $data['fecha'],
                'empleado' => $data['empleado']
            ]);
            $produccionItems[] = $item;
        }
    } else {
        // Fallback: crear items para todos los productos del lote (suma solicitada)
        $productosDelLote = [];
        foreach ($lote->pedido->items as $pedidoItem) {
            if (!isset($productosDelLote[$pedidoItem->producto])) {
                $productosDelLote[$pedidoItem->producto] = 0;
            }
            $productosDelLote[$pedidoItem->producto] += $pedidoItem->cantidad_solicitada;
        }
        foreach ($productosDelLote as $producto => $cantidadTotal) {
            $item = ProduccionItem::create([
                'lote_id' => $data['lote_id'],
                'producto' => $producto,
                'cantidad_producida' => $cantidadTotal, // Por defecto, la cantidad solicitada
                'fecha' => $data['fecha'],
                'empleado' => $data['empleado']
            ]);
            $produccionItems[] = $item;
        }
    }
    
    // Actualizar estado del lote a "producido" después de registrar la producción
    $lote->estado = 'producido';
    $lote->save();

        // Crear alerta persistente por registro de producción
        $empleado = isset($data['empleado']) && $data['empleado'] ? $data['empleado'] : 'Un usuario';
        $alerta = Alerta::create([
            'fecha' => date('Y-m-d H:i:s'),
            'fase' => 'produccion',
            'tipo' => 'info',
            'mensaje' => $empleado . ' ha registrado la producción para el lote ' . $lote->codigo_lote . '.',
            'read' => false
        ]);
        $usuarios = Usuario::where('activo', true)->get();
        foreach ($usuarios as $usuario) {
            AlertaUsuario::create([
                'alerta_id' => $alerta->id,
                'usuario_id' => $usuario->id,
                'read' => false,
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            ]);
        }
    
    // Calcular cantidad_solicitada agrupada por producto
    $solicitadasPorProducto = [];
    foreach ($lote->pedido->items as $pedidoItem) {
        $producto = $pedidoItem->producto;
        $cantidad = (int)$pedidoItem->cantidad_solicitada;
        if (!isset($solicitadasPorProducto[$producto])) {
            $solicitadasPorProducto[$producto] = 0;
        }
        $solicitadasPorProducto[$producto] += $cantidad;
    }

    // Preparar resumen por producto y crear alertas por déficit/superávit
    $resumen = [];
    foreach ($produccionItems as $item) {
        $producto = $item->producto;
        $cantidad_producida = (int)$item->cantidad_producida;
        $cantidad_solicitada = isset($solicitadasPorProducto[$producto]) ? (int)$solicitadasPorProducto[$producto] : 0;
        $diferencia = $cantidad_producida - $cantidad_solicitada;
        $estado = $diferencia < 0 ? 'déficit' : ($diferencia > 0 ? 'superávit' : 'justo');
        $resumen[] = [
            'producto' => $producto,
            'cantidad_producida' => $cantidad_producida,
            'cantidad_solicitada' => $cantidad_solicitada,
            'diferencia' => $diferencia,
            'estado' => $estado
        ];
        // Crear alerta si hay déficit o superávit
        if ($estado === 'déficit') {
            $alerta = Alerta::create([
                'fecha' => date('Y-m-d H:i:s'),
                'fase' => 'produccion',
                'tipo' => 'warning',
                'mensaje' => "Déficit en producción: Se produjeron $cantidad_producida de $producto, pero se solicitaron $cantidad_solicitada (lote {$lote->codigo_lote}).",
                'read' => false
            ]);
            $usuarios = Usuario::where('activo', true)->get();
            foreach ($usuarios as $usuario) {
                AlertaUsuario::create([
                    'alerta_id' => $alerta->id,
                    'usuario_id' => $usuario->id,
                    'read' => false,
                    'created_at' => date('Y-m-d H:i:s'),
                    'updated_at' => date('Y-m-d H:i:s'),
                ]);
            }
        } elseif ($estado === 'superávit') {
            $alerta = Alerta::create([
                'fecha' => date('Y-m-d H:i:s'),
                'fase' => 'produccion',
                'tipo' => 'warning',
                'mensaje' => "Superávit en producción: Se produjeron $cantidad_producida de $producto, pero se solicitaron $cantidad_solicitada (lote {$lote->codigo_lote}).",
                'read' => false
            ]);
            $usuarios = Usuario::where('activo', true)->get();
            foreach ($usuarios as $usuario) {
                AlertaUsuario::create([
                    'alerta_id' => $alerta->id,
                    'usuario_id' => $usuario->id,
                    'read' => false,
                    'created_at' => date('Y-m-d H:i:s'),
                    'updated_at' => date('Y-m-d H:i:s'),
                ]);
            }
        }
    }

    // Ocultar cantidad_producida en los items del pedido en la respuesta
    $loteArray = $lote->toArray();
    if (isset($loteArray['pedido']['items'])) {
        foreach ($loteArray['pedido']['items'] as &$item) {
            unset($item['cantidad_producida']);
        }
        unset($item); // break reference
    }

    $response->getBody()->write(json_encode([
        'produccion' => $produccion,
        'resumen' => $resumen,
        'lote' => $loteArray
    ]));
    return $response->withHeader('Content-Type', 'application/json')->withStatus(201);
});

// Consulta de producción
$app->get('/produccion', function ($request, $response) {
    $query = Produccion::with(['lote', 'items']);
    $params = $request->getQueryParams();
    if (!empty($params['fecha'])) {
        $query->where('fecha', $params['fecha']);
    }
    if (!empty($params['lote_id'])) {
        $query->where('lote_id', $params['lote_id']);
    }
    $producciones = $query->orderBy('fecha', 'desc')->get();
    $response->getBody()->write(json_encode($producciones));
    return $response->withHeader('Content-Type', 'application/json');
});

// Registro de despacho con lote_id
$app->post('/despacho', function ($request, $response) {
    $data = $request->getParsedBody();
    error_log('Datos recibidos en /despacho: ' . json_encode($data));
    
    // Verificar que el lote existe y está en estado 'producido'
    $lote = Lote::with(['pedido.items'])->find($data['lote_id']);
    if (!$lote) {
        $response->getBody()->write(json_encode(['error' => 'Lote no encontrado']));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(404);
    }
    
    if ($lote->estado !== 'producido') {
        $response->getBody()->write(json_encode(['error' => 'El lote debe estar en estado "producido" para poder despacharlo']));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
    }
    
    // Obtener las cantidades producidas para este lote
    $produccionItems = ProduccionItem::where('lote_id', $data['lote_id'])->get();
    
    // Calcular y crear registros de despacho automáticamente
    $despachos = [];
    
    foreach ($produccionItems as $produccionItem) {
        $producto = $produccionItem->producto;
        $cantidadProducida = $produccionItem->cantidad_producida;
        // Obtener items del pedido para este producto
        $itemsPedido = $lote->pedido->items->where('producto', $producto);
        $totalSolicitado = $itemsPedido->sum('cantidad_solicitada');
        if ($totalSolicitado > 0) {
            $cantidadDistribuida = 0;
            $itemsPedidoArray = $itemsPedido->values()->toArray();
            // Distribuir proporcionalmente, ajustando el último para evitar diferencias de redondeo
            foreach ($itemsPedidoArray as $index => $itemPedido) {
                if ($index === count($itemsPedidoArray) - 1) {
                    // Último item: asignar lo que queda para evitar diferencias de redondeo
                    $cantidadParaTienda = $cantidadProducida - $cantidadDistribuida;
                } else {
                    // Items anteriores: calcular proporción
                    $proporcion = $itemPedido['cantidad_solicitada'] / $totalSolicitado;
                    $cantidadParaTienda = round($cantidadProducida * $proporcion);
                }
                $cantidadDistribuida += $cantidadParaTienda;
                // Crear registro de despacho
                $despacho = Despacho::create([
                    'lote_id' => $data['lote_id'],
                    'producto' => $producto,
                    'tienda' => $itemPedido['tienda'],
                    'cantidad_despachada' => $cantidadParaTienda,
                    'fecha' => $data['fecha'],
                    'empleado' => $data['empleado'] ?? null,
                    'observaciones' => $data['observaciones'] ?? null
                ]);
                $despachos[] = $despacho;
            }
        }
    }
    
    // Actualizar estado del lote a "despachado"
    $lote->estado = 'despachado';
    $lote->save();

    // Resumen global por producto: comparar total despachado vs solicitado
    $pedido = $lote->pedido;
    $totalesSolicitados = [];
    $totalesDespachados = [];
    foreach ($pedido->items as $item) {
        $producto = $item->producto;
        $totalesSolicitados[$producto] = ($totalesSolicitados[$producto] ?? 0) + (int)$item->cantidad_solicitada;
    }
    foreach ($despachos as $despacho) {
        $producto = $despacho->producto;
        $totalesDespachados[$producto] = ($totalesDespachados[$producto] ?? 0) + (int)$despacho->cantidad_despachada;
    }
    foreach ($totalesSolicitados as $producto => $solicitado) {
        $despachado = $totalesDespachados[$producto] ?? 0;
        if ($despachado < $solicitado) {
            $alerta = Alerta::create([
                'fecha' => date('Y-m-d H:i:s'),
                'fase' => 'despacho',
                'tipo' => 'warning',
                'mensaje' => "Déficit en despacho: Se despacharon $despachado de $producto, pero se solicitaron $solicitado (lote {$lote->codigo_lote}).",
                'read' => false
            ]);
            $usuarios = Usuario::where('activo', true)->get();
            foreach ($usuarios as $usuario) {
                AlertaUsuario::create([
                    'alerta_id' => $alerta->id,
                    'usuario_id' => $usuario->id,
                    'read' => false,
                    'created_at' => date('Y-m-d H:i:s'),
                    'updated_at' => date('Y-m-d H:i:s'),
                ]);
            }
        }
    }

    // Crear alerta persistente por registro de despacho
    $empleado = isset($data['empleado']) && $data['empleado'] ? $data['empleado'] : 'Un usuario';
    $alerta = Alerta::create([
        'fecha' => date('Y-m-d H:i:s'),
        'fase' => 'despacho',
        'tipo' => 'info',
        'mensaje' => $empleado . ' ha registrado el despacho para el lote ' . $lote->codigo_lote . '.',
        'read' => false
    ]);
    $usuarios = Usuario::where('activo', true)->get();
    foreach ($usuarios as $usuario) {
        AlertaUsuario::create([
            'alerta_id' => $alerta->id,
            'usuario_id' => $usuario->id,
            'read' => false,
            'created_at' => date('Y-m-d H:i:s'),
            'updated_at' => date('Y-m-d H:i:s'),
        ]);
    }
    
    $response->getBody()->write(json_encode([
        'despachos' => $despachos,
        'lote' => $lote,
        'mensaje' => 'Despacho realizado automáticamente según proporciones del pedido'
    ]));
    return $response->withHeader('Content-Type', 'application/json')->withStatus(201);
});

// Consulta de despachos
$app->get('/despacho', function ($request, $response) {
    $query = Despacho::with('lote');
    $params = $request->getQueryParams();
    
    if (!empty($params['fecha'])) {
        $query->where('fecha', $params['fecha']);
    }
    if (!empty($params['producto'])) {
        $query->where('producto', $params['producto']);
    }
    if (!empty($params['tienda'])) {
        $query->where('tienda', $params['tienda']);
    }
    if (!empty($params['lote_id'])) {
        $query->where('lote_id', $params['lote_id']);
    }
    
    $despachos = $query->orderBy('fecha', 'desc')->get();
    $response->getBody()->write(json_encode($despachos));
    return $response->withHeader('Content-Type', 'application/json');
});

// Obtener datos de producción para despacho por lote
$app->get('/despacho/lote/{lote_id}/disponible', function ($request, $response, $args) {
    $lote_id = $args['lote_id'];
    
    // Verificar que el lote existe y está producido
    $lote = Lote::with(['pedido.items'])->find($lote_id);
    if (!$lote) {
        $response->getBody()->write(json_encode(['error' => 'Lote no encontrado']));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(404);
    }
    
    if ($lote->estado !== 'producido') {
        $response->getBody()->write(json_encode(['error' => 'El lote debe estar producido para poder despacharlo']));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
    }
    
    // Obtener las cantidades producidas para este lote
    $produccionItems = ProduccionItem::where('lote_id', $lote_id)->get();
    
    // Calcular distribución automática basada en proporciones del pedido
    $distribucionCalculada = [];
    
    foreach ($produccionItems as $produccionItem) {
        $producto = $produccionItem->producto;
        $cantidadProducida = $produccionItem->cantidad_producida;
        
        // Obtener items del pedido para este producto
        $itemsPedido = $lote->pedido->items->where('producto', $producto);
        $totalSolicitado = $itemsPedido->sum('cantidad_solicitada');
        
        if ($totalSolicitado > 0) {
            foreach ($itemsPedido as $itemPedido) {
                $proporcion = $itemPedido->cantidad_solicitada / $totalSolicitado;
                $cantidadParaTienda = round($cantidadProducida * $proporcion);
                
                $distribucionCalculada[] = [
                    'producto' => $producto,
                    'tienda' => $itemPedido->tienda,
                    'cantidad_solicitada' => $itemPedido->cantidad_solicitada,
                    'cantidad_producida' => $cantidadProducida,
                    'cantidad_a_despachar' => $cantidadParaTienda,
                    'proporcion' => round($proporcion * 100, 1)
                ];
            }
        }
    }
    
    // Crear estructura de datos para el despacho
    $datosDespacho = [
        'lote' => $lote,
        'produccion_items' => $produccionItems,
        'distribucion_calculada' => $distribucionCalculada,
        'resumen_productos' => $produccionItems->mapWithKeys(function ($item) {
            return [$item->producto => $item->cantidad_producida];
        })
    ];
    
    $response->getBody()->write(json_encode($datosDespacho));
    return $response->withHeader('Content-Type', 'application/json');
});

// Confirmación de recepción con lote_id
$app->post('/recepcion', function ($request, $response) {
    $data = $request->getParsedBody();
    error_log('Datos recibidos en /recepcion: ' . json_encode($data));
    
    // Verificar que el lote existe y está despachado
    $lote = Lote::find($data['lote_id']);
    if (!$lote) {
        $response->getBody()->write(json_encode(['error' => 'Lote no encontrado']));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(404);
    }
    
    if ($lote->estado !== 'despachado') {
        $response->getBody()->write(json_encode(['error' => 'El lote debe estar despachado para poder recibirse']));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
    }
    
    // Crear registros de recepción
    $recepciones = [];
    $alertaRecepcionCreada = false;
    if (isset($data['items']) && is_array($data['items'])) {
        foreach ($data['items'] as $itemData) {
            // Buscar la cantidad despachada para este producto y tienda
            $despacho = Despacho::where('lote_id', $data['lote_id'])
                ->where('producto', $itemData['producto'])
                ->where('tienda', $itemData['tienda'])
                ->first();
            $cantidad_despachada = $despacho ? (int)$despacho->cantidad_despachada : null;

            $recepcion = Recepcion::create([
                'lote_id' => $data['lote_id'],
                'producto' => $itemData['producto'],
                'tienda' => $itemData['tienda'],
                'cantidad_recibida' => $itemData['cantidad_recibida'],
                'fecha' => $data['fecha'],
                'confirmado' => $itemData['confirmado'] ?? false,
                'empleado' => $data['empleado'] ?? null,
                'observaciones' => $data['observaciones'] ?? null
            ]);
            $recepciones[] = $recepcion;
            // Alerta de déficit en recepción
            $empleado = isset($data['empleado']) && $data['empleado'] ? $data['empleado'] : 'Un usuario';
            $tienda = isset($itemData['tienda']) && $itemData['tienda'] ? $itemData['tienda'] : 'una tienda';
            if ($cantidad_despachada !== null && (int)$itemData['cantidad_recibida'] < $cantidad_despachada) {
                $alerta = Alerta::create([
                    'fecha' => date('Y-m-d H:i:s'),
                    'fase' => 'recepcion',
                    'tipo' => 'warning',
                    'mensaje' => "Déficit en recepción: Se recibieron {$itemData['cantidad_recibida']} de {$itemData['producto']}, pero se despacharon $cantidad_despachada (lote {$lote->codigo_lote}, tienda $tienda).",
                    'read' => false
                ]);
                $usuarios = Usuario::where('activo', true)->get();
                foreach ($usuarios as $usuario) {
                    AlertaUsuario::create([
                        'alerta_id' => $alerta->id,
                        'usuario_id' => $usuario->id,
                        'read' => false,
                        'created_at' => date('Y-m-d H:i:s'),
                        'updated_at' => date('Y-m-d H:i:s'),
                    ]);
                }
            }
            // Crear alerta persistente por registro de recepción solo una vez por tienda/lote
            if (!$alertaRecepcionCreada) {
                $alerta = Alerta::create([
                    'fecha' => date('Y-m-d H:i:s'),
                    'fase' => 'recepcion',
                    'tipo' => 'info',
                    'mensaje' => $empleado . ' ha registrado la recepcion en ' . $tienda . ' para el lote ' . $lote->codigo_lote . '.',
                    'read' => false
                ]);
                $usuarios = Usuario::where('activo', true)->get();
                foreach ($usuarios as $usuario) {
                    AlertaUsuario::create([
                        'alerta_id' => $alerta->id,
                        'usuario_id' => $usuario->id,
                        'read' => false,
                        'created_at' => date('Y-m-d H:i:s'),
                        'updated_at' => date('Y-m-d H:i:s'),
                    ]);
                }
                $alertaRecepcionCreada = true;
            }
        }
    } else {
        $response->getBody()->write(json_encode(['error' => 'Se requieren items para la recepción']));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
    }
    
    // Verificar si todas las tiendas del lote han completado sus recepciones
    // Primero, obtener todas las tiendas que tienen despachos en este lote
    $tiendasDespachadas = Despacho::where('lote_id', $data['lote_id'])
                                  ->distinct()
                                  ->pluck('tienda')
                                  ->toArray();
    
    // Obtener todas las tiendas que ya han registrado recepción para este lote
    $tiendasRecibidas = Recepcion::where('lote_id', $data['lote_id'])
                                 ->distinct()
                                 ->pluck('tienda')
                                 ->toArray();
    
    // Verificar si todas las tiendas despachadas han registrado recepción
    $todasTiendasRecibidas = empty(array_diff($tiendasDespachadas, $tiendasRecibidas));
    
    // Solo marcar el lote como recibido si todas las tiendas han completado recepciones
    if ($todasTiendasRecibidas) {
        // Verificar además que todas las recepciones estén confirmadas
        $todasConfirmadas = Recepcion::where('lote_id', $data['lote_id'])
                                    ->where('confirmado', true)
                                    ->count() === Recepcion::where('lote_id', $data['lote_id'])->count();
        
        if ($todasConfirmadas) {
            $lote->estado = 'recibido';
            $lote->save();
            
            $response->getBody()->write(json_encode([
                'recepciones' => $recepciones,
                'lote' => $lote,
                'mensaje' => 'Lote completamente recibido por todas las tiendas'
            ]));
        } else {
            $response->getBody()->write(json_encode([
                'recepciones' => $recepciones,
                'lote' => $lote,
                'mensaje' => 'Recepción registrada. Quedan recepciones por confirmar.'
            ]));
        }
    } else {
        $response->getBody()->write(json_encode([
            'recepciones' => $recepciones,
            'lote' => $lote,
            'mensaje' => 'Recepción registrada. Quedan tiendas pendientes por recibir.'
        ]));
    }
    
    return $response->withHeader('Content-Type', 'application/json')->withStatus(201);
});

// Consulta de recepciones
$app->get('/recepcion', function ($request, $response) {
    $query = Recepcion::with('lote');
    $params = $request->getQueryParams();
    
    if (!empty($params['fecha'])) {
        $query->where('fecha', $params['fecha']);
    }
    if (!empty($params['producto'])) {
        $query->where('producto', $params['producto']);
    }
    if (!empty($params['tienda'])) {
        $query->where('tienda', $params['tienda']);
    }
    if (!empty($params['lote_id'])) {
        $query->where('lote_id', $params['lote_id']);
    }
    if (isset($params['confirmado'])) {
        $query->where('confirmado', $params['confirmado']);
    }
    
    $recepciones = $query->orderBy('fecha', 'desc')->get();
    $response->getBody()->write(json_encode($recepciones));
    return $response->withHeader('Content-Type', 'application/json');
});

$app->get('/saludo/{nombre}', function ($request, $response, $args) {
    $nombre = $args['nombre'];
    $response->getBody()->write("Hola, $nombre!");
    return $response;
});

$app->post('/json', function ($request, $response, $args) {
    $data = $request->getParsedBody();
    $nombre = $data['nombre'] ?? 'Invitado';
    $saludo = ["mensaje" => "Hola, $nombre!"];
    $payload = json_encode($saludo);
    $response = $response->withHeader('Content-Type', 'application/json');
    $response->getBody()->write($payload);
    return $response;
});

$app->get('/reporte/despacho', function ($request, $response) {
    $params = $request->getQueryParams();
    $query = Despacho::query();
    if (!empty($params['fecha'])) {
        $query->where('fecha', $params['fecha']);
    }
    if (!empty($params['producto'])) {
        $query->where('producto', $params['producto']);
    }
    if (!empty($params['tienda'])) {
        $query->where('tienda', $params['tienda']);
    }
    $result = $query->selectRaw('producto, tienda, fecha, SUM(cantidad) as total')
        ->groupBy('producto', 'tienda', 'fecha')
        ->get();
    $response->getBody()->write(json_encode($result));
    return $response->withHeader('Content-Type', 'application/json');
});

$app->get('/reporte/recepcion', function ($request, $response) {
    $params = $request->getQueryParams();
    $query = Recepcion::query();
    if (!empty($params['fecha'])) {
        $query->where('fecha', $params['fecha']);
    }
    if (!empty($params['producto'])) {
        $query->where('producto', $params['producto']);
    }
    if (!empty($params['tienda'])) {
        $query->where('tienda', $params['tienda']);
    }
    if (isset($params['confirmado'])) {
        $query->where('confirmado', $params['confirmado']);
    }
    $result = $query->selectRaw('producto, tienda, fecha, SUM(cantidad) as total, confirmado')
        ->groupBy('producto', 'tienda', 'fecha', 'confirmado')
        ->get();
    $response->getBody()->write(json_encode($result));
    return $response->withHeader('Content-Type', 'application/json');
});

$app->get('/reporte/produccion', function ($request, $response) {
    $params = $request->getQueryParams();
    $query = Produccion::query();
    if (!empty($params['fecha'])) {
        $query->where('fecha', $params['fecha']);
    }
    if (!empty($params['producto'])) {
        $query->where('producto', $params['producto']);
    }
    $result = $query->selectRaw('producto, fecha, SUM(cantidad_producida) as total')
        ->groupBy('producto', 'fecha')
        ->get();
    $response->getBody()->write(json_encode($result));
    return $response->withHeader('Content-Type', 'application/json');
});


$app->get('/traza/{producto}', function ($request, $response, $args) {
    $producto = $args['producto'];
    $producciones = Produccion::where('producto', $producto)->get();
    $traza = [];
    foreach ($producciones as $prod) {
        $despachos = Despacho::where('produccion_id', $prod->id)->get();
        foreach ($despachos as $desp) {
            $recepciones = Recepcion::where('despacho_id', $desp->id)->get();
            $traza[] = [
                'produccion' => $prod,
                'despacho' => $desp,
                'recepciones' => $recepciones
            ];
        }
    }
    $response->getBody()->write(json_encode($traza));
    return $response->withHeader('Content-Type', 'application/json');
});

// Nueva ruta para trazabilidad por lote
$app->get('/traza/lote/{lote_id}', function ($request, $response, $args) {
    $lote_id = (int)$args['lote_id'];
    
    try {
        // Obtener información del lote
        $lote = Lote::find($lote_id);
        if (!$lote) {
            $response->getBody()->write(json_encode(['error' => 'Lote no encontrado']));
            return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
        }
        
        // Obtener información del pedido con sus items
        $pedido = Pedido::with('items')->find($lote->pedido_id);
        
        // Obtener información de producción con sus items
        $produccion = Produccion::with('items')->where('lote_id', $lote_id)->first();
        
        // Obtener información de despachos (cada registro es un item)
        $despachos = Despacho::where('lote_id', $lote_id)->get();
        
        // Obtener información de recepciones (cada registro es un item)
        $recepciones = Recepcion::where('lote_id', $lote_id)->get();
        
        $trazabilidad = [
            'lote_id' => $lote_id,
            'lote' => [
                'id' => $lote->id,
                'estado' => $lote->estado,
                'completado_en' => $lote->completado_en,
                'created_at' => $lote->created_at,
                'updated_at' => $lote->updated_at
            ],
            'pedido' => [
                'id' => $pedido->id,
                'fecha_pedido' => $pedido->fecha_pedido,
                'fecha_requerida' => $pedido->fecha_requerida,
                'estado' => $pedido->estado,
                'empleado' => $pedido->empleado ?? '',
                'created_at' => $pedido->created_at,
                'items' => $pedido->items->map(function($item) {
                    return [
                        'producto' => $item->producto,
                        'tienda' => $item->tienda,
                        'cantidad_solicitada' => $item->cantidad_solicitada
                    ];
                })
            ],
            'produccion' => $produccion ? [
                'id' => $produccion->id,
                'fecha' => $produccion->fecha,
                'empleado' => $produccion->empleado,
                'observaciones' => $produccion->observaciones,
                'created_at' => $produccion->created_at,
                'items' => $produccion->items->map(function($item) {
                    return [
                        'producto' => $item->producto,
                        'cantidad_producida' => $item->cantidad_producida,
                        'fecha' => $item->fecha,
                        'empleado' => $item->empleado
                    ];
                })
            ] : null,
            'despachos' => $despachos->map(function($despacho) {
                return [
                    'id' => $despacho->id,
                    'fecha' => $despacho->fecha,
                    'empleado' => $despacho->empleado,
                    'observaciones' => $despacho->observaciones,
                    'created_at' => $despacho->created_at,
                    'producto' => $despacho->producto,
                    'tienda' => $despacho->tienda,
                    'cantidad_despachada' => $despacho->cantidad_despachada
                ];
            }),
            'recepciones' => $recepciones->groupBy('tienda')->map(function($recepcionesTienda, $tienda) {
                $primerRecepcion = $recepcionesTienda->first();
                return [
                    'tienda' => $tienda,
                    'fecha' => $primerRecepcion->fecha,
                    'empleado' => $primerRecepcion->empleado,
                    'observaciones' => $primerRecepcion->observaciones,
                    'created_at' => $primerRecepcion->created_at,
                    'items' => $recepcionesTienda->map(function($recepcion) {
                        return [
                            'producto' => $recepcion->producto,
                            'cantidad_recibida' => $recepcion->cantidad_recibida,
                            'confirmado' => $recepcion->confirmado
                        ];
                    })
                ];
            })->values()
        ];
        
        $response->getBody()->write(json_encode($trazabilidad, JSON_PRETTY_PRINT));
        return $response->withHeader('Content-Type', 'application/json');
    } catch (Exception $e) {
        $response->getBody()->write(json_encode(['error' => 'Error al obtener trazabilidad: ' . $e->getMessage()]));
        return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
    }
});

// Ruta para obtener todos los lotes
$app->get('/lotes/todos', function ($request, $response) {
    try {
        error_log("Acceso a /lotes/todos");
        
        // Comprobar si estamos en una sesión autenticada
        session_start();
        if (!isset($_SESSION['user_id'])) {
            error_log("Acceso no autenticado a /lotes/todos");
            
            // Para propósitos de depuración, permitimos el acceso sin autenticación temporalmente
            error_log("Permitiendo acceso sin autenticación temporalmente");
            // En producción, descomentar la siguiente línea:
            // throw new Exception("No autenticado");
        }
        
        // Obtener encabezados para depuración
        $headers = $request->getHeaders();
        error_log("Headers: " . json_encode($headers));
        
        // Permitir acceso a usuarios con rol de tienda también (anteriormente solo admin)
        $rol = isset($headers['X-Role'][0]) ? $headers['X-Role'][0] : (isset($_SESSION['user_rol']) ? $_SESSION['user_rol'] : 'visitante');
        error_log("Rol detectado: " . $rol);
        
        $lotes = Lote::with('pedido')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function($lote) {
                return [
                    'id' => $lote->id,
                    'estado' => $lote->estado,
                    'fecha_pedido' => $lote->pedido ? $lote->pedido->fecha_pedido : null,
                    'fecha_requerida' => $lote->pedido ? $lote->pedido->fecha_requerida : null,
                    'created_at' => $lote->created_at
                ];
            });
        
        error_log("Lotes obtenidos: " . count($lotes));
        $response->getBody()->write(json_encode($lotes));
        return $response->withHeader('Content-Type', 'application/json');
        
    } catch (Exception $e) {
        error_log("Error en /lotes/todos: " . $e->getMessage());
        $response->getBody()->write(json_encode(['error' => 'Error al obtener lotes: ' . $e->getMessage()]));
        return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
    }
});

// Endpoints para obtener opciones de selects
$app->get('/opciones/productos', function ($request, $response) {
    // Solo productos de maestros activos (coherencia con inventario)
    $productos = Maestro::where('tipo', 'producto')
        ->where('activo', true)
        ->orderBy('nombre')
        ->pluck('nombre');
    
    $response->getBody()->write(json_encode($productos));
    return $response->withHeader('Content-Type', 'application/json');
});

$app->get('/opciones/empleados', function ($request, $response) {
    // Combinar empleados de maestros y de producciones reales
    $maestros = Maestro::where('tipo', 'empleado')->where('activo', true)->pluck('nombre');
    $usados = Produccion::select('empleado')->distinct()->pluck('empleado');
    $empleados = $maestros->merge($usados)->unique()->sort()->values();
    
    $response->getBody()->write(json_encode($empleados));
    return $response->withHeader('Content-Type', 'application/json');
});

$app->get('/opciones/tiendas', function ($request, $response) {
    // Combinar tiendas de maestros y de despachos/recepciones reales
    $maestros = Maestro::where('tipo', 'tienda')->where('activo', true)->pluck('nombre');
    $usados_despacho = Despacho::select('tienda')->distinct()->pluck('tienda');
    $usados_recepcion = Recepcion::select('tienda')->distinct()->pluck('tienda');
    $tiendas = $maestros->merge($usados_despacho)->merge($usados_recepcion)->unique()->sort()->values();
    
    $response->getBody()->write(json_encode($tiendas));
    return $response->withHeader('Content-Type', 'application/json');
});

// Obtener último inventario por producto y tienda
$app->get('/inventario/ultimo/{producto_nombre}', function ($request, $response, $args) {
    try {
        $producto_nombre = urldecode($args['producto_nombre']);
        
        // Buscar el producto por nombre
        $producto = Maestro::where('nombre', $producto_nombre)
                          ->where('tipo', 'producto')
                          ->first();
        
        if (!$producto) {
            $response->getBody()->write(json_encode([]));
            return $response->withHeader('Content-Type', 'application/json');
        }
        
        // Obtener el último inventario de cada tienda para este producto
        $inventarios = InventarioInicial::where('producto_id', $producto->id)
            ->select('tienda_id', 'cantidad_inicial', 'fecha')
            ->orderBy('fecha', 'desc')
            ->get()
            ->groupBy('tienda_id')
            ->map(function($grupo) {
                return $grupo->first(); // Tomar el más reciente de cada tienda
            });
        
        // Convertir tienda_id a nombre de tienda
        $resultado = [];
        foreach ($inventarios as $tienda_id => $inventario) {
            $tienda = Maestro::where('id', $tienda_id)->where('tipo', 'tienda')->first();
            if ($tienda) {
                $resultado[$tienda->nombre] = [
                    'cantidad' => $inventario->cantidad_inicial,
                    'fecha' => $inventario->fecha
                ];
            }
        }
        
        $response->getBody()->write(json_encode($resultado));
        return $response->withHeader('Content-Type', 'application/json');
        
    } catch (Exception $e) {
        $response->getBody()->write(json_encode(['error' => $e->getMessage()]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
    }
});

$app->get('/opciones/empleados-para-usuarios', function ($request, $response) {
    try {
        $empleados = Maestro::where('tipo', 'empleado')
                           ->where('activo', true)
                           ->get()
                           ->map(function($empleado) {
                               return [
                                   'id' => $empleado->id,
                                   'nombre' => $empleado->nombre
                               ];
                           });
        
        $response->getBody()->write(json_encode($empleados));
        return $response->withHeader('Content-Type', 'application/json');
    } catch (Exception $e) {
        error_log('Error en /opciones/empleados-para-usuarios: ' . $e->getMessage());
        $response->getBody()->write(json_encode(['error' => 'Error al obtener empleados']));
        return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
    }
});

$app->get('/opciones/lotes', function ($request, $response) {
    try {
        $lotes = Lote::with('pedido')->get()->map(function($lote) {
            return [
                'id' => $lote->id,
                'codigo_lote' => $lote->codigo_lote,
                'estado' => $lote->estado,
                'pedido_id' => $lote->pedido_id
            ];
        });
        
        $response->getBody()->write(json_encode($lotes));
        return $response->withHeader('Content-Type', 'application/json');
    } catch (Exception $e) {
        error_log('Error en /opciones/lotes: ' . $e->getMessage());
        $response->getBody()->write(json_encode(['error' => 'Error al obtener lotes']));
        return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
    }
});

$app->get('/opciones/producciones', function ($request, $response) {
    $params = $request->getQueryParams();
    
    // Necesitamos joinear con produccion_items para obtener los productos
    $query = Produccion::select(
        'produccion.id',
        'produccion_items.producto', 
        'produccion_items.cantidad_producida as cantidad',
        'produccion.fecha'
    )
    ->join('produccion_items', 'produccion.id', '=', 'produccion_items.produccion_id');
    
    if (!empty($params['producto'])) {
        $query->where('produccion_items.producto', $params['producto']);
    }
    if (!empty($params['fecha'])) {
        $query->where('produccion.fecha', $params['fecha']);
    }
    
    $producciones = $query->orderBy('produccion.fecha', 'desc')->get();
    $response->getBody()->write(json_encode($producciones));
    return $response->withHeader('Content-Type', 'application/json');
});

$app->get('/opciones/despachos', function ($request, $response) {
    $params = $request->getQueryParams();
    $query = Despacho::select('id', 'producto', 'cantidad', 'fecha', 'tienda');
    
    if (!empty($params['producto'])) {
        $query->where('producto', $params['producto']);
    }
    if (!empty($params['fecha'])) {
        $query->where('fecha', $params['fecha']);
    }
    if (!empty($params['tienda'])) {
        $query->where('tienda', $params['tienda']);
    }
    
    $despachos = $query->orderBy('fecha', 'desc')->get();
    $response->getBody()->write(json_encode($despachos));
    return $response->withHeader('Content-Type', 'application/json');
});

// Endpoints para gestión de datos maestros
$app->post('/maestros/producto', function ($request, $response) {
    $data = $request->getParsedBody();
    if (empty($data['nombre'])) {
        $response->getBody()->write(json_encode(['error' => 'Nombre del producto es requerido']));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
    }
    
    // Verificar si ya existe
    $existe = Maestro::where('tipo', 'producto')->where('nombre', $data['nombre'])->exists();
    if ($existe) {
        $response->getBody()->write(json_encode(['error' => 'El producto ya existe']));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(409);
    }
    
    $maestro = Maestro::create([
        'tipo' => 'producto',
        'nombre' => $data['nombre'],
        'familia_id' => !empty($data['familia_id']) ? (int)$data['familia_id'] : null,
        'activo' => true
    ]);
    
    $response->getBody()->write(json_encode(['mensaje' => 'Producto creado exitosamente', 'id' => $maestro->id, 'producto' => $maestro->nombre]));
    return $response->withHeader('Content-Type', 'application/json')->withStatus(201);
});

$app->post('/maestros/empleado', function ($request, $response) {
    $data = $request->getParsedBody();
    if (empty($data['nombre']) || empty($data['dni'])) {
        $response->getBody()->write(json_encode(['error' => 'Nombre y DNI del empleado son requeridos']));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
    }
    
    // Validar formato de DNI
    if (!preg_match('/^[0-9]{7,8}$/', $data['dni'])) {
        $response->getBody()->write(json_encode(['error' => 'El DNI debe contener solo números y tener entre 7 y 8 dígitos']));
        return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
    }
    
    // Verificar si ya existe por DNI
    $existeDni = Maestro::where('tipo', 'empleado')->where('dni', $data['dni'])->exists();
    if ($existeDni) {
        $response->getBody()->write(json_encode(['error' => 'Ya existe un empleado con este DNI']));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(409);
    }
    
    // Verificar si ya existe por nombre
    $existeNombre = Maestro::where('tipo', 'empleado')->where('nombre', $data['nombre'])->exists();
    if ($existeNombre) {
        $response->getBody()->write(json_encode(['error' => 'Ya existe un empleado con este nombre']));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(409);
    }
    
    $maestro = Maestro::create([
        'tipo' => 'empleado',
        'nombre' => $data['nombre'],
        'dni' => $data['dni'],
        'activo' => true
    ]);
    
    $response->getBody()->write(json_encode([
        'mensaje' => 'Empleado creado exitosamente', 
        'id' => $maestro->id, 
        'empleado' => $maestro->nombre,
        'dni' => $maestro->dni
    ]));
    return $response->withHeader('Content-Type', 'application/json')->withStatus(201);
});

$app->post('/maestros/tienda', function ($request, $response) {
    $data = $request->getParsedBody();
    if (empty($data['nombre'])) {
        $response->getBody()->write(json_encode(['error' => 'Nombre de la tienda es requerido']));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
    }
    
    // Verificar si ya existe
    $existe = Maestro::where('tipo', 'tienda')->where('nombre', $data['nombre'])->exists();
    if ($existe) {
        $response->getBody()->write(json_encode(['error' => 'La tienda ya existe']));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(409);
    }
    
    $maestro = Maestro::create([
        'tipo' => 'tienda',
        'nombre' => $data['nombre'],
        'activo' => true
    ]);
    
    $response->getBody()->write(json_encode(['mensaje' => 'Tienda creada exitosamente', 'id' => $maestro->id, 'tienda' => $maestro->nombre]));
    return $response->withHeader('Content-Type', 'application/json')->withStatus(201);
});

// Endpoint para consultar todos los datos maestros
$app->get('/maestros', function ($request, $response) {
    $params = $request->getQueryParams();
    $query = Maestro::query();
    
    if (!empty($params['tipo'])) {
        $query->where('tipo', $params['tipo']);
    }
    
    $maestros = $query->where('activo', true)->orderBy('tipo')->orderBy('nombre')->get();
    $response->getBody()->write(json_encode($maestros));
    return $response->withHeader('Content-Type', 'application/json');
});

// Endpoint para desactivar un dato maestro
$app->delete('/maestros/{id}', function ($request, $response, $args) {
    $id = $args['id'];
    $maestro = Maestro::find($id);
    
    if (!$maestro) {
        $response->getBody()->write(json_encode(['error' => 'Registro no encontrado']));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(404);
    }
    
    $maestro->activo = false;
    $maestro->save();
    
    $response->getBody()->write(json_encode(['mensaje' => 'Registro desactivado exitosamente']));
    return $response->withHeader('Content-Type', 'application/json');
});

// ==========================================
// GESTIÓN DE ROLES DINÁMICOS
// ==========================================

// Listar todos los roles
$app->get('/roles', function ($request, $response) {
    $roles = Rol::with('permisos')->where('activo', true)->get();
    $response->getBody()->write(json_encode(['roles' => $roles]));
    return $response->withHeader('Content-Type', 'application/json');
});

// Crear un nuevo rol
$app->post('/roles', function ($request, $response) {
    $data = $request->getParsedBody();
    
    if (empty($data['nombre']) || empty($data['descripcion'])) {
        $response->getBody()->write(json_encode(['error' => 'Nombre y descripción son requeridos']));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
    }
    
    // Verificar si ya existe
    $existe = Rol::where('nombre', $data['nombre'])->exists();
    if ($existe) {
        $response->getBody()->write(json_encode(['error' => 'El rol ya existe']));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(409);
    }
    
    $rol = Rol::create([
        'nombre' => $data['nombre'],
        'descripcion' => $data['descripcion'],
        'activo' => true
    ]);
    
    $response->getBody()->write(json_encode(['mensaje' => 'Rol creado exitosamente', 'rol' => $rol]));
    return $response->withHeader('Content-Type', 'application/json')->withStatus(201);
});

// Actualizar un rol
$app->put('/roles/{id}', function ($request, $response, $args) {
    $data = $request->getParsedBody();
    $rol = Rol::find($args['id']);
    
    if (!$rol) {
        $response->getBody()->write(json_encode(['error' => 'Rol no encontrado']));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(404);
    }
    
    if (isset($data['nombre'])) $rol->nombre = $data['nombre'];
    if (isset($data['descripcion'])) $rol->descripcion = $data['descripcion'];
    if (isset($data['activo'])) $rol->activo = $data['activo'];
    
    $rol->save();
    
    $response->getBody()->write(json_encode(['mensaje' => 'Rol actualizado exitosamente', 'rol' => $rol]));
    return $response->withHeader('Content-Type', 'application/json');
});

// Listar todos los permisos
$app->get('/permisos', function ($request, $response) {
    $permisos = Permiso::all();
    $response->getBody()->write(json_encode(['permisos' => $permisos]));
    return $response->withHeader('Content-Type', 'application/json');
});

// Crear un nuevo permiso
$app->post('/permisos', function ($request, $response) {
    $data = $request->getParsedBody();
    
    if (empty($data['endpoint']) || empty($data['descripcion'])) {
        $response->getBody()->write(json_encode(['error' => 'Endpoint y descripción son requeridos']));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
    }
    
    $permiso = Permiso::create([
        'endpoint' => $data['endpoint'],
        'metodo' => $data['metodo'] ?? '*',
        'descripcion' => $data['descripcion']
    ]);
    
    $response->getBody()->write(json_encode(['mensaje' => 'Permiso creado exitosamente', 'permiso' => $permiso]));
    return $response->withHeader('Content-Type', 'application/json')->withStatus(201);
});

// Asignar permisos a un rol
$app->post('/roles/{id}/permisos', function ($request, $response, $args) {
    $data = $request->getParsedBody();
    $rol = Rol::find($args['id']);
    
    if (!$rol) {
        $response->getBody()->write(json_encode(['error' => 'Rol no encontrado']));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(404);
    }
    
    if (empty($data['permisos']) || !is_array($data['permisos'])) {
        $response->getBody()->write(json_encode(['error' => 'Se requiere un array de IDs de permisos']));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
    }
    
    // Sincronizar permisos (esto reemplaza todos los permisos existentes)
    $rol->permisos()->sync($data['permisos']);
    
    $response->getBody()->write(json_encode(['mensaje' => 'Permisos asignados exitosamente']));
    return $response->withHeader('Content-Type', 'application/json');
});

// Obtener permisos de un rol específico
$app->get('/roles/{id}/permisos', function ($request, $response, $args) {
    $rol = Rol::with('permisos')->find($args['id']);
    
    if (!$rol) {
        $response->getBody()->write(json_encode(['error' => 'Rol no encontrado']));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(404);
    }
    
    $response->getBody()->write(json_encode(['permisos' => $rol->permisos]));
    return $response->withHeader('Content-Type', 'application/json');
});

// Verificar si un rol tiene un permiso específico
$app->get('/roles/{nombre}/permiso', function ($request, $response, $args) {
    $params = $request->getQueryParams();
    $endpoint = $params['endpoint'] ?? '';
    $metodo = $params['metodo'] ?? 'GET';
    
    if (empty($endpoint)) {
        $response->getBody()->write(json_encode(['error' => 'Endpoint es requerido']));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
    }
    
    $rol = Rol::where('nombre', $args['nombre'])->where('activo', true)->first();
    
    if (!$rol) {
        $response->getBody()->write(json_encode(['error' => 'Rol no encontrado']));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(404);
    }
    
    $tienePermiso = $rol->tienePermiso($endpoint, $metodo);
    
    $response->getBody()->write(json_encode([
        'rol' => $args['nombre'],
        'endpoint' => $endpoint,
        'metodo' => $metodo,
        'tiene_permiso' => $tienePermiso
    ]));
    return $response->withHeader('Content-Type', 'application/json');
});

// ============== GESTIÓN DE USUARIOS ==============

// Listar usuarios
$app->get('/usuarios', function ($request, $response) {
    try {
        $usuarios = Usuario::with(['rol', 'empleado'])->where('activo', true)->get();
        $response->getBody()->write(json_encode($usuarios));
        return $response->withHeader('Content-Type', 'application/json');
    } catch (Exception $e) {
        error_log('Error en /usuarios: ' . $e->getMessage());
        $response->getBody()->write(json_encode(['error' => 'Error al obtener usuarios']));
        return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
    }
});

// Crear nuevo usuario
$app->post('/usuarios', function ($request, $response) {
    try {
        $data = json_decode($request->getBody(), true);
        
        // Validaciones básicas
        if (!isset($data['empleado_id']) || !isset($data['password']) || !isset($data['rol_id'])) {
            $response->getBody()->write(json_encode(['error' => 'Faltan campos requeridos: empleado_id, password, rol_id']));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }
        
        // Verificar que el empleado existe
        $empleado = Maestro::where('tipo', 'empleado')
                          ->where('id', $data['empleado_id'])
                          ->where('activo', true)
                          ->first();
        if (!$empleado) {
            $response->getBody()->write(json_encode(['error' => 'El empleado especificado no existe o no está activo']));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }
        
        // Verificar que el empleado no tenga ya un usuario
        $usuarioExistente = Usuario::where('empleado_id', $data['empleado_id'])->first();
        if ($usuarioExistente) {
            $response->getBody()->write(json_encode(['error' => 'El empleado ya tiene un usuario asociado']));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }
        
        // Verificar que el rol existe
        $rol = Rol::find($data['rol_id']);
        if (!$rol) {
            $response->getBody()->write(json_encode(['error' => 'El rol especificado no existe']));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }
        
        // Crear usuario
        $usuario = Usuario::create([
            'empleado_id' => $data['empleado_id'],
            'password' => password_hash($data['password'], PASSWORD_DEFAULT),
            'rol_id' => $data['rol_id'],
            'activo' => true
        ]);
        
        // Cargar las relaciones
        $usuario->load(['rol', 'empleado']);
        
        $response->getBody()->write(json_encode([
            'success' => true,
            'mensaje' => 'Usuario creado exitosamente',
            'usuario' => $usuario
        ]));
        return $response->withHeader('Content-Type', 'application/json');
        
    } catch (Exception $e) {
        error_log('Error creando usuario: ' . $e->getMessage());
        $response->getBody()->write(json_encode(['error' => 'Error interno del servidor']));
        return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
    }
});

// Actualizar usuario
$app->put('/usuarios/{id}', function ($request, $response, $args) {
    try {
        $usuario = Usuario::find($args['id']);
        if (!$usuario) {
            $response->getBody()->write(json_encode(['error' => 'Usuario no encontrado']));
            return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
        }
        
        $data = json_decode($request->getBody(), true);
        
        // Actualizar campos permitidos
        if (isset($data['empleado_id'])) {
            // Verificar que el empleado existe
            $empleado = Maestro::where('tipo', 'empleado')
                              ->where('id', $data['empleado_id'])
                              ->where('activo', true)
                              ->first();
            if (!$empleado) {
                $response->getBody()->write(json_encode(['error' => 'El empleado especificado no existe o no está activo']));
                return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
            }
            
            // Verificar que el empleado no esté asociado a otro usuario
            $usuarioExistente = Usuario::where('empleado_id', $data['empleado_id'])
                                     ->where('id', '!=', $args['id'])
                                     ->first();
            if ($usuarioExistente) {
                $response->getBody()->write(json_encode(['error' => 'El empleado ya está asociado a otro usuario']));
                return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
            }
            
            $usuario->empleado_id = $data['empleado_id'];
        }
        
        if (isset($data['rol_id'])) {
            $rol = Rol::find($data['rol_id']);
            if (!$rol) {
                $response->getBody()->write(json_encode(['error' => 'El rol especificado no existe']));
                return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
            }
            $usuario->rol_id = $data['rol_id'];
        }
        
        if (isset($data['password']) && !empty($data['password'])) {
            $usuario->password = password_hash($data['password'], PASSWORD_DEFAULT);
        }
        
        if (isset($data['activo'])) {
            $usuario->activo = $data['activo'];
        }
        
        $usuario->save();
        $usuario->load('rol');
        
        $response->getBody()->write(json_encode([
            'success' => true,
            'mensaje' => 'Usuario actualizado exitosamente',
            'usuario' => $usuario
        ]));
        return $response->withHeader('Content-Type', 'application/json');
        
    } catch (Exception $e) {
        error_log('Error actualizando usuario: ' . $e->getMessage());
        $response->getBody()->write(json_encode(['error' => 'Error interno del servidor']));
        return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
    }
});

// Desactivar usuario (soft delete)
$app->delete('/usuarios/{id}', function ($request, $response, $args) {
    try {
        $usuario = Usuario::find($args['id']);
        if (!$usuario) {
            $response->getBody()->write(json_encode(['error' => 'Usuario no encontrado']));
            return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
        }
        
        $usuario->activo = false;
        $usuario->save();
        
        $response->getBody()->write(json_encode([
            'success' => true,
            'mensaje' => 'Usuario desactivado exitosamente'
        ]));
        return $response->withHeader('Content-Type', 'application/json');
        
    } catch (Exception $e) {
        error_log('Error desactivando usuario: ' . $e->getMessage());
        $response->getBody()->write(json_encode(['error' => 'Error interno del servidor']));
        return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
    }
});

// Endpoint para obtener lista de usuarios activos para login
$app->get('/usuarios-login', function ($request, $response) {
    try {
        $usuarios = Usuario::join('maestros', 'usuarios.empleado_id', '=', 'maestros.id')
            ->join('roles', 'usuarios.rol_id', '=', 'roles.id')
            ->where('usuarios.activo', true)
            ->where('maestros.tipo', 'empleado')
            ->select('usuarios.id', 'maestros.dni', 'maestros.nombre as empleado_nombre', 'roles.nombre as rol_nombre')
            ->orderBy('maestros.nombre')
            ->get();
            
        $response->getBody()->write(json_encode($usuarios));
        return $response->withHeader('Content-Type', 'application/json');
        
    } catch (Exception $e) {
        error_log('Error obteniendo usuarios para login: ' . $e->getMessage());
        $response->getBody()->write(json_encode(['error' => 'Error interno del servidor']));
        return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
    }
});

// Endpoint de login
$app->post('/login', function ($request, $response) {
    try {
        $data = $request->getParsedBody();
        error_log('Intento de login: ' . json_encode($data));
        
        if (!isset($data['usuario_id']) || !isset($data['password'])) {
            $response->getBody()->write(json_encode(['error' => 'Usuario y password son requeridos']));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }
        
        // Buscar usuario por ID
        $usuario = Usuario::join('maestros', 'usuarios.empleado_id', '=', 'maestros.id')
            ->join('roles', 'usuarios.rol_id', '=', 'roles.id')
            ->where('usuarios.id', $data['usuario_id'])
            ->where('usuarios.activo', true)
            ->select('usuarios.*', 'maestros.nombre as empleado_nombre', 'maestros.dni', 'roles.nombre as rol_nombre')
            ->first();
            
        if (!$usuario) {
            $response->getBody()->write(json_encode(['error' => 'Usuario no encontrado o inactivo']));
            return $response->withStatus(401)->withHeader('Content-Type', 'application/json');
        }
        
        // Verificar password
        if (!password_verify($data['password'], $usuario->password)) {
            $response->getBody()->write(json_encode(['error' => 'Password incorrecto']));
            return $response->withStatus(401)->withHeader('Content-Type', 'application/json');
        }
        
        // Login exitoso - crear sesión simple
        session_start();
        $_SESSION['user_id'] = $usuario->id;
        $_SESSION['user_dni'] = $usuario->dni;
        $_SESSION['user_nombre'] = $usuario->empleado_nombre;
        $_SESSION['user_rol'] = $usuario->rol_nombre;
        $_SESSION['rol_id'] = $usuario->rol_id;
        $_SESSION['empleado_id'] = $usuario->empleado_id;
        
        $response->getBody()->write(json_encode([
            'success' => true,
            'usuario' => [
                'id' => $usuario->id,
                'dni' => $usuario->dni,
                'nombre' => $usuario->empleado_nombre,
                'rol' => $usuario->rol_nombre,
                'rol_id' => $usuario->rol_id,
                'empleado_id' => $usuario->empleado_id
            ]
        ]));
        return $response->withHeader('Content-Type', 'application/json');
        
    } catch (Exception $e) {
        error_log('Error en login: ' . $e->getMessage());
        $response->getBody()->write(json_encode(['error' => 'Error interno del servidor']));
        return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
    }
});

// Endpoint de logout
$app->post('/logout', function ($request, $response) {
    session_start();
    session_destroy();
    
    $response->getBody()->write(json_encode(['success' => true, 'mensaje' => 'Sesión cerrada']));
    return $response->withHeader('Content-Type', 'application/json');
});

// Endpoint para verificar sesión
$app->get('/session', function ($request, $response) {
    session_start();
    
    if (!isset($_SESSION['user_id'])) {
        $response->getBody()->write(json_encode(['authenticated' => false]));
        return $response->withStatus(401)->withHeader('Content-Type', 'application/json');
    }
    
    $userData = [
        'id' => $_SESSION['user_id'],
        'dni' => $_SESSION['user_dni'],
        'nombre' => $_SESSION['user_nombre'],
        'rol' => $_SESSION['user_rol'],
        'rol_id' => $_SESSION['rol_id'],
        'empleado_id' => $_SESSION['empleado_id']
    ];
    
    // Si el usuario tiene rol de tienda, obtener las tiendas asociadas
    if ($_SESSION['user_rol'] === 'tienda') {
        try {
            // Obtener tiendas vinculadas a este usuario
            $usuarioId = $_SESSION['user_id'];
            $tiendasVinculadas = DB::table('usuarios_tiendas')
                ->where('usuario_id', $usuarioId)
                ->get();
                
            $tiendas = [];
            foreach ($tiendasVinculadas as $vinculo) {
                $tienda = Maestro::where('id', $vinculo->tienda_id)
                    ->where('tipo', 'tienda')
                    ->first();
                
                if ($tienda) {
                    $tiendas[] = [
                        'id' => $tienda->id,
                        'nombre' => $tienda->nombre
                    ];
                }
            }
            
            // Añadir las tiendas al array de usuario
            $userData['tiendas'] = $tiendas;
        } catch (Exception $e) {
            error_log('Error obteniendo tiendas del usuario: ' . $e->getMessage());
        }
    }
    
    $response->getBody()->write(json_encode([
        'authenticated' => true,
        'usuario' => $userData
    ]));
    return $response->withHeader('Content-Type', 'application/json');
});

// Rutas para la gestión de usuarios en tiendas
$app->get('/tiendas/{id}/usuarios', function ($request, $response, $args) {
    $tiendaId = (int)$args['id'];
    
    try {
        // Verificar si la tienda existe
        $tienda = Maestro::where('id', $tiendaId)
            ->where('tipo', 'tienda')
            ->first();
            
        if (!$tienda) {
            throw new Exception("Tienda no encontrada");
        }
        
        // Obtener usuarios vinculados a esta tienda
        $usuariosTienda = DB::table('usuarios_tiendas')
            ->where('tienda_id', $tiendaId)
            ->get();
            
        // Obtener información completa de los usuarios
        $usuariosInfo = [];
        foreach ($usuariosTienda as $ut) {
            $usuario = Usuario::with('empleado', 'rol')->find($ut->usuario_id);
            if ($usuario) {
                $usuariosInfo[] = [
                    'id' => $usuario->id,
                    'dni' => $usuario->empleado ? $usuario->empleado->dni : null,
                    'nombre' => $usuario->empleado ? $usuario->empleado->nombre : 'Sin nombre',
                    'rol' => $usuario->rol ? $usuario->rol->nombre : 'Sin rol',
                    'tienda_id' => $tiendaId,
                    'tienda_nombre' => $tienda->nombre
                ];
            }
        }
        
        $response->getBody()->write(json_encode([
            'tienda' => $tienda,
            'usuarios' => $usuariosInfo
        ]));
        return $response->withHeader('Content-Type', 'application/json');
    } catch (Exception $e) {
        $response->getBody()->write(json_encode(['error' => $e->getMessage()]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
    }
});

$app->post('/tiendas/{id}/usuarios', function ($request, $response, $args) {
    $tiendaId = (int)$args['id'];
    $data = $request->getParsedBody();
    $usuarioIds = isset($data['usuario_ids']) ? (array)$data['usuario_ids'] : [];
    
    try {
        // Verificar si la tienda existe
        $tienda = Maestro::where('id', $tiendaId)
            ->where('tipo', 'tienda')
            ->first();
            
        if (!$tienda) {
            throw new Exception("Tienda no encontrada");
        }
        
        // Iniciar transacción
        DB::beginTransaction();
        
        // Eliminar todas las vinculaciones actuales para esta tienda
        DB::table('usuarios_tiendas')->where('tienda_id', $tiendaId)->delete();
        
        // Crear las nuevas vinculaciones
        $vinculaciones = [];
        foreach ($usuarioIds as $usuarioId) {
            // Verificar que el usuario exista y tenga rol de tienda
            $usuario = Usuario::with('rol')->find($usuarioId);
            if ($usuario && $usuario->rol && $usuario->rol->nombre === 'tienda') {
                DB::table('usuarios_tiendas')->insert([
                    'usuario_id' => $usuarioId,
                    'tienda_id' => $tiendaId,
                    'created_at' => date('Y-m-d H:i:s'),
                    'updated_at' => date('Y-m-d H:i:s')
                ]);
                $vinculaciones[] = $usuarioId;
            }
        }
        
        // Confirmar transacción
        DB::commit();
        
        $response->getBody()->write(json_encode([
            'success' => true,
            'mensaje' => 'Usuarios vinculados correctamente',
            'tienda_id' => $tiendaId,
            'usuarios_vinculados' => $vinculaciones
        ]));
        return $response->withHeader('Content-Type', 'application/json');
    } catch (Exception $e) {
        // Revertir en caso de error
        DB::rollBack();
        
        $response->getBody()->write(json_encode(['error' => $e->getMessage()]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
    }
});

// ===== RUTAS DE INVENTARIO INICIAL =====

// Obtener familias de productos
$app->get('/familias', function ($request, $response) {
    try {
        $familias = FamiliaProducto::where('activo', true)->orderBy('nombre')->get();
        $response->getBody()->write(json_encode([
            'success' => true,
            'familias' => $familias
        ]));
        return $response->withHeader('Content-Type', 'application/json');
    } catch (Exception $e) {
        $response->getBody()->write(json_encode([
            'success' => false,
            'message' => $e->getMessage(),
            'familias' => []
        ]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
    }
});

// Obtener productos agrupados por familia para una tienda
$app->get('/inventario/productos/{tiendaId}', function ($request, $response, $args) {
    $tiendaIdOrName = $args['tiendaId'];
    
    try {
        // Verificar que la tienda existe (buscar por ID o por nombre)
        $tienda = null;
        if (is_numeric($tiendaIdOrName)) {
            // Buscar por ID
            $tienda = Maestro::where('id', $tiendaIdOrName)->where('tipo', 'tienda')->first();
        } else {
            // Buscar por nombre
            $tienda = Maestro::where('nombre', $tiendaIdOrName)->where('tipo', 'tienda')->first();
        }
        
        if (!$tienda) {
            throw new Exception("Tienda '$tiendaIdOrName' no encontrada");
        }
        
        // Verificar si hay familias creadas
        $familiasCount = FamiliaProducto::where('activo', true)->count();
        if ($familiasCount === 0) {
            $response->getBody()->write(json_encode([
                'success' => false,
                'message' => 'No hay familias de productos creadas. Crea familias primero en la sección de Gestión de Familias.',
                'familias' => []
            ]));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
        }
        
        // Obtener productos con sus familias
        $productos = Maestro::with('familia')
            ->where('tipo', 'producto')
            ->where('activo', true)
            ->orderBy('familia_id')
            ->orderBy('nombre')
            ->get();
            
        if ($productos->isEmpty()) {
            $response->getBody()->write(json_encode([
                'success' => false,
                'message' => 'No hay productos registrados.',
                'familias' => []
            ]));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
        }
            
        // Agrupar por familia
        $productosPorFamilia = [];
        foreach ($productos as $producto) {
            $familiaId = $producto->familia_id ?: 0;
            $familiaNombre = $producto->familia ? $producto->familia->nombre : 'Sin Familia';
            
            if (!isset($productosPorFamilia[$familiaId])) {
                $productosPorFamilia[$familiaId] = [
                    'familia' => $familiaNombre,
                    'productos' => []
                ];
            }
            
            $productosPorFamilia[$familiaId]['productos'][] = [
                'id' => $producto->id,
                'nombre' => $producto->nombre
            ];
        }
        
        $response->getBody()->write(json_encode([
            'success' => true,
            'familias' => array_values($productosPorFamilia)
        ]));
        return $response->withHeader('Content-Type', 'application/json');
        
    } catch (Exception $e) {
        $response->getBody()->write(json_encode([
            'success' => false,
            'message' => $e->getMessage(),
            'familias' => []
        ]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
    }
});

// Obtener inventario inicial de una fecha específica para una tienda
$app->get('/inventario/{tiendaId}/{fecha}', function ($request, $response, $args) {
    $tiendaIdOrName = $args['tiendaId'];
    $fecha = $args['fecha'];
    
    try {
        // Buscar la tienda por ID o nombre para obtener el ID real
        $tienda = null;
        if (is_numeric($tiendaIdOrName)) {
            $tienda = Maestro::where('id', $tiendaIdOrName)->where('tipo', 'tienda')->first();
        } else {
            $tienda = Maestro::where('nombre', $tiendaIdOrName)->where('tipo', 'tienda')->first();
        }
        
        if (!$tienda) {
            throw new Exception("Tienda '$tiendaIdOrName' no encontrada");
        }
        
        $inventarios = InventarioInicial::with(['producto', 'usuario.empleado'])
            ->where('tienda_id', $tienda->id)
            ->where('fecha', $fecha)
            ->get();
            
        $response->getBody()->write(json_encode($inventarios));
        return $response->withHeader('Content-Type', 'application/json');
        
    } catch (Exception $e) {
        $response->getBody()->write(json_encode(['error' => $e->getMessage()]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
    }
});

// Registrar inventario inicial
$app->post('/inventario', function ($request, $response) {
    try {
        $data = $request->getParsedBody();
        
        // Validar datos requeridos
        if (!isset($data['fecha'], $data['tienda_id'], $data['productos'])) {
            throw new Exception("Datos incompletos");
        }
        
        // Buscar la tienda por ID o nombre para obtener el ID real
        $tienda = null;
        if (is_numeric($data['tienda_id'])) {
            $tienda = Maestro::where('id', $data['tienda_id'])->where('tipo', 'tienda')->first();
        } else {
            $tienda = Maestro::where('nombre', $data['tienda_id'])->where('tipo', 'tienda')->first();
        }
        
        if (!$tienda) {
            throw new Exception("Tienda '{$data['tienda_id']}' no encontrada");
        }
        
        $tiendaId = $tienda->id;
        
        // Obtener el usuario actual desde headers
        $headers = $request->getHeaders();
        $sessionData = isset($headers['X-Session']) ? json_decode($headers['X-Session'][0], true) : null;
        $usuarioId = $sessionData['usuario']['id'] ?? null;
        
        if (!$usuarioId) {
            throw new Exception("Usuario no identificado");
        }
        
        DB::beginTransaction();
        
        // Eliminar inventarios existentes para esta fecha y tienda
        InventarioInicial::where('fecha', $data['fecha'])
            ->where('tienda_id', $tiendaId)
            ->delete();
        
        // Insertar nuevos inventarios
        $inventarios = [];
        foreach ($data['productos'] as $productoData) {
            if (isset($productoData['producto_id'], $productoData['cantidad_inicial']) && 
                $productoData['cantidad_inicial'] >= 0) {
                
                $inventarios[] = [
                    'fecha' => $data['fecha'],
                    'tienda_id' => $tiendaId,
                    'producto_id' => $productoData['producto_id'],
                    'cantidad_inicial' => $productoData['cantidad_inicial'],
                    'usuario_id' => $usuarioId,
                    'observaciones' => $productoData['observaciones'] ?? null,
                    'created_at' => date('Y-m-d H:i:s'),
                    'updated_at' => date('Y-m-d H:i:s')
                ];
            }
        }
        
        if (empty($inventarios)) {
            throw new Exception("No hay productos válidos para registrar");
        }
        
        DB::table('inventario_inicial')->insert($inventarios);
        
        DB::commit();
        
        $response->getBody()->write(json_encode([
            'mensaje' => 'Inventario inicial registrado exitosamente',
            'productos_registrados' => count($inventarios)
        ]));
        return $response->withHeader('Content-Type', 'application/json');
        
    } catch (Exception $e) {
        DB::rollBack();
        $response->getBody()->write(json_encode(['error' => $e->getMessage()]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
    }
});

// Gestión de familias (solo admin)
$app->post('/familias', function ($request, $response) {
    try {
        $data = $request->getParsedBody();
        
        if (!isset($data['nombre'])) {
            throw new Exception("Nombre de familia requerido");
        }
        
        $familia = FamiliaProducto::create([
            'nombre' => $data['nombre'],
            'descripcion' => $data['descripcion'] ?? null,
            'activo' => true
        ]);
        
        $response->getBody()->write(json_encode([
            'success' => true,
            'familia' => $familia,
            'message' => 'Familia creada exitosamente'
        ]));
        return $response->withHeader('Content-Type', 'application/json');
        
    } catch (Exception $e) {
        $response->getBody()->write(json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
    }
});

// Actualizar familia
$app->put('/familias/{id}', function ($request, $response, $args) {
    try {
        $familiaId = (int)$args['id'];
        $data = $request->getParsedBody();
        
        $familia = FamiliaProducto::find($familiaId);
        if (!$familia) {
            throw new Exception("Familia no encontrada");
        }
        
        if (isset($data['nombre'])) {
            $familia->nombre = $data['nombre'];
        }
        if (isset($data['descripcion'])) {
            $familia->descripcion = $data['descripcion'];
        }
        
        $familia->save();
        
        $response->getBody()->write(json_encode([
            'success' => true,
            'familia' => $familia,
            'message' => 'Familia actualizada exitosamente'
        ]));
        return $response->withHeader('Content-Type', 'application/json');
        
    } catch (Exception $e) {
        $response->getBody()->write(json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
    }
});

// Eliminar familia
$app->delete('/familias/{id}', function ($request, $response, $args) {
    try {
        $familiaId = (int)$args['id'];
        
        $familia = FamiliaProducto::find($familiaId);
        if (!$familia) {
            throw new Exception("Familia no encontrada");
        }
        
        // Verificar si hay productos asignados a esta familia
        $productosAsignados = Maestro::where('familia_id', $familiaId)->count();
        if ($productosAsignados > 0) {
            throw new Exception("No se puede eliminar la familia porque tiene productos asignados");
        }
        
        $familia->delete();
        
        $response->getBody()->write(json_encode([
            'success' => true,
            'message' => 'Familia eliminada exitosamente'
        ]));
        return $response->withHeader('Content-Type', 'application/json');
        
    } catch (Exception $e) {
        $response->getBody()->write(json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
    }
});

// Asignar familia a producto
$app->put('/productos/{id}/familia', function ($request, $response, $args) {
    try {
        $productoId = (int)$args['id'];
        $data = $request->getParsedBody();
        $producto = Maestro::where('id', $productoId)->where('tipo', 'producto')->first();
        if (!$producto) {
            throw new Exception("Producto no encontrado");
        }
        $producto->familia_id = $data['familia_id'] ?? null;
        $producto->save();
        $response->getBody()->write(json_encode(['mensaje' => 'Familia asignada exitosamente']));
        return $response->withHeader('Content-Type', 'application/json');
    } catch (Exception $e) {
        $response->getBody()->write(json_encode(['error' => $e->getMessage()]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
    }
});

// Ruta específica para header.php (puedes agregar más rutas similares aquí)
$app->get('/header.php', function ($request, $response, $args) {
    $path = __DIR__ . '/header.php';
    if (file_exists($path)) {
        ob_start();
        include $path;
        $html = ob_get_clean();
        $response->getBody()->write($html);
        return $response->withHeader('Content-Type', 'text/html');
    } else {
        return $response->withStatus(404)->write('Archivo no encontrado');
    }
});

$app->run();
