// Funciones para el manejo de inventario inicial

// Función para guardar progreso en localStorage
function guardarProgresoInventario() {
  const tiendaId = document.getElementById('select-tienda-inventario').value;
  const fecha = document.getElementById('fecha-inventario').value;
  
  if (!tiendaId) return;
  
  const productos = {};
  const tbody = document.getElementById('productos-inventario-tbody');
  if (!tbody) return;
  
  const filas = tbody.querySelectorAll('tr');
  filas.forEach(fila => {
    const inputCantidad = fila.querySelector('input[type="number"]');
    const inputProductoId = fila.querySelector('input[type="hidden"]');
    
    if (inputCantidad && inputProductoId) {
      const productoId = inputProductoId.value;
      const cantidad = inputCantidad.value;
      
      if (cantidad !== '') {
        productos[productoId] = cantidad;
      }
    }
  });
  
  const progreso = {
    tienda: tiendaId,
    fecha: fecha,
    productos: productos,
    timestamp: new Date().toISOString()
  };
  
  localStorage.setItem(`inventario_progreso_${tiendaId}`, JSON.stringify(progreso));
  console.log('Progreso guardado:', progreso);
}

// Función para cargar progreso desde localStorage
function cargarProgresoInventario(tiendaId) {
  if (!tiendaId) return;
  
  const progreso = localStorage.getItem(`inventario_progreso_${tiendaId}`);
  if (!progreso) return;
  
  try {
    const data = JSON.parse(progreso);
    
    // Cargar fecha si existe
    if (data.fecha) {
      const fechaInput = document.getElementById('fecha-inventario');
      if (fechaInput) {
        fechaInput.value = data.fecha;
      }
    }
    
    // Cargar cantidades de productos
    const tbody = document.getElementById('productos-inventario-tbody');
    if (!tbody) return;
    
    const filas = tbody.querySelectorAll('tr');
    filas.forEach(fila => {
      const inputCantidad = fila.querySelector('input[type="number"]');
      const inputProductoId = fila.querySelector('input[type="hidden"]');
      
      if (inputCantidad && inputProductoId) {
        const productoId = inputProductoId.value;
        if (data.productos[productoId]) {
          inputCantidad.value = data.productos[productoId];
          actualizarEstiloInput(inputCantidad);
        }
      }
    });
    
    console.log('Progreso cargado:', data);
    return data;
  } catch (error) {
    console.error('Error cargando progreso:', error);
  }
}

// Función para actualizar estilo de input según su valor
function actualizarEstiloInput(input) {
  if (input.value && input.value.trim() !== '') {
    input.classList.remove('border-red-300', 'bg-red-50');
    input.classList.add('border-green-300', 'bg-green-50');
  } else {
    input.classList.remove('border-green-300', 'bg-green-50');
    input.classList.add('border-red-300', 'bg-red-50');
  }
  
  // Actualizar indicador de progreso
  actualizarIndicadorProgreso();
}

// Función para actualizar el indicador de progreso
function actualizarIndicadorProgreso() {
  const tbody = document.getElementById('productos-inventario-tbody');
  if (!tbody) return;
  
  const inputs = tbody.querySelectorAll('input[type="number"]');
  const completados = Array.from(inputs).filter(input => input.value && input.value.trim() !== '').length;
  
  const elementoCompletados = document.getElementById('productos-completados');
  const elementoTotales = document.getElementById('productos-totales');
  
  if (elementoCompletados && elementoTotales) {
    elementoCompletados.textContent = completados;
    elementoTotales.textContent = inputs.length;
    
    // Cambiar color según progreso
    const indicador = document.getElementById('indicador-progreso');
    if (completados === 0) {
      indicador.className = 'text-sm text-red-600';
    } else if (completados === inputs.length) {
      indicador.className = 'text-sm text-green-600';
    } else {
      indicador.className = 'text-sm text-blue-600';
    }
  }
}

// Función para limpiar progreso guardado
function limpiarProgresoInventario(tiendaId) {
  if (tiendaId) {
    localStorage.removeItem(`inventario_progreso_${tiendaId}`);
    console.log('Progreso limpiado para tienda:', tiendaId);
  }
}

// Función para configurar botones de inventario
function configurarBotonesInventario(tiendaId) {
  // Botón guardar progreso manual
  const btnGuardar = document.getElementById('btn-guardar-progreso');
  if (btnGuardar) {
    btnGuardar.onclick = function() {
      guardarProgresoInventario();
      
      // Mostrar confirmación visual
      const originalText = this.textContent;
      this.textContent = '✓ Guardado';
      this.classList.add('btn-success');
      
      setTimeout(() => {
        this.textContent = originalText;
        this.classList.remove('btn-success');
      }, 2000);
    };
  }
  
  // Botón limpiar progreso
  const btnLimpiar = document.getElementById('btn-limpiar-progreso');
  if (btnLimpiar) {
    btnLimpiar.onclick = function() {
      const confirmacion = confirm('¿Estás seguro de que quieres limpiar todos los datos?\n\nEsta acción no se puede deshacer.');
      if (confirmacion) {
        // Limpiar localStorage
        limpiarProgresoInventario(tiendaId);
        
        // Limpiar inputs
        const tbody = document.getElementById('productos-inventario-tbody');
        const inputs = tbody.querySelectorAll('input[type="number"]');
        inputs.forEach(input => {
          input.value = '';
          actualizarEstiloInput(input);
        });
        
        // Mostrar confirmación
        const originalText = this.textContent;
        this.textContent = '✓ Limpiado';
        this.classList.add('btn-success');
        
        setTimeout(() => {
          this.textContent = originalText;
          this.classList.remove('btn-success');
        }, 2000);
      }
    };
  }
}

// Función para mostrar/ocultar la sección de inventario según el rol
function mostrarSeccionInventario(rol) {
  const seccion = document.getElementById('seccion-inventario');
  if (rol === 'tienda' || rol === 'admin') {
    seccion.style.display = 'block';
    cargarTiendasInventario();
  } else {
    seccion.style.display = 'none';
  }
}

// Cargar tiendas disponibles para inventario
async function cargarTiendasInventario() {
  console.log('=== cargarTiendasInventario iniciado ===');
  
  try {
    const select = document.getElementById('select-tienda-inventario');
    
    if (!select) {
      console.error('Select de tienda no encontrado');
      return;
    }
    
    console.log('Select encontrado:', select);
    
    // Obtener usuario actual (puede venir de main.js)
    const usuarioActual = window.currentUser || (window.obtenerUsuarioActual ? window.obtenerUsuarioActual() : null);
    
    console.log('Usuario actual:', usuarioActual);
    
    if (!usuarioActual) {
      console.error('No hay usuario actual disponible');
      return;
    }
    
    // Si es admin, cargar todas las tiendas
    if (usuarioActual.rol && usuarioActual.rol.nombre === 'admin') {
      const tiendas = await api('/opciones/tiendas');
      
      select.innerHTML = '<option value="">-- Seleccionar tienda --</option>';
      tiendas.forEach(tienda => {
        const option = document.createElement('option');
        option.value = tienda;
        option.textContent = tienda;
        select.appendChild(option);
      });
      
      console.log('Admin: tiendas cargadas:', tiendas);
    } 
    // Si es usuario de tienda, pre-seleccionar su tienda
    else if (usuarioActual.tiendas && usuarioActual.tiendas.length > 0) {
      const tiendaUsuario = usuarioActual.tiendas[0];
      const tiendaNombre = typeof tiendaUsuario === 'object' ? tiendaUsuario.nombre : tiendaUsuario;
      
      select.innerHTML = '';
      const option = document.createElement('option');
      option.value = tiendaNombre;
      option.textContent = tiendaNombre;
      option.selected = true;
      select.appendChild(option);
      
      console.log('Usuario tienda: tienda preseleccionada:', tiendaNombre);
    } 
    // Usuario sin tienda
    else {
      select.innerHTML = '<option value="">Sin tienda asignada</option>';
      console.log('Usuario sin tienda asignada');
      return;
    }
    
    // Agregar event listener para cargar productos automáticamente
    select.removeEventListener('change', cargarInventarioProductos); // Evitar duplicados
    select.addEventListener('change', cargarInventarioProductos);
    
    // Si hay una tienda pre-seleccionada, cargar productos automáticamente
    if (select.value && select.value !== '') {
      console.log('Cargando productos automáticamente para tienda:', select.value);
      await cargarInventarioProductos();
    }
    
  } catch (error) {
    console.error('Error cargando tiendas:', error);
    const select = document.getElementById('select-tienda-inventario');
    if (select) {
      select.innerHTML = '<option value="">Error cargando tiendas</option>';
    }
  }
}

// Cargar productos automáticamente cuando se selecciona una tienda
// Cargar productos en formato tabla por familias
async function cargarInventarioProductos() {
  console.log('=== cargarInventarioProductos iniciado ===');
  
  const tiendaId = document.getElementById('select-tienda-inventario').value;
  const tabla = document.getElementById('tabla-inventario');
  const loading = document.getElementById('loading-productos');
  const btnRegistrar = document.getElementById('btn-registrar-inventario');
  
  console.log('tiendaId:', tiendaId);
  console.log('elementos DOM encontrados:', { tabla: !!tabla, loading: !!loading, btnRegistrar: !!btnRegistrar });
  
  if (!tiendaId) {
    document.getElementById('productos-inventario-tbody').innerHTML = '';
    tabla.style.display = 'none';
    btnRegistrar.style.display = 'none';
    document.getElementById('inventario-controles').style.display = 'none';
    loading.style.display = 'block';
    loading.textContent = 'Selecciona una tienda para cargar los productos...';
    console.log('No hay tienda seleccionada');
    return;
  }
  
  try {
    // Mostrar loading
    loading.style.display = 'block';
    loading.textContent = 'Cargando productos...';
    tabla.style.display = 'none';
    btnRegistrar.style.display = 'none';
    
    const maestros = await api('/maestros', 'GET', null, 'admin');
    const productos = maestros.filter(item => item.tipo === 'producto');
    const familiasResponse = await api('/familias', 'GET', null, 'admin');
    const familias = familiasResponse.familias || [];
    
    // Crear mapa de familias para fácil acceso
    const familiaMap = {};
    familias.forEach(familia => {
      familiaMap[familia.id] = familia.nombre;
    });
    
    // Agrupar productos por familia
    const productosPorFamilia = {};
    productos.forEach(producto => {
      const familiaId = producto.familia_id || 'sin_familia';
      const familiaNombre = familiaId === 'sin_familia' ? 'Sin Familia' : familiaMap[familiaId] || 'Sin Familia';
      
      if (!productosPorFamilia[familiaNombre]) {
        productosPorFamilia[familiaNombre] = [];
      }
      productosPorFamilia[familiaNombre].push(producto);
    });
    
    // Generar filas de la tabla
    let html = '';
    const familias_ordenadas = Object.keys(productosPorFamilia).sort();
    
    familias_ordenadas.forEach(familiaNombre => {
      const productosEnFamilia = productosPorFamilia[familiaNombre];
      
      productosEnFamilia.forEach((producto, index) => {
        html += `
          <tr>
            <td>
              ${index === 0 ? `<span class="font-semibold">${familiaNombre}</span>` : ''}
            </td>
            <td>${producto.nombre}</td>
            <td>
              <input type="number" 
                     class="input w-20 text-center border-red-300 bg-red-50" 
                     min="0" 
                     placeholder=""
                     data-producto-id="${producto.id}">
              <input type="hidden" value="${producto.id}">
            </td>
          </tr>
        `;
      });
    });
    
    document.getElementById('productos-inventario-tbody').innerHTML = html;
    
    // Agregar event listeners para guardado automático y estilos
    const tbody = document.getElementById('productos-inventario-tbody');
    const inputs = tbody.querySelectorAll('input[type="number"]');
    
    inputs.forEach(input => {
      // Event listener para cambios en tiempo real
      input.addEventListener('input', function() {
        actualizarEstiloInput(this);
        
        // Guardado automático con debounce
        clearTimeout(this.saveTimeout);
        this.saveTimeout = setTimeout(() => {
          guardarProgresoInventario();
        }, 1000); // Guarda 1 segundo después del último cambio
      });
      
      // Event listener para cuando el input pierde el foco
      input.addEventListener('blur', function() {
        actualizarEstiloInput(this);
        guardarProgresoInventario();
      });
      
      // Inicializar estilo
      actualizarEstiloInput(input);
    });
    
    // Cargar progreso guardado para esta tienda
    cargarProgresoInventario(tiendaId);
    
    // Configurar botones de control
    configurarBotonesInventario(tiendaId);
    
    // Mostrar tabla, controles y botón, ocultar loading
    loading.style.display = 'none';
    tabla.style.display = 'table';
    btnRegistrar.style.display = 'inline-block';
    document.getElementById('inventario-controles').style.display = 'flex';
    
    // Actualizar indicador inicial
    actualizarIndicadorProgreso();
    
  } catch (error) {
    console.error('Error cargando productos:', error);
    loading.style.display = 'block';
    loading.innerHTML = `<div class="text-red-500">Error cargando productos: ${error.message}</div>`;
    tabla.style.display = 'none';
    btnRegistrar.style.display = 'none';
    document.getElementById('inventario-controles').style.display = 'none';
  }
}

// Manejar envío del formulario de inventario
document.getElementById('form-inventario').onsubmit = async function(e) {
  e.preventDefault();
  
  const tiendaId = document.getElementById('select-tienda-inventario').value;
  const fecha = document.getElementById('fecha-inventario').value;
  
  if (!tiendaId || !fecha) {
    alert('Selecciona tienda y fecha');
    return;
  }
  
  // Recopilar datos de productos desde la tabla
  const productos = [];
  const tbody = document.getElementById('productos-inventario-tbody');
  const filas = tbody.querySelectorAll('tr');
  
  filas.forEach(fila => {
    const inputCantidad = fila.querySelector('input[type="number"]');
    const inputProductoId = fila.querySelector('input[type="hidden"]');
    
    if (inputCantidad && inputProductoId) {
      const cantidad = parseInt(inputCantidad.value);
      const productoId = parseInt(inputProductoId.value);
      
      if (!isNaN(cantidad) && cantidad >= 0) {
        productos.push({
          producto_id: productoId,
          cantidad_inicial: cantidad
        });
      }
    }
  });
  
  if (productos.length === 0) {
    alert('Ingresa al menos un producto con cantidad válida');
    return;
  }
  
  // Confirmar antes de enviar
  const confirmacion = confirm(`¿Confirmar registro de inventario?\n\nTienda: ${tiendaId}\nFecha: ${fecha}\nProductos: ${productos.length}\n\nEsta acción no se puede deshacer.`);
  if (!confirmacion) {
    return;
  }
  
  try {
    const data = {
      fecha: fecha,
      tienda_id: tiendaId, // Enviar como string (nombre de tienda)
      productos: productos
    };
    
    console.log('Enviando datos de inventario:', data);
    
    const result = await api('/inventario', 'POST', data, 'admin');
    
    console.log('Respuesta del servidor:', result);
    
    if (result.error) {
      throw new Error(result.error);
    }
    
    const mensaje = result.mensaje || 'Inventario registrado exitosamente';
    const productosRegistrados = result.productos_registrados || productos.length;
    
    alert(`✓ ${mensaje}\nProductos registrados: ${productosRegistrados}`);
    
    // Limpiar progreso guardado después del éxito
    limpiarProgresoInventario(tiendaId);
    
    // Limpiar formulario
    const inputs = tbody.querySelectorAll('input[type="number"]');
    inputs.forEach(input => {
      input.value = '';
      actualizarEstiloInput(input);
    });
    
    // Actualizar fecha para el siguiente día
    establecerFechasAutomaticas();
    
  } catch (error) {
    console.error('Error registrando inventario:', error);
    alert(`Error: ${error.message || error}`);
  }
};

// Función para establecer fechas automáticas
function establecerFechasAutomaticas() {
  const fechaInput = document.getElementById('fecha-inventario');
  if (fechaInput) {
    const ahora = new Date();
    // Formato para datetime-local: YYYY-MM-DDTHH:MM
    const fechaFormateada = ahora.toISOString().slice(0, 16);
    fechaInput.value = fechaFormateada;
  }
}

// Inicializar fechas cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
  establecerFechasAutomaticas();
});
