// Funciones para cargar lotes
const cargarLotesPendientes = async () => {
  try {
    const lotes = await api('/lotes/pendientes');
    const lotesContainer = document.getElementById('lotes-cards-container');
    const selectDespacho = document.getElementById('select-lote-despacho');
    
    // Actualizar contenedor de tarjetas para lotes pendientes
    if (lotesContainer) {
      lotesContainer.innerHTML = '';
      
      if (lotes.length === 0) {
        lotesContainer.innerHTML = '<p>No hay lotes pendientes disponibles</p>';
        return;
      }
      
      lotes.forEach(lote => {
        // Crear tarjeta para el lote
        const card = document.createElement('div');
        card.className = 'lote-card card w-full p-4 border-2 border-transparent [.selected]:bg-green-100 [.selected]:border-green-500';
        card.dataset.loteId = lote.id;
        
        if (lote.pedido && lote.pedido.items && lote.pedido.items.length > 0) {
          // Agrupar productos y calcular cantidades totales
          const productos = {};
          let cantidadTotal = 0;
          
          lote.pedido.items.forEach(item => {
            if (!productos[item.producto]) {
              productos[item.producto] = 0;
            }
            productos[item.producto] += item.cantidad_solicitada;
            cantidadTotal += item.cantidad_solicitada;
          });
          
          // Crear contenido de la tarjeta con información más detallada
          let contenidoHTML = `
            <input type="radio" name="lote_radio" id="lote-${lote.id}" value="${lote.id}">
            <h4>${lote.codigo_lote}</h4>
            <div class="flex justify-between items-center">
            <div class="grid gap-0">
            <span class="label">Fecha pedido</span> ${new Date(lote.pedido.fecha_pedido).toLocaleDateString()}</div>
            <div class="grid gap-0">
            <span class="label">Fecha requerida</span> ${new Date(lote.pedido.fecha_requerida).toLocaleDateString()}</div>
            <div class="grid gap-0">
            <span class="label">Total productos</span> 
            <span class="text-3xl font-bold">${cantidadTotal}</span>
            <span>unidades</span>
            </div>
            <!--<div class="lote-productos">
              <p><strong>Productos:</strong></p>
              <ul>-->
          `;
          
          // Agregar cada producto a la lista
          // Object.keys(productos).forEach(prod => {
          //   contenidoHTML += `<li>${prod}: ${productos[prod]} unidades</li>`;
          // });
          
          // contenidoHTML += 
          `
              <!--</ul>
            </div>-->
          `;
          
          card.innerHTML = contenidoHTML;
          card.dataset.productos = JSON.stringify(productos);
          card.dataset.cantidadTotal = cantidadTotal;
        } else {
          card.innerHTML = `
            <input type="radio" name="lote_radio" id="lote-${lote.id}" value="${lote.id}">
            <h4>${lote.codigo_lote}</h4>
            <p>Sin productos</p>
          `;
          card.dataset.productos = '{}';
          card.dataset.cantidadTotal = '0';
        }
        
        // Agregar evento click a la tarjeta
        card.addEventListener('click', function() {
          // Quitar clase 'selected' de todas las tarjetas
          document.querySelectorAll('.lote-card').forEach(c => c.classList.remove('selected'));
          
          // Agregar clase 'selected' a esta tarjeta
          this.classList.add('selected');
          
          // Marcar el radio button
          const radio = this.querySelector('input[type="radio"]');
          radio.checked = true;
          
          // Actualizar el campo oculto con el ID del lote
          document.getElementById('input-lote-id').value = this.dataset.loteId;
          
          // Llamar a la función para actualizar productos del lote
          actualizarProductoLote(this.dataset.loteId, this.dataset.productos);
        });
        
        lotesContainer.appendChild(card);
      });
    }
    
    // Cargar lotes producidos para despacho
    await cargarLotesProducidos();
  } catch (error) {
    console.error('Error cargando lotes:', error);
  }
};

const cargarLotesProducidos = async () => {
  try {
    //console.log('Iniciando carga de lotes producidos...');
    const lotes = await api('/lotes/producidos');
    //console.log('Lotes producidos obtenidos:', lotes);
    const lotesContainer = document.getElementById('lotes-despacho-cards-container');
    
    if (lotesContainer) {
      lotesContainer.innerHTML = '';
      
      if (lotes.length === 0) {
        lotesContainer.innerHTML = '<p>No hay lotes producidos disponibles</p>';
        return;
      }
      
      lotes.forEach(lote => {
        // Crear tarjeta para el lote
        const card = document.createElement('div');
        card.className = 'lote-card card w-full p-4 [.selected]:bg-green-100 [.selected]:border-green-500';
        card.dataset.loteId = lote.id;
        
        if (lote.pedido && lote.pedido.items && lote.pedido.items.length > 0) {
          // Agrupar productos y calcular cantidades totales
          const productos = {};
          let cantidadTotal = 0;
          
          lote.pedido.items.forEach(item => {
            if (!productos[item.producto]) {
              productos[item.producto] = 0;
            }
            productos[item.producto] += item.cantidad_solicitada;
            cantidadTotal += item.cantidad_solicitada;
          });
          
          // Crear contenido de la tarjeta con información más detallada
          let contenidoHTML = `
            <input type="radio" name="lote_radio_despacho" id="lote-despacho-${lote.id}" value="${lote.id}">
            <h4>${lote.codigo_lote}</h4>
            <div class="flex justify-between items-center"> 
            <div class="grid gap-0">
            <span class="label">Fecha pedido</span> ${new Date(lote.pedido.fecha_pedido).toLocaleDateString()}</div>
            <div class="grid gap-0">
            <span class="label">Fecha requerida</span> ${new Date(lote.pedido.fecha_requerida).toLocaleDateString()}</div>
            <div class="grid gap-0">
            <span class="label">Total productos</span> 
            <span class="text-3xl font-bold">${cantidadTotal}</span> 
            <span>unidades</span>
            </div>
            <!--<div class="lote-productos">
              <p><strong>Productos:</strong></p>
              <ul>-->
          `;
          
          // Agregar cada producto a la lista
          // Object.keys(productos).forEach(prod => {
          //   contenidoHTML += `<li>${prod}: ${productos[prod]} unidades</li>`;
          // });
          
          // contenidoHTML +=
          `
              <!--</ul>
            </div>-->
          `;
          
          card.innerHTML = contenidoHTML;
          card.dataset.productos = JSON.stringify(productos);
          card.dataset.cantidadTotal = cantidadTotal;
        } else {
          card.innerHTML = `
            <input type="radio" name="lote_radio_despacho" id="lote-despacho-${lote.id}" value="${lote.id}">
            <h4>${lote.codigo_lote}</h4>
            <p>Sin productos</p>
          `;
          card.dataset.productos = '{}';
          card.dataset.cantidadTotal = '0';
        }
        
        // Agregar evento click a la tarjeta
        card.addEventListener('click', function() {
          // Quitar clase 'selected' de todas las tarjetas
          document.querySelectorAll('#lotes-despacho-cards-container .lote-card').forEach(c => c.classList.remove('selected'));
          
          // Agregar clase 'selected' a esta tarjeta
          this.classList.add('selected');
          
          // Marcar el radio button
          const radio = this.querySelector('input[type="radio"]');
          radio.checked = true;
          
          // Actualizar el campo oculto con el ID del lote
          document.getElementById('input-lote-id-despacho').value = this.dataset.loteId;
          
          // Llamar a la función para actualizar la distribución del despacho
          actualizarDistribucionDespacho(this.dataset.loteId);
        });
        
        lotesContainer.appendChild(card);
      });
    }
    
    // Cargar lotes despachados para recepción
    await cargarLotesDespachados();
  } catch (error) {
    console.error('Error cargando lotes producidos:', error);
  }
};

const cargarLotesDespachados = async () => {
  try {
    const lotes = await api('/lotes?estado=despachado');
    const selectRecepcion = document.getElementById('select-lote-recepcion');
    
    if (selectRecepcion) {
      selectRecepcion.innerHTML = '<option value="">-- Seleccionar lote --</option>';
      
      lotes.forEach(lote => {
        const option = document.createElement('option');
        option.value = lote.id;
        
        if (lote.pedido && lote.pedido.items && lote.pedido.items.length > 0) {
          // Agrupar productos y calcular cantidades totales
          const productos = {};
          let cantidadTotal = 0;
          
          lote.pedido.items.forEach(item => {
            if (!productos[item.producto]) {
              productos[item.producto] = 0;
            }
            productos[item.producto] += item.cantidad_solicitada;
            cantidadTotal += item.cantidad_solicitada;
          });
          
          // Crear descripción del lote
          const productosTexto = Object.keys(productos).map(prod => 
            `${prod}(${productos[prod]})`
          ).join(', ');
          
          option.dataset.productos = JSON.stringify(productos);
          option.dataset.cantidadTotal = cantidadTotal;
          option.textContent = `${lote.codigo_lote} - ${productosTexto} (${cantidadTotal} total)`;
        } else {
          option.dataset.productos = '{}';
          option.dataset.cantidadTotal = '0';
          option.textContent = `${lote.codigo_lote} - Sin productos`;
        }
        
        selectRecepcion.appendChild(option);
      });
    }
  } catch (error) {
    console.error('Error cargando lotes despachados:', error);
  }
};

const cargarPedidosPendientes = async () => {
  try {
    const pedidos = await api('/pedidos/pendientes');
    const select = document.getElementById('select-pedido');
    select.innerHTML = '<option value="">-- Seleccionar pedido --</option>';
    
    pedidos.forEach(pedido => {
      const option = document.createElement('option');
      option.value = pedido.id;
      option.dataset.producto = pedido.producto;
      option.dataset.cantidad = pedido.cantidad_solicitada;
      option.textContent = `${pedido.producto} - ${pedido.cantidad_solicitada} unidades (Pedido: ${pedido.fecha_pedido}, Req: ${pedido.fecha_requerida})`;
      select.appendChild(option);
    });
  } catch (error) {
    console.error('Error cargando pedidos:', error);
  }
};
