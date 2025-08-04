// Funciones para cargar lotes
const cargarLotesPendientes = async () => {
  try {
    const lotes = await api('/lotes/pendientes');
    const selectProduccion = document.getElementById('select-lote');
    const selectDespacho = document.getElementById('select-lote-despacho');
    
    // Actualizar select de producción (lotes pendientes)
    if (selectProduccion) {
      selectProduccion.innerHTML = '<option value="">-- Seleccionar lote --</option>';
      
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
        
        selectProduccion.appendChild(option);
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
    const lotes = await api('/lotes/producidos');
    const selectDespacho = document.getElementById('select-lote-despacho');
    
    if (selectDespacho) {
      selectDespacho.innerHTML = '<option value="">-- Seleccionar lote --</option>';
      
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
        
        selectDespacho.appendChild(option);
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
