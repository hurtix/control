<?php
// Router para el servidor PHP built-in
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Si es un archivo estático existente, lo servimos directamente
if ($uri !== '/' && file_exists(__DIR__ . $uri)) {
    return false; // Dejar que el servidor built-in maneje archivos estáticos
}

// Lista de rutas de API que deben ir a index.php (Slim)
$apiRoutes = [
    '/opciones/',  // Vuelvo a poner con slash para que capture /opciones/empleados, /opciones/productos, etc.
    '/roles',
    '/maestros',
    '/lotes',  
    '/pedidos',
    '/produccion',
    '/despacho',
    '/recepcion',
    '/permisos',
    '/login',
    '/logout',
    '/session',
    '/usuarios-login',
    '/usuarios',
    '/traza/',
    '/alertas'
];

// Verificar si la URI coincide con alguna ruta de API
$isApiRoute = false;
foreach ($apiRoutes as $route) {
    // Para rutas que terminan en '/', verificar si la URI comienza con esa ruta
    if (substr($route, -1) === '/') {
        if (strpos($uri, $route) === 0) {
            $isApiRoute = true;
            break;
        }
    } else {
        // Para rutas exactas, verificar coincidencia exacta o que sea una subruta
        if ($uri === $route || strpos($uri, $route . '/') === 0) {
            $isApiRoute = true;
            break;
        }
    }
}

if ($isApiRoute) {
    // Para rutas de API, usar index.php (Slim)
    require __DIR__ . '/index.php';
} else {
    // Para rutas HTML, servir el archivo correspondiente
    if ($uri === '/') {
        require __DIR__ . '/index.html';
    } else {
        $file = __DIR__ . $uri;
        if (file_exists($file) && pathinfo($file, PATHINFO_EXTENSION) === 'html') {
            require $file;
        } else {
            http_response_code(404);
            echo '404 Not Found';
        }
    }
}
?>
