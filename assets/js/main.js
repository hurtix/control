// Variables globales
const formPedido = document.getElementById('form-pedido');
const resultPedido = document.getElementById('result-pedido');
const formProduccion = document.getElementById('form-produccion');
const resultProduccion = document.getElementById('result-produccion');
const formDespacho = document.getElementById('form-despacho');
const resultDespacho = document.getElementById('result-despacho');
const formRecepcion = document.getElementById('form-recepcion');
const resultRecepcion = document.getElementById('result-recepcion');
const resultConsultas = document.getElementById('result-consultas');
const formTraza = document.getElementById('form-traza');
const resultTraza = document.getElementById('result-traza');

// Formularios de datos maestros
const formProducto = document.getElementById('form-producto');
const resultProducto = document.getElementById('result-producto');
const formEmpleadoMaestro = document.getElementById('form-empleado-maestro');
const resultEmpleadoMaestro = document.getElementById('result-empleado-maestro');
const formTiendaMaestro = document.getElementById('form-tienda-maestro');
const resultTiendaMaestro = document.getElementById('result-tienda-maestro');
const resultMaestrosList = document.getElementById('result-maestros-list');

// Variables para pedidos
let contadorProductosPedido = 0;
let tiendas = []; // Variable global para almacenar las tiendas

// Función para formatear fechas
function formatearFecha(fechaString) {
  if (!fechaString) return 'N/A';
  
  const fecha = new Date(fechaString);
  if (isNaN(fecha.getTime())) return fechaString; // Si no es una fecha válida, devolver el string original
  
  const dia = fecha.getDate().toString().padStart(2, '0');
  const mes = (fecha.getMonth() + 1).toString().padStart(2, '0'); // +1 porque los meses van de 0 a 11
  const anio = fecha.getFullYear();
  
  return `${dia}/${mes}/${anio}`;
}

// Función para formatear fecha y hora
function formatearFechaHora(fechaString) {
  if (!fechaString) return 'N/A';
  
  const fecha = new Date(fechaString);
  if (isNaN(fecha.getTime())) return fechaString;
  
  const dia = fecha.getDate().toString().padStart(2, '0');
  const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
  const anio = fecha.getFullYear();
  const hora = fecha.getHours().toString().padStart(2, '0');
  const minutos = fecha.getMinutes().toString().padStart(2, '0');
  
  return `${dia}/${mes}/${anio} ${hora}:${minutos}`;
}

// Función API
const api = (endpoint, method = 'GET', data = null, role = 'admin') => {
  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-Role': role
    }
  };
  if (data) opts.body = JSON.stringify(data);
  
  return fetch(endpoint, opts).then(async response => {
    const contentType = response.headers.get('content-type');
    
    // Verificar si la respuesta es JSON
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    } else {
      // Si no es JSON, obtener el texto y crear un objeto de error
      const text = await response.text();
      console.error('Respuesta no-JSON del servidor:', text);
      return { 
        error: 'Respuesta inválida del servidor', 
        details: text,
        status: response.status 
      };
    }
  }).catch(error => {
    console.error('Error en la petición API:', error);
    return { 
      error: 'Error de conexión', 
      details: error.message 
    };
  });
};

// Funciones para cargar opciones
const cargarOpciones = async (endpoint, selectId) => {
  try {
    const opciones = await api(endpoint);
    const select = document.getElementById(selectId);
    const defaultOption = select.querySelector('option[value=""]');
    select.innerHTML = '';
    if (defaultOption) select.appendChild(defaultOption);
    
    opciones.forEach(opcion => {
      const option = document.createElement('option');
      option.value = opcion;
      option.textContent = opcion;
      select.appendChild(option);
    });
  } catch (error) {
    console.error('Error cargando opciones:', error);
  }
};

const cargarOpcionesEnSelect = async (endpoint, select) => {
  try {
    const opciones = await api(endpoint);
    const defaultOption = select.querySelector('option[value=""]');
    select.innerHTML = '';
    if (defaultOption) select.appendChild(defaultOption);
    
    opciones.forEach(opcion => {
      const option = document.createElement('option');
      // Si opcion es un string simple, usarlo directamente
      // Si opcion es un objeto, usar la propiedad 'nombre'
      const valor = typeof opcion === 'string' ? opcion : opcion.nombre;
      option.value = valor;
      option.textContent = valor;
      select.appendChild(option);
    });
  } catch (error) {
    console.error(`Error cargando opciones de ${endpoint}:`, error);
  }
};

// Inicialización
document.addEventListener('DOMContentLoaded', async () => {
  // Establecer fecha de hoy por defecto
  const hoy = new Date().toISOString().split('T')[0];
  document.querySelectorAll('input[type="date"]').forEach(input => {
    input.value = hoy;
  });

  // Establecer fechas automáticas en campos con clase fecha-auto
  establecerFechasAutomaticas();

  // Ocultar inputs personalizados inicialmente
  document.querySelectorAll('[id*="input-"]').forEach(input => {
    input.style.display = 'none';
  });

  // Ya no necesitamos cargar opciones de empleados para los formularios
  // que ahora usan automáticamente el usuario actual
  // Los IDs de empleado ahora son campos ocultos que se completan automáticamente
  
  // Cargar lotes para trazabilidad (todos los lotes, no solo pendientes)
  await cargarLotesParaTrazabilidad();
  
  // Cargar tiendas disponibles para el nuevo formulario de pedidos
  await cargarTiendasDisponibles();
  
  // Cargar opciones en el nuevo formulario de pedidos
  await cargarOpcionesEnSelect('/opciones/productos', document.querySelector('.producto-select'));
  
  // Cargar lotes pendientes
  await cargarLotesPendientes();
  
  // Cargar lotes producidos para despacho
  await cargarLotesProducidos();
  
  // Cargar lotes para recepción
  await cargarLotesParaRecepcion();
  
  // Establecer fechas automáticas
  establecerFechasAutomaticas();
  
  // Actualizar visibilidad del botón después de cargar todos los datos
  setTimeout(() => {
    actualizarVisibilidadBotonAgregar();
  }, 100);
});

// Función para establecer fechas automáticas
function establecerFechasAutomaticas() {
  const ahora = new Date();
  const fechaHoraFormateada = ahora.toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
  
  // Establecer fecha y hora en todos los campos con clase fecha-auto
  const camposFechaAuto = document.querySelectorAll('.fecha-auto');
  camposFechaAuto.forEach(campo => {
    campo.value = fechaHoraFormateada;
  });
}

// Función para convertir fecha y hora actual al formato ISO para el backend
function obtenerFechaActualISO() {
  return new Date().toISOString().slice(0, 19).replace('T', ' ');
}

// Función para cargar lotes para trazabilidad
async function cargarLotesParaTrazabilidad() {
  try {
    const lotes = await api('/lotes/todos');
    const select = document.getElementById('select-lote-traza');
    if (select) {
      select.innerHTML = '<option value="">-- Seleccionar lote --</option>';
      lotes.forEach(lote => {
        const option = document.createElement('option');
        option.value = lote.id;
        option.textContent = `Lote ${lote.id} - ${lote.estado} (${lote.fecha_pedido})`;
        select.appendChild(option);
      });
    }
  } catch (error) {
    console.error('Error cargando lotes para trazabilidad:', error);
  }
}

// Nueva función para cargar lotes para recepción como tarjetas
async function cargarLotesParaRecepcion() {
  try {
    console.log('Iniciando carga de lotes para recepción...');
    
    // Solo necesitamos lotes despachados
    const despachos = await api('/despacho');
    console.log('Despachos obtenidos:', despachos);
    
    // Obtener las tiendas del usuario actual
    console.log('Current user:', currentUser);
    const tiendasUsuario = currentUser && currentUser.tiendas ? currentUser.tiendas : [];
    console.log('Tiendas del usuario:', tiendasUsuario);
    const tiendaNombre = tiendasUsuario.length > 0 ? tiendasUsuario[0].nombre : null;
    console.log('Tienda seleccionada:', tiendaNombre);
    
    if (!tiendaNombre) {
      console.error('El usuario no tiene tienda asignada');
      // Quitado el alert que mostraba mensaje de error por tienda no asignada
      return;
    }
    
    // Guardar la tienda del usuario en el campo oculto
    document.getElementById('tienda-usuario-actual').value = tiendaNombre;
    
    // Filtrar despachos solo para la tienda del usuario actual
    const despachosTienda = despachos.filter(d => d.tienda === tiendaNombre);
    
    // Obtener IDs de lotes únicos de los despachos de esta tienda
    const lotesIds = [...new Set(despachosTienda.map(d => d.lote_id))];
    
    // Obtener recepciones ya registradas para esta tienda
    console.log('Obteniendo recepciones...');
    const recepciones = await api('/recepcion');
    console.log('Recepciones obtenidas:', recepciones);
    
    // Verificar si recepciones es válido
    if (!recepciones || recepciones.error) {
      console.error('Error obteniendo recepciones:', recepciones);
      throw new Error('Error al obtener recepciones: ' + (recepciones.error || 'Respuesta inválida'));
    }
    
    const recepcionesTienda = recepciones.filter(r => r.tienda === tiendaNombre);
    console.log('Recepciones para esta tienda:', recepcionesTienda);
    
    const lotesRecibidos = [...new Set(recepcionesTienda.map(r => r.lote_id))];
    console.log('Lotes ya recibidos:', lotesRecibidos);
    
    // Filtrar lotes que han sido despachados pero NO han sido recibidos por esta tienda
    const lotesPendientesRecepcion = lotesIds.filter(id => !lotesRecibidos.includes(id));
    console.log('Lotes pendientes de recepción:', lotesPendientesRecepcion);
    
    // Obtener información completa de los lotes pendientes
    console.log('Obteniendo información completa de lotes...');
    const lotesCompletos = await api('/lotes/todos');
    console.log('Lotes completos:', lotesCompletos);
    
    // Verificar si lotesCompletos es válido
    if (!lotesCompletos || lotesCompletos.error) {
      console.error('Error obteniendo lotes completos:', lotesCompletos);
      throw new Error('Error al obtener lotes: ' + (lotesCompletos.error || 'Respuesta inválida'));
    }
    
    const lotesFiltrados = lotesCompletos.filter(lote => lotesPendientesRecepcion.includes(lote.id));
    console.log('Lotes filtrados para recepción:', lotesFiltrados);
    
    const container = document.getElementById('lotes-recepcion-container');
    container.innerHTML = '';
    
    if (lotesFiltrados.length === 0) {
      container.innerHTML = '<div class="empty-message">No hay lotes pendientes de recepción para tu tienda</div>';
      return;
    }
    
    lotesFiltrados.forEach(lote => {
      const card = document.createElement('div');
      card.className = 'card card w-full p-4';
      card.dataset.id = lote.id;
      
      card.innerHTML = `
        <div class="card-header">Lote ${lote.id}</div>
        <div class="card-body">
          <div class="card-info">Estado: <strong>${lote.estado}</strong></div>
          <div class="card-info">Fecha: <strong>${formatearFecha(lote.fecha_pedido)}</strong></div>
          <div class="card-info">Productos: <strong>${lote.cantidad_productos || 'N/A'}</strong></div>
        </div>
      `;
      
      card.addEventListener('click', async () => {
        // Remover selección previa
        document.querySelectorAll('#lotes-recepcion-container .card-item.selected').forEach(c => {
          c.classList.remove('selected');
        });
        
        // Marcar como seleccionado
        card.classList.add('selected');
        
        // Guardar ID en campo oculto
        document.getElementById('lote-recepcion-selected').value = lote.id;
        
        // Cargar despachos para este lote y tienda
        await cargarDespachosLoteTiendaRecepcion(lote.id, tiendaNombre);
      });
      
      container.appendChild(card);
    });
  } catch (error) {
    console.error('Error cargando lotes para recepción:', error);
    const container = document.getElementById('lotes-recepcion-container');
    container.innerHTML = '<div class="error-message">Error al cargar lotes. Intente nuevamente.</div>';
  }
}
