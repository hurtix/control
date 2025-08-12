<?php include 'header.php'; ?>

<?php include 'auth-header.php'; ?>

<main class="bg-white">


<!-- <h1>Control de Panadería</h1> -->








<h2>Consultas y Reportes</h2>
<button class="btn-outline" onclick="consultar('pedidos')">Consultar Pedidos</button>
<button class="btn-outline" onclick="consultar('produccion')">Consultar Producción</button>
<button class="btn-outline" onclick="consultar('despacho')">Consultar Despachos</button>
<button class="btn-outline" onclick="consultar('recepcion')">Consultar Recepciones</button>
<button class="btn-outline" onclick="consultar('alertas')">Ver Alertas</button>
<div class="endpoint">GET /pedidos, /produccion, /despacho, /recepcion, /alertas</div>
<div id="result-consultas" class="result"></div>

<div>
    <h2>Trazabilidad</h2>
    <div class="flex gap-x-4">
        <div class="w-1/6">
            <form id="form-traza">
                <div class="grid gap-3">
                    <label class="label">Lote</label>
                    <select class="select w-full" name="lote" id="select-lote-traza">
                        <option value="">-- Seleccionar lote --</option>
                    </select>
                    <button class="btn" type="submit">Consultar Trazabilidad</button>
                </div>
                <div class="endpoint">GET /traza/lote/{lote_id}</div>
            </form>
        </div>
        <div class="w-5/6">
            <div id="result-traza" class="result card p-4 min-h-[400px]"></div>
        </div>
    </div>
</div>


<!-- Sección de Gestión de Familias de Productos -->
<div id="seccion-familias" class="mt-8">
    <h2>Gestión de Familias de Productos</h2>
    <p class="text-sm text-gray-600 mb-4">
        Administra las familias de productos para organizar el inventario. Solo administradores pueden acceder a esta función.
    </p>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2em; margin-top: 1em;">
        <!-- Crear Familia -->
        <div>
            <h3>Crear Nueva Familia</h3>
            <form id="form-nueva-familia">
                <div class="grid gap-3">
                    <label class="label">Nombre de la Familia</label>
                    <input class="input" type="text" name="nombre" placeholder="ej. Panadería" required>
                </div>
                <div class="grid gap-3">
                    <label class="label">Descripción</label>
                    <textarea class="textarea" name="descripcion" placeholder="Descripción de la familia (opcional)"></textarea>
                </div>
                <button class="btn mt-4" type="submit">Crear Familia</button>
            </form>
            <div id="result-nueva-familia" class="result mt-4"></div>
        </div>

        <!-- Lista de Familias -->
        <div>
            <h3>Familias Existentes</h3>
            <button class="btn-outline mb-4" onclick="cargarFamilias()">Actualizar Lista</button>
            <div id="lista-familias" class="result"></div>
        </div>
    </div>

    <!-- Editar Familia -->
    <div id="form-editar-familia-container" style="display: none; margin-top: 2em; padding: 1em; border: 1px solid #ddd; border-radius: 8px;">
        <h3>Editar Familia</h3>
        <form id="form-editar-familia">
            <input type="hidden" name="id">
            <div class="grid gap-3">
                <label class="label">Nombre de la Familia</label>
                <input class="input" type="text" name="nombre" required>
            </div>
            <div class="grid gap-3">
                <label class="label">Descripción</label>
                <textarea class="textarea" name="descripcion"></textarea>
            </div>
            <div class="flex gap-2 mt-4">
                <button class="btn" type="submit">Guardar Cambios</button>
                <button class="btn-outline" type="button" onclick="cancelarEdicionFamilia()">Cancelar</button>
            </div>
        </form>
        <div id="result-editar-familia" class="result mt-4"></div>
    </div>
</div>



<h2>Gestión de Datos Maestros</h2>
<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2em; margin-top: 1em;">

    <div>
        <h3>Productos</h3>
        <form id="form-producto">
            <div class="grid gap-3">
                <label class="label">Nombre del Producto</label>
                <input class="input" type="text" name="nombre" required placeholder="Ej: Pan Integral">
            </div>
            <div class="grid gap-3">
                <label class="label">Familia de Producto</label>
                <select class="select" name="familia_id" id="familia-select-producto">
                    <option value="">-- Sin familia asignada --</option>
                </select>
                <small style="color: #6c757d; font-size: 0.8em;">Opcional: Selecciona una familia para organizar mejor el inventario</small>
            </div>
            <button class="btn" type="submit">Agregar Producto</button>
            <div class="endpoint">POST /maestros/producto</div>
        </form>
        <div id="result-producto" class="result"></div>
    </div>

    <div>
        <h3>Empleados</h3>
        <form id="form-empleado-maestro">
            <div class="grid gap-3">
                <label class="label">DNI</label>
                <input class="input" type="text" name="dni" pattern="[0-9]{7,8}" title="Solo números, 7-8 dígitos" required
                    placeholder="12345678">
            </div>
            <div class="grid gap-3">
                <label class="label">Nombre del Empleado</label>
                <input class="input" type="text" name="nombre" required placeholder="Ej: Juan Pérez">
            </div>
            <button class="btn" type="submit">Agregar Empleado</button>
            <div class="endpoint">POST /maestros/empleado</div>
        </form>
        <div id="result-empleado-maestro" class="result"></div>
    </div>

    <div>
        <h3>Tiendas</h3>
        <form id="form-tienda-maestro">
            <div class="grid gap-3">
                <label class="label">Nombre de la Tienda</label>
                <input class="input" type="text" name="nombre" required placeholder="Ej: Sucursal Norte">
            </div>
            <button class="btn" type="submit">Agregar Tienda</button>
            <div class="endpoint">POST /maestros/tienda</div>
        </form>
        <div id="result-tienda-maestro" class="result"></div>
    </div>

</div>

<h2>Datos Maestros Registrados</h2>
<div style="margin-top: 1em;">
    <button class="btn-outline" onclick="verMaestros('all')">📋 Ver Todos</button>
    <button class="btn-outline" onclick="verMaestros('producto')">📦 Productos</button>
    <button class="btn-outline" onclick="verMaestros('empleado')">👥 Empleados</button>
    <button class="btn-outline" onclick="verMaestros('tienda')">🏪 Tiendas</button>
    <div class="endpoint">GET /maestros</div>
</div>
<div id="result-maestros-list" class="result"></div>

<h2>Administración de Roles</h2>
<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2em; margin-top: 1em;">

    <!-- Gestión de Roles -->
    <div>
        <h3>Gestión de Roles</h3>

        <!-- Crear nuevo rol -->
        <form id="form-nuevo-rol">
            <div class="grid gap-3">
                <label class="label">Nombre del Rol</label>
                <input class="input" type="text" name="nombre" required>
            </div>
            <div class="grid gap-3">
                <label class="label">Descripción</label>
                <input class="input" type="text" name="descripcion" required>
            </div>
            <button class="btn" type="submit">Crear Rol</button>
            <div class="endpoint">POST /roles</div>
        </form>
        <div id="result-nuevo-rol" class="result"></div>

        <!-- Listar roles -->
        <div style="margin-top: 2em;">
            <button class="btn-outline" onclick="listarRoles()">Ver Roles</button>
            <div class="endpoint">GET /roles</div>
        </div>
        <div id="result-roles" class="result"></div>
    </div>

    <!-- Gestión de Permisos -->
    <div>
        <h3>Gestión de Permisos</h3>

        <!-- Crear nuevo permiso -->
        <form id="form-nuevo-permiso">
            <div class="grid gap-3">
                <label class="label">Endpoint</label>
                <input class="input" type="text" name="endpoint" placeholder="/nuevo-endpoint" required>
            </div>
            <div class="grid gap-3">
                <label class="label">Método</label>
                <select class="select" name="metodo">
                    <option value="*">Todos (*)</option>
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                </select>
                </label>
                <div class="grid gap-3">
                    <label class="label">Descripción</label>
                    <input class="input" type="text" name="descripcion" required>
                </div>
                <button class="btn" type="submit">Crear Permiso</button>
                <div class="endpoint">POST /permisos</div>
        </form>
        <div id="result-nuevo-permiso" class="result"></div>

        <!-- Listar permisos -->
        <div style="margin-top: 2em;">
            <button class="btn-outline" onclick="listarPermisos()">Ver Permisos</button>
            <div class="endpoint">GET /permisos</div>
        </div>
        <div id="result-permisos" class="result"></div>
    </div>
</div>

<!-- Asignación de Permisos a Roles -->
<div style="margin-top: 2em;">
    <h3>Asignar Permisos a Roles</h3>
    <form id="form-asignar-permisos">
        <div class="form-row">
            <div class="grid gap-3">
                <label class="label">Rol</label>
                <select id="select-rol-permisos" class="select" name="rol_id" required></select>
            </div>
            <button class="btn-outline" type="button" onclick="cargarPermisosDelRol()">Ver Permisos Actuales</button>
        </div>

        <div id="permisos-disponibles"
            style="margin-top: 1em; max-height: 200px; overflow-y: auto; border: 1px solid #ddd; padding: 1em; background: #f9f9f9;">
            <p>Selecciona un rol para ver los permisos disponibles</p>
        </div>

        <button class="btn" type="submit">Asignar Permisos Seleccionados</button>
        <div class="endpoint">POST /roles/{id}/permisos</div>
    </form>
    <div id="result-asignar-permisos" class="result"></div>
</div>

<!-- Verificador de Permisos -->
<div style="margin-top: 2em;">
    <h3>Verificar Permisos</h3>
    <form id="form-verificar-permiso">
        <div class="form-row">
            <div class="grid gap-3">
                <label class="label">Rol</label>
                <input class="input" type="text" name="rol_nombre" placeholder="admin" required>
            </div>
            <div class="grid gap-3">
                <label class="label">Endpoint</label>
                <input class="input" type="text" name="endpoint" placeholder="/pedidos" required>
            </div>
            <div class="grid gap-3">
                <label class="label">Método</label>
                <select class="select" name="metodo">
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                </select>
                </label>
                <button class="btn" type="submit">Verificar</button>
            </div>
            <!-- <div class="endpoint">GET /roles/{nombre}/permiso</div> -->
    </form>
    <div id="result-verificar-permiso" class="result"></div>
</div>

<h2>Gestión de Usuarios</h2>
<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2em; margin-top: 1em;">

    <!-- Crear Usuario -->
    <div>
        <h3>Crear Usuario</h3>
        <form id="form-nuevo-usuario">
            <div class="grid gap-3">
                <label class="label">Empleado</label>
                <select class="select" name="empleado_id" id="select-empleado-usuario" required>
                    <option value="">-- Seleccionar empleado --</option>
                </select>
            </div>
            <div class="grid gap-3">
                <label class="label">Password</label>
                <input class="input" type="password" name="password" required>
            </div>
            <div class="grid gap-3">
                <label class="label">Rol</label>
                <select class="select" name="rol_id" id="select-rol-usuario" required onchange="mostrarCampoTienda()">
                    <option value="">-- Seleccionar rol --</option>
                </select>
            </div>

            <div id="campo-tienda-usuario" style="display: none;">
                <label class="label">Tienda</label>
                <select name="tienda_id" id="select-tienda-usuario">
                    <option value="">-- Seleccionar tienda --</option>
                </select>
                <p style="color: #dc3545; font-size: 0.9em; margin-top: 0.3em;">
                    ⚠️ El usuario solo tendrá acceso a la tienda seleccionada
                </p>
            </div>
            <p style="color: #666; font-size: 0.9em; margin-top: 0.5em;">
                El usuario se crea para el empleado seleccionado. El DNI y nombre se toman del empleado.
            </p>
            <button class="btn" type="submit">Crear Usuario</button>
            <div class="endpoint">POST /usuarios</div>
        </form>
        <div id="result-nuevo-usuario" class="result"></div>
    </div>

    <!-- Listar Usuarios -->
    <div>
        <h3>Usuarios Registrados</h3>
        <button class="btn-outline" onclick="listarUsuarios()">Ver Usuarios</button>
        <div class="endpoint">GET /usuarios</div>
        <div id="result-usuarios" class="result"></div>
    </div>
</div>

<!-- Editar Usuario -->
<div style="margin-top: 2em;">
    <h3>Editar Usuario</h3>
    <form id="form-editar-usuario" style="display: none;">
        <input type="hidden" name="id">
        <div class="grid gap-3">
            <label class="label">Empleado </label>
            <select class="select" name="empleado_id" id="select-empleado-editar" required>
                <option value="">-- Seleccionar empleado --</option>
            </select>
            <div class="grid gap-3">
                <label class="label">Nuevo Password (opcional)</label>
                <input class="input" type="password" name="password" placeholder="Dejar vacío para mantener el actual">
            </div>
        </div>
        <div class="grid gap-3">
            <label class="label">Rol </label>
            <select class="select" name="rol_id" id="select-rol-editar" required onchange="mostrarCampoTiendaEditar()">
                <option value="">-- Seleccionar rol --</option>
            </select>
        </div>
        <div class="grid gap-3">
            <label class="label">Estado </label>
            <select class="select" name="activo" required>
                <option value="1">Activo</option>
                <option value="0">Inactivo</option>
            </select>
        </div>
        <div id="campo-tienda-usuario-editar" style="display: none; margin-top: 0.5em;">
            <label>Tienda
                <select name="tienda_id" id="select-tienda-editar">
                    <option value="">-- Seleccionar tienda --</option>
                </select>
            </label>
            <p style="color: #dc3545; font-size: 0.9em; margin-top: 0.3em;">
                ⚠️ El usuario solo tendrá acceso a la tienda seleccionada
            </p>
        </div>
        <div class="form-row">
            <button class="btn-secondary" type="button" onclick="cancelarEdicionUsuario()">Cancelar</button>
            <button class="btn" type="submit">Actualizar Usuario</button>
        </div>
        <div class="endpoint">PUT /usuarios/{id}</div>
    </form>
    <div id="result-editar-usuario" class="result"></div>
</div>
</main>
<?php include 'footer.php'; ?>