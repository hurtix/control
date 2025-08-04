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
  let html = `<h3 style="color: #e74c3c; margin-bottom: 1.5em;">📋 Consulta de Pedidos</h3>`;
  
  // Intentar diferentes estructuras de datos
  let pedidos = datos.pedidos || datos || [];
  if (!Array.isArray(pedidos)) {
    pedidos = [];
  }
  
  if (pedidos.length === 0) {
    return html + `<p style="color: #6c757d; text-align: center; padding: 2em;">No hay pedidos registrados</p>`;
  }
  
  pedidos.forEach(pedido => {
    const fechaPedido = new Date(pedido.fecha_pedido).toLocaleString('es-ES');
    const fechaRequerida = new Date(pedido.fecha_requerida).toLocaleDateString('es-ES');
    const estadoColor = pedido.estado === 'completado' ? '#28a745' : pedido.estado === 'en_proceso' ? '#ffc107' : '#dc3545';
    
    // Intentar diferentes nombres para el ID del lote
    const loteId = pedido.lote_id || pedido.id || pedido.lote || 'Sin ID';
    
    html += `<div style="margin-bottom: 2em; padding: 1.5em; border-left: 4px solid ${estadoColor}; background: #f8f9fa; border-radius: 0 5px 5px 0;">`;
    html += `<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1em;">`;
    html += `<h4 style="color: ${estadoColor}; margin: 0;">📦 Lote #${loteId}</h4>`;
    html += `<span style="background: ${estadoColor}; color: white; padding: 0.25em 0.75em; border-radius: 15px; font-size: 0.9em;">${pedido.estado.toUpperCase()}</span>`;
    html += `</div>`;
    
    html += `<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1em; margin-bottom: 1em;">`;
    html += `<div><strong>📅 Fecha Pedido:</strong><br>${fechaPedido}</div>`;
    html += `<div><strong>⏰ Fecha Requerida:</strong><br>${fechaRequerida}</div>`;
    html += `</div>`;
    
    if (pedido.items && pedido.items.length > 0) {
      html += `<h5 style="color: #495057; margin: 1em 0 0.5em 0;">🛒 Productos Solicitados:</h5>`;
      html += `<div style="display: grid; gap: 0.5em;">`;
      pedido.items.forEach(item => {
        html += `<div style="background: white; padding: 0.75em; border-radius: 5px; border: 1px solid #dee2e6;">`;
        html += `<strong>${item.producto}</strong> → <em>${item.tienda}</em>: `;
        html += `<span style="color: ${estadoColor}; font-weight: bold;">${item.cantidad_solicitada} unidades</span>`;
        html += `</div>`;
      });
      html += `</div>`;
    }
    html += `</div>`;
  });
  
  return html;
}

// Función para mostrar producción formateada
function mostrarProduccionFormateada(datos) {
  let html = `<h3 style="color: #f39c12; margin-bottom: 1.5em;">🏭 Consulta de Producción</h3>`;
  
  // Intentar diferentes estructuras de datos
  let produccion = datos.produccion || datos || [];
  if (!Array.isArray(produccion)) {
    produccion = [];
  }
  
  if (produccion.length === 0) {
    return html + `<p style="color: #6c757d; text-align: center; padding: 2em;">No hay registros de producción</p>`;
  }
  
  produccion.forEach(prod => {
    const fecha = new Date(prod.fecha).toLocaleString('es-ES');
    
    html += `<div style="margin-bottom: 2em; padding: 1.5em; border-left: 4px solid #f39c12; background: #fef9e7; border-radius: 0 5px 5px 0;">`;
    html += `<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1em;">`;
    html += `<h4 style="color: #f39c12; margin: 0;">📦 Lote #${prod.lote_id}</h4>`;
    html += `<span style="background: #f39c12; color: white; padding: 0.25em 0.75em; border-radius: 15px; font-size: 0.9em;">PRODUCIDO</span>`;
    html += `</div>`;
    
    html += `<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1em; margin-bottom: 1em;">`;
    html += `<div><strong>📅 Fecha Producción:</strong><br>${fecha}</div>`;
    html += `<div><strong>👤 Empleado:</strong><br>${prod.empleado || 'No especificado'}</div>`;
    html += `</div>`;
    
    if (prod.observaciones) {
      html += `<div style="background: white; padding: 0.75em; border-radius: 5px; margin-bottom: 1em;">`;
      html += `<strong>📝 Observaciones:</strong> ${prod.observaciones}`;
      html += `</div>`;
    }
    
    if (prod.items && prod.items.length > 0) {
      html += `<h5 style="color: #f39c12; margin: 1em 0 0.5em 0;">📦 Productos Producidos:</h5>`;
      html += `<div style="display: grid; gap: 0.5em;">`;
      prod.items.forEach(item => {
        html += `<div style="background: white; padding: 0.75em; border-radius: 5px; border: 1px solid #f39c12;">`;
        html += `<strong>${item.producto}</strong>: `;
        html += `<span style="color: #f39c12; font-weight: bold;">${item.cantidad_producida} unidades</span>`;
        if (item.empleado) {
          html += ` <small style="color: #666;">(Empleado: ${item.empleado})</small>`;
        }
        html += `</div>`;
      });
      html += `</div>`;
    }
    html += `</div>`;
  });
  
  return html;
}

// Función para mostrar despachos formateados
function mostrarDespachosFormateados(datos) {
  let html = `<h3 style="color: #9b59b6; margin-bottom: 1.5em;">🚚 Consulta de Despachos</h3>`;
  
  // Intentar diferentes estructuras de datos
  let despachos = datos.despachos || datos || [];
  if (!Array.isArray(despachos)) {
    despachos = [];
  }
  
  if (despachos.length === 0) {
    return html + `<p style="color: #6c757d; text-align: center; padding: 2em;">No hay registros de despachos</p>`;
  }
  
  // Agrupar por lote
  const despachosPorLote = {};
  despachos.forEach(despacho => {
    if (!despachosPorLote[despacho.lote_id]) {
      despachosPorLote[despacho.lote_id] = [];
    }
    despachosPorLote[despacho.lote_id].push(despacho);
  });
  
  Object.keys(despachosPorLote).forEach(loteId => {
    const despachosLote = despachosPorLote[loteId];
    const fecha = new Date(despachosLote[0].fecha).toLocaleString('es-ES');
    
    html += `<div style="margin-bottom: 2em; padding: 1.5em; border-left: 4px solid #9b59b6; background: #f8f4fd; border-radius: 0 5px 5px 0;">`;
    html += `<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1em;">`;
    html += `<h4 style="color: #9b59b6; margin: 0;">📦 Lote #${loteId}</h4>`;
    html += `<span style="background: #9b59b6; color: white; padding: 0.25em 0.75em; border-radius: 15px; font-size: 0.9em;">DESPACHADO</span>`;
    html += `</div>`;
    
    html += `<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1em; margin-bottom: 1em;">`;
    html += `<div><strong>📅 Fecha Despacho:</strong><br>${fecha}</div>`;
    html += `<div><strong>👤 Empleado:</strong><br>${despachosLote[0].empleado || 'No especificado'}</div>`;
    html += `</div>`;
    
    if (despachosLote[0].observaciones) {
      html += `<div style="background: white; padding: 0.75em; border-radius: 5px; margin-bottom: 1em;">`;
      html += `<strong>📝 Observaciones:</strong> ${despachosLote[0].observaciones}`;
      html += `</div>`;
    }
    
    html += `<h5 style="color: #9b59b6; margin: 1em 0 0.5em 0;">📦 Productos Despachados:</h5>`;
    html += `<div style="display: grid; gap: 0.5em;">`;
    despachosLote.forEach(despacho => {
      html += `<div style="background: white; padding: 0.75em; border-radius: 5px; border: 1px solid #9b59b6;">`;
      html += `<strong>${despacho.producto}</strong> → <em>${despacho.tienda}</em>: `;
      html += `<span style="color: #9b59b6; font-weight: bold;">${despacho.cantidad_despachada} unidades</span>`;
      html += `</div>`;
    });
    html += `</div>`;
    html += `</div>`;
  });
  
  return html;
}

// Función para mostrar recepciones formateadas
function mostrarRecepcionesFormateadas(datos) {
  let html = `<h3 style="color: #27ae60; margin-bottom: 1.5em;">🏪 Consulta de Recepciones</h3>`;
  
  // Intentar diferentes estructuras de datos
  let recepciones = datos.recepciones || datos || [];
  if (!Array.isArray(recepciones)) {
    recepciones = [];
  }
  
  if (recepciones.length === 0) {
    return html + `<p style="color: #6c757d; text-align: center; padding: 2em;">No hay registros de recepciones</p>`;
  }
  
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
  
  Object.values(recepcionesPorLote).forEach(recepcionGroup => {
    const fecha = new Date(recepcionGroup.fecha).toLocaleString('es-ES');
    
    html += `<div style="margin-bottom: 2em; padding: 1.5em; border-left: 4px solid #27ae60; background: #f0f9f4; border-radius: 0 5px 5px 0;">`;
    html += `<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1em;">`;
    html += `<h4 style="color: #27ae60; margin: 0;">📦 Lote #${recepcionGroup.lote_id} - 🏬 ${recepcionGroup.tienda}</h4>`;
    html += `<span style="background: #27ae60; color: white; padding: 0.25em 0.75em; border-radius: 15px; font-size: 0.9em;">RECIBIDO</span>`;
    html += `</div>`;
    
    html += `<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1em; margin-bottom: 1em;">`;
    html += `<div><strong>📅 Fecha Recepción:</strong><br>${fecha}</div>`;
    html += `<div><strong>👤 Empleado:</strong><br>${recepcionGroup.empleado || 'No especificado'}</div>`;
    html += `</div>`;
    
    if (recepcionGroup.observaciones) {
      html += `<div style="background: white; padding: 0.75em; border-radius: 5px; margin-bottom: 1em;">`;
      html += `<strong>📝 Observaciones:</strong> ${recepcionGroup.observaciones}`;
      html += `</div>`;
    }
    
    html += `<h5 style="color: #27ae60; margin: 1em 0 0.5em 0;">📦 Productos Recibidos:</h5>`;
    html += `<div style="display: grid; gap: 0.5em;">`;
    recepcionGroup.items.forEach(item => {
      const confirmadoIcon = item.confirmado ? '✅' : '❌';
      const confirmadoText = item.confirmado ? 'Confirmado' : 'No confirmado';
      const confirmadoColor = item.confirmado ? '#27ae60' : '#dc3545';
      
      html += `<div style="background: white; padding: 0.75em; border-radius: 5px; border: 1px solid #27ae60;">`;
      html += `<strong>${item.producto}</strong>: `;
      html += `<span style="color: #27ae60; font-weight: bold;">${item.cantidad_recibida} unidades</span> `;
      html += `<span style="color: ${confirmadoColor}; font-weight: bold;">${confirmadoIcon} ${confirmadoText}</span>`;
      html += `</div>`;
    });
    html += `</div>`;
    html += `</div>`;
  });
  
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
  let html = `<div class="trazabilidad-container">`;
  html += `<h3 style="color: #2c3e50; margin-bottom: 1.5em;">📊 Trazabilidad Completa - Lote #${trazabilidad.lote_id}</h3>`;
  
  // Estado del lote
  html += `<div class="etapa-container" style="margin-bottom: 2em; padding: 1em; border-left: 4px solid #3498db; background: #f8f9fa;">`;
  html += `<h4 style="color: #3498db; margin: 0 0 0.5em 0;">📦 Estado del Lote</h4>`;
  html += `<p><strong>Estado Actual:</strong> <span class="estado-badge estado-${trazabilidad.lote.estado}">${trazabilidad.lote.estado.toUpperCase()}</span></p>`;
  if (trazabilidad.lote.completado_en) {
    html += `<p><strong>Completado:</strong> ${new Date(trazabilidad.lote.completado_en).toLocaleString('es-ES')}</p>`;
  }
  html += `<p><strong>Creado:</strong> ${new Date(trazabilidad.lote.created_at).toLocaleString('es-ES')}</p>`;
  html += `</div>`;
  
  // Información del pedido
  html += `<div class="etapa-container" style="margin-bottom: 2em; padding: 1em; border-left: 4px solid #e74c3c; background: #fdf2f2;">`;
  html += `<h4 style="color: #e74c3c; margin: 0 0 0.5em 0;">📋 1. Pedido Registrado</h4>`;
  html += `<p><strong>📅 Fecha y Hora del Pedido:</strong> ${new Date(trazabilidad.pedido.fecha_pedido).toLocaleString('es-ES')}</p>`;
  html += `<p><strong>📅 Fecha Requerida:</strong> ${new Date(trazabilidad.pedido.fecha_requerida).toLocaleDateString('es-ES')}</p>`;
  html += `<p><strong>🏷️ Estado:</strong> ${trazabilidad.pedido.estado}</p>`;
  html += `<h5 style="margin: 1em 0 0.5em 0;">🛒 Productos Solicitados:</h5>`;
  html += `<ul style="margin: 0; padding-left: 1.5em;">`;
  trazabilidad.pedido.items.forEach(item => {
    html += `<li><strong>${item.producto}</strong> → ${item.tienda}: <span style="color: #e74c3c; font-weight: bold;">${item.cantidad_solicitada} unidades</span></li>`;
  });
  html += `</ul></div>`;
  
  // Información de producción
  if (trazabilidad.produccion) {
    html += `<div class="etapa-container" style="margin-bottom: 2em; padding: 1em; border-left: 4px solid #f39c12; background: #fef9e7;">`;
    html += `<h4 style="color: #f39c12; margin: 0 0 0.5em 0;">🏭 2. Producción Realizada</h4>`;
    html += `<p><strong>📅 Fecha y Hora:</strong> ${new Date(trazabilidad.produccion.fecha).toLocaleString('es-ES')}</p>`;
    html += `<p><strong>👤 Empleado:</strong> ${trazabilidad.produccion.empleado || 'No especificado'}</p>`;
    if (trazabilidad.produccion.observaciones) {
      html += `<p><strong>📝 Observaciones:</strong> ${trazabilidad.produccion.observaciones}</p>`;
    }
    html += `<h5 style="margin: 1em 0 0.5em 0;">📦 Productos Producidos:</h5>`;
    html += `<ul style="margin: 0; padding-left: 1.5em;">`;
    trazabilidad.produccion.items.forEach(item => {
      html += `<li><strong>${item.producto}</strong>: <span style="color: #f39c12; font-weight: bold;">${item.cantidad_producida} unidades</span></li>`;
      html += ` <small style="color: #666;">(Empleado: ${item.empleado || 'No especificado'})</small>`;
    });
    html += `</ul></div>`;
  } else {
    html += `<div class="etapa-pendiente" style="margin-bottom: 2em; padding: 1em; border-left: 4px solid #bdc3c7; background: #f5f5f5; color: #7f8c8d;">`;
    html += `<h4 style="color: #7f8c8d; margin: 0;">🏭 2. Producción - PENDIENTE</h4>`;
    html += `<p>La producción aún no ha sido registrada.</p></div>`;
  }
  
  // Información de despachos
  if (trazabilidad.despachos && trazabilidad.despachos.length > 0) {
    html += `<div class="etapa-container" style="margin-bottom: 2em; padding: 1em; border-left: 4px solid #9b59b6; background: #f8f4fd;">`;
    html += `<h4 style="color: #9b59b6; margin: 0 0 0.5em 0;">🚚 3. Despacho Realizado</h4>`;
    
    // Agrupar despachos por fecha
    const despachosPorFecha = {};
    trazabilidad.despachos.forEach(despacho => {
      const fecha = despacho.fecha;
      if (!despachosPorFecha[fecha]) {
        despachosPorFecha[fecha] = [];
      }
      despachosPorFecha[fecha].push(despacho);
    });
    
    Object.keys(despachosPorFecha).forEach(fecha => {
      const despachosDelDia = despachosPorFecha[fecha];
      html += `<div style="margin-bottom: 1em;">`;
      html += `<p><strong>📅 Fecha y Hora:</strong> ${new Date(fecha).toLocaleString('es-ES')}</p>`;
      html += `<p><strong>👤 Empleado:</strong> ${despachosDelDia[0].empleado || 'No especificado'}</p>`;
      if (despachosDelDia[0].observaciones) {
        html += `<p><strong>📝 Observaciones:</strong> ${despachosDelDia[0].observaciones}</p>`;
      }
      html += `<h5 style="margin: 0.5em 0;">📦 Productos Despachados:</h5>`;
      html += `<ul style="margin: 0; padding-left: 1.5em;">`;
      despachosDelDia.forEach(despacho => {
        html += `<li><strong>${despacho.producto}</strong> → ${despacho.tienda}: <span style="color: #9b59b6; font-weight: bold;">${despacho.cantidad_despachada} unidades</span></li>`;
      });
      html += `</ul></div>`;
    });
    html += `</div>`;
  } else {
    html += `<div class="etapa-pendiente" style="margin-bottom: 2em; padding: 1em; border-left: 4px solid #bdc3c7; background: #f5f5f5; color: #7f8c8d;">`;
    html += `<h4 style="color: #7f8c8d; margin: 0;">🚚 3. Despacho - PENDIENTE</h4>`;
    html += `<p>El despacho aún no ha sido registrado.</p></div>`;
  }
  
  // Información de recepciones
  if (trazabilidad.recepciones && trazabilidad.recepciones.length > 0) {
    html += `<div class="etapa-container" style="margin-bottom: 2em; padding: 1em; border-left: 4px solid #27ae60; background: #f0f9f4;">`;
    html += `<h4 style="color: #27ae60; margin: 0 0 0.5em 0;">🏪 4. Recepción en Tiendas</h4>`;
    
    trazabilidad.recepciones.forEach(recepcion => {
      html += `<div style="margin-bottom: 1.5em; padding: 0.5em; border: 1px solid #d5f4e6; border-radius: 4px; background: #ffffff;">`;
      html += `<h6 style="color: #27ae60; margin: 0 0 0.5em 0;">🏬 ${recepcion.tienda}</h6>`;
      html += `<p><strong>📅 Fecha y Hora:</strong> ${new Date(recepcion.fecha).toLocaleString('es-ES')}</p>`;
      html += `<p><strong>👤 Empleado:</strong> ${recepcion.empleado || 'No especificado'}</p>`;
      if (recepcion.observaciones) {
        html += `<p><strong>📝 Observaciones:</strong> ${recepcion.observaciones}</p>`;
      }
      html += `<h6 style="margin: 0.5em 0;">📦 Productos Recibidos:</h6>`;
      html += `<ul style="margin: 0; padding-left: 1.5em;">`;
      recepcion.items.forEach(item => {
        const confirmadomText = item.confirmado ? '✅ Confirmado' : '❌ No confirmado';
        html += `<li><strong>${item.producto}</strong>: <span style="color: #27ae60; font-weight: bold;">${item.cantidad_recibida} unidades</span> - ${confirmadomText}</li>`;
      });
      html += `</ul></div>`;
    });
    html += `</div>`;
  } else {
    html += `<div class="etapa-pendiente" style="margin-bottom: 2em; padding: 1em; border-left: 4px solid #bdc3c7; background: #f5f5f5; color: #7f8c8d;">`;
    html += `<h4 style="color: #7f8c8d; margin: 0;">🏪 4. Recepción en Tiendas - PENDIENTE</h4>`;
    html += `<p>La recepción en tiendas aún no ha sido registrada.</p></div>`;
  }
  
  html += `</div>`;
  
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
    
    // Recargar lista de empleados
    setTimeout(async () => {
      await cargarOpciones('/opciones/empleados', 'select-empleado');
      await cargarOpciones('/opciones/empleados', 'select-empleado-despacho');
      await cargarOpciones('/opciones/empleados', 'select-empleado-recepcion');
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
        await cargarOpciones('/opciones/empleados', 'select-empleado');
        await cargarOpciones('/opciones/empleados', 'select-empleado-despacho');
        await cargarOpciones('/opciones/empleados', 'select-empleado-recepcion');
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
                  <th style="padding: 0.75em; text-align: left; border: 1px solid #dee2e6; font-weight: 600;">Fecha Registro</th>
                </tr>
              </thead>
              <tbody>
                ${productos.map(p => `
                  <tr style="border-bottom: 1px solid #dee2e6;">
                    <td style="padding: 0.75em; border: 1px solid #dee2e6; font-weight: bold; color: #0056b3;">${p.id}</td>
                    <td style="padding: 0.75em; border: 1px solid #dee2e6;">${p.nombre}</td>
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