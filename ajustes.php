<?php include 'header.php'; ?>

<?php include 'auth-header.php'; ?>

<main class="bg-white">


<!-- <h1>Control de Panadería</h1> -->








<h2>Consultas y Reportes</h2>
<div class="border rounded p-4">
    <button class="btn" onclick="consultar('pedidos')">Consultar Pedidos</button>
    <button class="btn" onclick="consultar('produccion')">Consultar Producción</button>
    <button class="btn" onclick="consultar('despacho')">Consultar Despachos</button>
    <button class="btn" onclick="consultar('recepcion')">Consultar Recepciones</button>
    <button class="btn" onclick="consultar('alertas')">Ver Alertas</button>
    <div class="endpoint">GET /pedidos, /produccion, /despacho, /recepcion, /alertas</div>
    <div id="result-consultas" class="result"></div>
</div>

<h2>Trazabilidad</h2>
<div class="border rounded p-4">
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
            <div id="result-traza" class="result card p-4 min-h-[400px]">
                <div class="w-full h-full min-h-[400px] flex flex-col justify-center items-center text-center text-gray-500">
                <svg class="w-25 opacity-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M12 1.25C11.3953 1.25 10.8384 1.40029 10.2288 1.65242C9.64008 1.89588 8.95633 2.25471 8.1049 2.70153L6.03739 3.78651C4.99242 4.33487 4.15616 4.77371 3.51047 5.20491C2.84154 5.65164 2.32632 6.12201 1.95112 6.75918C1.57718 7.39421 1.40896 8.08184 1.32829 8.90072C1.24999 9.69558 1.24999 10.6731 1.25 11.9026V12.0974C1.24999 13.3268 1.24999 14.3044 1.32829 15.0993C1.40896 15.9182 1.57718 16.6058 1.95112 17.2408C2.32632 17.878 2.84154 18.3484 3.51047 18.7951C4.15616 19.2263 4.99241 19.6651 6.03737 20.2135L8.10481 21.2984C8.95628 21.7453 9.64006 22.1041 10.2288 22.3476C10.8384 22.5997 11.3953 22.75 12 22.75C12.6047 22.75 13.1616 22.5997 13.7712 22.3476C14.3599 22.1041 15.0437 21.7453 15.8951 21.2985L17.9626 20.2135C19.0076 19.6651 19.8438 19.2263 20.4895 18.7951C21.1585 18.3484 21.6737 17.878 22.0489 17.2408C22.4228 16.6058 22.591 15.9182 22.6717 15.0993C22.75 14.3044 22.75 13.3269 22.75 12.0975V11.9025C22.75 10.6731 22.75 9.69557 22.6717 8.90072C22.591 8.08184 22.4228 7.39421 22.0489 6.75918C21.6737 6.12201 21.1585 5.65164 20.4895 5.20491C19.8438 4.77371 19.0076 4.33487 17.9626 3.7865L15.8951 2.70154C15.0437 2.25472 14.3599 1.89589 13.7712 1.65242C13.1616 1.40029 12.6047 1.25 12 1.25ZM8.7708 4.04608C9.66052 3.57917 10.284 3.2528 10.802 3.03856C11.3062 2.83004 11.6605 2.75 12 2.75C12.3395 2.75 12.6938 2.83004 13.198 3.03856C13.716 3.2528 14.3395 3.57917 15.2292 4.04608L17.2292 5.09563C18.3189 5.66748 19.0845 6.07032 19.6565 6.45232C19.9387 6.64078 20.1604 6.81578 20.3395 6.99174L17.0088 8.65708L8.50895 4.18349L8.7708 4.04608ZM6.94466 5.00439L6.7708 5.09563C5.68111 5.66747 4.91553 6.07032 4.34352 6.45232C4.06131 6.64078 3.83956 6.81578 3.66054 6.99174L12 11.1615L15.3572 9.48289L7.15069 5.16369C7.07096 5.12173 7.00191 5.06743 6.94466 5.00439ZM2.93768 8.30737C2.88718 8.52125 2.84901 8.76413 2.82106 9.04778C2.75084 9.7606 2.75 10.6644 2.75 11.9415V12.0585C2.75 13.3356 2.75084 14.2394 2.82106 14.9522C2.88974 15.6494 3.02022 16.1002 3.24367 16.4797C3.46587 16.857 3.78727 17.1762 4.34352 17.5477C4.91553 17.9297 5.68111 18.3325 6.7708 18.9044L8.7708 19.9539C9.66052 20.4208 10.284 20.7472 10.802 20.9614C10.9656 21.0291 11.1134 21.0832 11.25 21.1255V12.4635L2.93768 8.30737ZM12.75 21.1255C12.8866 21.0832 13.0344 21.0291 13.198 20.9614C13.716 20.7472 14.3395 20.4208 15.2292 19.9539L17.2292 18.9044C18.3189 18.3325 19.0845 17.9297 19.6565 17.5477C20.2127 17.1762 20.5341 16.857 20.7563 16.4797C20.9798 16.1002 21.1103 15.6494 21.1789 14.9522C21.2492 14.2394 21.25 13.3356 21.25 12.0585V11.9415C21.25 10.6644 21.2492 9.7606 21.1789 9.04778C21.151 8.76412 21.1128 8.52125 21.0623 8.30736L17.75 9.96352V13C17.75 13.4142 17.4142 13.75 17 13.75C16.5858 13.75 16.25 13.4142 16.25 13V10.7135L12.75 12.4635V21.1255Z" fill="currentColor"></path> </g></svg>
                <small>Selecciona un lote para ver su trazabilidad</small>
                </div>
            </div>
        </div>
    </div>
</div>


<!-- Sección de Gestión de Familias de Productos -->
<div id="seccion-familias" class="mt-8">
    <h2>Gestión de Familias de Productos</h2>
    <p class="text-sm text-gray-600 mb-4">
        Administra las familias de productos para organizar el inventario. Solo administradores pueden acceder a esta función.
    </p>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-2 gap-4 border rounded p-4">
        <!-- Crear Familia -->
        <div>
            <h3>Crear Nueva Familia</h3>
            <div class="border rounded p-4">
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
        </div>

        <!-- Lista de Familias -->
        <div>
            <h3>Familias Existentes</h3>
            <div class="border rounded p-4">
            <button class="btn-outline mb-4" onclick="cargarFamilias()">Actualizar Lista</button>
            <div id="lista-familias" class="result"></div>
            </div>
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
<div class="grid grid-cols-3 gap-4 border rounded p-4">

    <div>
        <h3>Productos</h3>
        <div class="border rounded p-4">
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
    </div>

    <div>
        <h3>Empleados</h3>
        <div class="border rounded p-4">
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
    </div>

    <div>
        <h3>Tiendas</h3>
        <div class="border rounded p-4">
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

</div>
<h2>Datos Maestros Registrados</h2>
<div class="border rounded p-4">
    <div class="flex flex-col lg:flex-row gap-x-2">
        <button class="btn" onclick="verMaestros('all')">Ver Todos</button>
        <button class="btn" onclick="verMaestros('producto')">Productos</button>
        <button class="btn" onclick="verMaestros('empleado')">Empleados</button>
        <button class="btn" onclick="verMaestros('tienda')">Tiendas</button>
    </div>
    <div class="endpoint">GET /maestros</div>
    <div id="result-maestros-list" class="result"></div>
</div>
<h2>Administración de Roles</h2>
<div class="grid grid-cols-1 lg:grid-cols-2 gap-4 border rounded p-4">

    <!-- Gestión de Roles -->
    <div class="border rounded p-4">
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
        <div>
            <button class="btn-outline" onclick="listarRoles()">Ver Roles</button>
            <div class="endpoint">GET /roles</div>
        </div>
        <div id="result-roles" class="result"></div>
    </div>

    <!-- Gestión de Permisos -->
    <div class="border rounded p-4">
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
<div>
    <h3>Asignar Permisos a Roles</h3>
    <div class="border rounded p-4">
    <form id="form-asignar-permisos">
        <div class="form-row">
            <div class="grid gap-3">
                <label class="label">Rol</label>
                <select id="select-rol-permisos" class="select" name="rol_id" required></select>
            </div>
            <button class="btn-outline" type="button" onclick="cargarPermisosDelRol()">Ver Permisos Actuales</button>
        </div>

        <div id="permisos-disponibles" class="alert my-4">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M11.292 3.30809C10.8982 3.82224 10.4538 4.61551 9.80827 5.77355L9.48057 6.36141C9.46082 6.39684 9.44132 6.43194 9.42201 6.4667C9.12127 7.0079 8.86745 7.46469 8.45844 7.77518C8.04503 8.08901 7.54106 8.20227 6.95535 8.3339C6.91771 8.34235 6.87973 8.35089 6.84141 8.35956L6.20506 8.50354C4.94974 8.78757 4.09576 8.98299 3.51082 9.21351C2.94002 9.43845 2.81953 9.62275 2.77361 9.77044C2.72514 9.9263 2.7237 10.1647 3.06494 10.7068C3.41129 11.257 3.99558 11.9432 4.85011 12.9425L5.28393 13.4498C5.30914 13.4793 5.33413 13.5084 5.35886 13.5373C5.76188 14.0074 6.09791 14.3993 6.25205 14.895C6.40526 15.3877 6.35448 15.9054 6.29291 16.5331C6.28913 16.5716 6.28532 16.6105 6.2815 16.6499L6.21591 17.3267C6.08682 18.6589 5.99978 19.5762 6.02922 20.2369C6.05859 20.8965 6.1979 21.0788 6.30865 21.1628C6.40716 21.2376 6.58925 21.3204 7.18248 21.1504C7.78535 20.9777 8.58659 20.6111 9.76202 20.0699L10.3578 19.7956C10.3945 19.7787 10.4309 19.7619 10.4669 19.7452C11.0117 19.4934 11.4843 19.2748 12 19.2748C12.5157 19.2748 12.9883 19.4934 13.5331 19.7452C13.5692 19.7619 13.6055 19.7787 13.6422 19.7956L14.238 20.0699C15.4134 20.6111 16.2147 20.9777 16.8176 21.1504C17.4108 21.3204 17.5929 21.2376 17.6914 21.1628C17.8021 21.0788 17.9414 20.8965 17.9708 20.2369C18.0002 19.5762 17.9132 18.6589 17.7841 17.3267L17.7185 16.6499C17.7147 16.6105 17.7109 16.5716 17.7071 16.5331C17.6456 15.9054 17.5948 15.3877 17.748 14.895C17.9021 14.3993 18.2382 14.0074 18.6412 13.5372C18.6659 13.5084 18.6909 13.4793 18.7161 13.4498L19.1499 12.9425C20.0044 11.9432 20.5887 11.257 20.9351 10.7068C21.2763 10.1647 21.2749 9.9263 21.2264 9.77044C21.1805 9.62275 21.06 9.43845 20.4892 9.21351C19.9043 8.98299 19.0503 8.78757 17.795 8.50354L17.1586 8.35956C17.1203 8.35089 17.0823 8.34235 17.0447 8.33389C16.459 8.20227 15.955 8.08901 15.5416 7.77518C15.1326 7.46469 14.8788 7.0079 14.578 6.4667C14.5587 6.43194 14.5392 6.39684 14.5195 6.36141L14.1918 5.77355C13.5462 4.61551 13.1018 3.82224 12.7081 3.30809C12.3147 2.79443 12.1138 2.75 12 2.75C11.8863 2.75 11.6853 2.79443 11.292 3.30809ZM10.1011 2.3961C10.5777 1.77363 11.1669 1.25 12 1.25C12.8331 1.25 13.4223 1.77363 13.899 2.3961C14.3674 3.00773 14.864 3.89876 15.471 4.98776L15.8296 5.63106C16.2222 6.33523 16.3226 6.48482 16.4486 6.58044C16.5698 6.67247 16.7262 6.7238 17.4896 6.89654L18.1897 7.05492C19.3653 7.32088 20.3338 7.53999 21.0392 7.81796C21.7714 8.10651 22.4121 8.5318 22.6588 9.32502C22.9029 10.1101 22.6285 10.8323 22.2045 11.5059C21.7925 12.1604 21.1344 12.9298 20.3306 13.8698L19.8561 14.4247C19.3391 15.0292 19.2311 15.1772 19.1803 15.3404C19.1286 15.5069 19.1334 15.6992 19.2115 16.5052L19.2831 17.2433C19.4048 18.4994 19.5041 19.5236 19.4693 20.3037C19.434 21.0977 19.2536 21.8601 18.5984 22.3576C17.9308 22.8643 17.1542 22.8072 16.4044 22.5924C15.6774 22.3841 14.7711 21.9667 13.6705 21.46L13.0149 21.1581C12.2975 20.8278 12.1439 20.7748 12 20.7748C11.8561 20.7748 11.7025 20.8278 10.9852 21.1581L10.3295 21.46C9.22898 21.9667 8.32265 22.3841 7.59565 22.5924C6.84587 22.8072 6.0692 22.8643 5.40168 22.3576C4.7464 21.8601 4.56607 21.0977 4.5307 20.3037C4.49595 19.5236 4.59523 18.4993 4.71697 17.2433L4.7885 16.5052C4.8666 15.6992 4.87147 15.5069 4.81971 15.3404C4.76894 15.1772 4.66094 15.0292 4.14393 14.4247L3.66945 13.8698C2.8656 12.9299 2.20753 12.1604 1.79553 11.5059C1.37149 10.8323 1.09714 10.1101 1.34127 9.32502C1.58794 8.5318 2.22867 8.10651 2.96086 7.81796C3.66622 7.53999 4.63474 7.32088 5.81038 7.05492L5.87404 7.04052L6.51039 6.89654C7.27382 6.72381 7.43023 6.67247 7.55148 6.58044C7.67743 6.48482 7.77785 6.33523 8.17039 5.63106L8.52899 4.98775C9.13601 3.89876 9.63268 3.00773 10.1011 2.3961Z" fill="currentColor"></path> </g></svg>
            <p>Selecciona un rol para ver los permisos disponibles</p>
        </div>

        <button class="btn" type="submit">Asignar Permisos Seleccionados</button>
        <div class="endpoint">POST /roles/{id}/permisos</div>
    </form>
    <div id="result-asignar-permisos" class="result"></div>
    </div>
</div>

<!-- Verificador de Permisos -->
<div>
    <h3>Verificar Permisos</h3>
    <div class="border rounded p-4">
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
</div>

<h2>Gestión de Usuarios</h2>
<div class="grid grid-cols-1 lg:grid-cols-2 gap-4 border rounded p-4">

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
<dialog id="dialog-editar-usuario" class="dialog w-full sm:max-w-[425px] max-h-[612px]" aria-labelledby="dialog-editar-usuario-title" aria-describedby="dialog-editar-usuario-description" onclick="if (event.target === this) this.close()">
    <article>
        <header>
            <h2 id="dialog-editar-usuario-title">Editar Usuario</h2>
            <p id="dialog-editar-usuario-description">Modifica los datos del usuario y haz clic en guardar.</p>
        </header>
        <section>
            <form id="form-editar-usuario" class="form grid gap-4">
                <input type="hidden" name="id">
                <div class="grid gap-3">
                    <label for="select-empleado-editar">Empleado</label>
                    <select class="select" name="empleado_id" id="select-empleado-editar" required>
                        <option value="">-- Seleccionar empleado --</option>
                    </select>
                </div>
                <div class="grid gap-3">
                    <label for="password-editar">Nuevo Password (opcional)</label>
                    <input class="input" type="password" name="password" id="password-editar" placeholder="Dejar vacío para mantener el actual">
                </div>
                <div class="grid gap-3">
                    <label for="select-rol-editar">Rol</label>
                    <select class="select" name="rol_id" id="select-rol-editar" required onchange="mostrarCampoTiendaEditar()">
                        <option value="">-- Seleccionar rol --</option>
                    </select>
                </div>
                <div class="grid gap-3">
                    <label for="select-estado-editar">Estado</label>
                    <select class="select" name="activo" id="select-estado-editar" required>
                        <option value="1">Activo</option>
                        <option value="0">Inactivo</option>
                    </select>
                </div>
                <div id="campo-tienda-usuario-editar" style="display: none; margin-top: 0.5em;">
                    <label for="select-tienda-editar">Tienda
                        <select name="tienda_id" id="select-tienda-editar">
                            <option value="">-- Seleccionar tienda --</option>
                        </select>
                    </label>
                    <p style="color: #dc3545; font-size: 0.9em; margin-top: 0.3em;">
                        ⚠️ El usuario solo tendrá acceso a la tienda seleccionada
                    </p>
                </div>
                <div id="result-editar-usuario" class="result"></div>
            </form>
        </section>
        <footer>
            <button class="btn-outline" type="button" onclick="this.closest('dialog').close()">Cancelar</button>
            <button class="btn" type="submit" form="form-editar-usuario">Guardar cambios</button>
        </footer>
        <!-- <button type="button" aria-label="Close dialog" onclick="this.closest('dialog').close()" style="position:absolute;top:1rem;right:1rem;background:none;border:none;">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x-icon lucide-x">
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
            </svg>
        </button> -->
    </article>
</dialog>
</main>
<?php include 'footer.php'; ?>