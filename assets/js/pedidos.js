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
    tiendasContainer.style.display = 'block';
    
    // Limpiar el grid
    tiendasGrid.innerHTML = '';
    
    // Crear campos de cantidad para cada tienda
    tiendas.forEach(tienda => {
      const div = document.createElement('div');
      div.className = 'tienda-cantidad';
      div.innerHTML = `
        <label>${tienda}:</label>
        <input type="number" 
               class="cantidad-tienda-input" 
               data-producto="${producto}"
               data-tienda="${tienda}"
               min="0" 
               placeholder="0">
      `;
      tiendasGrid.appendChild(div);
    });
    
  } else {
    // Ocultar el contenedor si no hay producto seleccionado
    tiendasContainer.style.display = 'none';
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
  const nuevoProducto = document.createElement('div');
  nuevoProducto.className = 'producto-tienda-item';
  nuevoProducto.innerHTML = `
    <div class="form-row">
      <label>Producto 
        <select class="producto-select" onchange="actualizarTiendasProducto(this)">
          <option value="">-- Seleccionar producto --</option>
        </select>
      </label>
    </div>
    <div class="tiendas-cantidades" style="display: none;">
      <h4>Cantidades por tienda:</h4>
      <div class="tiendas-grid" id="tiendas-grid-${contadorProductosPedido}"></div>
      <button type="button" onclick="removerProductoPedido(this)" style="background: #dc3545; margin-top: 1em;">Remover Producto</button>
    </div>
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
    button.closest('.producto-tienda-item').remove();
    // Actualizar disponibilidad después de remover
    actualizarDisponibilidadProductos();
  }
};
