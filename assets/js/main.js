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
