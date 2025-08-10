// Manejadores de eventos para maestros y consultas

// Consultas generales
const consultar = (tipo) => {
  let endpoint = '/pedidos';
  let role = 'ventas';
  if (tipo === 'produccion') { endpoint = '/produccion'; role = 'produccion'; }
  if (tipo === 'despacho') { endpoint = '/despacho'; role = 'despacho'; }
  if (tipo === 'recepcion') { endpoint = '/recepcion'; role = 'tienda'; }
  if (tipo === 'alertas') { endpoint = '/alertas'; role = 'admin'; }
  
  api(endpoint, 'GET', null, role).then(res => {
    // Mostrar JSON para debug y luego formatear
    console.log('Respuesta del servidor:', res);
    console.log('Tipo de consulta:', tipo);
    console.log('Endpoint:', endpoint);
    console.log('Role:', role);
    
    if (res && !res.error) {
      mostrarConsultaFormateada(tipo, res);
    } else {
      resultConsultas.textContent = JSON.stringify(res, null, 2);
    }
  }).catch(error => {
    console.error('Error en la consulta:', error);
    resultConsultas.textContent = 'Error en la consulta: ' + error.message;
  });
};

// Función para mostrar consultas formateadas
function mostrarConsultaFormateada(tipo, datos) {
  let html = `<div class="consulta-container">`;
  
  switch (tipo) {
    case 'pedidos':
      html += mostrarPedidosFormateados(datos);
      break;
    case 'produccion':
      html += mostrarProduccionFormateada(datos);
      break;
    case 'despacho':
      html += mostrarDespachosFormateados(datos);
      break;
    case 'recepcion':
      html += mostrarRecepcionesFormateadas(datos);
      break;
    case 'alertas':
      html += mostrarAlertasFormateadas(datos);
      break;
    default:
      html += `<pre>${JSON.stringify(datos, null, 2)}</pre>`;
  }
  
  html += `</div>`;
  resultConsultas.innerHTML = html;
}

// Función para mostrar pedidos formateados
function mostrarPedidosFormateados(datos) {
  let html = `<h3>Consulta de Pedidos</h3>`;
  
  // Intentar diferentes estructuras de datos
  let pedidos = datos.pedidos || datos || [];
  if (!Array.isArray(pedidos)) {
    pedidos = [];
  }
  
  if (pedidos.length === 0) {
    return html + `<p>No hay pedidos registrados</p>`;
  }
  
  html += `<div class="border p-4 rounded-lg"><table class="table">
    <thead>
      <tr>
        <th>Lote</th>
        <th>Fecha Pedido</th>
        <th>Fecha Requerida</th>
        <th>Responsable</th>
        <th>Productos</th>
      </tr>
    </thead>
    <tbody>`;
    pedidos.forEach((pedido, idx) => {
      const fechaPedido = new Date(pedido.fecha_pedido).toLocaleString('es-ES');
      const fechaRequerida = new Date(pedido.fecha_requerida).toLocaleDateString('es-ES');
      // const estadoColor = pedido.estado === 'completado' ? '#28a745' : pedido.estado === 'en_proceso' ? '#ffc107' : '#dc3545';
      const loteId = pedido.lote_id || pedido.id || pedido.lote || 'Sin ID';
      const productosId = `productos-dialog-${idx}`;
      let productosBtn = '';
      if (pedido.items && pedido.items.length > 0) {
        productosBtn = `<button type="button"  onclick="document.getElementById('dialog-${loteId}').showModal()" class="btn-outline" data-productos-id="dialog-${loteId}">Ver productos</button>`;
      } else {
        productosBtn = '<span>Sin productos</span>';
      }
      html += `<tr>
        <td><svg viewBox="0 0 24 24" class="w-4 inline-flex items-center" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M12 1.25C11.3953 1.25 10.8384 1.40029 10.2288 1.65242C9.64008 1.89588 8.95633 2.25471 8.1049 2.70153L6.03739 3.78651C4.99242 4.33487 4.15616 4.77371 3.51047 5.20491C2.84154 5.65164 2.32632 6.12201 1.95112 6.75918C1.57718 7.39421 1.40896 8.08184 1.32829 8.90072C1.24999 9.69558 1.24999 10.6731 1.25 11.9026V12.0974C1.24999 13.3268 1.24999 14.3044 1.32829 15.0993C1.40896 15.9182 1.57718 16.6058 1.95112 17.2408C2.32632 17.878 2.84154 18.3484 3.51047 18.7951C4.15616 19.2263 4.99241 19.6651 6.03737 20.2135L8.10481 21.2984C8.95628 21.7453 9.64006 22.1041 10.2288 22.3476C10.8384 22.5997 11.3953 22.75 12 22.75C12.6047 22.75 13.1616 22.5997 13.7712 22.3476C14.3599 22.1041 15.0437 21.7453 15.8951 21.2985L17.9626 20.2135C19.0076 19.6651 19.8438 19.2263 20.4895 18.7951C21.1585 18.3484 21.6737 17.878 22.0489 17.2408C22.4228 16.6058 22.591 15.9182 22.6717 15.0993C22.75 14.3044 22.75 13.3269 22.75 12.0975V11.9025C22.75 10.6731 22.75 9.69557 22.6717 8.90072C22.591 8.08184 22.4228 7.39421 22.0489 6.75918C21.6737 6.12201 21.1585 5.65164 20.4895 5.20491C19.8438 4.77371 19.0076 4.33487 17.9626 3.7865L15.8951 2.70154C15.0437 2.25472 14.3599 1.89589 13.7712 1.65242C13.1616 1.40029 12.6047 1.25 12 1.25ZM8.7708 4.04608C9.66052 3.57917 10.284 3.2528 10.802 3.03856C11.3062 2.83004 11.6605 2.75 12 2.75C12.3395 2.75 12.6938 2.83004 13.198 3.03856C13.716 3.2528 14.3395 3.57917 15.2292 4.04608L17.2292 5.09563C18.3189 5.66748 19.0845 6.07032 19.6565 6.45232C19.9387 6.64078 20.1604 6.81578 20.3395 6.99174L17.0088 8.65708L8.50895 4.18349L8.7708 4.04608ZM6.94466 5.00439L6.7708 5.09563C5.68111 5.66747 4.91553 6.07032 4.34352 6.45232C4.06131 6.64078 3.83956 6.81578 3.66054 6.99174L12 11.1615L15.3572 9.48289L7.15069 5.16369C7.07096 5.12173 7.00191 5.06743 6.94466 5.00439ZM2.93768 8.30737C2.88718 8.52125 2.84901 8.76413 2.82106 9.04778C2.75084 9.7606 2.75 10.6644 2.75 11.9415V12.0585C2.75 13.3356 2.75084 14.2394 2.82106 14.9522C2.88974 15.6494 3.02022 16.1002 3.24367 16.4797C3.46587 16.857 3.78727 17.1762 4.34352 17.5477C4.91553 17.9297 5.68111 18.3325 6.7708 18.9044L8.7708 19.9539C9.66052 20.4208 10.284 20.7472 10.802 20.9614C10.9656 21.0291 11.1134 21.0832 11.25 21.1255V12.4635L2.93768 8.30737ZM12.75 21.1255C12.8866 21.0832 13.0344 21.0291 13.198 20.9614C13.716 20.7472 14.3395 20.4208 15.2292 19.9539L17.2292 18.9044C18.3189 18.3325 19.0845 17.9297 19.6565 17.5477C20.2127 17.1762 20.5341 16.857 20.7563 16.4797C20.9798 16.1002 21.1103 15.6494 21.1789 14.9522C21.2492 14.2394 21.25 13.3356 21.25 12.0585V11.9415C21.25 10.6644 21.2492 9.7606 21.1789 9.04778C21.151 8.76412 21.1128 8.52125 21.0623 8.30736L17.75 9.96352V13C17.75 13.4142 17.4142 13.75 17 13.75C16.5858 13.75 16.25 13.4142 16.25 13V10.7135L12.75 12.4635V21.1255Z" fill="currentColor"></path> </g></svg> ${loteId}</td>
        <td>${fechaPedido}</td>
        <td>${fechaRequerida}</td>
        <td>${pedido.empleado || 'No especificado'}</td>
        <td>${productosBtn}
          <dialog id="dialog-${loteId}" class="dialog w-full sm:max-w-[425px] max-h-[612px]" aria-labelledby="dialog-${loteId}-title" aria-describedby="dialog-${loteId}-description" onclick="if (event.target === this) this.close()">
          <article>
          <header>
            <h4>Productos del pedido</h4>
          </header>
          <section>
            <div><table class="table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <!-- Tiendas dinámicas -->
                  ${(function() {
                    // Obtener tiendas únicas de los items
                    const tiendas = Array.from(new Set((pedido.items||[]).map(i => i.tienda)));
                    return tiendas.map(t => `<th>${t}</th>`).join('') + '<th>Total</th>';
                  })()}
                </tr>
              </thead>
              <tbody>
                ${(function() {
                  // Agrupar por producto
                  const items = pedido.items||[];
                  const tiendas = Array.from(new Set(items.map(i => i.tienda)));
                  const productos = Array.from(new Set(items.map(i => i.producto)));
                  return productos.map(prod => {
                    // Para cada tienda, buscar cantidad
                    let total = 0;
                    const tds = tiendas.map(t => {
                      const found = items.find(i => i.producto === prod && i.tienda === t);
                      if (found) { total += Number(found.cantidad_solicitada)||0; return `<td>${found.cantidad_solicitada}</td>`; }
                      return '<td>0</td>';
                    }).join('');
                    return `<tr><td>${prod}</td>${tds}<td><strong>${total}</strong></td></tr>`;
                  }).join('');
                })()}
              </tbody>
            </table></div>
            </section>
            <footer>
            <button class="btn-outline" onclick="this.closest('dialog').close()">Cancel</button>
            </footer>
          </article></dialog>
        </td>
      </tr>`;
  });
  html += `</tbody></table></div>`;
  
  return html;
}
    // Script para manejar los diálogos
    // setTimeout(() => {
    //   document.querySelectorAll('button[data-productos-id]').forEach(btn => {
    //     btn.onclick = function() {
    //       const dialog = document.getElementById(btn.getAttribute('data-productos-id'));
    //       if (dialog) dialog.showModal();
    //     };
    //   });
    //   document.querySelectorAll('.productos-dialog .cerrar-dialog').forEach(btn => {
    //     btn.onclick = function() {
    //       const dialog = btn.closest('dialog');
    //       if (dialog) dialog.close();
    //     };
    //   });
    // }, 0);

// Función para mostrar producción formateada
function mostrarProduccionFormateada(datos) {
  let html = `<h3>Consulta de Producción</h3>`;
  let produccion = datos.produccion || datos || [];
  if (!Array.isArray(produccion)) produccion = [];
  if (produccion.length === 0) return html + `<p>No hay registros de producción</p>`;
  html += `<div class="border p-4 rounded-lg"><table class="table">
    <thead>
      <tr>
        <th>Lote</th>
        <th>Fecha Producción</th>
        <th>Responsable</th>
        <th>Observaciones</th>
        <th>Productos</th>
      </tr>
    </thead>
    <tbody>`;
  produccion.forEach((prod, idx) => {
    const fecha = new Date(prod.fecha).toLocaleString('es-ES');
    const productosId = `prod-dialog-${idx}`;
    let productosBtn = '';
    if (prod.items && prod.items.length > 0) {
      productosBtn = `<button type="button" onclick="document.getElementById('${productosId}').showModal()" class="btn-outline" data-productos-id="${productosId}">Ver productos</button>`;
    } else {
      productosBtn = '<span>Sin productos</span>';
    }
    html += `<tr>
      <td><svg viewBox="0 0 24 24" class="w-4 inline-flex items-center" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M12 1.25C11.3953 1.25 10.8384 1.40029 10.2288 1.65242C9.64008 1.89588 8.95633 2.25471 8.1049 2.70153L6.03739 3.78651C4.99242 4.33487 4.15616 4.77371 3.51047 5.20491C2.84154 5.65164 2.32632 6.12201 1.95112 6.75918C1.57718 7.39421 1.40896 8.08184 1.32829 8.90072C1.24999 9.69558 1.24999 10.6731 1.25 11.9026V12.0974C1.24999 13.3268 1.24999 14.3044 1.32829 15.0993C1.40896 15.9182 1.57718 16.6058 1.95112 17.2408C2.32632 17.878 2.84154 18.3484 3.51047 18.7951C4.15616 19.2263 4.99241 19.6651 6.03737 20.2135L8.10481 21.2984C8.95628 21.7453 9.64006 22.1041 10.2288 22.3476C10.8384 22.5997 11.3953 22.75 12 22.75C12.6047 22.75 13.1616 22.5997 13.7712 22.3476C14.3599 22.1041 15.0437 21.7453 15.8951 21.2985L17.9626 20.2135C19.0076 19.6651 19.8438 19.2263 20.4895 18.7951C21.1585 18.3484 21.6737 17.878 22.0489 17.2408C22.4228 16.6058 22.591 15.9182 22.6717 15.0993C22.75 14.3044 22.75 13.3269 22.75 12.0975V11.9025C22.75 10.6731 22.75 9.69557 22.6717 8.90072C22.591 8.08184 22.4228 7.39421 22.0489 6.75918C21.6737 6.12201 21.1585 5.65164 20.4895 5.20491C19.8438 4.77371 19.0076 4.33487 17.9626 3.7865L15.8951 2.70154C15.0437 2.25472 14.3599 1.89589 13.7712 1.65242C13.1616 1.40029 12.6047 1.25 12 1.25ZM8.7708 4.04608C9.66052 3.57917 10.284 3.2528 10.802 3.03856C11.3062 2.83004 11.6605 2.75 12 2.75C12.3395 2.75 12.6938 2.83004 13.198 3.03856C13.716 3.2528 14.3395 3.57917 15.2292 4.04608L17.2292 5.09563C18.3189 5.66748 19.0845 6.07032 19.6565 6.45232C19.9387 6.64078 20.1604 6.81578 20.3395 6.99174L17.0088 8.65708L8.50895 4.18349L8.7708 4.04608ZM6.94466 5.00439L6.7708 5.09563C5.68111 5.66747 4.91553 6.07032 4.34352 6.45232C4.06131 6.64078 3.83956 6.81578 3.66054 6.99174L12 11.1615L15.3572 9.48289L7.15069 5.16369C7.07096 5.12173 7.00191 5.06743 6.94466 5.00439ZM2.93768 8.30737C2.88718 8.52125 2.84901 8.76413 2.82106 9.04778C2.75084 9.7606 2.75 10.6644 2.75 11.9415V12.0585C2.75 13.3356 2.75084 14.2394 2.82106 14.9522C2.88974 15.6494 3.02022 16.1002 3.24367 16.4797C3.46587 16.857 3.78727 17.1762 4.34352 17.5477C4.91553 17.9297 5.68111 18.3325 6.7708 18.9044L8.7708 19.9539C9.66052 20.4208 10.284 20.7472 10.802 20.9614C10.9656 21.0291 11.1134 21.0832 11.25 21.1255V12.4635L2.93768 8.30737ZM12.75 21.1255C12.8866 21.0832 13.0344 21.0291 13.198 20.9614C13.716 20.7472 14.3395 20.4208 15.2292 19.9539L17.2292 18.9044C18.3189 18.3325 19.0845 17.9297 19.6565 17.5477C20.2127 17.1762 20.5341 16.857 20.7563 16.4797C20.9798 16.1002 21.1103 15.6494 21.1789 14.9522C21.2492 14.2394 21.25 13.3356 21.25 12.0585V11.9415C21.25 10.6644 21.2492 9.7606 21.1789 9.04778C21.151 8.76412 21.1128 8.52125 21.0623 8.30736L17.75 9.96352V13C17.75 13.4142 17.4142 13.75 17 13.75C16.5858 13.75 16.25 13.4142 16.25 13V10.7135L12.75 12.4635V21.1255Z" fill="currentColor"></path> </g></svg> ${prod.lote_id}</td>
      <td>${fecha}</td>
      <td>${prod.empleado || 'No especificado'}</td>
      <td>${prod.observaciones || ''}</td>
      <td>${productosBtn}
        <dialog id="${productosId}" class="dialog w-full sm:max-w-[425px] max-h-[612px]" aria-labelledby="${productosId}-title" aria-describedby="${productosId}-description" onclick="if (event.target === this) this.close()">
        <article>
        <header><h4>Productos producidos</h4></header>
        <section>
        <div class="table-responsive"><table class="table table-sm">
          <thead>
            <tr>
              <th>Producto</th>
              ${(function() {
                const empleados = Array.from(new Set((prod.items||[]).map(i => i.empleado||'')));
                return empleados.map(e => `<th>${e||'Empleado'}</th>`).join('') + '<th>Total</th>';
              })()}
            </tr>
          </thead>
          <tbody>
            ${(function() {
              const items = prod.items||[];
              const empleados = Array.from(new Set(items.map(i => i.empleado||'')));
              const productos = Array.from(new Set(items.map(i => i.producto)));
              return productos.map(p => {
                let total = 0;
                const tds = empleados.map(e => {
                  const found = items.find(i => i.producto === p && (i.empleado||'') === e);
                  if (found) { total += Number(found.cantidad_producida)||0; return `<td>${found.cantidad_producida}</td>`; }
                  return '<td>0</td>';
                }).join('');
                return `<tr><td>${p}</td>${tds}<td><strong>${total}</strong></td></tr>`;
              }).join('');
            })()}
          </tbody>
        </table></div>
        </section>
        <footer><button class="btn-outline" onclick="this.closest('dialog').close()">Cerrar</button></footer>
        </article></dialog>
      </td>
    </tr>`;
  });
  html += `</tbody></table></div>`;
  return html;
}

// Función para mostrar despachos formateados
function mostrarDespachosFormateados(datos) {
  let html = `<h3>Consulta de Despachos</h3>`;
  let despachos = datos.despachos || datos || [];
  if (!Array.isArray(despachos)) despachos = [];
  if (despachos.length === 0) return html + `<p>No hay registros de despachos</p>`;
  html += `<div class="border p-4 rounded-lg"><table class="table">
    <thead>
      <tr>
        <th>Lote</th>
        <th>Fecha Despacho</th>
        <th>Responsable</th>
        <th>Observaciones</th>
        <th>Productos</th>
      </tr>
    </thead>
    <tbody>`;
  // Agrupar por lote
  const despachosPorLote = {};
  despachos.forEach(despacho => {
    if (!despachosPorLote[despacho.lote_id]) {
      despachosPorLote[despacho.lote_id] = [];
    }
    despachosPorLote[despacho.lote_id].push(despacho);
  });
  Object.keys(despachosPorLote).forEach((loteId, idx) => {
    const despachosLote = despachosPorLote[loteId];
    const fecha = new Date(despachosLote[0].fecha).toLocaleString('es-ES');
    const productosId = `desp-dialog-${idx}`;
    let productosBtn = '';
    if (despachosLote.length > 0) {
      productosBtn = `<button type="button" onclick="document.getElementById('${productosId}').showModal()" class="btn-outline" data-productos-id="${productosId}">Ver productos</button>`;
    } else {
      productosBtn = '<span>Sin productos</span>';
    }
    html += `<tr>
      <td><svg viewBox="0 0 24 24" class="w-4 inline-flex items-center" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M12 1.25C11.3953 1.25 10.8384 1.40029 10.2288 1.65242C9.64008 1.89588 8.95633 2.25471 8.1049 2.70153L6.03739 3.78651C4.99242 4.33487 4.15616 4.77371 3.51047 5.20491C2.84154 5.65164 2.32632 6.12201 1.95112 6.75918C1.57718 7.39421 1.40896 8.08184 1.32829 8.90072C1.24999 9.69558 1.24999 10.6731 1.25 11.9026V12.0974C1.24999 13.3268 1.24999 14.3044 1.32829 15.0993C1.40896 15.9182 1.57718 16.6058 1.95112 17.2408C2.32632 17.878 2.84154 18.3484 3.51047 18.7951C4.15616 19.2263 4.99241 19.6651 6.03737 20.2135L8.10481 21.2984C8.95628 21.7453 9.64006 22.1041 10.2288 22.3476C10.8384 22.5997 11.3953 22.75 12 22.75C12.6047 22.75 13.1616 22.5997 13.7712 22.3476C14.3599 22.1041 15.0437 21.7453 15.8951 21.2985L17.9626 20.2135C19.0076 19.6651 19.8438 19.2263 20.4895 18.7951C21.1585 18.3484 21.6737 17.878 22.0489 17.2408C22.4228 16.6058 22.591 15.9182 22.6717 15.0993C22.75 14.3044 22.75 13.3269 22.75 12.0975V11.9025C22.75 10.6731 22.75 9.69557 22.6717 8.90072C22.591 8.08184 22.4228 7.39421 22.0489 6.75918C21.6737 6.12201 21.1585 5.65164 20.4895 5.20491C19.8438 4.77371 19.0076 4.33487 17.9626 3.7865L15.8951 2.70154C15.0437 2.25472 14.3599 1.89589 13.7712 1.65242C13.1616 1.40029 12.6047 1.25 12 1.25ZM8.7708 4.04608C9.66052 3.57917 10.284 3.2528 10.802 3.03856C11.3062 2.83004 11.6605 2.75 12 2.75C12.3395 2.75 12.6938 2.83004 13.198 3.03856C13.716 3.2528 14.3395 3.57917 15.2292 4.04608L17.2292 5.09563C18.3189 5.66748 19.0845 6.07032 19.6565 6.45232C19.9387 6.64078 20.1604 6.81578 20.3395 6.99174L17.0088 8.65708L8.50895 4.18349L8.7708 4.04608ZM6.94466 5.00439L6.7708 5.09563C5.68111 5.66747 4.91553 6.07032 4.34352 6.45232C4.06131 6.64078 3.83956 6.81578 3.66054 6.99174L12 11.1615L15.3572 9.48289L7.15069 5.16369C7.07096 5.12173 7.00191 5.06743 6.94466 5.00439ZM2.93768 8.30737C2.88718 8.52125 2.84901 8.76413 2.82106 9.04778C2.75084 9.7606 2.75 10.6644 2.75 11.9415V12.0585C2.75 13.3356 2.75084 14.2394 2.82106 14.9522C2.88974 15.6494 3.02022 16.1002 3.24367 16.4797C3.46587 16.857 3.78727 17.1762 4.34352 17.5477C4.91553 17.9297 5.68111 18.3325 6.7708 18.9044L8.7708 19.9539C9.66052 20.4208 10.284 20.7472 10.802 20.9614C10.9656 21.0291 11.1134 21.0832 11.25 21.1255V12.4635L2.93768 8.30737ZM12.75 21.1255C12.8866 21.0832 13.0344 21.0291 13.198 20.9614C13.716 20.7472 14.3395 20.4208 15.2292 19.9539L17.2292 18.9044C18.3189 18.3325 19.0845 17.9297 19.6565 17.5477C20.2127 17.1762 20.5341 16.857 20.7563 16.4797C20.9798 16.1002 21.1103 15.6494 21.1789 14.9522C21.2492 14.2394 21.25 13.3356 21.25 12.0585V11.9415C21.25 10.6644 21.2492 9.7606 21.1789 9.04778C21.151 8.76412 21.1128 8.52125 21.0623 8.30736L17.75 9.96352V13C17.75 13.4142 17.4142 13.75 17 13.75C16.5858 13.75 16.25 13.4142 16.25 13V10.7135L12.75 12.4635V21.1255Z" fill="currentColor"></path> </g></svg> ${loteId}</td>
      <td>${fecha}</td>
      <td>${despachosLote[0].empleado || 'No especificado'}</td>
      <td>${despachosLote[0].observaciones || ''}</td>
      <td>${productosBtn}
        <dialog id="${productosId}" class="dialog w-full sm:max-w-[425px] max-h-[612px]" aria-labelledby="${productosId}-title" aria-describedby="${productosId}-description" onclick="if (event.target === this) this.close()">
        <article>
        <header><h4>Productos despachados</h4></header>
        <section>
        <div><table class="table table-sm">
          <thead>
            <tr>
              <th>Producto</th>
              ${(function() {
                const tiendas = Array.from(new Set((despachosLote||[]).map(i => i.tienda)));
                return tiendas.map(t => `<th>${t}</th>`).join('') + '<th>Total</th>';
              })()}
            </tr>
          </thead>
          <tbody>
            ${(function() {
              const items = despachosLote||[];
              const tiendas = Array.from(new Set(items.map(i => i.tienda)));
              const productos = Array.from(new Set(items.map(i => i.producto)));
              return productos.map(prod => {
                let total = 0;
                const tds = tiendas.map(t => {
                  const found = items.find(i => i.producto === prod && i.tienda === t);
                  if (found) { total += Number(found.cantidad_despachada)||0; return `<td>${found.cantidad_despachada}</td>`; }
                  return '<td>0</td>';
                }).join('');
                return `<tr><td>${prod}</td>${tds}<td><strong>${total}</strong></td></tr>`;
              }).join('');
            })()}
          </tbody>
        </table></div>
        </section>
        <footer><button class="btn-outline" onclick="this.closest('dialog').close()">Cerrar</button></footer>
        </article></dialog>
      </td>
    </tr>`;
  });
  html += `</tbody></table></div>`;
  return html;
}

// Función para mostrar recepciones formateadas
function mostrarRecepcionesFormateadas(datos) {
  let html = `<h3>Consulta de Recepciones</h3>`;
  let recepciones = datos.recepciones || datos || [];
  if (!Array.isArray(recepciones)) recepciones = [];
  if (recepciones.length === 0) return html + `<p>No hay registros de recepciones</p>`;
  html += `<div class="border p-4 rounded-lg"><table class="table">
    <thead>
      <tr>
        <th>Lote</th>
        <th>Fecha Recepción</th>
        <th>Tienda</th>
        <th>Responsable</th>
        <th>Observaciones</th>
        <th>Productos</th>
      </tr>
    </thead>
    <tbody>`;
  // Agrupar por lote y tienda
  const recepcionesPorLote = {};
  recepciones.forEach(recepcion => {
    const key = `${recepcion.lote_id}-${recepcion.tienda}`;
    if (!recepcionesPorLote[key]) {
      recepcionesPorLote[key] = {
        lote_id: recepcion.lote_id,
        tienda: recepcion.tienda,
        fecha: recepcion.fecha,
        empleado: recepcion.empleado,
        observaciones: recepcion.observaciones,
        items: []
      };
    }
    recepcionesPorLote[key].items.push(recepcion);
  });
  Object.values(recepcionesPorLote).forEach((recepcionGroup, idx) => {
    const fecha = new Date(recepcionGroup.fecha).toLocaleString('es-ES');
    const productosId = `rec-dialog-${idx}`;
    let productosBtn = '';
    if (recepcionGroup.items.length > 0) {
      productosBtn = `<button type="button" onclick="document.getElementById('${productosId}').showModal()" class="btn-outline" data-productos-id="${productosId}">Ver productos</button>`;
    } else {
      productosBtn = '<span>Sin productos</span>';
    }
    html += `<tr>
      <td><svg viewBox="0 0 24 24" class="w-4 inline-flex items-center" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M12 1.25C11.3953 1.25 10.8384 1.40029 10.2288 1.65242C9.64008 1.89588 8.95633 2.25471 8.1049 2.70153L6.03739 3.78651C4.99242 4.33487 4.15616 4.77371 3.51047 5.20491C2.84154 5.65164 2.32632 6.12201 1.95112 6.75918C1.57718 7.39421 1.40896 8.08184 1.32829 8.90072C1.24999 9.69558 1.24999 10.6731 1.25 11.9026V12.0974C1.24999 13.3268 1.24999 14.3044 1.32829 15.0993C1.40896 15.9182 1.57718 16.6058 1.95112 17.2408C2.32632 17.878 2.84154 18.3484 3.51047 18.7951C4.15616 19.2263 4.99241 19.6651 6.03737 20.2135L8.10481 21.2984C8.95628 21.7453 9.64006 22.1041 10.2288 22.3476C10.8384 22.5997 11.3953 22.75 12 22.75C12.6047 22.75 13.1616 22.5997 13.7712 22.3476C14.3599 22.1041 15.0437 21.7453 15.8951 21.2985L17.9626 20.2135C19.0076 19.6651 19.8438 19.2263 20.4895 18.7951C21.1585 18.3484 21.6737 17.878 22.0489 17.2408C22.4228 16.6058 22.591 15.9182 22.6717 15.0993C22.75 14.3044 22.75 13.3269 22.75 12.0975V11.9025C22.75 10.6731 22.75 9.69557 22.6717 8.90072C22.591 8.08184 22.4228 7.39421 22.0489 6.75918C21.6737 6.12201 21.1585 5.65164 20.4895 5.20491C19.8438 4.77371 19.0076 4.33487 17.9626 3.7865L15.8951 2.70154C15.0437 2.25472 14.3599 1.89589 13.7712 1.65242C13.1616 1.40029 12.6047 1.25 12 1.25ZM8.7708 4.04608C9.66052 3.57917 10.284 3.2528 10.802 3.03856C11.3062 2.83004 11.6605 2.75 12 2.75C12.3395 2.75 12.6938 2.83004 13.198 3.03856C13.716 3.2528 14.3395 3.57917 15.2292 4.04608L17.2292 5.09563C18.3189 5.66748 19.0845 6.07032 19.6565 6.45232C19.9387 6.64078 20.1604 6.81578 20.3395 6.99174L17.0088 8.65708L8.50895 4.18349L8.7708 4.04608ZM6.94466 5.00439L6.7708 5.09563C5.68111 5.66747 4.91553 6.07032 4.34352 6.45232C4.06131 6.64078 3.83956 6.81578 3.66054 6.99174L12 11.1615L15.3572 9.48289L7.15069 5.16369C7.07096 5.12173 7.00191 5.06743 6.94466 5.00439ZM2.93768 8.30737C2.88718 8.52125 2.84901 8.76413 2.82106 9.04778C2.75084 9.7606 2.75 10.6644 2.75 11.9415V12.0585C2.75 13.3356 2.75084 14.2394 2.82106 14.9522C2.88974 15.6494 3.02022 16.1002 3.24367 16.4797C3.46587 16.857 3.78727 17.1762 4.34352 17.5477C4.91553 17.9297 5.68111 18.3325 6.7708 18.9044L8.7708 19.9539C9.66052 20.4208 10.284 20.7472 10.802 20.9614C10.9656 21.0291 11.1134 21.0832 11.25 21.1255V12.4635L2.93768 8.30737ZM12.75 21.1255C12.8866 21.0832 13.0344 21.0291 13.198 20.9614C13.716 20.7472 14.3395 20.4208 15.2292 19.9539L17.2292 18.9044C18.3189 18.3325 19.0845 17.9297 19.6565 17.5477C20.2127 17.1762 20.5341 16.857 20.7563 16.4797C20.9798 16.1002 21.1103 15.6494 21.1789 14.9522C21.2492 14.2394 21.25 13.3356 21.25 12.0585V11.9415C21.25 10.6644 21.2492 9.7606 21.1789 9.04778C21.151 8.76412 21.1128 8.52125 21.0623 8.30736L17.75 9.96352V13C17.75 13.4142 17.4142 13.75 17 13.75C16.5858 13.75 16.25 13.4142 16.25 13V10.7135L12.75 12.4635V21.1255Z" fill="currentColor"></path> </g></svg> ${recepcionGroup.lote_id}</td>
      <td>${fecha}</td>
      <td>${recepcionGroup.tienda}</td>
      <td>${recepcionGroup.empleado || 'No especificado'}</td>
      <td>${recepcionGroup.observaciones || ''}</td>
      <td>${productosBtn}
        <dialog id="${productosId}" class="dialog w-full sm:max-w-[425px] max-h-[612px]" aria-labelledby="${productosId}-title" aria-describedby="${productosId}-description" onclick="if (event.target === this) this.close()">
        <article>
        <header><h4>Productos recibidos</h4></header>
        <section>
        <div class="table-responsive"><table class="table table-sm">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Confirmado</th>
            </tr>
          </thead>
          <tbody>
            ${recepcionGroup.items.map(item => {
              const confirmadoIcon = item.confirmado ? '✅' : '❌';
              const confirmadoText = item.confirmado ? 'Confirmado' : 'No confirmado';
              const confirmadoColor = item.confirmado ? '#27ae60' : '#dc3545';
              return `<tr><td>${item.producto}</td><td>${item.cantidad_recibida}</td><td style="color:${confirmadoColor};font-weight:bold;">${confirmadoIcon} ${confirmadoText}</td></tr>`;
            }).join('')}
          </tbody>
        </table></div>
        </section>
        <footer><button class="btn-outline" onclick="this.closest('dialog').close()">Cerrar</button></footer>
        </article></dialog>
      </td>
    </tr>`;
  });
  html += `</tbody></table></div>`;
  return html;
}

// Función para mostrar alertas formateadas
function mostrarAlertasFormateadas(datos) {
  let html = `<h3 style="color: #dc3545; margin-bottom: 1.5em;">⚠️ Alertas del Sistema</h3>`;
  
  // Intentar diferentes estructuras de datos
  let alertas = datos.alertas || datos || [];
  if (!Array.isArray(alertas)) {
    alertas = [];
  }
  
  if (alertas.length === 0) {
    html += `<div style="text-align: center; padding: 2em; background: #d4edda; border: 1px solid #c3e6cb; border-radius: 5px; color: #155724;">`;
    html += `<h4>🎉 ¡Todo está funcionando correctamente!</h4>`;
    html += `<p>No hay alertas en el sistema en este momento.</p>`;
    html += `</div>`;
    return html;
  }
  
  alertas.forEach(alerta => {
    let alertaColor, alertaIcon, alertaBg;
    
    switch (alerta.tipo) {
      case 'critico':
        alertaColor = '#dc3545';
        alertaIcon = '🚨';
        alertaBg = '#f8d7da';
        break;
      case 'advertencia':
        alertaColor = '#ffc107';
        alertaIcon = '⚠️';
        alertaBg = '#fff3cd';
        break;
      case 'info':
        alertaColor = '#17a2b8';
        alertaIcon = 'ℹ️';
        alertaBg = '#d1ecf1';
        break;
      default:
        alertaColor = '#6c757d';
        alertaIcon = '📢';
        alertaBg = '#e2e3e5';
    }
    
    html += `<div style="margin-bottom: 1.5em; padding: 1em; border-left: 4px solid ${alertaColor}; background: ${alertaBg}; border-radius: 0 5px 5px 0;">`;
    html += `<div style="display: flex; align-items: center; margin-bottom: 0.5em;">`;
    html += `<span style="font-size: 1.2em; margin-right: 0.5em;">${alertaIcon}</span>`;
    html += `<h4 style="color: ${alertaColor}; margin: 0; flex: 1;">${alerta.titulo || 'Alerta'}</h4>`;
    html += `<span style="background: ${alertaColor}; color: white; padding: 0.25em 0.5em; border-radius: 10px; font-size: 0.8em;">${alerta.tipo ? alerta.tipo.toUpperCase() : 'ALERTA'}</span>`;
    html += `</div>`;
    html += `<p style="margin: 0.5em 0; color: #495057;">${alerta.mensaje || 'Sin descripción'}</p>`;
    
    if (alerta.fecha) {
      html += `<small style="color: #6c757d;">📅 ${new Date(alerta.fecha).toLocaleString('es-ES')}</small>`;
    }
    html += `</div>`;
  });
  
  return html;
}

// Trazabilidad
formTraza.onsubmit = async e => {
  e.preventDefault();
  const fd = new FormData(formTraza);
  const lote = fd.get('lote');
  if (!lote) {
    alert('Por favor selecciona un lote');
    return;
  }
  const res = await api('/traza/lote/' + encodeURIComponent(lote), 'GET', null, 'admin');
  
  // Formatear y mostrar la trazabilidad de manera más legible
  if (res && !res.error) {
    mostrarTrazabilidadFormateada(res);
  } else {
    resultTraza.textContent = JSON.stringify(res, null, 2);
  }
};

// Función para mostrar trazabilidad formateada
function mostrarTrazabilidadFormateada(trazabilidad) {
  let steps = [];
  // Información general del lote (fuera del stepper)
  const infoLoteHtml = `
    <div class="lote-info-general">
    <ul class="flex flex-col sm:flex-row">
  <li class="inline-flex items-center gap-x-2.5 py-3 px-4 text-sm font-medium bg-white border border-gray-200 text-gray-800 -mt-px first:rounded-t-lg first:mt-0 last:rounded-b-lg sm:-ms-px sm:mt-0 sm:first:rounded-se-none sm:first:rounded-es-lg sm:last:rounded-es-none sm:last:rounded-se-lg dark:bg-neutral-900 dark:border-neutral-700 dark:text-white">
    <svg viewBox="0 0 24 24" class="w-6" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M12 1.25C11.3953 1.25 10.8384 1.40029 10.2288 1.65242C9.64008 1.89588 8.95633 2.25471 8.1049 2.70153L6.03739 3.78651C4.99242 4.33487 4.15616 4.77371 3.51047 5.20491C2.84154 5.65164 2.32632 6.12201 1.95112 6.75918C1.57718 7.39421 1.40896 8.08184 1.32829 8.90072C1.24999 9.69558 1.24999 10.6731 1.25 11.9026V12.0974C1.24999 13.3268 1.24999 14.3044 1.32829 15.0993C1.40896 15.9182 1.57718 16.6058 1.95112 17.2408C2.32632 17.878 2.84154 18.3484 3.51047 18.7951C4.15616 19.2263 4.99241 19.6651 6.03737 20.2135L8.10481 21.2984C8.95628 21.7453 9.64006 22.1041 10.2288 22.3476C10.8384 22.5997 11.3953 22.75 12 22.75C12.6047 22.75 13.1616 22.5997 13.7712 22.3476C14.3599 22.1041 15.0437 21.7453 15.8951 21.2985L17.9626 20.2135C19.0076 19.6651 19.8438 19.2263 20.4895 18.7951C21.1585 18.3484 21.6737 17.878 22.0489 17.2408C22.4228 16.6058 22.591 15.9182 22.6717 15.0993C22.75 14.3044 22.75 13.3269 22.75 12.0975V11.9025C22.75 10.6731 22.75 9.69557 22.6717 8.90072C22.591 8.08184 22.4228 7.39421 22.0489 6.75918C21.6737 6.12201 21.1585 5.65164 20.4895 5.20491C19.8438 4.77371 19.0076 4.33487 17.9626 3.7865L15.8951 2.70154C15.0437 2.25472 14.3599 1.89589 13.7712 1.65242C13.1616 1.40029 12.6047 1.25 12 1.25ZM8.7708 4.04608C9.66052 3.57917 10.284 3.2528 10.802 3.03856C11.3062 2.83004 11.6605 2.75 12 2.75C12.3395 2.75 12.6938 2.83004 13.198 3.03856C13.716 3.2528 14.3395 3.57917 15.2292 4.04608L17.2292 5.09563C18.3189 5.66748 19.0845 6.07032 19.6565 6.45232C19.9387 6.64078 20.1604 6.81578 20.3395 6.99174L17.0088 8.65708L8.50895 4.18349L8.7708 4.04608ZM6.94466 5.00439L6.7708 5.09563C5.68111 5.66747 4.91553 6.07032 4.34352 6.45232C4.06131 6.64078 3.83956 6.81578 3.66054 6.99174L12 11.1615L15.3572 9.48289L7.15069 5.16369C7.07096 5.12173 7.00191 5.06743 6.94466 5.00439ZM2.93768 8.30737C2.88718 8.52125 2.84901 8.76413 2.82106 9.04778C2.75084 9.7606 2.75 10.6644 2.75 11.9415V12.0585C2.75 13.3356 2.75084 14.2394 2.82106 14.9522C2.88974 15.6494 3.02022 16.1002 3.24367 16.4797C3.46587 16.857 3.78727 17.1762 4.34352 17.5477C4.91553 17.9297 5.68111 18.3325 6.7708 18.9044L8.7708 19.9539C9.66052 20.4208 10.284 20.7472 10.802 20.9614C10.9656 21.0291 11.1134 21.0832 11.25 21.1255V12.4635L2.93768 8.30737ZM12.75 21.1255C12.8866 21.0832 13.0344 21.0291 13.198 20.9614C13.716 20.7472 14.3395 20.4208 15.2292 19.9539L17.2292 18.9044C18.3189 18.3325 19.0845 17.9297 19.6565 17.5477C20.2127 17.1762 20.5341 16.857 20.7563 16.4797C20.9798 16.1002 21.1103 15.6494 21.1789 14.9522C21.2492 14.2394 21.25 13.3356 21.25 12.0585V11.9415C21.25 10.6644 21.2492 9.7606 21.1789 9.04778C21.151 8.76412 21.1128 8.52125 21.0623 8.30736L17.75 9.96352V13C17.75 13.4142 17.4142 13.75 17 13.75C16.5858 13.75 16.25 13.4142 16.25 13V10.7135L12.75 12.4635V21.1255Z" fill="currentColor"></path> </g></svg>
    Lote ${trazabilidad.lote_id}
  </li>
  <li class="inline-flex items-center gap-x-2.5 py-3 px-4 text-sm font-medium bg-white border border-gray-200 text-gray-800 -mt-px first:rounded-t-lg first:mt-0 last:rounded-b-lg sm:-ms-px sm:mt-0 sm:first:rounded-se-none sm:first:rounded-es-lg sm:last:rounded-es-none sm:last:rounded-se-lg dark:bg-neutral-900 dark:border-neutral-700 dark:text-white">
    <svg viewBox="0 0 24 24" class="w-6" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M5 1.25C5.41421 1.25 5.75 1.58579 5.75 2V3.08515L7.32358 2.77043C9.11678 2.41179 10.9756 2.58245 12.6735 3.26161L13.0868 3.42693C14.3652 3.93832 15.7724 4.03382 17.1082 3.69986C18.3875 3.38005 19.4147 4.76652 18.7363 5.89719L17.4578 8.02808C17.0814 8.65542 17.021 8.78483 17.0056 8.90275C16.9972 8.96731 16.9972 9.03269 17.0056 9.09725C17.021 9.21517 17.0814 9.34458 17.4578 9.97192L19.0184 12.573C19.5884 13.5229 19.0787 14.7534 18.004 15.0221L17.9039 15.0471C15.9814 15.5277 13.9563 15.3903 12.1164 14.6543C10.6886 14.0832 9.12562 13.9397 7.61776 14.2413L5.75 14.6149V22C5.75 22.4142 5.41421 22.75 5 22.75C4.58579 22.75 4.25 22.4142 4.25 22V2C4.25 1.58579 4.58579 1.25 5 1.25ZM5.75 13.0851L7.32358 12.7704C9.11678 12.4118 10.9756 12.5825 12.6735 13.2616C14.2206 13.8805 15.9235 13.996 17.5401 13.5919L17.6402 13.5669C17.7377 13.5425 17.7839 13.4309 17.7322 13.3447L16.1716 10.7437C16.1517 10.7106 16.132 10.6779 16.1125 10.6455C15.8295 10.1756 15.5796 9.76055 15.5183 9.29176C15.493 9.09808 15.493 8.90192 15.5183 8.70824C15.5796 8.23946 15.8295 7.82441 16.1125 7.35454C16.132 7.32208 16.1517 7.28936 16.1716 7.25634L17.4254 5.16658C15.7976 5.56324 14.0861 5.4422 12.5297 4.81964L12.1164 4.65433C10.6886 4.08323 9.12562 3.93973 7.61776 4.2413L5.75 4.61485V13.0851Z" fill="currentColor"></path> </g></svg>
    <span class="capitalize">${trazabilidad.lote.estado}</span>
  </li>
  <li class="inline-flex items-center gap-x-2.5 py-3 px-4 text-sm font-medium bg-white border border-gray-200 text-gray-800 -mt-px first:rounded-t-lg first:mt-0 last:rounded-b-lg sm:-ms-px sm:mt-0 sm:first:rounded-se-none sm:first:rounded-es-lg sm:last:rounded-es-none sm:last:rounded-se-lg dark:bg-neutral-900 dark:border-neutral-700 dark:text-white">
    <svg viewBox="0 0 24 24" class="w-6" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M17 14C17.5523 14 18 13.5523 18 13C18 12.4477 17.5523 12 17 12C16.4477 12 16 12.4477 16 13C16 13.5523 16.4477 14 17 14Z" fill="#1C274C"></path> <path d="M17 18C17.5523 18 18 17.5523 18 17C18 16.4477 17.5523 16 17 16C16.4477 16 16 16.4477 16 17C16 17.5523 16.4477 18 17 18Z" fill="#1C274C"></path> <path d="M13 13C13 13.5523 12.5523 14 12 14C11.4477 14 11 13.5523 11 13C11 12.4477 11.4477 12 12 12C12.5523 12 13 12.4477 13 13Z" fill="#1C274C"></path> <path d="M13 17C13 17.5523 12.5523 18 12 18C11.4477 18 11 17.5523 11 17C11 16.4477 11.4477 16 12 16C12.5523 16 13 16.4477 13 17Z" fill="#1C274C"></path> <path d="M7 14C7.55229 14 8 13.5523 8 13C8 12.4477 7.55229 12 7 12C6.44772 12 6 12.4477 6 13C6 13.5523 6.44772 14 7 14Z" fill="#1C274C"></path> <path d="M7 18C7.55229 18 8 17.5523 8 17C8 16.4477 7.55229 16 7 16C6.44772 16 6 16.4477 6 17C6 17.5523 6.44772 18 7 18Z" fill="#1C274C"></path> <path fill-rule="evenodd" clip-rule="evenodd" d="M7 1.75C7.41421 1.75 7.75 2.08579 7.75 2.5V3.26272C8.412 3.24999 9.14133 3.24999 9.94346 3.25H14.0564C14.8586 3.24999 15.588 3.24999 16.25 3.26272V2.5C16.25 2.08579 16.5858 1.75 17 1.75C17.4142 1.75 17.75 2.08579 17.75 2.5V3.32709C18.0099 3.34691 18.2561 3.37182 18.489 3.40313C19.6614 3.56076 20.6104 3.89288 21.3588 4.64124C22.1071 5.38961 22.4392 6.33855 22.5969 7.51098C22.75 8.65018 22.75 10.1058 22.75 11.9435V14.0564C22.75 15.8941 22.75 17.3498 22.5969 18.489C22.4392 19.6614 22.1071 20.6104 21.3588 21.3588C20.6104 22.1071 19.6614 22.4392 18.489 22.5969C17.3498 22.75 15.8942 22.75 14.0565 22.75H9.94359C8.10585 22.75 6.65018 22.75 5.51098 22.5969C4.33856 22.4392 3.38961 22.1071 2.64124 21.3588C1.89288 20.6104 1.56076 19.6614 1.40314 18.489C1.24997 17.3498 1.24998 15.8942 1.25 14.0564V11.9436C1.24998 10.1058 1.24997 8.65019 1.40314 7.51098C1.56076 6.33855 1.89288 5.38961 2.64124 4.64124C3.38961 3.89288 4.33856 3.56076 5.51098 3.40313C5.7439 3.37182 5.99006 3.34691 6.25 3.32709V2.5C6.25 2.08579 6.58579 1.75 7 1.75ZM5.71085 4.88976C4.70476 5.02502 4.12511 5.27869 3.7019 5.7019C3.27869 6.12511 3.02502 6.70476 2.88976 7.71085C2.86685 7.88123 2.8477 8.06061 2.83168 8.25H21.1683C21.1523 8.06061 21.1331 7.88124 21.1102 7.71085C20.975 6.70476 20.7213 6.12511 20.2981 5.7019C19.8749 5.27869 19.2952 5.02502 18.2892 4.88976C17.2615 4.75159 15.9068 4.75 14 4.75H10C8.09318 4.75 6.73851 4.75159 5.71085 4.88976ZM2.75 12C2.75 11.146 2.75032 10.4027 2.76309 9.75H21.2369C21.2497 10.4027 21.25 11.146 21.25 12V14C21.25 15.9068 21.2484 17.2615 21.1102 18.2892C20.975 19.2952 20.7213 19.8749 20.2981 20.2981C19.8749 20.7213 19.2952 20.975 18.2892 21.1102C17.2615 21.2484 15.9068 21.25 14 21.25H10C8.09318 21.25 6.73851 21.2484 5.71085 21.1102C4.70476 20.975 4.12511 20.7213 3.7019 20.2981C3.27869 19.8749 3.02502 19.2952 2.88976 18.2892C2.75159 17.2615 2.75 15.9068 2.75 14V12Z" fill="currentColor"></path> </g></svg>
    ${new Date(trazabilidad.lote.created_at).toLocaleString('es-ES')}
  </li>
</ul>
      <!--<h2>Lote #${trazabilidad.lote_id}</h2>
      <div style="display: flex; flex-wrap: wrap; gap: 2em; align-items: center;">
        <div><strong>Estado Actual:</strong> <span class="estado-badge estado-${trazabilidad.lote.estado}">${trazabilidad.lote.estado.toUpperCase()}</span></div>
        <div><strong>Creado:</strong> ${new Date(trazabilidad.lote.created_at).toLocaleString('es-ES')}</div>
        ${trazabilidad.lote.completado_en ? `<div><strong>Completado:</strong> ${new Date(trazabilidad.lote.completado_en).toLocaleString('es-ES')}</div>` : ''}
      </div>-->
    </div>
  </div>
  <hr class="my-4">
  `;

  // Paso 1: Pedido
  steps.push({
    title: 'Pedido',
    icon: '<svg viewBox="0 0 24 24" class="w-4" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M14.7566 2.62145C16.5852 0.792851 19.55 0.792851 21.3786 2.62145C23.2072 4.45005 23.2072 7.41479 21.3786 9.24339L11.8933 18.7287C11.3514 19.2706 11.0323 19.5897 10.6774 19.8665C10.2592 20.1927 9.80655 20.4725 9.32766 20.7007C8.92136 20.8943 8.49334 21.037 7.76623 21.2793L4.43511 22.3897L3.63303 22.6571C2.98247 22.8739 2.26522 22.7046 1.78032 22.2197C1.29542 21.7348 1.1261 21.0175 1.34296 20.367L2.72068 16.2338C2.96303 15.5067 3.10568 15.0787 3.29932 14.6724C3.52755 14.1935 3.80727 13.7409 4.13354 13.3226C4.41035 12.9677 4.72939 12.6487 5.27137 12.1067L14.7566 2.62145ZM4.40051 20.8201L7.24203 19.8729C8.03314 19.6092 8.36927 19.4958 8.68233 19.3466C9.06287 19.1653 9.42252 18.943 9.75492 18.6837C10.0284 18.4704 10.2801 18.2205 10.8698 17.6308L18.4393 10.0614C17.6506 9.78321 16.6346 9.26763 15.6835 8.31651C14.7324 7.36538 14.2168 6.34939 13.9387 5.56075L6.36917 13.1302C5.77951 13.7199 5.52959 13.9716 5.3163 14.2451C5.05704 14.5775 4.83476 14.9371 4.65341 15.3177C4.50421 15.6307 4.3908 15.9669 4.12709 16.758L3.17992 19.5995L4.40051 20.8201ZM15.1554 4.34404C15.1896 4.519 15.2474 4.75684 15.3438 5.03487C15.561 5.66083 15.9712 6.48288 16.7442 7.25585C17.5171 8.02881 18.3392 8.43903 18.9651 8.6562C19.2432 8.75266 19.481 8.81046 19.656 8.84466L20.3179 8.18272C21.5607 6.93991 21.5607 4.92492 20.3179 3.68211C19.0751 2.4393 17.0601 2.4393 15.8173 3.68211L15.1554 4.34404Z" fill="#ffffff"></path> </g></svg>',
    color: 'bg-red-100',
    number: 1,
    content:
  `<strong>Fecha y hora:</strong> ${new Date(trazabilidad.pedido.fecha_pedido).toLocaleString('es-ES')}<br>` +
  `<strong>Fecha Requerida:</strong> ${new Date(trazabilidad.pedido.fecha_requerida).toLocaleDateString('es-ES')}<br>` +
  // `<strong>Estado:</strong> ${trazabilidad.pedido.estado}<br>` +
  `<strong>Responsable:</strong> ${trazabilidad.pedido.empleado || 'No especificado'}<br>` +
  (() => {
    // Obtener todas las tiendas únicas
    const tiendas = [...new Set(trazabilidad.pedido.items.map(item => item.tienda))];
    // Obtener todos los productos únicos
    const productos = [...new Set(trazabilidad.pedido.items.map(item => item.producto))];
    // Construir la tabla
    let tabla = `<button type="button" onclick="document.getElementById('dialog-produccion').showModal()" class="btn-outline">Productos Solicitados</button>
    <dialog id="dialog-produccion" class="dialog w-full sm:max-w-[425px] max-h-[612px]" aria-labelledby="dialog-produccion-title" aria-describedby="dialog-produccion-description" onclick="if (event.target === this) this.close()">
      <article>
        <header><h3>Productos Solicitados</h3></header>
        <section>
          <table class="table">
            <thead>
              <tr>
                <th>Producto</th>
                ${tiendas.map(t => `<th class="text-center">${t}</th>`).join('')}
                <th class="text-center">Total</th>
              </tr>
            </thead>
            <tbody>
              ${productos.map(producto => `
                <tr>
                  <td><strong>${producto}</strong></td>
                  ${tiendas.map(tienda => {
                    const item = trazabilidad.pedido.items.find(i => i.producto === producto && i.tienda === tienda);
                    return `<td class="text-center">${item ? item.cantidad_solicitada : '-'}</td>`;
                  }).join('')}
                  <td class="text-center font-bold">${tiendas.reduce((total, tienda) => {
                    const item = trazabilidad.pedido.items.find(i => i.producto === producto && i.tienda === tienda);
                    return total + (item ? item.cantidad_solicitada : 0);
                  }, 0)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </section>
        <footer>
          <button class="btn-outline" onclick="this.closest('dialog').close()">Cancel</button>
        </footer>
      </article>
    </dialog>`;
    return tabla;
  })()
  });

  // Paso 2: Producción
  if (trazabilidad.produccion) {
    steps.push({
      title: 'Producción',
      icon: '<svg viewBox="0 0 24 24" class="w-4" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M7.25285 4.25547C8.09403 2.47951 9.90263 1.25 12 1.25C14.0974 1.25 15.906 2.47951 16.7471 4.25547C16.831 4.25184 16.9153 4.25 17 4.25C20.1756 4.25 22.75 6.82436 22.75 10C22.75 12.1806 21.5363 14.0762 19.75 15.0508L19.75 18.052C19.75 18.9505 19.7501 19.6997 19.6701 20.2945C19.5857 20.9223 19.4 21.4891 18.9445 21.9445C18.4891 22.4 17.9223 22.5857 17.2945 22.6701C16.6997 22.7501 15.9505 22.75 15.052 22.75H8.94801C8.04952 22.75 7.3003 22.7501 6.70552 22.6701C6.07773 22.5857 5.51093 22.4 5.05546 21.9445C4.59999 21.4891 4.41432 20.9223 4.32991 20.2945C4.24994 19.6997 4.24997 18.9505 4.25 18.052L4.25 15.0508C2.46371 14.0762 1.25 12.1806 1.25 10C1.25 6.82436 3.82436 4.25 7 4.25C7.08469 4.25 7.16899 4.25184 7.25285 4.25547ZM6.80262 5.7545C4.54704 5.85762 2.75 7.71895 2.75 10C2.75 11.7416 3.79769 13.2402 5.30028 13.8967C5.57345 14.016 5.75 14.2859 5.75 14.584V17.25H18.25L18.25 14.584C18.25 14.2859 18.4265 14.016 18.6997 13.8967C20.2023 13.2402 21.25 11.7416 21.25 10C21.25 7.71895 19.453 5.85761 17.1974 5.7545C17.2321 5.99825 17.25 6.24718 17.25 6.5V7C17.25 7.41421 16.9142 7.75 16.5 7.75C16.0858 7.75 15.75 7.41421 15.75 7V6.5C15.75 6.07715 15.6803 5.67212 15.5524 5.29486C15.0502 3.81402 13.6484 2.75 12 2.75C10.3516 2.75 8.94981 3.81402 8.44763 5.29486C8.3197 5.67212 8.25 6.07715 8.25 6.5V7C8.25 7.41421 7.91421 7.75 7.5 7.75C7.08579 7.75 6.75 7.41421 6.75 7V6.5C6.75 6.24717 6.76792 5.99825 6.80262 5.7545ZM18.2482 18.75H5.75181C5.75604 19.3194 5.77008 19.7491 5.81654 20.0946C5.87858 20.5561 5.9858 20.7536 6.11612 20.8839C6.24643 21.0142 6.44393 21.1214 6.90539 21.1835C7.38843 21.2484 8.03599 21.25 9 21.25H15C15.964 21.25 16.6116 21.2484 17.0946 21.1835C17.5561 21.1214 17.7536 21.0142 17.8839 20.8839C18.0142 20.7536 18.1214 20.5561 18.1835 20.0946C18.2299 19.7491 18.244 19.3194 18.2482 18.75Z" fill="#ffffff"></path> </g></svg>',
      color: 'bg-yellow-100',
      number: 2,
      content:
  `<strong>Fecha y hora:</strong> ${new Date(trazabilidad.produccion.fecha).toLocaleString('es-ES')}<br>` +
  `<strong>Responsable:</strong> ${trazabilidad.produccion.empleado || 'No especificado'}<br>` +
  (trazabilidad.produccion.observaciones ? `<strong>Observaciones:</strong> ${trazabilidad.produccion.observaciones}<br>` : '') +
  (() => {
    const tiendas = [...new Set(trazabilidad.produccion.items.map(item => item.tienda))];
    const productos = [...new Set(trazabilidad.produccion.items.map(item => item.producto))];
    let tabla = `<button type="button" onclick="document.getElementById('dialog-produccion-detalle').showModal()" class="btn-outline">Productos Producidos</button>
    <dialog id="dialog-produccion-detalle" class="dialog w-full sm:max-w-[425px] max-h-[612px]" aria-labelledby="dialog-produccion-title" aria-describedby="dialog-produccion-description" onclick="if (event.target === this) this.close()">
      <article>
        <header><h3>Productos Producidos</h3></header>
        <section>
          <table class="table">
            <thead>
              <tr>
                <th>Producto</th>
                <th class="text-center">Cantidades</th>
              </tr>
            </thead>
            <tbody>
              ${productos.map(producto => `
                <tr>
                  <td><strong>${producto}</strong></td>
                  ${tiendas.map(tienda => {
                    const item = trazabilidad.produccion.items.find(i => i.producto === producto && i.tienda === tienda);
                    return `<td class="text-center">${item ? item.cantidad_producida : '-'}</td>`;
                  }).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </section>
        <footer>
          <button class="btn-outline" onclick="this.closest('dialog').close()">Cancel</button>
        </footer>
      </article>
    </dialog>`;
    return tabla;
  })()
    });
  } else {
    steps.push({
      title: 'Producción',
      icon: '<svg viewBox="0 0 24 24" class="w-4" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M7.25285 4.25547C8.09403 2.47951 9.90263 1.25 12 1.25C14.0974 1.25 15.906 2.47951 16.7471 4.25547C16.831 4.25184 16.9153 4.25 17 4.25C20.1756 4.25 22.75 6.82436 22.75 10C22.75 12.1806 21.5363 14.0762 19.75 15.0508L19.75 18.052C19.75 18.9505 19.7501 19.6997 19.6701 20.2945C19.5857 20.9223 19.4 21.4891 18.9445 21.9445C18.4891 22.4 17.9223 22.5857 17.2945 22.6701C16.6997 22.7501 15.9505 22.75 15.052 22.75H8.94801C8.04952 22.75 7.3003 22.7501 6.70552 22.6701C6.07773 22.5857 5.51093 22.4 5.05546 21.9445C4.59999 21.4891 4.41432 20.9223 4.32991 20.2945C4.24994 19.6997 4.24997 18.9505 4.25 18.052L4.25 15.0508C2.46371 14.0762 1.25 12.1806 1.25 10C1.25 6.82436 3.82436 4.25 7 4.25C7.08469 4.25 7.16899 4.25184 7.25285 4.25547ZM6.80262 5.7545C4.54704 5.85762 2.75 7.71895 2.75 10C2.75 11.7416 3.79769 13.2402 5.30028 13.8967C5.57345 14.016 5.75 14.2859 5.75 14.584V17.25H18.25L18.25 14.584C18.25 14.2859 18.4265 14.016 18.6997 13.8967C20.2023 13.2402 21.25 11.7416 21.25 10C21.25 7.71895 19.453 5.85761 17.1974 5.7545C17.2321 5.99825 17.25 6.24718 17.25 6.5V7C17.25 7.41421 16.9142 7.75 16.5 7.75C16.0858 7.75 15.75 7.41421 15.75 7V6.5C15.75 6.07715 15.6803 5.67212 15.5524 5.29486C15.0502 3.81402 13.6484 2.75 12 2.75C10.3516 2.75 8.94981 3.81402 8.44763 5.29486C8.3197 5.67212 8.25 6.07715 8.25 6.5V7C8.25 7.41421 7.91421 7.75 7.5 7.75C7.08579 7.75 6.75 7.41421 6.75 7V6.5C6.75 6.24717 6.76792 5.99825 6.80262 5.7545ZM18.2482 18.75H5.75181C5.75604 19.3194 5.77008 19.7491 5.81654 20.0946C5.87858 20.5561 5.9858 20.7536 6.11612 20.8839C6.24643 21.0142 6.44393 21.1214 6.90539 21.1835C7.38843 21.2484 8.03599 21.25 9 21.25H15C15.964 21.25 16.6116 21.2484 17.0946 21.1835C17.5561 21.1214 17.7536 21.0142 17.8839 20.8839C18.0142 20.7536 18.1214 20.5561 18.1835 20.0946C18.2299 19.7491 18.244 19.3194 18.2482 18.75Z" fill="#c3c3c3"></path> </g></svg>',
      color: 'bg-gray-100',
      number: 2,
      content: `La producción aún no ha sido registrada.`
    });
  }

  // Paso 3: Despacho
  if (trazabilidad.despachos && trazabilidad.despachos.length > 0) {
    // Agrupar despachos por fecha
    const despachosPorFecha = {};
    trazabilidad.despachos.forEach(despacho => {
      const fecha = despacho.fecha;
      if (!despachosPorFecha[fecha]) {
        despachosPorFecha[fecha] = [];
      }
      despachosPorFecha[fecha].push(despacho);
    });
    let content = '';
Object.keys(despachosPorFecha).forEach(fecha => {
  const despachosDelDia = despachosPorFecha[fecha];
  const tiendas = [...new Set(despachosDelDia.map(item => item.tienda))];
  const productos = [...new Set(despachosDelDia.map(item => item.producto))];
  content += `<div>
    <strong>Fecha y hora:</strong> ${new Date(fecha).toLocaleString('es-ES')}<br>
    <strong>Responsable:</strong> ${despachosDelDia[0].empleado || 'No especificado'}<br>
    ${despachosDelDia[0].observaciones ? `<strong>Observaciones:</strong> ${despachosDelDia[0].observaciones}<br>` : ''}
    <button type="button" onclick="document.getElementById('dialog-despacho-${fecha}').showModal()" class="btn-outline">Productos Despachados</button>
    <dialog id="dialog-despacho-${fecha}" class="dialog w-full sm:max-w-[425px] max-h-[612px]" aria-labelledby="dialog-despacho-title" aria-describedby="dialog-despacho-description" onclick="if (event.target === this) this.close()">
      <article>
        <header><h3>Productos Despachados</h3></header>
        <section>
          <table class="table">
            <thead>
              <tr>
                <th>Producto</th>
                ${tiendas.map(t => `<th class="text-center">${t}</th>`).join('')}
                <th class="text-center">Total</th>
              </tr>
            </thead>
            <tbody>
              ${productos.map(producto => `
                <tr>
                  <td><strong>${producto}</strong></td>
                  ${tiendas.map(tienda => {
                    const item = despachosDelDia.find(i => i.producto === producto && i.tienda === tienda);
                    return `<td class="text-center">${item ? item.cantidad_despachada : '-'}</td>`;
                  }).join('')}
                  <td class="text-center font-bold">${tiendas.reduce((total, tienda) => {
                    const item = despachosDelDia.find(i => i.producto === producto && i.tienda === tienda);
                    return total + (item ? item.cantidad_despachada : 0);
                  }, 0)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </section>
        <footer>
          <button class="btn-outline" onclick="this.closest('dialog').close()">Cancel</button>
        </footer>
      </article>
    </dialog>
  </div>`;
});
    steps.push({
      title: 'Despacho',
      icon: '<svg viewBox="0 0 24 24" class="w-4" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M11.9436 1.25H12.0564C13.8942 1.24998 15.3498 1.24997 16.489 1.40314C17.6614 1.56076 18.6104 1.89288 19.3588 2.64124C20.1071 3.38961 20.4392 4.33856 20.5969 5.51098C20.6996 6.27504 20.7334 7.18144 20.7445 8.25H21C21.9665 8.25 22.75 9.0335 22.75 10V11C22.75 11.5508 22.4907 12.0695 22.05 12.4L20.7475 13.3768C20.7402 14.6093 20.7113 15.6375 20.5969 16.489C20.4392 17.6614 20.1071 18.6104 19.3588 19.3588C19.1689 19.5486 18.9661 19.7117 18.75 19.852V21C18.75 21.9665 17.9665 22.75 17 22.75H15.5C14.5335 22.75 13.75 21.9665 13.75 21V20.7445C13.2253 20.75 12.6616 20.75 12.0564 20.75H11.9436C11.3384 20.75 10.7747 20.75 10.25 20.7445V21C10.25 21.9665 9.4665 22.75 8.5 22.75H7C6.0335 22.75 5.25 21.9665 5.25 21V19.852C5.03392 19.7117 4.83112 19.5486 4.64124 19.3588C3.89288 18.6104 3.56076 17.6614 3.40313 16.489C3.28866 15.6375 3.25975 14.6093 3.25246 13.3768L1.95 12.4C1.50934 12.0695 1.25 11.5508 1.25 11V10C1.25 9.0335 2.0335 8.25 3 8.25H3.25546C3.26659 7.18144 3.30041 6.27504 3.40313 5.51098C3.56076 4.33856 3.89288 3.38961 4.64124 2.64124C5.38961 1.89288 6.33855 1.56076 7.51098 1.40314C8.65019 1.24997 10.1058 1.24998 11.9436 1.25ZM3.25 9.75H3C2.86193 9.75 2.75 9.86193 2.75 10V11C2.75 11.0787 2.78705 11.1528 2.85 11.2L3.25 11.5L3.25 9.94359C3.25 9.87858 3.25 9.81405 3.25 9.75ZM4.75573 13.75C4.76662 14.7836 4.79821 15.6082 4.88976 16.2892C5.02502 17.2952 5.27869 17.8749 5.7019 18.2981C6.12511 18.7213 6.70476 18.975 7.71085 19.1102C8.73851 19.2484 10.0932 19.25 12 19.25C13.9068 19.25 15.2615 19.2484 16.2892 19.1102C17.2952 18.975 17.8749 18.7213 18.2981 18.2981C18.7213 17.8749 18.975 17.2952 19.1102 16.2892C19.2018 15.6082 19.2334 14.7836 19.2443 13.75H4.75573ZM19.25 12.25H4.75002C4.75 12.1677 4.75 12.0844 4.75 12V10C4.75 8.1173 4.75155 6.77287 4.88458 5.75H19.1154C19.2484 6.77287 19.25 8.1173 19.25 10V12C19.25 12.0844 19.25 12.1677 19.25 12.25ZM20.75 11.5L21.15 11.2C21.213 11.1528 21.25 11.0787 21.25 11V10C21.25 9.86193 21.1381 9.75 21 9.75H20.75C20.75 9.81405 20.75 9.87858 20.75 9.94359V11.5ZM18.701 4.25C18.5882 4.03672 18.4548 3.85859 18.2981 3.7019C17.8749 3.27869 17.2952 3.02502 16.2892 2.88976C15.2615 2.75159 13.9068 2.75 12 2.75C10.0932 2.75 8.73851 2.75159 7.71085 2.88976C6.70476 3.02502 6.12511 3.27869 5.7019 3.7019C5.54522 3.85859 5.41177 4.03672 5.29896 4.25H18.701ZM6.75 20.4605V21C6.75 21.1381 6.86193 21.25 7 21.25H8.5C8.63807 21.25 8.75 21.1381 8.75 21V20.7042C8.30066 20.6815 7.88845 20.6476 7.51098 20.5969C7.24599 20.5612 6.99242 20.5167 6.75 20.4605ZM15.25 20.7042V21C15.25 21.1381 15.3619 21.25 15.5 21.25H17C17.1381 21.25 17.25 21.1381 17.25 21V20.4605C17.0076 20.5167 16.754 20.5612 16.489 20.5969C16.1116 20.6476 15.6993 20.6815 15.25 20.7042ZM6.25 16C6.25 15.5858 6.58579 15.25 7 15.25H8.5C8.91421 15.25 9.25 15.5858 9.25 16C9.25 16.4142 8.91421 16.75 8.5 16.75H7C6.58579 16.75 6.25 16.4142 6.25 16ZM14.75 16C14.75 15.5858 15.0858 15.25 15.5 15.25H17C17.4142 15.25 17.75 15.5858 17.75 16C17.75 16.4142 17.4142 16.75 17 16.75H15.5C15.0858 16.75 14.75 16.4142 14.75 16Z" fill="#ffffff"></path> </g></svg>',
      color: 'bg-purple-100',
      number: 3,
      content
    });
  } else {
    steps.push({
      title: 'Despacho',
      icon: '<svg viewBox="0 0 24 24" class="w-4" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M11.9436 1.25H12.0564C13.8942 1.24998 15.3498 1.24997 16.489 1.40314C17.6614 1.56076 18.6104 1.89288 19.3588 2.64124C20.1071 3.38961 20.4392 4.33856 20.5969 5.51098C20.6996 6.27504 20.7334 7.18144 20.7445 8.25H21C21.9665 8.25 22.75 9.0335 22.75 10V11C22.75 11.5508 22.4907 12.0695 22.05 12.4L20.7475 13.3768C20.7402 14.6093 20.7113 15.6375 20.5969 16.489C20.4392 17.6614 20.1071 18.6104 19.3588 19.3588C19.1689 19.5486 18.9661 19.7117 18.75 19.852V21C18.75 21.9665 17.9665 22.75 17 22.75H15.5C14.5335 22.75 13.75 21.9665 13.75 21V20.7445C13.2253 20.75 12.6616 20.75 12.0564 20.75H11.9436C11.3384 20.75 10.7747 20.75 10.25 20.7445V21C10.25 21.9665 9.4665 22.75 8.5 22.75H7C6.0335 22.75 5.25 21.9665 5.25 21V19.852C5.03392 19.7117 4.83112 19.5486 4.64124 19.3588C3.89288 18.6104 3.56076 17.6614 3.40313 16.489C3.28866 15.6375 3.25975 14.6093 3.25246 13.3768L1.95 12.4C1.50934 12.0695 1.25 11.5508 1.25 11V10C1.25 9.0335 2.0335 8.25 3 8.25H3.25546C3.26659 7.18144 3.30041 6.27504 3.40313 5.51098C3.56076 4.33856 3.89288 3.38961 4.64124 2.64124C5.38961 1.89288 6.33855 1.56076 7.51098 1.40314C8.65019 1.24997 10.1058 1.24998 11.9436 1.25ZM3.25 9.75H3C2.86193 9.75 2.75 9.86193 2.75 10V11C2.75 11.0787 2.78705 11.1528 2.85 11.2L3.25 11.5L3.25 9.94359C3.25 9.87858 3.25 9.81405 3.25 9.75ZM4.75573 13.75C4.76662 14.7836 4.79821 15.6082 4.88976 16.2892C5.02502 17.2952 5.27869 17.8749 5.7019 18.2981C6.12511 18.7213 6.70476 18.975 7.71085 19.1102C8.73851 19.2484 10.0932 19.25 12 19.25C13.9068 19.25 15.2615 19.2484 16.2892 19.1102C17.2952 18.975 17.8749 18.7213 18.2981 18.2981C18.7213 17.8749 18.975 17.2952 19.1102 16.2892C19.2018 15.6082 19.2334 14.7836 19.2443 13.75H4.75573ZM19.25 12.25H4.75002C4.75 12.1677 4.75 12.0844 4.75 12V10C4.75 8.1173 4.75155 6.77287 4.88458 5.75H19.1154C19.2484 6.77287 19.25 8.1173 19.25 10V12C19.25 12.0844 19.25 12.1677 19.25 12.25ZM20.75 11.5L21.15 11.2C21.213 11.1528 21.25 11.0787 21.25 11V10C21.25 9.86193 21.1381 9.75 21 9.75H20.75C20.75 9.81405 20.75 9.87858 20.75 9.94359V11.5ZM18.701 4.25C18.5882 4.03672 18.4548 3.85859 18.2981 3.7019C17.8749 3.27869 17.2952 3.02502 16.2892 2.88976C15.2615 2.75159 13.9068 2.75 12 2.75C10.0932 2.75 8.73851 2.75159 7.71085 2.88976C6.70476 3.02502 6.12511 3.27869 5.7019 3.7019C5.54522 3.85859 5.41177 4.03672 5.29896 4.25H18.701ZM6.75 20.4605V21C6.75 21.1381 6.86193 21.25 7 21.25H8.5C8.63807 21.25 8.75 21.1381 8.75 21V20.7042C8.30066 20.6815 7.88845 20.6476 7.51098 20.5969C7.24599 20.5612 6.99242 20.5167 6.75 20.4605ZM15.25 20.7042V21C15.25 21.1381 15.3619 21.25 15.5 21.25H17C17.1381 21.25 17.25 21.1381 17.25 21V20.4605C17.0076 20.5167 16.754 20.5612 16.489 20.5969C16.1116 20.6476 15.6993 20.6815 15.25 20.7042ZM6.25 16C6.25 15.5858 6.58579 15.25 7 15.25H8.5C8.91421 15.25 9.25 15.5858 9.25 16C9.25 16.4142 8.91421 16.75 8.5 16.75H7C6.58579 16.75 6.25 16.4142 6.25 16ZM14.75 16C14.75 15.5858 15.0858 15.25 15.5 15.25H17C17.4142 15.25 17.75 15.5858 17.75 16C17.75 16.4142 17.4142 16.75 17 16.75H15.5C15.0858 16.75 14.75 16.4142 14.75 16Z" fill="#c3c3c3"></path> </g></svg>',
      color: 'bg-gray-100',
      number: 3,
      content: `El despacho aún no ha sido registrado.`
    });
  }

  // Paso 4: Recepción
  if (trazabilidad.recepciones && trazabilidad.recepciones.length > 0) {
    // Agrupar por tienda
    const tiendas = trazabilidad.recepciones.map(r => r.tienda);
    let content = `<button type="button" onclick="document.getElementById('dialog-recepcion-multi').showModal()" class="btn-outline">Productos Recibidos</button>
    <dialog id="dialog-recepcion-multi" class="dialog w-full sm:max-w-[600px] max-h-[612px]" aria-labelledby="dialog-recepcion-title" aria-describedby="dialog-recepcion-description" onclick="if (event.target === this) this.close()">
      <article>
        <header><h3>Productos Recibidos en Tiendas</h3></header>
        <section>
          <div class="tabs w-full" id="tabs-recepcion-tiendas">
            <nav role="tablist" aria-orientation="horizontal" class="w-full">
              ${tiendas.map((tienda, idx) => `
                <button type="button" role="tab" id="tab-recepcion-${idx}" aria-controls="panel-recepcion-${idx}" aria-selected="${idx === 0 ? 'true' : 'false'}" tabindex="${idx === 0 ? '0' : '-1'}">${tienda}</button>
              `).join('')}
            </nav>
            ${tiendas.map((tienda, idx) => {
              const recep = trazabilidad.recepciones.find(r => r.tienda === tienda);
              if (!recep) return '';
              return `
                <div role="tabpanel" id="panel-recepcion-${idx}" aria-labelledby="tab-recepcion-${idx}" tabindex="-1" aria-selected="${idx === 0 ? 'true' : 'false'}" ${idx !== 0 ? 'hidden' : ''}>
                  <div class="mb-2">
                    <strong>Fecha y hora:</strong> ${new Date(recep.fecha).toLocaleString('es-ES')}<br>
                    <strong>Responsable:</strong> ${recep.empleado || 'No especificado'}<br>
                    ${recep.observaciones ? `<strong>Observaciones:</strong> ${recep.observaciones}<br>` : ''}
                  </div>
                  <table class="table">
                    <thead>
                      <tr>
                        <th>Producto</th>
                        <th class="text-center">Cantidad</th>
                        <th class="text-center">Confirmado</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${recep.items.map(item => `
                        <tr>
                          <td><strong>${item.producto}</strong></td>
                          <td class="text-center">${item.cantidad_recibida}</td>
                          <td class="text-center">${item.confirmado ? '✅ Confirmado' : '❌ No confirmado'}</td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>
              `;
            }).join('')}
          </div>
        </section>
        <footer>
          <button class="btn-outline" onclick="this.closest('dialog').close()">Cancel</button>
        </footer>
      </article>
    </dialog>`;
    steps.push({
      title: 'Recepción',
      icon: '<svg viewBox="0 0 24 24" class="w-4" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M7.30681 1.24996C6.50585 1.24969 5.95624 1.24951 5.46776 1.38342C4.44215 1.66458 3.58414 2.36798 3.1073 3.31853C2.88019 3.77127 2.77258 4.31024 2.61576 5.0957L1.99616 8.19383C1.76456 9.35186 2.08191 10.4718 2.74977 11.3115L2.74977 14.0564C2.74975 15.8942 2.74974 17.3498 2.9029 18.489C3.06053 19.6614 3.39265 20.6104 4.14101 21.3587C4.88937 22.1071 5.83832 22.4392 7.01074 22.5969C8.14996 22.75 9.60559 22.75 11.4434 22.75H12.5562C14.3939 22.75 15.8496 22.75 16.9888 22.5969C18.1612 22.4392 19.1102 22.1071 19.8585 21.3587C20.6069 20.6104 20.939 19.6614 21.0966 18.489C21.2498 17.3498 21.2498 15.8942 21.2498 14.0564V11.3115C21.9176 10.4718 22.235 9.35187 22.0034 8.19383L21.3838 5.0957C21.227 4.31024 21.1194 3.77127 20.8923 3.31853C20.4154 2.36798 19.5574 1.66458 18.5318 1.38342C18.0433 1.24951 17.4937 1.24969 16.6927 1.24996H7.30681ZM18.2682 12.75C18.7971 12.75 19.2969 12.6435 19.7498 12.4524V14C19.7498 15.9068 19.7482 17.2615 19.61 18.2891C19.4747 19.2952 19.2211 19.8749 18.7979 20.2981C18.3747 20.7213 17.795 20.975 16.7889 21.1102C16.3434 21.1701 15.8365 21.2044 15.2498 21.2239V18.4678C15.2498 18.028 15.2498 17.6486 15.2216 17.3373C15.1917 17.0082 15.1257 16.6822 14.9483 16.375C14.7508 16.0329 14.4668 15.7489 14.1248 15.5514C13.8176 15.3741 13.4916 15.308 13.1624 15.2782C12.8511 15.25 12.4718 15.25 12.032 15.25H11.9675C11.5278 15.25 11.1484 15.25 10.8371 15.2782C10.5079 15.308 10.182 15.3741 9.87477 15.5514C9.53272 15.7489 9.24869 16.0329 9.05121 16.375C8.87384 16.6822 8.80778 17.0082 8.77795 17.3373C8.74973 17.6486 8.74975 18.028 8.74977 18.4678L8.74977 21.2239C8.16304 21.2044 7.6561 21.1701 7.21062 21.1102C6.20453 20.975 5.62488 20.7213 5.20167 20.2981C4.77846 19.8749 4.52479 19.2952 4.38953 18.2891C4.25136 17.2615 4.24977 15.9068 4.24977 14V12.4523C4.70264 12.6435 5.20244 12.75 5.73132 12.75C7.00523 12.75 8.14422 12.1216 8.83783 11.1458C9.54734 12.1139 10.6929 12.75 11.9996 12.75C13.3063 12.75 14.452 12.1138 15.1615 11.1455C15.8551 12.1215 16.9942 12.75 18.2682 12.75ZM10.2498 21.248C10.6382 21.2499 11.0539 21.25 11.4998 21.25H12.4998C12.9457 21.25 13.3614 21.2499 13.7498 21.248V18.5C13.7498 18.0189 13.749 17.7082 13.7277 17.4727C13.7073 17.2476 13.6729 17.1659 13.6493 17.125C13.5835 17.011 13.4888 16.9163 13.3748 16.8505C13.3339 16.8269 13.2522 16.7925 13.027 16.772C12.7916 16.7507 12.4809 16.75 11.9998 16.75C11.5187 16.75 11.208 16.7507 10.9725 16.772C10.7474 16.7925 10.6656 16.8269 10.6248 16.8505C10.5108 16.9163 10.4161 17.011 10.3502 17.125C10.3267 17.1659 10.2922 17.2476 10.2718 17.4727C10.2505 17.7082 10.2498 18.0189 10.2498 18.5V21.248ZM8.67082 2.74999H7.41748C6.46302 2.74999 6.13246 2.75654 5.86433 2.83005C5.24897 2.99874 4.73416 3.42078 4.44806 3.99112C4.3234 4.23962 4.25214 4.56248 4.06496 5.4984L3.46703 8.48801C3.18126 9.91687 4.27415 11.25 5.73132 11.25C6.91763 11.25 7.91094 10.3511 8.02898 9.17063L8.09757 8.48474L8.10155 8.44273L8.67082 2.74999ZM9.59103 8.62499L10.1785 2.74999H13.8208L14.405 8.59198C14.5473 10.0151 13.4298 11.25 11.9996 11.25C10.5804 11.25 9.46911 10.0341 9.59103 8.62499ZM18.1352 2.83005C17.8671 2.75654 17.5365 2.74999 16.5821 2.74999H15.3285L15.9706 9.17063C16.0886 10.3511 17.0819 11.25 18.2682 11.25C19.7254 11.25 20.8183 9.91687 20.5325 8.48801L19.9346 5.4984C19.7474 4.56248 19.6762 4.23962 19.5515 3.99112C19.2654 3.42078 18.7506 2.99874 18.1352 2.83005Z" fill="#ffffff"></path> </g></svg>',
      color: 'bg-green-100',
      number: 4,
      content
    });
  } else {
    steps.push({
      title: 'Recepción',
      icon: '<svg viewBox="0 0 24 24" class="w-4" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M7.30681 1.24996C6.50585 1.24969 5.95624 1.24951 5.46776 1.38342C4.44215 1.66458 3.58414 2.36798 3.1073 3.31853C2.88019 3.77127 2.77258 4.31024 2.61576 5.0957L1.99616 8.19383C1.76456 9.35186 2.08191 10.4718 2.74977 11.3115L2.74977 14.0564C2.74975 15.8942 2.74974 17.3498 2.9029 18.489C3.06053 19.6614 3.39265 20.6104 4.14101 21.3587C4.88937 22.1071 5.83832 22.4392 7.01074 22.5969C8.14996 22.75 9.60559 22.75 11.4434 22.75H12.5562C14.3939 22.75 15.8496 22.75 16.9888 22.5969C18.1612 22.4392 19.1102 22.1071 19.8585 21.3587C20.6069 20.6104 20.939 19.6614 21.0966 18.489C21.2498 17.3498 21.2498 15.8942 21.2498 14.0564V11.3115C21.9176 10.4718 22.235 9.35187 22.0034 8.19383L21.3838 5.0957C21.227 4.31024 21.1194 3.77127 20.8923 3.31853C20.4154 2.36798 19.5574 1.66458 18.5318 1.38342C18.0433 1.24951 17.4937 1.24969 16.6927 1.24996H7.30681ZM18.2682 12.75C18.7971 12.75 19.2969 12.6435 19.7498 12.4524V14C19.7498 15.9068 19.7482 17.2615 19.61 18.2891C19.4747 19.2952 19.2211 19.8749 18.7979 20.2981C18.3747 20.7213 17.795 20.975 16.7889 21.1102C16.3434 21.1701 15.8365 21.2044 15.2498 21.2239V18.4678C15.2498 18.028 15.2498 17.6486 15.2216 17.3373C15.1917 17.0082 15.1257 16.6822 14.9483 16.375C14.7508 16.0329 14.4668 15.7489 14.1248 15.5514C13.8176 15.3741 13.4916 15.308 13.1624 15.2782C12.8511 15.25 12.4718 15.25 12.032 15.25H11.9675C11.5278 15.25 11.1484 15.25 10.8371 15.2782C10.5079 15.308 10.182 15.3741 9.87477 15.5514C9.53272 15.7489 9.24869 16.0329 9.05121 16.375C8.87384 16.6822 8.80778 17.0082 8.77795 17.3373C8.74973 17.6486 8.74975 18.028 8.74977 18.4678L8.74977 21.2239C8.16304 21.2044 7.6561 21.1701 7.21062 21.1102C6.20453 20.975 5.62488 20.7213 5.20167 20.2981C4.77846 19.8749 4.52479 19.2952 4.38953 18.2891C4.25136 17.2615 4.24977 15.9068 4.24977 14V12.4523C4.70264 12.6435 5.20244 12.75 5.73132 12.75C7.00523 12.75 8.14422 12.1216 8.83783 11.1458C9.54734 12.1139 10.6929 12.75 11.9996 12.75C13.3063 12.75 14.452 12.1138 15.1615 11.1455C15.8551 12.1215 16.9942 12.75 18.2682 12.75ZM10.2498 21.248C10.6382 21.2499 11.0539 21.25 11.4998 21.25H12.4998C12.9457 21.25 13.3614 21.2499 13.7498 21.248V18.5C13.7498 18.0189 13.749 17.7082 13.7277 17.4727C13.7073 17.2476 13.6729 17.1659 13.6493 17.125C13.5835 17.011 13.4888 16.9163 13.3748 16.8505C13.3339 16.8269 13.2522 16.7925 13.027 16.772C12.7916 16.7507 12.4809 16.75 11.9998 16.75C11.5187 16.75 11.208 16.7507 10.9725 16.772C10.7474 16.7925 10.6656 16.8269 10.6248 16.8505C10.5108 16.9163 10.4161 17.011 10.3502 17.125C10.3267 17.1659 10.2922 17.2476 10.2718 17.4727C10.2505 17.7082 10.2498 18.0189 10.2498 18.5V21.248ZM8.67082 2.74999H7.41748C6.46302 2.74999 6.13246 2.75654 5.86433 2.83005C5.24897 2.99874 4.73416 3.42078 4.44806 3.99112C4.3234 4.23962 4.25214 4.56248 4.06496 5.4984L3.46703 8.48801C3.18126 9.91687 4.27415 11.25 5.73132 11.25C6.91763 11.25 7.91094 10.3511 8.02898 9.17063L8.09757 8.48474L8.10155 8.44273L8.67082 2.74999ZM9.59103 8.62499L10.1785 2.74999H13.8208L14.405 8.59198C14.5473 10.0151 13.4298 11.25 11.9996 11.25C10.5804 11.25 9.46911 10.0341 9.59103 8.62499ZM18.1352 2.83005C17.8671 2.75654 17.5365 2.74999 16.5821 2.74999H15.3285L15.9706 9.17063C16.0886 10.3511 17.0819 11.25 18.2682 11.25C19.7254 11.25 20.8183 9.91687 20.5325 8.48801L19.9346 5.4984C19.7474 4.56248 19.6762 4.23962 19.5515 3.99112C19.2654 3.42078 18.7506 2.99874 18.1352 2.83005Z" fill="#c3c3c3"></path> </g></svg>',
      color: 'bg-gray-100',
      number: 4,
      content: `La recepción en tiendas aún no ha sido registrada.`
    });
  }

  // Determinar el paso actual (el último completado o el primero pendiente)
  let currentStep = 0;
  if (trazabilidad.produccion) currentStep = 1;
  if (trazabilidad.despachos && trazabilidad.despachos.length > 0) currentStep = 2;
  if (trazabilidad.recepciones && trazabilidad.recepciones.length > 0) currentStep = 3;

  // Renderizado del stepper
  let html = `<div class="trazabilidad-container">
  <div class="flex justify-between items-center">
    <h3>Trazabilidad del lote</h3>
    ${infoLoteHtml}
    <ul class="relative flex flex-col md:flex-row gap-2">`;
  steps.forEach((step, idx) => {
    // Resaltar todos los pasos completados y el actual en azul, y la línea también
    const isCompleted = idx < currentStep;
    const isActive = idx === currentStep;
    const isHighlighted = idx <= currentStep;
    const stepNumberClass = isHighlighted ? 'bg-green-600 text-white shadow-lg' : step.color + ' text-gray-800';
    const titleClass = isHighlighted ? 'font-bold text-green-700' : 'font-medium text-gray-800';
    const lineClass = isHighlighted ? 'bg-green-600' : 'bg-gray-200';
    html += `
      <li class="md:shrink md:basis-0 flex-1 group flex gap-x-2 md:block">
        <div class="min-w-7 min-h-7 flex flex-col items-center md:w-full md:inline-flex md:flex-wrap md:flex-row text-xs align-middle">
          <span class="size-7 flex justify-center items-center shrink-0 ${stepNumberClass} rounded-full dark:bg-neutral-700 dark:text-white">
            ${step.icon || (idx + 1)}
          </span>
          <div class="mt-2 w-px h-full md:mt-0 md:ms-2 md:w-full md:h-px md:flex-1 ${lineClass} group-last:hidden dark:bg-neutral-700"></div>
        </div>
        <div class="grow md:grow-0 md:mt-3 pb-5">
          <span class="block text-sm ${titleClass} dark:text-white">
            ${step.title}
          </span>
          <div class="text-sm text-gray-500 dark:text-neutral-500">
            ${step.content}
          </div>
        </div>
      </li>`;
  });
  html += `</ul></div>`;
  resultTraza.innerHTML = html;
}

// Gestión de datos maestros
formProducto.onsubmit = async e => {
  e.preventDefault();
  const fd = new FormData(formProducto);
  const data = Object.fromEntries(fd.entries());
  
  try {
    const res = await api('/maestros/producto', 'POST', data, 'admin');
    resultProducto.textContent = JSON.stringify(res, null, 2);
    formProducto.reset();
    
    // Recargar lista de productos
    setTimeout(async () => {
      await cargarLotesParaTrazabilidad();
      await cargarOpcionesEnSelect('/opciones/productos', document.querySelector('.producto-select'));
    }, 500);
  } catch (error) {
    resultProducto.textContent = 'Error: ' + error.message;
  }
};

formEmpleadoMaestro.onsubmit = async e => {
  e.preventDefault();
  const fd = new FormData(formEmpleadoMaestro);
  const data = Object.fromEntries(fd.entries());
  
  try {
    const res = await api('/maestros/empleado', 'POST', data, 'admin');
    resultEmpleadoMaestro.textContent = JSON.stringify(res, null, 2);
    formEmpleadoMaestro.reset();
    
    // Ya no necesitamos recargar opciones para los campos ocultos de empleados
    // que se completan automáticamente con el usuario actual
    setTimeout(() => {
      // Mantener el timeout para consistencia pero sin cargar opciones
    }, 500);
  } catch (error) {
    resultEmpleadoMaestro.textContent = 'Error: ' + error.message;
  }
};

formTiendaMaestro.onsubmit = async e => {
  e.preventDefault();
  const fd = new FormData(formTiendaMaestro);
  const data = Object.fromEntries(fd.entries());
  
  try {
    const res = await api('/maestros/tienda', 'POST', data, 'admin');
    resultTiendaMaestro.textContent = JSON.stringify(res, null, 2);
    formTiendaMaestro.reset();
    
    // Recargar lista de tiendas
    setTimeout(async () => {
      await cargarTiendasDisponibles();
      verMaestros('all');
      setTimeout(async () => {
        await cargarLotesParaTrazabilidad();
        await cargarOpcionesEnSelect('/opciones/productos', document.querySelector('.producto-select'));
        // Ya no necesitamos recargar opciones para los campos ocultos de empleados
        // que se completan automáticamente con el usuario actual
        await cargarTiendasDisponibles();
      }, 500);
    }, 200);
  } catch (error) {
    resultTiendaMaestro.textContent = 'Error: ' + error.message;
  }
};

const verMaestros = async (tipo) => {
  try {
    const res = await api('/maestros', 'GET', null, 'admin');
    // Manejar tanto array directo como objeto con propiedad maestros
    const maestros = Array.isArray(res) ? res : (res.maestros || []);
    
    if (!Array.isArray(maestros)) {
      resultMaestrosList.innerHTML = '<p style="color: #dc3545;">Error: No se pudieron cargar los datos maestros</p>';
      return;
    }

    // Cargar familias para los selects
    let familias = [];
    try {
      const familiasRes = await api('/familias');
      familias = familiasRes.success ? familiasRes.familias : [];
    } catch (error) {
      console.error('Error cargando familias:', error);
    }
    
    let html = '<div style="margin-top: 1em;">';
    
    if (tipo === 'all' || tipo === 'producto') {
      const productos = maestros.filter(m => m.tipo === 'producto' && m.activo);
      html += `
        <div style="margin-bottom: 2em;">
          <h4 style="color: #0056b3; border-bottom: 2px solid #e9ecef; padding-bottom: 0.5em;">
            📦 Productos (${productos.length})
          </h4>
          ${productos.length > 0 ? `
            <table style="width: 100%; border-collapse: collapse; margin-top: 1em; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <thead>
                <tr style="background: #f8f9fa; border-bottom: 2px solid #dee2e6;">
                  <th style="padding: 0.75em; text-align: left; border: 1px solid #dee2e6; font-weight: 600;">ID</th>
                  <th style="padding: 0.75em; text-align: left; border: 1px solid #dee2e6; font-weight: 600;">Nombre del Producto</th>
                  <th style="padding: 0.75em; text-align: left; border: 1px solid #dee2e6; font-weight: 600;">Familia</th>
                  <th style="padding: 0.75em; text-align: left; border: 1px solid #dee2e6; font-weight: 600;">Fecha Registro</th>
                </tr>
              </thead>
              <tbody>
                ${productos.map(p => `
                  <tr style="border-bottom: 1px solid #dee2e6;">
                    <td style="padding: 0.75em; border: 1px solid #dee2e6; font-weight: bold; color: #0056b3;">${p.id}</td>
                    <td style="padding: 0.75em; border: 1px solid #dee2e6;">${p.nombre}</td>
                    <td style="padding: 0.75em; border: 1px solid #dee2e6;">
                      <select onchange="asignarFamiliaProducto(${p.id}, this.value)" style="padding: 0.25em; border: 1px solid #ced4da; border-radius: 3px; width: 100%;">
                        <option value="">-- Sin familia --</option>
                        ${familias.map(f => `
                          <option value="${f.id}" ${p.familia_id == f.id ? 'selected' : ''}>${f.nombre}</option>
                        `).join('')}
                      </select>
                    </td>
                    <td style="padding: 0.75em; border: 1px solid #dee2e6; color: #6c757d;">
                      ${new Date(p.created_at).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          ` : '<p style="color: #6c757d; font-style: italic; margin: 1em 0;">No hay productos registrados</p>'}
        </div>
      `;
    }
    
    if (tipo === 'all' || tipo === 'empleado') {
      const empleados = maestros.filter(m => m.tipo === 'empleado' && m.activo);
      html += `
        <div style="margin-bottom: 2em;">
          <h4 style="color: #28a745; border-bottom: 2px solid #e9ecef; padding-bottom: 0.5em;">
            👥 Empleados (${empleados.length})
          </h4>
          ${empleados.length > 0 ? `
            <table style="width: 100%; border-collapse: collapse; margin-top: 1em; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <thead>
                <tr style="background: #f8f9fa; border-bottom: 2px solid #dee2e6;">
                  <th style="padding: 0.75em; text-align: left; border: 1px solid #dee2e6; font-weight: 600;">ID</th>
                  <th style="padding: 0.75em; text-align: left; border: 1px solid #dee2e6; font-weight: 600;">DNI</th>
                  <th style="padding: 0.75em; text-align: left; border: 1px solid #dee2e6; font-weight: 600;">Nombre del Empleado</th>
                  <th style="padding: 0.75em; text-align: left; border: 1px solid #dee2e6; font-weight: 600;">Estado</th>
                  <th style="padding: 0.75em; text-align: left; border: 1px solid #dee2e6; font-weight: 600;">Fecha Registro</th>
                </tr>
              </thead>
              <tbody>
                ${empleados.map(e => `
                  <tr style="border-bottom: 1px solid #dee2e6;">
                    <td style="padding: 0.75em; border: 1px solid #dee2e6; font-weight: bold; color: #28a745;">${e.id}</td>
                    <td style="padding: 0.75em; border: 1px solid #dee2e6; font-weight: bold; color: #0056b3;">
                      ${e.dni ? e.dni : '<span style="color: #dc3545; font-style: italic;">Sin DNI</span>'}
                    </td>
                    <td style="padding: 0.75em; border: 1px solid #dee2e6;">${e.nombre}</td>
                    <td style="padding: 0.75em; border: 1px solid #dee2e6;">
                      ${e.dni ? 
                        '<span style="background: #d4edda; color: #155724; padding: 0.25em 0.5em; border-radius: 3px; font-size: 0.85em;">✓ Completo</span>' :
                        '<span style="background: #f8d7da; color: #721c24; padding: 0.25em 0.5em; border-radius: 3px; font-size: 0.85em;">⚠ Falta DNI</span>'
                      }
                    </td>
                    <td style="padding: 0.75em; border: 1px solid #dee2e6; color: #6c757d;">
                      ${new Date(e.created_at).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          ` : '<p style="color: #6c757d; font-style: italic; margin: 1em 0;">No hay empleados registrados</p>'}
        </div>
      `;
    }
    
    if (tipo === 'all' || tipo === 'tienda') {
      const tiendas = maestros.filter(m => m.tipo === 'tienda' && m.activo);
      html += `
        <div style="margin-bottom: 2em;">
          <h4 style="color: #dc3545; border-bottom: 2px solid #e9ecef; padding-bottom: 0.5em;">
            🏪 Tiendas (${tiendas.length})
          </h4>
          ${tiendas.length > 0 ? `
            <table style="width: 100%; border-collapse: collapse; margin-top: 1em; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <thead>
                <tr style="background: #f8f9fa; border-bottom: 2px solid #dee2e6;">
                  <th style="padding: 0.75em; text-align: left; border: 1px solid #dee2e6; font-weight: 600;">ID</th>
                  <th style="padding: 0.75em; text-align: left; border: 1px solid #dee2e6; font-weight: 600;">Nombre de la Tienda</th>
                  <th style="padding: 0.75em; text-align: left; border: 1px solid #dee2e6; font-weight: 600;">Fecha Registro</th>
                  <th style="padding: 0.75em; text-align: left; border: 1px solid #dee2e6; font-weight: 600;">Acciones</th>
                </tr>
              </thead>
              <tbody>
                ${tiendas.map(t => `
                  <tr style="border-bottom: 1px solid #dee2e6;">
                    <td style="padding: 0.75em; border: 1px solid #dee2e6; font-weight: bold; color: #dc3545;">${t.id}</td>
                    <td style="padding: 0.75em; border: 1px solid #dee2e6;">${t.nombre}</td>
                    <td style="padding: 0.75em; border: 1px solid #dee2e6; color: #6c757d;">
                      ${new Date(t.created_at).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </td>
                    <td style="padding: 0.75em; border: 1px solid #dee2e6;">
                      <button onclick="gestionarUsuariosTienda(${t.id}, '${t.nombre}')" 
                              style="background: #17a2b8; color: white; border: none; padding: 0.5em; border-radius: 4px; cursor: pointer;">
                        👥 Gestionar Usuarios
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          ` : '<p style="color: #6c757d; font-style: italic; margin: 1em 0;">No hay tiendas registradas</p>'}
        </div>
      `;
    }
    
    html += '</div>';
    resultMaestrosList.innerHTML = html;
    
  } catch (error) {
    console.error('Error cargando maestros:', error);
    resultMaestrosList.innerHTML = `
      <div style="color: #dc3545; background: #f8d7da; border: 1px solid #f5c6cb; padding: 1em; border-radius: 5px;">
        <strong>Error al cargar datos:</strong> ${error.message}
      </div>
    `;
  }
};

// Función para gestionar los usuarios vinculados a una tienda
async function gestionarUsuariosTienda(tiendaId, tiendaNombre) {
  try {
    // Función para inspeccionar objetos en consola
    const debugObject = (label, obj) => {
      console.log(`DEBUG ${label}:`, JSON.stringify(obj, null, 2));
    };
    
    // 1. Crear el modal de gestión de usuarios
    const modalId = 'modal-usuarios-tienda';
    let modalElement = document.getElementById(modalId);
    
    // Si el modal no existe, lo creamos
    if (!modalElement) {
      modalElement = document.createElement('div');
      modalElement.id = modalId;
      modalElement.className = 'modal-usuarios-tienda';
      modalElement.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
      `;
      
      document.body.appendChild(modalElement);
    }
    
    // 2. Cargar los usuarios disponibles y los ya vinculados a la tienda
    const usuarios = await api('/usuarios', 'GET', null, 'admin');
    debugObject('Todos los usuarios', usuarios.slice(0, 3)); // Solo debuggear 3 primeros para no saturar
    
    const tiendaInfo = await api(`/tiendas/${tiendaId}/usuarios`, 'GET', null, 'admin');
    debugObject('Tienda Info', tiendaInfo);
    
    const usuariosVinculados = tiendaInfo.usuarios || [];
    
    // 3. Generar el contenido del modal
    modalElement.innerHTML = `
      <div style="background: white; border-radius: 8px; width: 90%; max-width: 800px; max-height: 90vh; overflow-y: auto; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
        <div style="padding: 1.5em; border-bottom: 1px solid #dee2e6; display: flex; justify-content: space-between; align-items: center;">
          <h3 style="margin: 0;">👥 Usuarios de la Tienda: ${tiendaNombre}</h3>
          <button onclick="document.getElementById('${modalId}').remove()" style="background: none; border: none; font-size: 1.5em; cursor: pointer;">×</button>
        </div>
        
        <div style="padding: 1.5em;">
          <p style="margin-bottom: 1.5em; color: #6c757d;">
            Seleccione los usuarios que tendrán acceso a esta tienda. Los usuarios con rol "tienda" solo podrán gestionar información de la tienda asignada.
          </p>
          
          <form id="form-vincular-usuarios-tienda">
            <input type="hidden" name="tienda_id" value="${tiendaId}">
            
            <div style="max-height: 50vh; overflow-y: auto; padding: 1em; border: 1px solid #dee2e6; border-radius: 5px; margin-bottom: 1.5em;">
              <h4 style="margin-top: 0;">Seleccionar Usuarios:</h4>
              
              ${usuarios.length > 0 ? 
                usuarios.map(usuario => {
                  // Accedemos correctamente al nombre del rol a través del objeto rol
                  const rolNombre = usuario.rol && typeof usuario.rol === 'object' ? usuario.rol.nombre : usuario.rol;
                  const isRolTienda = rolNombre === 'tienda';
                  
                  // Verificamos si el usuario está vinculado a esta tienda
                  const isVinculado = usuariosVinculados.some(u => u.id === usuario.id);
                  
                  // Si está vinculado, obtenemos el nombre de la tienda
                  const tiendaActual = isVinculado ? 
                    (usuariosVinculados.find(u => u.id === usuario.id) || {}).tienda_nombre : null;
                  
                  // Obtenemos el nombre del usuario - puede estar directamente o en objeto empleado
                  const nombreUsuario = usuario.nombre || 
                    (usuario.empleado && usuario.empleado.nombre ? usuario.empleado.nombre : 'Usuario sin nombre');
                  
                  // Obtenemos el DNI - puede estar directamente o en objeto empleado
                  const dniUsuario = usuario.dni || 
                    (usuario.empleado && usuario.empleado.dni ? usuario.empleado.dni : 'No especificado');
                    
                  return `
                    <div style="padding: 0.75em; border: 1px solid ${isVinculado ? '#28a745' : '#dee2e6'}; border-radius: 5px; margin-bottom: 0.5em; background: ${isVinculado ? '#f0fff0' : 'white'};">
                      <div style="display: flex; align-items: center;">
                        <input 
                          type="checkbox" 
                          name="usuario_ids" 
                          value="${usuario.id}" 
                          id="usuario-${usuario.id}" 
                          ${isVinculado ? 'checked' : ''} 
                          ${isRolTienda ? '' : 'disabled'} 
                          style="margin-right: 1em;"
                        >
                        <div>
                          <label for="usuario-${usuario.id}" style="font-weight: bold; margin-bottom: 0.25em; display: block;">
                            ${nombreUsuario} 
                            <span style="background: ${isRolTienda ? '#17a2b8' : '#6c757d'}; color: white; padding: 0.2em 0.5em; border-radius: 3px; font-size: 0.8em; margin-left: 0.5em;">
                              ${rolNombre || 'Sin rol'}
                            </span>
                          </label>
                          <div style="font-size: 0.9em; color: #6c757d;">DNI: ${dniUsuario}</div>
                          ${isRolTienda ? 
                            (isVinculado ? 
                              `<div style="font-size: 0.9em; color: #28a745; margin-top: 0.25em;">✓ Vinculado a: ${tiendaActual || tiendaNombre}</div>` : 
                              '') : 
                            `<div style="font-size: 0.9em; color: #dc3545; margin-top: 0.25em;">⚠️ No es usuario de tienda</div>`
                          }
                        </div>
                      </div>
                    </div>
                  `;
                }).join('') : 
                '<p style="color: #6c757d; font-style: italic;">No hay usuarios registrados</p>'
              }
            </div>
            
            <div style="display: flex; justify-content: flex-end; gap: 1em;">
              <button type="button" onclick="document.getElementById('${modalId}').remove()" style="background: #6c757d; color: white; border: none; padding: 0.75em 1.5em; border-radius: 5px; cursor: pointer;">
                Cancelar
              </button>
              <button type="submit" style="background: #28a745; color: white; border: none; padding: 0.75em 1.5em; border-radius: 5px; cursor: pointer;">
                Guardar Cambios
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
    
    // 4. Manejar el submit del formulario
    document.getElementById('form-vincular-usuarios-tienda').onsubmit = async (e) => {
      e.preventDefault();
      
      // Recopilar los IDs de usuarios seleccionados
      const form = e.target;
      const formData = new FormData(form);
      const usuarioIds = formData.getAll('usuario_ids').map(Number);
      
      try {
        // Enviar al servidor los usuarios seleccionados
        const response = await api(`/tiendas/${tiendaId}/usuarios`, 'POST', { usuario_ids: usuarioIds }, 'admin');
        
        // Mostrar mensaje de éxito
        alert(`Usuarios actualizados para la tienda ${tiendaNombre}`);
        
        // Cerrar el modal
        document.getElementById(modalId).remove();
        
      } catch (error) {
        console.error('Error al vincular usuarios:', error);
        alert(`Error al vincular usuarios: ${error.message}`);
      }
    };
    
  } catch (error) {
    console.error('Error gestionando usuarios de tienda:', error);
    alert(`Error: ${error.message}`);
  }
}

// Función para asignar familia a un producto
const asignarFamiliaProducto = async (productoId, familiaId) => {
  try {
    // Mostrar loading visual
    const select = document.querySelector(`select[onchange*="${productoId}"]`);
    const originalHTML = select.innerHTML;
    select.innerHTML = '<option>Guardando...</option>';
    select.disabled = true;
    
    const endpoint = `/productos/${productoId}/familia`;
    const body = { 
      familia_id: familiaId ? parseInt(familiaId) : null 
    };
    
    const response = await api(endpoint, 'PUT', body, 'admin');
    
    // Verificar la respuesta del backend
    if (response.mensaje || response.success !== false) {
      // Mostrar mensaje de éxito temporal
      select.style.backgroundColor = '#d4edda';
      setTimeout(() => {
        select.style.backgroundColor = '';
      }, 1000);
      
      console.log(`Producto ${productoId} ${familiaId ? 'asignado a familia ' + familiaId : 'removido de familia'}`);
    } else {
      throw new Error(response.error || 'Error al asignar familia');
    }
    
  } catch (error) {
    console.error('Error asignando familia:', error);
    alert(`Error al asignar familia: ${error.message}`);
    
    // Recargar la vista para restaurar el estado correcto
    const tipo = document.querySelector('input[name="tipoMaestro"]:checked')?.value || 'all';
    verMaestros(tipo);
    
  } finally {
    // Restaurar el select
    const select = document.querySelector(`select[onchange*="${productoId}"]`);
    if (select) {
      select.disabled = false;
      // No restauramos el HTML porque queremos mantener la selección actual
    }
  }
};