// Manejadores de eventos para formularios
// Pedidos
formPedido.onsubmit = async e => {
  e.preventDefault();
  const fd = new FormData(formPedido);
  
  // Validar que todos los campos estén completos
  const cantidadInputs = document.querySelectorAll('.cantidad-tienda-input');
  let camposInvalidos = false;
  
  cantidadInputs.forEach(input => {
    // Si el input está visible (su producto está seleccionado)
    if (input.closest('.tiendas-cantidades').style.visibility !== 'hidden') {
      if (input.value === '' || isNaN(parseInt(input.value)) || parseInt(input.value) < 0) {
        camposInvalidos = true;
        input.classList.add('border-red-500');
        setTimeout(() => {
          input.classList.remove('border-red-500');
        }, 3000);
      }
    }
  });
  
  if (camposInvalidos) {
    alert('Por favor, complete todas las cantidades con valores numéricos (0 o mayor)');
    return;
  }
  
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
    <tr class="producto-tienda-item">
      <td>
        <select class="producto-select select" onchange="actualizarTiendasProducto(this)">
          <option value="">-- Seleccionar producto --</option>
        </select>
      </td>
      <td class="tiendas-cantidades" style="visibility: hidden;">
        <div class="tiendas-grid" id="tiendas-grid-0"></div>
      </td>
      <td class="producto-total" style="visibility: hidden;">
        <span class="font-bold text-lg">0</span>
      </td>
      <td>
        <button type="button" class="btn-sm-icon-destructive" onclick="removerProductoPedido(this)"><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g fill="currentColor"><path fill-rule="evenodd" clip-rule="evenodd" d="M10.3 2.25h3.4q.3 0 .57.03c.7.11 1.32.55 1.64 1.18q.13.24.22.54l.1.34.04.09a1.25 1.25 0 0 0 1.23.82h3a.75.75 0 0 1 0 1.5h-17a.75.75 0 0 1 0-1.5h3.09a1.25 1.25 0 0 0 1.17-.91L7.87 4q.1-.3.22-.54c.32-.63.93-1.07 1.64-1.18q.25-.04.58-.03m-1.3 3 .18-.43.1-.3.14-.37a.8.8 0 0 1 .54-.4h4.08q.36.09.54.4c.03.04.05.1.14.37l.1.3.04.12q.05.15.13.31z"/><path d="M5.92 8.45a.75.75 0 1 0-1.5.1l.46 6.95c.09 1.28.16 2.32.32 3.13.17.85.45 1.55 1.04 2.1.6.56 1.32.8 2.17.91.83.11 1.87.11 3.15.11h.88c1.29 0 2.32 0 3.15-.1a3.7 3.7 0 0 0 2.17-.91c.59-.55.87-1.26 1.04-2.1.16-.82.23-1.86.32-3.14l.46-6.95a.75.75 0 0 0-1.5-.1l-.45 6.9a26 26 0 0 1-.3 3c-.14.67-.33 1.04-.6 1.3-.27.25-.65.41-1.34.5-.71.1-1.65.1-3 .1h-.78c-1.35 0-2.29 0-3-.1-.7-.09-1.07-.25-1.34-.5-.27-.26-.46-.62-.6-1.3-.14-.72-.2-1.65-.3-3z"/><path d="M9.43 10.25c.4-.04.78.26.82.68l.5 5a.75.75 0 0 1-1.5.14l-.5-5a.75.75 0 0 1 .68-.82m5.14 0c.42.04.72.41.68.82l-.5 5a.75.75 0 0 1-1.5-.14l.5-5a.75.75 0 0 1 .82-.68"/></g></svg></button>
      </td>
    </tr>
  `;
  contadorProductosPedido = 0;
  
  // Reiniciar el gran total
  document.getElementById('gran-total').textContent = '0';
  
  // Reiniciar los totales por tienda
  inicializarTotalesTienda();
  
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
  
  // Recopilar productos y cantidades producidas desde la tabla
  const productosRows = document.querySelectorAll('#productos-lote-lista tr');
  const productos = [];
  productosRows.forEach(row => {
    const productoId = row.dataset.producto;
    const cantidadInput = row.querySelector('.cantidad-producida-input');
    if (productoId && cantidadInput && cantidadInput.value && !isNaN(parseFloat(cantidadInput.value)) && parseFloat(cantidadInput.value) >= 0) {
      productos.push({
        producto: productoId,
        cantidad_producida: parseFloat(cantidadInput.value),
        empleado: data.empleado
      });
    }
  });
  if (productos.length === 0) {
    alert('Debe especificar cantidades producidas para todos los productos');
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
  
  // Quitar selección de todas las tarjetas
  document.querySelectorAll('.lote-card').forEach(card => card.classList.remove('selected'));
  
  // Limpiar el campo hidden
  document.getElementById('input-lote-id').value = '';
  
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
  
  // Quitar selección de todas las tarjetas
  document.querySelectorAll('#lotes-despacho-cards-container .lote-card').forEach(card => card.classList.remove('selected'));
  
  // Limpiar el campo hidden
  document.getElementById('input-lote-id-despacho').value = '';
  
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
  
  // Obtener la tienda del usuario actual
  const tiendaUsuarioActual = document.getElementById('tienda-usuario-actual').value;
  if (!tiendaUsuarioActual) {
    // Quitado el alert que mostraba mensaje de error por tienda no asignada
    return;
  }
  
  // Usar la tienda vinculada al usuario
  data.tienda = tiendaUsuarioActual;
  
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
    
    // Solo procesar items de la tienda del usuario actual
    if (producto && tienda === tiendaUsuarioActual && !isNaN(cantidadRecibida) && cantidadRecibida >= 0) {
      items.push({
        producto: producto,
        tienda: tienda,
        cantidad_recibida: cantidadRecibida,
        confirmado: confirmado
      });
    }
  });
  
  if (items.length === 0) {
    alert('Debe especificar cantidades recibidas para al menos un producto de tu tienda');
    return;
  }
  
  data.items = items;
  data.lote_id = Number(data.lote_id);

  const res = await api('/recepcion', 'POST', data, 'tienda');
  resultRecepcion.textContent = JSON.stringify(res, null, 2);
  
  // No limpiar completamente el formulario, mantener el lote seleccionado
  // y actualizar las tiendas disponibles
  const fechaElement = document.querySelector('#form-recepcion [name="fecha"]');
  const loteElement = document.getElementById('select-lote-recepcion');
  const empleadoElement = document.getElementById('select-empleado-recepcion');
  const observacionesElement = document.querySelector('#form-recepcion [name="observaciones"]');
  
  const fechaActual = fechaElement ? fechaElement.value : '';
  const loteActual = loteElement ? loteElement.value : '';
  const empleadoActual = empleadoElement ? empleadoElement.value : '';
  const observacionesActuales = observacionesElement ? observacionesElement.value : '';
  
  // Solo limpiar los contenedores dinámicos
  document.getElementById('despachos-tienda-container').style.display = 'none';
  document.getElementById('despachos-tienda-lista').innerHTML = '';
  const selectTienda = document.getElementById('select-tienda-recepcion');
  if (selectTienda) {
    selectTienda.innerHTML = '<option value="">-- Seleccionar tienda --</option>';
  }
  
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
    const selectTienda = document.getElementById('select-tienda-recepcion');
    if (selectTienda) {
      selectTienda.innerHTML = '<option value="">-- Seleccionar tienda --</option>';
    }
    
    // Establecer fecha actual
    establecerFechasAutomaticas();
    
    // Recargar lotes para recepción para que desaparezca el completado
    await cargarLotesParaRecepcion();
  } else {
    // Mantener valores del formulario principal si el lote aún tiene tiendas pendientes
    const fechaElement = document.querySelector('#form-recepcion [name="fecha"]');
    const loteElement = document.getElementById('select-lote-recepcion');
    const empleadoElement = document.getElementById('select-empleado-recepcion');
    const observacionesElement = document.querySelector('#form-recepcion [name="observaciones"]');
    
    if (fechaElement) fechaElement.value = fechaActual;
    if (loteElement) loteElement.value = loteActual;
    if (empleadoElement) empleadoElement.value = empleadoActual;
    if (observacionesElement) observacionesElement.value = observacionesActuales;
    
    // Recargar lotes para mostrar estado actualizado
    await cargarLotesParaRecepcion();
    
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
