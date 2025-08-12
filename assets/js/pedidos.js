// Guardado manual y limpiar progreso para pedidos
document.addEventListener('DOMContentLoaded', () => {
  // Guardado manual
  const btnGuardar = document.getElementById('btn-guardar-progreso-pedidos');
  if (btnGuardar) {
    btnGuardar.onclick = function() {
      guardarProgresoPedidos();
      const originalText = this.textContent;
      this.textContent = '✓ Guardado';
      this.classList.add('btn-success');
      setTimeout(() => {
        this.textContent = originalText;
        this.classList.remove('btn-success');
      }, 2000);
    };
  }
  // Limpiar todo
  const btnLimpiar = document.getElementById('btn-limpiar-progreso-pedidos');
  if (btnLimpiar) {
    btnLimpiar.onclick = function() {
      if (confirm('¿Estás seguro de que quieres limpiar todos los datos?\n\nEsta acción no se puede deshacer.')) {
        localStorage.removeItem(PEDIDOS_PROGRESO_KEY);
        // Limpiar productos
        const container = document.getElementById('productos-tiendas-container');
        container.innerHTML = '';
        // Limpiar totales en el footer
        if (typeof inicializarTotalesTienda === 'function') {
          inicializarTotalesTienda();
        }
        // Limpiar gran total
        const granTotalElement = document.getElementById('gran-total');
        if (granTotalElement) {
          granTotalElement.textContent = '0';
        }
        // Opcional: agregar una fila vacía si así lo deseas
      }
    };
  }
  // Autoguardado en inputs
  document.addEventListener('input', function(e) {
    if (e.target && e.target.classList && e.target.classList.contains('cantidad-tienda-input')) {
      guardarProgresoPedidos();
    }
    if (e.target && e.target.classList && e.target.classList.contains('producto-select')) {
      guardarProgresoPedidos();
    }
  });
});
// --- GUARDADO Y RESTAURACIÓN DE PROGRESO DE PEDIDOS ---
const PEDIDOS_PROGRESO_KEY = 'pedidos_progreso';

function guardarProgresoPedidos() {
  const productos = [];
  document.querySelectorAll('.producto-tienda-item').forEach(fila => {
    const select = fila.querySelector('.producto-select');
    const producto = select ? select.value : '';
    if (!producto) return;
    const cantidades = {};
    fila.querySelectorAll('.cantidad-tienda-input').forEach(input => {
      cantidades[input.dataset.tienda] = input.value;
    });
    productos.push({ producto, cantidades });
  });
  const progreso = { productos, timestamp: new Date().toISOString() };
  localStorage.setItem(PEDIDOS_PROGRESO_KEY, JSON.stringify(progreso));
}

async function cargarProgresoPedidos() {
  const progreso = localStorage.getItem(PEDIDOS_PROGRESO_KEY);
  if (!progreso) return;
  try {
    const data = JSON.parse(progreso);
    // Limpiar productos actuales
    const container = document.getElementById('productos-tiendas-container');
    container.innerHTML = '';
    for (let idx = 0; idx < data.productos.length; idx++) {
      const item = data.productos[idx];
      const fila = agregarProductoPedido();
      const select = fila.querySelector('.producto-select');
      // Esperar a que las opciones estén cargadas
      setTimeout(() => {
        select.value = item.producto;
        actualizarTiendasProducto(select).then(() => {
          Object.entries(item.cantidades).forEach(([tienda, valor]) => {
            const input = fila.querySelector(`.cantidad-tienda-input[data-tienda="${tienda}"]`);
            if (input) {
              input.value = valor;
              actualizarTotales(input);
            }
          });
        });
      }, 200);
    }
  } catch (e) { console.error('Error cargando progreso pedidos:', e); }
}

// Restaurar progreso automáticamente al cargar la página
document.addEventListener('DOMContentLoaded', () => {
  cargarProgresoPedidos();
});
// Funciones para gestión de pedidos
const cargarTiendasDisponibles = async () => {
  //console.log('=== cargarTiendasDisponibles iniciado ===');
  try {
    const tiendasResponse = await api('/opciones/tiendas');
    //console.log('Respuesta de /opciones/tiendas:', tiendasResponse);
    
    tiendas = tiendasResponse;
    //console.log('Tiendas cargadas:', tiendas);
    
    // Inicializar el grid de totales por tienda
    inicializarTotalesTienda();
    
    //console.log('cargarTiendasDisponibles completado exitosamente');
  } catch (error) {
    console.error('Error cargando tiendas:', error);
    tiendas = [];
  }
};

// Función para inicializar el grid de totales por tienda
const inicializarTotalesTienda = () => {
  const tiendasTotalesGrid = document.getElementById('tiendas-totales-grid');
  if (!tiendasTotalesGrid) return;
  
  tiendasTotalesGrid.innerHTML = '';
  
  // Crear elementos simplificados para el total de cada tienda (solo números)
  tiendas.forEach(tienda => {
    const span = document.createElement('span');
    span.className = 'tienda-total-valor text-lg';
    span.setAttribute('data-tienda', tienda);
    span.textContent = '0';
    tiendasTotalesGrid.appendChild(span);
  });
};

async function actualizarTiendasProducto(selectProducto) {
    const productoSeleccionado = selectProducto.value;
    
    //console.log('actualizarTiendasProducto - productoSeleccionado:', productoSeleccionado);
    
    const fila = selectProducto.closest('.producto-tienda-item');
    const tiendasContainer = fila.querySelector('.tiendas-cantidades');
    const tiendasGrid = fila.querySelector('.tiendas-grid');
    const totalProducto = fila.querySelector('.producto-total');
    
    if (productoSeleccionado) {
        // Generar inputs para cada tienda
        tiendasGrid.innerHTML = '';
        
        for (const tienda of tiendas) {
            const tiendaDiv = document.createElement('div');
            tiendaDiv.className = 'tienda-input-container text-center';
      tiendaDiv.innerHTML = `
        <div class="text-sm font-medium text-gray-700 mb-1">${tienda}</div>
        <input type="number" 
             class="cantidad-tienda-input input w-20 text-center mx-auto border-red-300 bg-red-50" 
             data-tienda="${tienda}" 
             data-producto="${productoSeleccionado}" 
             value="" 
             min="0" 
             onchange="actualizarTotales(this)">
        <div class="inventario-info text-xs text-gray-500 mt-1" data-tienda="${tienda}">Cargando...</div>
      `;
            tiendasGrid.appendChild(tiendaDiv);
        }
        
        // Obtener inventario del producto seleccionado
        try {
            const encodedProducto = encodeURIComponent(productoSeleccionado);
            const inventarioResponse = await api(`inventario/ultimo/${encodedProducto}`);
            
            // Actualizar info de inventario para cada tienda
            tiendas.forEach(tienda => {
                const infoDiv = tiendasGrid.querySelector(`.inventario-info[data-tienda="${tienda}"]`);
                if (infoDiv) {
                    if (inventarioResponse && inventarioResponse[tienda]) {
                        const inv = inventarioResponse[tienda];
                        infoDiv.innerHTML = `Stock actual: ${inv.cantidad}`;
                        infoDiv.innerHTML += `<br>Ult. Act: ${inv.fecha}`;
                    } else {
                        infoDiv.textContent = 'Sin inventario';
                    }
                }
            });
            
            //console.log(`Inventario cargado para ${productoSeleccionado}`);
        } catch (error) {
            console.error('Error obteniendo inventario:', error);
            // Mostrar error en todos los divs de inventario
            tiendasGrid.querySelectorAll('.inventario-info').forEach(div => {
                div.textContent = 'Error cargando inventario';
            });
        }
        
        // Mostrar las columnas de tiendas y total
        tiendasContainer.style.visibility = 'visible';
        totalProducto.style.visibility = 'visible';
        
        //console.log('Grid de tiendas generado para:', productoSeleccionado);
    } else {
        // Ocultar las columnas si no hay producto seleccionado
        tiendasContainer.style.visibility = 'hidden';
        totalProducto.style.visibility = 'hidden';
        tiendasGrid.innerHTML = '';
        //console.log('Grid de tiendas ocultado');
    }
    
    // Actualizar disponibilidad de productos
    actualizarDisponibilidadProductos();
}

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
      <select class="producto-select select" onchange="actualizarTiendasProducto(this).catch(console.error)">>
        <option value="">-- Seleccionar producto --</option>
      </select>
    </td>
    <td class="tiendas-cantidades" style="visibility: hidden;">
      <div class="tiendas-grid grid grid-cols-3 gap-x-8" id="tiendas-grid-${contadorProductosPedido}"></div>
    </td>
    <td class="producto-total" style="visibility: hidden;">
      <span class="font-bold text-lg">0</span>
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
  return nuevoProducto;
};

const removerProductoPedido = (button) => {
  const container = document.getElementById('productos-tiendas-container');
  if (container.children.length > 1) {
    button.closest('tr.producto-tienda-item').remove();
    // Actualizar disponibilidad después de remover
    actualizarDisponibilidadProductos();
    // Actualizar los totales
    actualizarGranTotal();
    actualizarTotalesPorTienda();
  }
};

// Función para validar y actualizar totales al cambiar cantidades
const actualizarTotales = (input) => {
  // Mostrar stock resultante (suma simple)
  actualizarStockResultado(input);

  // Permitir vacío, pero si hay valor, validar que no sea negativo y convertir a entero
  if (input.value === '' || input.value === null) {
    // No modificar el valor, solo feedback visual
  } else {
    if (parseFloat(input.value) < 0) {
      input.value = 0;
    } else {
      input.value = Math.floor(parseFloat(input.value));
    }
  }

  // Feedback visual: rojo si vacío, verde si 0 o mayor
  input.classList.remove('border-red-300', 'bg-red-50', 'border-green-300', 'bg-green-50');
  if (input.value === '' || input.value === null) {
    input.classList.add('border-red-300', 'bg-red-50');
  } else {
    input.classList.add('border-green-300', 'bg-green-50');
  }

  // Calcular el total para este producto
  const fila = input.closest('.producto-tienda-item');
  calcularTotalProducto(fila);

  // Actualizar el gran total
  actualizarGranTotal();

  // Actualizar totales por tienda
  actualizarTotalesPorTienda();
};

// Suma simple: stock actual mostrado en la fila + input
function actualizarStockResultado(input) {
  const tienda = input.dataset.tienda;
  const fila = input.closest('.producto-tienda-item');
  if (!fila) return;
  // Buscar el div donde mostrar el resultado
  let stockDiv = fila.querySelector(`.stock-resultado[data-tienda="${tienda}"]`);
  if (!stockDiv) {
    // Si no existe, lo creamos (por compatibilidad)
    stockDiv = document.createElement('div');
    stockDiv.className = 'stock-resultado text-xs text-gray-700 mt-1';
    stockDiv.setAttribute('data-tienda', tienda);
    input.parentNode.appendChild(stockDiv);
  }
  // Buscar el stock actual mostrado en la fila
  const infoDiv = fila.querySelector(`.inventario-info[data-tienda="${tienda}"]`);
  let stockActual = 0;
  if (infoDiv) {
    const match = infoDiv.textContent.match(/Stock actual:\s*(\d+)/);
    if (match) {
      stockActual = parseInt(match[1]) || 0;
    }
  }
  const cantidad = parseInt(input.value) || 0;
  stockDiv.innerHTML = `Stock nuevo: <span class="stock-actual"></span><span class="stock-final">${stockActual + cantidad}</span>`;
}

// Calcular el total para un producto sumando todas sus cantidades
const calcularTotalProducto = (fila) => {
  let total = 0;
  const inputs = fila.querySelectorAll('.cantidad-tienda-input');
  
  inputs.forEach(input => {
    const cantidad = parseInt(input.value) || 0;
    total += cantidad;
  });
  
  const totalCell = fila.querySelector('.producto-total span');
  if (totalCell) {
    totalCell.textContent = total;
  }
  
  return total;
};

// Calcular el gran total sumando todos los totales por producto
const actualizarGranTotal = () => {
  let granTotal = 0;
  const filas = document.querySelectorAll('.producto-tienda-item');
  
  filas.forEach(fila => {
    const totalSpan = fila.querySelector('.producto-total span');
    if (totalSpan && totalSpan.closest('.producto-total').style.visibility !== 'hidden') {
      granTotal += parseInt(totalSpan.textContent) || 0;
    }
  });
  
  const granTotalElement = document.getElementById('gran-total');
  if (granTotalElement) {
    granTotalElement.textContent = granTotal;
  }
  
  return granTotal;
};

// Calcular los totales por tienda sumando verticalmente las cantidades
const actualizarTotalesPorTienda = () => {
  // Inicializar objeto para almacenar los totales por tienda
  const totalesPorTienda = {};
  tiendas.forEach(tienda => {
    totalesPorTienda[tienda] = 0;
  });
  
  // Sumar las cantidades de cada tienda en todas las filas de productos
  const filas = document.querySelectorAll('.producto-tienda-item');
  filas.forEach(fila => {
    // Solo procesar filas con productos seleccionados (visibles)
    if (fila.querySelector('.tiendas-cantidades').style.visibility !== 'hidden') {
      const inputs = fila.querySelectorAll('.cantidad-tienda-input');
      inputs.forEach(input => {
        const tienda = input.dataset.tienda;
        const cantidad = parseInt(input.value) || 0;
        if (totalesPorTienda.hasOwnProperty(tienda)) {
          totalesPorTienda[tienda] += cantidad;
        }
      });
    }
  });
  
  // Actualizar los elementos de la UI con los totales por tienda (solo números)
  for (const tienda in totalesPorTienda) {
    const totalElement = document.querySelector(`.tienda-total-valor[data-tienda="${tienda}"]`);
    if (totalElement) {
      totalElement.textContent = totalesPorTienda[tienda];
    }
  }
  
  return totalesPorTienda;
};
