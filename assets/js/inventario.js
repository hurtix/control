// Funciones para el manejo de inventario inicial

// Función para mostrar/ocultar la sección de inventario según el rol
function mostrarSeccionInventario(rol) {
  const seccion = document.getElementById('seccion-inventario');
  if (rol === 'tienda') {
    seccion.style.display = 'block';
    cargarTiendasInventario();
  } else {
    seccion.style.display = 'none';
  }
}

// Cargar tiendas disponibles para inventario
async function cargarTiendasInventario() {
  try {
    const tiendas = await api('/opciones/tiendas');
    const select = document.getElementById('select-tienda-inventario');
    
    select.innerHTML = '<option value="">-- Seleccionar tienda --</option>';
    tiendas.forEach(tienda => {
      const option = document.createElement('option');
      option.value = tienda.id || tienda; // Manejar ambos formatos
      option.textContent = tienda.nombre || tienda;
      select.appendChild(option);
    });
    
    // Si el usuario tiene una tienda asignada, pre-seleccionarla
    const usuarioActual = window.obtenerUsuarioActual ? window.obtenerUsuarioActual() : null;
    if (usuarioActual && usuarioActual.tiendas && usuarioActual.tiendas.length > 0) {
      select.value = usuarioActual.tiendas[0].id;
    }
    
  } catch (error) {
    console.error('Error cargando tiendas:', error);
  }
}

// Cargar productos agrupados por familia para inventario
async function cargarInventarioProductos() {
  const tiendaId = document.getElementById('select-tienda-inventario').value;
  const fecha = document.getElementById('fecha-inventario').value;
  
  if (!tiendaId) {
    alert('Selecciona una tienda');
    return;
  }
  
  if (!fecha) {
    alert('Selecciona una fecha');
    return;
  }
  
  try {
    // Mostrar loading
    const container = document.getElementById('productos-por-familia');
    container.innerHTML = '<div class="text-center p-4">Cargando productos...</div>';
    document.getElementById('inventario-productos-container').style.display = 'block';
    
    // Cargar productos agrupados por familia
    const response = await api(`/inventario/productos/${tiendaId}`);
    console.log('Respuesta de /inventario/productos:', response);
    
    // Validar que la respuesta tenga el formato correcto
    let familias;
    if (response && response.success && Array.isArray(response.familias)) {
      familias = response.familias;
    } else if (Array.isArray(response)) {
      familias = response;
    } else if (response && !response.success) {
      // Error específico del servidor
      container.innerHTML = `
        <div class="text-center p-8">
          <p class="text-red-500 mb-4">⚠️ ${response.message}</p>
          <div class="text-sm text-gray-600">
            <p><strong>Para usar el inventario necesitas:</strong></p>
            <ol class="list-decimal list-inside mt-2 space-y-1">
              <li>Crear familias de productos (ej: Panadería, Bebidas, etc.)</li>
              <li>Asignar productos a esas familias</li>
              <li>Luego podrás registrar el inventario final</li>
            </ol>
          </div>
        </div>
      `;
      return;
    } else {
      console.error('Formato de respuesta no válido:', response);
      throw new Error('No se pudieron cargar las familias de productos');
    }
    
    console.log('Familias procesadas:', familias);
    
    // Verificar que hay familias
    if (!familias || familias.length === 0) {
      container.innerHTML = `
        <div class="text-center p-8">
          <p class="text-gray-500">No hay productos organizados por familias para esta tienda.</p>
          <p class="text-sm text-gray-400 mt-2">Los productos deben estar asignados a familias primero.</p>
        </div>
      `;
      return;
    }
    
    // Cargar inventario existente si hay
    let inventarioExistente = {};
    try {
      const inventarios = await api(`/inventario/${tiendaId}/${fecha}`);
      inventarios.forEach(inv => {
        inventarioExistente[inv.producto_id] = {
          cantidad: inv.cantidad_inicial,
          observaciones: inv.observaciones
        };
      });
    } catch (e) {
      // No hay inventario existente, continuar
    }
    
    // Generar HTML por familias
    let html = '';
    familias.forEach(familia => {
      html += `
        <div class="familia-productos mb-6">
          <h3 class="text-lg font-semibold text-blue-600 mb-3">${familia.familia}</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      `;
      
      familia.productos.forEach(producto => {
        const inventario = inventarioExistente[producto.id] || { cantidad: '', observaciones: '' };
        html += `
          <div class="producto-item border rounded-lg p-3 bg-gray-50">
            <label class="block text-sm font-medium mb-2">${producto.nombre}</label>
            <div class="flex gap-2">
              <input type="number" 
                     class="input cantidad-inventario" 
                     data-producto-id="${producto.id}"
                     value="${inventario.cantidad}"
                     min="0" 
                     placeholder="Cantidad">
              <input type="text" 
                     class="input observaciones-producto" 
                     data-producto-id="${producto.id}"
                     value="${inventario.observaciones}"
                     placeholder="Obs. (opcional)">
            </div>
          </div>
        `;
      });
      
      html += `
          </div>
        </div>
      `;
    });
    
    container.innerHTML = html;
    
  } catch (error) {
    console.error('Error cargando productos:', error);
    alert('Error cargando productos: ' + error.message);
  }
}

// Manejar envío del formulario de inventario
document.getElementById('form-inventario').onsubmit = async function(e) {
  e.preventDefault();
  
  const tiendaId = document.getElementById('select-tienda-inventario').value;
  const fecha = document.getElementById('fecha-inventario').value;
  const observacionesGenerales = document.getElementById('observaciones-inventario').value;
  
  if (!tiendaId || !fecha) {
    alert('Selecciona tienda y fecha');
    return;
  }
  
  // Recopilar datos de productos
  const productos = [];
  const cantidadInputs = document.querySelectorAll('.cantidad-inventario');
  const observacionesInputs = document.querySelectorAll('.observaciones-producto');
  
  cantidadInputs.forEach((input, index) => {
    const cantidad = parseInt(input.value);
    const productoId = input.dataset.productoId;
    const observaciones = observacionesInputs[index].value;
    
    if (!isNaN(cantidad) && cantidad >= 0) {
      productos.push({
        producto_id: parseInt(productoId),
        cantidad_inicial: cantidad,
        observaciones: observaciones || null
      });
    }
  });
  
  if (productos.length === 0) {
    alert('Ingresa al menos un producto con cantidad válida');
    return;
  }
  
  try {
    const data = {
      fecha: fecha,
      tienda_id: tiendaId, // Enviar como string (nombre de tienda)
      productos: productos,
      observaciones_generales: observacionesGenerales
    };
    
    const result = await api('/inventario', 'POST', data, 'tienda');
    
    document.getElementById('result-inventario').innerHTML = 
      `<div class="success">✓ ${result.mensaje}<br>Productos registrados: ${result.productos_registrados}</div>`;
    
    // Limpiar observaciones generales
    document.getElementById('observaciones-inventario').value = '';
    
    // Actualizar fecha para el siguiente día
    establecerFechasAutomaticas();
    
  } catch (error) {
    console.error('Error registrando inventario:', error);
    document.getElementById('result-inventario').innerHTML = 
      `<div class="error">Error: ${error.message}</div>`;
  }
};

// Inicializar inventario cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
  // La sección se mostrará cuando se determine el rol del usuario
  // Esto se manejará desde main.js cuando se cargue la sesión
  
  // Establecer fecha actual
  const fechaInput = document.getElementById('fecha-inventario');
  if (fechaInput) {
    const hoy = new Date().toISOString().split('T')[0];
    fechaInput.value = hoy;
  }
});
