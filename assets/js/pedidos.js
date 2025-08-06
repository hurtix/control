// Funciones para gestión de pedidos
const cargarTiendasDisponibles = async () => {
  try {
    tiendas = await api('/opciones/tiendas');
  } catch (error) {
    console.error('Error cargando tiendas:', error);
    tiendas = [];
  }
};

const actualizarTiendasProducto = (select) => {
  const productoItem = select.closest('.producto-tienda-item');
  const tiendasContainer = productoItem.querySelector('.tiendas-cantidades');
  const tiendasGrid = productoItem.querySelector('.tiendas-grid');
  const producto = select.value;
  
  // Actualizar disponibilidad de productos en todos los selects
  actualizarDisponibilidadProductos();
  
  if (producto) {
    // Mostrar el contenedor de tiendas
    tiendasContainer.style.visibility = 'visible';
    
    // Limpiar el grid
    tiendasGrid.innerHTML = '';
    
    // Crear campos de cantidad para cada tienda
    tiendas.forEach(tienda => {
      const div = document.createElement('div');
      div.className = 'tienda-cantidad flex';
      div.innerHTML = `
        <span class="px-2 text-sm py-1.5 items-center min-w-fit rounded-s-md border border-e-0 border-gray-200 bg-gray-50 font-bold">${tienda}</span>
        <input type="number" 
               class="cantidad-tienda-input input bg-white rounded-tl-none rounded-bl-none" 
               data-producto="${producto}"
               data-tienda="${tienda}"
               min="0" 
               placeholder="">
      `;
      tiendasGrid.appendChild(div);
    });
    
  } else {
    // Ocultar el contenedor si no hay producto seleccionado
    tiendasContainer.style.visibility = 'hidden';
    tiendasGrid.innerHTML = '';
  }
};

// Función para actualizar la disponibilidad de productos en todos los selects
const actualizarDisponibilidadProductos = () => {
  // Obtener todos los productos ya seleccionados
  const productosSeleccionados = [];
  document.querySelectorAll('.producto-select').forEach(select => {
    if (select.value) {
      productosSeleccionados.push(select.value);
    }
  });
  
  // Actualizar cada select
  document.querySelectorAll('.producto-select').forEach(select => {
    const valorActual = select.value;
    const options = select.querySelectorAll('option');
    
    options.forEach(option => {
      if (option.value === '') {
        // Siempre mostrar la opción vacía
        option.style.display = '';
        return;
      }
      
      // Si el producto está seleccionado en otro select, ocultarlo
      // Excepto si es el valor actual de este select
      if (productosSeleccionados.includes(option.value) && option.value !== valorActual) {
        option.style.display = 'none';
      } else {
        option.style.display = '';
      }
    });
  });
  
  // Controlar la visibilidad del botón "Agregar Producto"
  actualizarVisibilidadBotonAgregar();
};

// Función para controlar la visibilidad del botón "Agregar Producto"
const actualizarVisibilidadBotonAgregar = () => {
  // Contar productos disponibles (opciones visibles que no están vacías)
  const primerSelect = document.querySelector('.producto-select');
  if (!primerSelect) return;
  
  let productosDisponibles = 0;
  primerSelect.querySelectorAll('option').forEach(option => {
    if (option.value !== '' && option.style.display !== 'none') {
      productosDisponibles++;
    }
  });
  
  // Contar cuántos selects existen (filas de productos)
  const totalSelects = document.querySelectorAll('.producto-select').length;
  
  // Si hay productos disponibles y no hemos llegado al límite, mostrar el botón
  const botonAgregar = document.querySelector('button[onclick="agregarProductoPedido()"]');
  if (botonAgregar) {
    // El botón debe estar visible si:
    // 1. Hay productos disponibles para seleccionar, Y
    // 2. El número de filas existentes es menor que el total de productos únicos
    const totalProductos = primerSelect.querySelectorAll('option:not([value=""])').length;
    
    if (productosDisponibles > 0 && totalSelects < totalProductos) {
      botonAgregar.style.display = '';
    } else {
      botonAgregar.style.display = 'none';
    }
  }
};

const agregarProductoPedido = () => {
  contadorProductosPedido++;
  const container = document.getElementById('productos-tiendas-container');
  const nuevoProducto = document.createElement('tr');
  nuevoProducto.className = 'producto-tienda-item';
  nuevoProducto.innerHTML = `
    <td>
      <select class="producto-select select" onchange="actualizarTiendasProducto(this)">
        <option value="">-- Seleccionar producto --</option>
      </select>
    </td>
    <td class="tiendas-cantidades" style="visibility: hidden;">
      <div class="tiendas-grid" id="tiendas-grid-${contadorProductosPedido}"></div>
    </td>
    <td>
      <button class="btn-sm-icon-destructive" type="button" onclick="removerProductoPedido(this)"><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g fill="currentColor"><path fill-rule="evenodd" clip-rule="evenodd" d="M10.3 2.25h3.4q.3 0 .57.03c.7.11 1.32.55 1.64 1.18q.13.24.22.54l.1.34.04.09a1.25 1.25 0 0 0 1.23.82h3a.75.75 0 0 1 0 1.5h-17a.75.75 0 0 1 0-1.5h3.09a1.25 1.25 0 0 0 1.17-.91L7.87 4q.1-.3.22-.54c.32-.63.93-1.07 1.64-1.18q.25-.04.58-.03m-1.3 3 .18-.43.1-.3.14-.37a.8.8 0 0 1 .54-.4h4.08q.36.09.54.4c.03.04.05.1.14.37l.1.3.04.12q.05.15.13.31z"/><path d="M5.92 8.45a.75.75 0 1 0-1.5.1l.46 6.95c.09 1.28.16 2.32.32 3.13.17.85.45 1.55 1.04 2.1.6.56 1.32.8 2.17.91.83.11 1.87.11 3.15.11h.88c1.29 0 2.32 0 3.15-.1a3.7 3.7 0 0 0 2.17-.91c.59-.55.87-1.26 1.04-2.1.16-.82.23-1.86.32-3.14l.46-6.95a.75.75 0 0 0-1.5-.1l-.45 6.9a26 26 0 0 1-.3 3c-.14.67-.33 1.04-.6 1.3-.27.25-.65.41-1.34.5-.71.1-1.65.1-3 .1h-.78c-1.35 0-2.29 0-3-.1-.7-.09-1.07-.25-1.34-.5-.27-.26-.46-.62-.6-1.3-.14-.72-.2-1.65-.3-3z"/><path d="M9.43 10.25c.4-.04.78.26.82.68l.5 5a.75.75 0 0 1-1.5.14l-.5-5a.75.75 0 0 1 .68-.82m5.14 0c.42.04.72.41.68.82l-.5 5a.75.75 0 0 1-1.5-.14l.5-5a.75.75 0 0 1 .82-.68"/></g></svg></button>
    </td>
  `;
  container.appendChild(nuevoProducto);
  
  // Cargar opciones en el nuevo select
  cargarOpcionesEnSelect('/opciones/productos', nuevoProducto.querySelector('.producto-select'));
  
  // Actualizar disponibilidad después de agregar el nuevo select
  setTimeout(() => {
    actualizarDisponibilidadProductos();
  }, 100);
};

const removerProductoPedido = (button) => {
  const container = document.getElementById('productos-tiendas-container');
  if (container.children.length > 1) {
    button.closest('tr.producto-tienda-item').remove();
    // Actualizar disponibilidad después de remover
    actualizarDisponibilidadProductos();
  }
};
