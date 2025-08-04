// Manejadores de eventos para formularios
// Pedidos
formPedido.onsubmit = async e => {
  e.preventDefault();
  const fd = new FormData(formPedido);
  
  // Obtener datos básicos del pedido
  const data = {
    fecha_pedido: obtenerFechaActualISO(), // Usar fecha actual automática
    fecha_requerida: fd.get('fecha_requerida'),
    empleado: fd.get('empleado') || (currentUser ? currentUser.nombre : ''), // Incluir el empleado actual
    items: []
  };
  
  // Recopilar todos los productos y cantidades por tienda
  const productosItems = document.querySelectorAll('.producto-tienda-item');
  
  productosItems.forEach(item => {
    const productoSelect = item.querySelector('.producto-select');
    const producto = productoSelect.value;
    
    if (producto) {
      // Obtener todas las cantidades por tienda para este producto
      const cantidadInputs = item.querySelectorAll('.cantidad-tienda-input');
      
      cantidadInputs.forEach(input => {
        const tienda = input.dataset.tienda;
        const cantidad = parseInt(input.value);
        
        // Incluir el item si tiene un valor numérico válido (incluyendo 0)
        if (!isNaN(cantidad) && cantidad >= 0) {
          data.items.push({
            producto: producto,
            tienda: tienda,
            cantidad_solicitada: cantidad
          });
        }
      });
    }
  });
  
  if (data.items.length === 0) {
    alert('Debe seleccionar al menos un producto y especificar cantidades válidas (incluyendo 0) para las tiendas');
    return;
  }
  
  const res = await api('/pedidos', 'POST', data, 'ventas');
  resultPedido.textContent = JSON.stringify(res, null, 2);
  
  // Limpiar formulario
  formPedido.reset();
  const container = document.getElementById('productos-tiendas-container');
  container.innerHTML = `
    <div class="producto-tienda-item">
      <div class="form-row">
        <label>Producto 
          <select class="producto-select" onchange="actualizarTiendasProducto(this)">
            <option value="">-- Seleccionar producto --</option>
          </select>
        </label>
      </div>
      <div class="tiendas-cantidades" style="display: none;">
        <h4>Cantidades por tienda:</h4>
        <div class="tiendas-grid" id="tiendas-grid-0"></div>
        <button type="button" onclick="removerProductoPedido(this)" style="background: #dc3545; margin-top: 1em;">Remover Producto</button>
      </div>
    </div>
  `;
  contadorProductosPedido = 0;
  
    // Recargar opciones
    setTimeout(async () => {
      await cargarLotesPendientes();
      await cargarLotesParaTrazabilidad();
      // Cargar opciones en el formulario limpio
      await cargarOpcionesEnSelect('/opciones/productos', document.querySelector('.producto-select'));
      // Actualizar disponibilidad después del reset
      actualizarDisponibilidadProductos();
      // Asegurar que el botón esté visible después del reset
      const botonAgregar = document.querySelector('button[onclick="agregarProductoPedido()"]');
      if (botonAgregar) {
        botonAgregar.style.display = '';
      }
    }, 500);
};

// Producción
formProduccion.onsubmit = async e => {
  e.preventDefault();
  const fd = new FormData(formProduccion);
  const data = Object.fromEntries(fd.entries());
  
  // Usar fecha actual automática
  data.fecha = obtenerFechaActualISO();
  
  // Asegurarse de que el nombre del empleado esté presente
  if (!data.empleado && currentUser && currentUser.nombre) {
    console.log("Empleado no encontrado en el formulario. Usando nombre del usuario autenticado:", currentUser.nombre);
    data.empleado = currentUser.nombre;
  }
  
  // Recopilar productos y cantidades producidas
  const productosInputs = document.querySelectorAll('.cantidad-producida-input');
  const productos = [];
  
  productosInputs.forEach(input => {
    const producto = input.dataset.producto;
    const cantidadProducida = parseInt(input.value);
    
    if (producto && cantidadProducida > 0) {
      productos.push({
        producto: producto,
        cantidad_producida: cantidadProducida,
        empleado: data.empleado // Asegurar que cada producto tenga el empleado
      });
    }
  });
  
  if (productos.length === 0) {
    alert('Debe especificar cantidades producidas para al menos un producto');
    return;
  }
  
  data.productos = productos;
  data.lote_id = Number(data.lote_id);
  
  const res = await api('/produccion', 'POST', data, 'produccion');
  resultProduccion.textContent = JSON.stringify(res, null, 2);
  
  // Limpiar formulario
  formProduccion.reset();
  document.getElementById('productos-lote-container').style.display = 'none';
  document.getElementById('productos-lote-lista').innerHTML = '';
  
  // Recargar lotes pendientes después de producir
  setTimeout(async () => {
    await cargarLotesPendientes();
    // Ya no necesitamos recargar opciones de empleados
  }, 500);
};

// Despacho
formDespacho.onsubmit = async e => {
  e.preventDefault();
  const fd = new FormData(formDespacho);
  const data = Object.fromEntries(fd.entries());
  
  // Usar fecha actual automática
  data.fecha = obtenerFechaActualISO();
  
  // Asegurarse de que el nombre del empleado esté presente
  if (!data.empleado && currentUser && currentUser.nombre) {
    console.log("Empleado no encontrado en el formulario de despacho. Usando nombre del usuario autenticado:", currentUser.nombre);
    data.empleado = currentUser.nombre;
  }
  
  data.lote_id = Number(data.lote_id);
  
  const res = await api('/despacho', 'POST', data, 'despacho');
  resultDespacho.textContent = JSON.stringify(res, null, 2);
  
  // Limpiar formulario
  formDespacho.reset();
  document.getElementById('distribucion-despacho-container').style.display = 'none';
  document.getElementById('distribucion-despacho-lista').innerHTML = '';
  
  // Recargar lotes producidos después de despachar
  setTimeout(async () => {
    await cargarLotesProducidos();
    // Ya no necesitamos recargar opciones de empleados
  }, 500);
};

// Recepción
formRecepcion.onsubmit = async e => {
  e.preventDefault();
  const fd = new FormData(formRecepcion);
  const data = Object.fromEntries(fd.entries());
  
  // Usar fecha actual automática
  data.fecha = obtenerFechaActualISO();
  
  // Asegurarse de que el nombre del empleado esté presente
  if (!data.empleado && currentUser && currentUser.nombre) {
    console.log("Empleado no encontrado en el formulario de recepción. Usando nombre del usuario autenticado:", currentUser.nombre);
    data.empleado = currentUser.nombre;
  }
  
  // Obtener tienda seleccionada
  const tiendaSeleccionada = document.getElementById('select-tienda-recepcion').value;
  if (!tiendaSeleccionada) {
    alert('Debe seleccionar una tienda');
    return;
  }
  
  // Recopilar items de recepción para esta tienda específica
  const cantidadInputs = document.querySelectorAll('.cantidad-recibida-input');
  const confirmadoInputs = document.querySelectorAll('.confirmado-input');
  const items = [];
  
  cantidadInputs.forEach((input, index) => {
    const producto = input.dataset.producto;
    const tienda = input.dataset.tienda;
    const cantidadRecibida = parseInt(input.value);
    const confirmadoSelect = confirmadoInputs[index];
    const confirmado = confirmadoSelect ? confirmadoSelect.value === '1' : false;
    
    // Solo procesar items de la tienda seleccionada
    if (producto && tienda === tiendaSeleccionada && !isNaN(cantidadRecibida) && cantidadRecibida >= 0) {
      items.push({
        producto: producto,
        tienda: tienda,
        cantidad_recibida: cantidadRecibida,
        confirmado: confirmado
      });
    }
  });
  
  if (items.length === 0) {
    alert('Debe especificar cantidades recibidas para al menos un producto de la tienda seleccionada');
    return;
  }
  
  data.items = items;
  data.lote_id = Number(data.lote_id);
  data.tienda = tiendaSeleccionada; // Agregar tienda al payload
  
  const res = await api('/recepcion', 'POST', data, 'tienda');
  resultRecepcion.textContent = JSON.stringify(res, null, 2);
  
  // No limpiar completamente el formulario, mantener el lote seleccionado
  // y actualizar las tiendas disponibles
  const fechaActual = document.querySelector('[name="fecha"]').value;
  const loteActual = document.getElementById('select-lote-recepcion').value;
  const empleadoActual = document.getElementById('select-empleado-recepcion').value;
  const observacionesActuales = document.querySelector('[name="observaciones"]').value;
  
  // Solo limpiar los contenedores dinámicos
  document.getElementById('despachos-tienda-container').style.display = 'none';
  document.getElementById('despachos-tienda-lista').innerHTML = '';
  document.getElementById('select-tienda-recepcion').innerHTML = '<option value="">-- Seleccionar tienda --</option>';
  
  // Verificar si el lote se completó (todas las tiendas recibieron)
  let loteCompletado = false;
  if (res && res.mensaje && res.mensaje.includes('completamente recibido')) {
    loteCompletado = true;
  }
  
  if (loteCompletado) {
    // Si el lote se completó, limpiar todo el formulario y recargar lotes
    formRecepcion.reset();
    document.getElementById('tiendas-lote-container').style.display = 'none';
    document.getElementById('despachos-tienda-container').style.display = 'none';
    document.getElementById('despachos-tienda-lista').innerHTML = '';
    document.getElementById('select-tienda-recepcion').innerHTML = '<option value="">-- Seleccionar tienda --</option>';
    
    // Establecer fecha actual
    const hoy = new Date().toISOString().split('T')[0];
    document.querySelector('[name="fecha"]').value = hoy;
    
    // Recargar lotes despachados para que desaparezca el completado
    await cargarLotesDespachados();
  } else {
    // Mantener valores del formulario principal si el lote aún tiene tiendas pendientes
    document.querySelector('[name="fecha"]').value = fechaActual;
    document.getElementById('select-lote-recepcion').value = loteActual;
    document.getElementById('select-empleado-recepcion').value = empleadoActual;
    document.querySelector('[name="observaciones"]').value = observacionesActuales;
    
    // Actualizar las tiendas disponibles para el mismo lote
    if (loteActual) {
      await actualizarTiendasLote();
    }
  }
  
  // Ya no necesitamos recargar opciones de empleados
  setTimeout(() => {
    // Mantener el timeout para consistencia pero sin cargar opciones de empleados
  }, 500);
};
