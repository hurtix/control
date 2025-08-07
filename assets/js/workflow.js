// Funciones para actualizar datos de producción, despacho y recepción
const actualizarProductoLote = (loteId, productosData) => {
  const container = document.getElementById('productos-lote-container');
  const lista = document.getElementById('productos-lote-lista');
  const submitButton = document.getElementById('btn-registrar-produccion');
  
  if (loteId) {
    try {
      // Si productosData es un string, parsearlo
      const productos = typeof productosData === 'string' ? 
                         JSON.parse(productosData) : 
                         productosData;
      
      // Mostrar el contenedor
      container.style.display = 'block';
      
      // Limpiar la lista
      lista.innerHTML = '';
      
      // Deshabilitar el botón de envío inicialmente
      if (submitButton) {
        submitButton.disabled = true;
      }
      
      // Crear campos para cada producto con el nuevo diseño
      Object.keys(productos).forEach(producto => {
        const cantidad = productos[producto];
        const div = document.createElement('div');
        div.className = 'gap-2 flex flex-row items-center justify-between rounded-lg border p-4 shadow-xs mb-3';
        div.dataset.producto = producto;
        div.dataset.nombreProducto = producto;
        div.innerHTML = `
          <div class="flex flex-col gap-1 text-nowrap">
            <label class="leading-normal font-bold text-xl">${producto}</label>
            <div class="flex gap-x-8">
            <div class="flex flex-col">
            <span class="label mt-1">Qty solicitada <span class="font-bold text-lg">${cantidad}</span></span>
            
            </div>
            <div class="flex items-center gap-x-4"><label class="label">Qty producida</label>
              <input type="number" 
                    class="cantidad-producida-input input w-[100px] text-lg" 
                    data-producto="${producto}"
                    data-cantidad-solicitada="${cantidad}"
                    min="0" 
                    max="${cantidad * 1.2}"
                    placeholder=""
                    oninput="actualizarEstadoProduccion(this)"
                    required>
                    <div class="estado-produccion mt-1"></div>
                    </div>
            </div>
          </div>
          <div class="flex items-center">
            <input type="checkbox" 
                   class="producto-validado input"
                   data-producto="${producto}"
                   role="switch"
                   onchange="verificarProductosValidados()">
          </div>
        `;
        lista.appendChild(div);
      });
      
      // Agregar listener para cambios en los inputs
      document.querySelectorAll('.cantidad-producida-input').forEach(input => {
        input.addEventListener('input', function() {
          const parentDiv = this.closest('.flex.flex-row');
          const checkbox = parentDiv.querySelector('.producto-validado');
          
          // Deshabilitar checkbox si el input está vacío
          checkbox.disabled = !this.value;
          
          // Desmarcar el checkbox si el input está vacío
          if (!this.value) {
            checkbox.checked = false;
          }
          
          // Actualizar el estado de producción (déficit/superávit)
          actualizarEstadoProduccion(this);
          
          // Verificar todos los productos
          verificarProductosValidados();
        });
        
        // Inicializar el estado de producción para cada input
        actualizarEstadoProduccion(input);
      });
      
    } catch (error) {
      console.error('Error procesando datos del lote:', error);
      container.style.display = 'none';
    }
  } else {
    container.style.display = 'none';
    lista.innerHTML = '';
  }
};

// Función para actualizar el estado de producción (déficit o superávit)
const actualizarEstadoProduccion = (input) => {
  const cantidadSolicitada = parseInt(input.dataset.cantidadSolicitada);
  const cantidadProducida = parseInt(input.value);
  const estadoElement = input.nextElementSibling;
  
  // Limpiar el estado anterior
  estadoElement.innerHTML = '';
  estadoElement.classList.remove('deficit', 'superavit');
  
  if (!isNaN(cantidadProducida)) {
    if (cantidadProducida < cantidadSolicitada) {
      const faltante = cantidadSolicitada - cantidadProducida;
      estadoElement.innerHTML = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="inline-block w-4 h-4 mr-1"><path fill-rule="evenodd" clip-rule="evenodd" d="M1.47 6.47c.3-.3.77-.3 1.06 0l3.92 3.9c.51.51.84.84 1.12 1.05.26.2.38.22.46.22s.2-.02.47-.22.6-.54 1.12-1.05l.28-.27q.7-.72 1.24-1.15c.39-.3.83-.52 1.37-.52.53 0 .97.22 1.36.52q.55.43 1.24 1.15l6.14 6.1v-3.75a.75.75 0 0 1 1.5 0V18c0 .41-.34.75-.75.75h-5.58a.75.75 0 1 1 0-1.5h3.76L14.1 11.2c-.51-.51-.85-.84-1.12-1.05-.26-.2-.38-.22-.46-.22s-.2.02-.47.22-.6.54-1.12 1.05l-.28.27q-.69.72-1.24 1.15c-.39.3-.83.52-1.37.52-.53 0-.97-.22-1.37-.52q-.54-.43-1.24-1.15l-.03-.04-3.92-3.9a.75.75 0 0 1 0-1.06" fill="currentColor"/></svg>Déficit ${faltante} unidades`;
      estadoElement.classList.add('deficit');
    } else if (cantidadProducida > cantidadSolicitada) {
      const sobrante = cantidadProducida - cantidadSolicitada;
      estadoElement.innerHTML = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="inline-block w-4 h-4 mr-1"><path fill-rule="evenodd" clip-rule="evenodd" d="M15.67 7c0-.41.33-.75.75-.75H22c.41 0 .75.34.75.75v5.55a.75.75 0 0 1-1.5 0V8.8l-6.14 6.1q-.69.72-1.24 1.15c-.39.3-.83.52-1.36.52s-.98-.22-1.37-.52q-.54-.43-1.24-1.15l-.28-.27c-.51-.51-.85-.84-1.12-1.05-.26-.2-.38-.22-.47-.22s-.2.02-.46.22c-.28.2-.6.54-1.12 1.05l-3.92 3.9a.75.75 0 0 1-1.06-1.06l3.95-3.94q.7-.72 1.24-1.15c.4-.3.84-.52 1.37-.52s.98.22 1.37.52q.55.43 1.24 1.15l.28.27c.51.51.85.84 1.12 1.05.26.2.38.22.47.22s.2-.02.46-.22c.27-.2.6-.54 1.12-1.05l6.1-6.05h-3.77a.75.75 0 0 1-.75-.75" fill="currentColor"/></svg>Superávit ${sobrante} unidades`;
      estadoElement.classList.add('superavit');
    }
  }
};

// Función para verificar si todos los productos han sido validados
const verificarProductosValidados = () => {
  const submitButton = document.getElementById('btn-registrar-produccion');
  if (!submitButton) return;
  
  const inputs = document.querySelectorAll('.cantidad-producida-input');
  const checkboxes = document.querySelectorAll('.producto-validado');
  
  // Si no hay productos, deshabilitar el botón
  if (inputs.length === 0) {
    submitButton.disabled = true;
    return;
  }
  
  // Verificar que todos los inputs tengan un valor y todos los checkboxes estén marcados
  let todosValidados = true;
  
  inputs.forEach((input, index) => {
    const checkbox = checkboxes[index];
    if (!input.value || !checkbox.checked) {
      todosValidados = false;
    }
  });
  
  // Habilitar o deshabilitar el botón según el resultado
  submitButton.disabled = !todosValidados;
};

const actualizarDistribucionDespacho = async (loteId) => {
  const container = document.getElementById('distribucion-despacho-container');
  const lista = document.getElementById('distribucion-despacho-lista');
  
  if (!loteId) {
    loteId = document.getElementById('input-lote-id-despacho').value;
  }
  
  if (loteId) {
    try {
      // Obtener datos de distribución del endpoint
      const distribucion = await api(`/despacho/lote/${loteId}/disponible`);
      
      // Mostrar el contenedor
      container.style.display = 'block';
      
      // Limpiar la lista
      lista.innerHTML = '';
      
      if (distribucion.distribucion_calculada && distribucion.distribucion_calculada.length > 0) {
        
        // === TABLA 1: RESUMEN GENERAL DE PRODUCTOS ===
        const tablaGeneral = document.createElement('div');
        tablaGeneral.style.cssText = 'background: #f8f9fa; padding: 1em; border-radius: 5px; border: 1px solid #dee2e6; margin-bottom: 1.5em;';
        
        // Agrupar por producto para la tabla general
        const productosSummary = {};
        distribucion.distribucion_calculada.forEach(item => {
          if (!productosSummary[item.producto]) {
            productosSummary[item.producto] = {
              producto: item.producto,
              cantidad_solicitada: 0,
              cantidad_producida: item.cantidad_producida // Asumiendo que es la misma para todas las tiendas
            };
          }
          productosSummary[item.producto].cantidad_solicitada += item.cantidad_solicitada;
        });
        
        let htmlGeneral = '<h4 style="color: #495057; margin: 0 0 1em 0;">📊 Resumen General por Producto</h4>';
        htmlGeneral += '<table style="width: 100%; border-collapse: collapse;">';
        htmlGeneral += '<thead><tr style="background: #007cba; color: white;">';
        htmlGeneral += '<th style="border: 1px solid #ccc; padding: 8px;">Producto</th>';
        htmlGeneral += '<th style="border: 1px solid #ccc; padding: 8px;">Total Solicitado</th>';
        htmlGeneral += '<th style="border: 1px solid #ccc; padding: 8px;">Total Producido</th>';
        htmlGeneral += '<th style="border: 1px solid #ccc; padding: 8px;">Cantidad a Despachar</th>';
        htmlGeneral += '<th style="border: 1px solid #ccc; padding: 8px;">Estado</th>';
        htmlGeneral += '</tr></thead><tbody>';
        
        Object.values(productosSummary).forEach(item => {
          const producidoMenor = item.cantidad_producida < item.cantidad_solicitada;
          const statusColor = producidoMenor ? '#dc3545' : '#28a745';
          const statusText = producidoMenor ? '⚠️ Déficit' : '✅ Completo';
          
          htmlGeneral += '<tr>';
          htmlGeneral += `<td style="border: 1px solid #ccc; padding: 8px;"><strong>${item.producto}</strong></td>`;
          htmlGeneral += `<td style="border: 1px solid #ccc; padding: 8px;">${item.cantidad_solicitada}</td>`;
          htmlGeneral += `<td style="border: 1px solid #ccc; padding: 8px;">${item.cantidad_producida}</td>`;
          htmlGeneral += `<td style="border: 1px solid #ccc; padding: 8px;">`;
          htmlGeneral += `<input type="number" class="cantidad-despacho-input" data-producto="${item.producto}" `;
          htmlGeneral += `value="${item.cantidad_producida}" min="0" max="${item.cantidad_producida}" `;
          htmlGeneral += `style="width: 80px; padding: 4px; border: 1px solid #ccc; border-radius: 3px;" `;
          htmlGeneral += `onchange="validarCantidadDespacho(this, ${item.cantidad_producida})">`;
          htmlGeneral += `</td>`;
          htmlGeneral += `<td style="border: 1px solid #ccc; padding: 8px; color: ${statusColor}; font-weight: bold;">${statusText}</td>`;
          htmlGeneral += '</tr>';
        });
        
        htmlGeneral += '</tbody></table>';
        htmlGeneral += '<p style="color: #6c757d; font-size: 0.9em; margin: 0.5em 0 0 0;">💡 Ajuste las cantidades a despachar según disponibilidad. No puede exceder lo producido.</p>';
        tablaGeneral.innerHTML = htmlGeneral;
        lista.appendChild(tablaGeneral);
        
        // === TABLA 2: MATRIZ DE DISTRIBUCIÓN POR TIENDAS ===
        const tablaDistribucion = document.createElement('div');
        tablaDistribucion.style.cssText = 'background: #f0f8ff; padding: 1em; border-radius: 5px; border: 1px solid #b0d4f1;';
        
        // Obtener lista única de productos y tiendas
        const productos = [...new Set(distribucion.distribucion_calculada.map(item => item.producto))];
        const tiendas = [...new Set(distribucion.distribucion_calculada.map(item => item.tienda))];
        
        // Crear matriz de datos
        const matriz = {};
        distribucion.distribucion_calculada.forEach(item => {
          if (!matriz[item.producto]) {
            matriz[item.producto] = {};
          }
          matriz[item.producto][item.tienda] = {
            cantidad_solicitada: item.cantidad_solicitada,
            cantidad_a_despachar: item.cantidad_a_despachar,
            proporcion: item.proporcion
          };
        });
        
        let htmlDistribucion = '<h4 style="color: #0056b3; margin: 0 0 1em 0;">🚚 Distribución por Tiendas</h4>';
        htmlDistribucion += '<table style="width: 100%; border-collapse: collapse;">';
        htmlDistribucion += '<thead><tr style="background: #0056b3; color: white;">';
        htmlDistribucion += '<th style="border: 1px solid #ccc; padding: 8px;">Producto</th>';
        
        // Columnas de tiendas
        tiendas.forEach(tienda => {
          htmlDistribucion += `<th style="border: 1px solid #ccc; padding: 8px; text-align: center;">${tienda}</th>`;
        });
        
        htmlDistribucion += '</tr></thead><tbody>';
        
        // Filas de productos
        productos.forEach(producto => {
          htmlDistribucion += '<tr>';
          htmlDistribucion += `<td style="border: 1px solid #ccc; padding: 8px; font-weight: bold; background: #e9ecef;">${producto}</td>`;
          
          tiendas.forEach(tienda => {
            const datos = matriz[producto] && matriz[producto][tienda];
            if (datos) {
              htmlDistribucion += `<td style="border: 1px solid #ccc; padding: 8px; text-align: center;">`;
              htmlDistribucion += `<div style="font-size: 0.9em;">`;
              htmlDistribucion += `<div><strong>${datos.cantidad_a_despachar}</strong> unidades</div>`;
              htmlDistribucion += `<div style="color: #6c757d; font-size: 0.8em;">(${datos.proporcion}% del total)</div>`;
              htmlDistribucion += `<div style="color: #6c757d; font-size: 0.8em;">Solicitado: ${datos.cantidad_solicitada}</div>`;
              htmlDistribucion += `</div>`;
              htmlDistribucion += `</td>`;
            } else {
              htmlDistribucion += `<td style="border: 1px solid #ccc; padding: 8px; text-align: center; color: #6c757d;">-</td>`;
            }
          });
          
          htmlDistribucion += '</tr>';
        });
        
        htmlDistribucion += '</tbody></table>';
        htmlDistribucion += '<p style="color: #6c757d; font-size: 0.9em; margin: 0.5em 0 0 0;">📋 Esta distribución se basa en las proporciones del pedido original.</p>';
        tablaDistribucion.innerHTML = htmlDistribucion;
        lista.appendChild(tablaDistribucion);
        
      } else {
        lista.innerHTML = '<p style="color: #dc3545;">No hay datos de producción disponibles para este lote.</p>';
      }
      
    } catch (error) {
      console.error('Error cargando distribución de despacho:', error);
      container.style.display = 'none';
      lista.innerHTML = '<p style="color: #dc3545;">Error cargando la distribución automática.</p>';
    }
  } else {
    container.style.display = 'none';
    lista.innerHTML = '';
  }
};

const actualizarTiendasLote = async () => {
  const select = document.getElementById('select-lote-recepcion');
  const selectedOption = select.options[select.selectedIndex];
  const container = document.getElementById('tiendas-lote-container');
  const selectTienda = document.getElementById('select-tienda-recepcion');
  const containerTienda = document.getElementById('despachos-tienda-container');
  
  if (selectedOption.value) {
    try {
      // Obtener despachos del lote para ver qué tiendas tienen items
      const despachos = await api(`/despacho?lote_id=${selectedOption.value}`);
      
      // Obtener recepciones ya registradas para este lote
      const recepciones = await api(`/recepcion?lote_id=${selectedOption.value}`);
      
      // Mostrar el contenedor de tiendas
      container.style.display = 'block';
      containerTienda.style.display = 'none'; // Ocultar hasta que seleccionen tienda
      
      // Limpiar select de tienda
      selectTienda.innerHTML = '<option value="">-- Seleccionar tienda --</option>';
      
      if (despachos && despachos.length > 0) {
        // Obtener tiendas únicas que tienen despachos
        const tiendasConDespachos = [...new Set(despachos.map(d => d.tienda))];
        
        // Obtener tiendas que ya registraron recepción
        const tiendasConRecepcion = [...new Set(recepciones.map(r => r.tienda))];
        
        // Filtrar tiendas que tienen despachos pero NO tienen recepción
        const tiendasDisponibles = tiendasConDespachos.filter(tienda => 
          !tiendasConRecepcion.includes(tienda)
        );
        
        if (tiendasDisponibles.length > 0) {
          tiendasDisponibles.forEach(tienda => {
            const option = document.createElement('option');
            option.value = tienda;
            option.textContent = tienda;
            selectTienda.appendChild(option);
          });
        } else {
          // Si no hay tiendas disponibles, mostrar mensaje
          const option = document.createElement('option');
          option.value = '';
          option.textContent = '-- Todas las tiendas ya registraron recepción --';
          option.disabled = true;
          selectTienda.appendChild(option);
        }
      } else {
        container.style.display = 'none';
        alert('No hay despachos registrados para este lote.');
      }
      
    } catch (error) {
      console.error('Error cargando tiendas del lote:', error);
      container.style.display = 'none';
    }
  } else {
    container.style.display = 'none';
    containerTienda.style.display = 'none';
    selectTienda.innerHTML = '<option value="">-- Seleccionar tienda --</option>';
  }
};

const actualizarDespachosLoteTienda = async () => {
  const selectLote = document.getElementById('select-lote-recepcion');
  const selectTienda = document.getElementById('select-tienda-recepcion');
  const container = document.getElementById('despachos-tienda-container');
  const lista = document.getElementById('despachos-tienda-lista');
  
  const loteId = selectLote.value;
  const tienda = selectTienda.value;
  
  if (loteId && tienda) {
    try {
      // Obtener despachos del lote filtrados por tienda
      const despachos = await api(`/despacho?lote_id=${loteId}`);
      const despachosTienda = despachos.filter(d => d.tienda === tienda);
      
      // Mostrar el contenedor
      container.style.display = 'block';
      
      // Limpiar la lista
      lista.innerHTML = '';
      
      if (despachosTienda && despachosTienda.length > 0) {
        // Crear formulario con los despachos de esta tienda
        const tabla = document.createElement('div');
        tabla.style.cssText = 'background: #f0f8ff; padding: 1em; border-radius: 5px; border: 1px solid #b0d4f1;';
        
        let html = '<table style="width: 100%; border-collapse: collapse; margin-bottom: 1em;">';
        html += '<thead><tr style="background: #007cba; color: white;">';
        html += '<th style="border: 1px solid #ccc; padding: 8px;">Producto</th>';
        html += '<th style="border: 1px solid #ccc; padding: 8px;">Cantidad Despachada</th>';
        html += '<th style="border: 1px solid #ccc; padding: 8px;">Cantidad Recibida</th>';
        html += '<th style="border: 1px solid #ccc; padding: 8px;">Confirmado</th>';
        html += '</tr></thead><tbody>';
        
        despachosTienda.forEach((despacho, index) => {
          html += '<tr>';
          html += `<td style="border: 1px solid #ccc; padding: 8px;"><strong>${despacho.producto}</strong></td>`;
          html += `<td style="border: 1px solid #ccc; padding: 8px;">${despacho.cantidad_despachada}</td>`;
          html += `<td style="border: 1px solid #ccc; padding: 8px;">
                    <input type="number" 
                           class="cantidad-recibida-input" 
                           data-producto="${despacho.producto}"
                           data-tienda="${despacho.tienda}"
                           data-despachado="${despacho.cantidad_despachada}"
                           min="0" 
                           max="${despacho.cantidad_despachada}" 
                           value="${despacho.cantidad_despachada}" 
                           style="width: 100px;"
                           required>
                   </td>`;
          html += `<td style="border: 1px solid #ccc; padding: 8px;">
                    <select class="confirmado-input" 
                            data-producto="${despacho.producto}"
                            data-tienda="${despacho.tienda}">
                      <option value="1">Sí</option>
                      <option value="0">No</option>
                    </select>
                   </td>`;
          html += '</tr>';
        });
        
        html += '</tbody></table>';
        
        // Agregar resumen
        html += `<div style="background: #e8f5e8; padding: 0.8em; border-radius: 3px; margin-top: 1em;">
                  <strong>Resumen:</strong> ${despachosTienda.length} producto(s) para recibir en <strong>${tienda}</strong>
                 </div>`;
        
        tabla.innerHTML = html;
        lista.appendChild(tabla);
      } else {
        lista.innerHTML = '<p style="color: #dc3545;">No hay despachos registrados para esta tienda en este lote.</p>';
      }
      
    } catch (error) {
      console.error('Error cargando despachos de la tienda:', error);
      container.style.display = 'none';
      lista.innerHTML = '<p style="color: #dc3545;">Error cargando los despachos de la tienda.</p>';
    }
  } else {
    container.style.display = 'none';
    lista.innerHTML = '';
  }
};

const actualizarProductoPedido = () => {
  const select = document.getElementById('select-pedido');
  const selectedOption = select.options[select.selectedIndex];
  
  if (selectedOption.value) {
    document.getElementById('input-producto-produccion').value = selectedOption.dataset.producto;
    document.getElementById('cantidad-solicitada').value = selectedOption.dataset.cantidad;
  } else {
    document.getElementById('input-producto-produccion').value = '';
    document.getElementById('cantidad-solicitada').value = '';
  }
};

// Función para validar cantidades de despacho
const validarCantidadDespacho = (input, cantidadProducida) => {
  const valorIngresado = parseInt(input.value);
  const producto = input.dataset.producto;
  
  // Limpiar alertas previas
  const alertaExistente = input.parentNode.querySelector('.alerta-cantidad');
  if (alertaExistente) {
    alertaExistente.remove();
  }
  
  // Validar que no exceda lo producido
  if (valorIngresado > cantidadProducida) {
    input.value = cantidadProducida;
    mostrarAlertaCantidad(input, `⚠️ No puede despachar más de lo producido (${cantidadProducida})`, 'warning');
    return false;
  }
  
  // Validar que no sea negativo
  if (valorIngresado < 0) {
    input.value = 0;
    mostrarAlertaCantidad(input, `❌ La cantidad no puede ser negativa`, 'error');
    return false;
  }
  
  // Validar que coincida con lo producido (opcional, se puede hacer warning)
  if (valorIngresado !== cantidadProducida && valorIngresado > 0) {
    mostrarAlertaCantidad(input, `⚠️ Cantidad diferente a lo producido. ¿Hay productos dañados o retenidos?`, 'info');
  }
  
  // Actualizar el estilo del input según el estado
  if (valorIngresado === cantidadProducida) {
    input.style.borderColor = '#28a745';
    input.style.backgroundColor = '#f8fff9';
  } else if (valorIngresado < cantidadProducida) {
    input.style.borderColor = '#ffc107';
    input.style.backgroundColor = '#fffdf0';
  } else {
    input.style.borderColor = '#dc3545';
    input.style.backgroundColor = '#fff5f5';
  }
  
  return true;
};

// Función auxiliar para mostrar alertas de cantidad
const mostrarAlertaCantidad = (input, mensaje, tipo) => {
  const alerta = document.createElement('div');
  alerta.className = 'alerta-cantidad';
  alerta.style.cssText = `
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    padding: 0.25em 0.5em;
    font-size: 0.8em;
    border-radius: 3px;
    z-index: 1000;
    margin-top: 2px;
  `;
  
  // Estilos según el tipo
  switch (tipo) {
    case 'error':
      alerta.style.backgroundColor = '#f8d7da';
      alerta.style.color = '#721c24';
      alerta.style.border = '1px solid #f5c6cb';
      break;
    case 'warning':
      alerta.style.backgroundColor = '#fff3cd';
      alerta.style.color = '#856404';
      alerta.style.border = '1px solid #ffeaa7';
      break;
    case 'info':
      alerta.style.backgroundColor = '#d1ecf1';
      alerta.style.color = '#0c5460';
      alerta.style.border = '1px solid #b8daff';
      break;
  }
  
  alerta.textContent = mensaje;
  
  // Hacer el contenedor padre relativo si no lo es
  input.parentNode.style.position = 'relative';
  input.parentNode.appendChild(alerta);
  
  // Remover la alerta después de 3 segundos
  setTimeout(() => {
    if (alerta.parentNode) {
      alerta.remove();
    }
  }, 3000);
};

/**
 * Carga los despachos para un lote y una tienda específica (para el formulario de recepción)
 * Versión adaptada para la nueva interfaz con tarjetas y usuario vinculado a tienda
 */
async function cargarDespachosLoteTiendaRecepcion(loteId, tiendaNombre) {
  const container = document.getElementById('despachos-tienda-container');
  const lista = document.getElementById('despachos-tienda-lista');
  
  if (loteId && tiendaNombre) {
    try {
      // Mostrar el contenedor
      container.style.display = 'block';
      
      // Obtener despachos del lote filtrados por tienda
      const despachos = await api(`/despacho?lote_id=${loteId}`);
      const despachosTienda = despachos.filter(d => d.tienda === tiendaNombre);
      
      // Limpiar la lista
      lista.innerHTML = '';
      
      if (despachosTienda && despachosTienda.length > 0) {
        // Crear formulario con los despachos de esta tienda
        const tabla = document.createElement('div');
        tabla.style.cssText = 'background: #f0f8ff; padding: 1em; border-radius: 5px; border: 1px solid #b0d4f1;';
        
        let html = '<table style="width: 100%; border-collapse: collapse; margin-bottom: 1em;">';
        html += '<thead><tr style="background: #007cba; color: white;">';
        html += '<th style="border: 1px solid #ccc; padding: 8px;">Producto</th>';
        html += '<th style="border: 1px solid #ccc; padding: 8px;">Cantidad Despachada</th>';
        html += '<th style="border: 1px solid #ccc; padding: 8px;">Cantidad Recibida</th>';
        html += '<th style="border: 1px solid #ccc; padding: 8px;">Confirmado</th>';
        html += '</tr></thead><tbody>';
        
        despachosTienda.forEach((despacho, index) => {
          html += '<tr>';
          html += `<td style="border: 1px solid #ccc; padding: 8px;"><strong>${despacho.producto}</strong></td>`;
          html += `<td style="border: 1px solid #ccc; padding: 8px;">${despacho.cantidad_despachada}</td>`;
          html += `<td style="border: 1px solid #ccc; padding: 8px;">
                    <input type="number" 
                           class="cantidad-recibida-input" 
                           data-producto="${despacho.producto}"
                           data-tienda="${despacho.tienda}"
                           data-despachado="${despacho.cantidad_despachada}"
                           min="0" 
                           max="${despacho.cantidad_despachada}" 
                           value="${despacho.cantidad_despachada}" 
                           style="width: 100px;"
                           required>
                   </td>`;
          html += `<td style="border: 1px solid #ccc; padding: 8px;">
                    <select class="confirmado-input" 
                            data-producto="${despacho.producto}"
                            data-tienda="${despacho.tienda}">
                      <option value="1">Sí</option>
                      <option value="0">No</option>
                    </select>
                   </td>`;
          html += '</tr>';
        });
        
        html += '</tbody></table>';
        
        // Agregar resumen
        html += `<div style="background: #e8f5e8; padding: 0.8em; border-radius: 3px; margin-top: 1em;">
                  <strong>Resumen:</strong> ${despachosTienda.length} producto(s) para recibir en <strong>${tiendaNombre}</strong>
                </div>`;
        
        tabla.innerHTML = html;
        lista.appendChild(tabla);
      } else {
        lista.innerHTML = '<div class="empty-message">No hay productos para recibir en esta tienda para este lote</div>';
      }
    } catch (error) {
      console.error('Error cargando despachos para recepción:', error);
      lista.innerHTML = '<div class="error-message">Error al cargar despachos. Intente nuevamente.</div>';
      container.style.display = 'block';
    }
  } else {
    container.style.display = 'none';
  }
}
