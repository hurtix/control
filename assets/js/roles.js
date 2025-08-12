// Gestión de Roles Dinámicos

// Elementos del DOM para roles
const formNuevoRol = document.getElementById('form-nuevo-rol');
const resultNuevoRol = document.getElementById('result-nuevo-rol');
const resultRoles = document.getElementById('result-roles');
const formNuevoPermiso = document.getElementById('form-nuevo-permiso');
const resultNuevoPermiso = document.getElementById('result-nuevo-permiso');
const resultPermisos = document.getElementById('result-permisos');
const formAsignarPermisos = document.getElementById('form-asignar-permisos');
const resultAsignarPermisos = document.getElementById('result-asignar-permisos');
const formVerificarPermiso = document.getElementById('form-verificar-permiso');
const resultVerificarPermiso = document.getElementById('result-verificar-permiso');

// Crear nuevo rol
if (formNuevoRol) {
  formNuevoRol.onsubmit = async e => {
    e.preventDefault();
    const fd = new FormData(formNuevoRol);
    const data = Object.fromEntries(fd.entries());
    
    try {
      const res = await api('/roles', 'POST', data, 'admin');
      resultNuevoRol.textContent = JSON.stringify(res, null, 2);
      formNuevoRol.reset();
      
      // Actualizar lista de roles
      setTimeout(() => {
        listarRoles();
        cargarRolesEnSelect();
      }, 500);
    } catch (error) {
      resultNuevoRol.textContent = 'Error: ' + error.message;
    }
  };
}

// Crear nuevo permiso
if (formNuevoPermiso) {
  formNuevoPermiso.onsubmit = async e => {
    e.preventDefault();
    const fd = new FormData(formNuevoPermiso);
    const data = Object.fromEntries(fd.entries());
    
    try {
      const res = await api('/permisos', 'POST', data, 'admin');
      resultNuevoPermiso.textContent = JSON.stringify(res, null, 2);
      formNuevoPermiso.reset();
      
      // Actualizar lista de permisos
      setTimeout(() => {
        listarPermisos();
      }, 500);
    } catch (error) {
      resultNuevoPermiso.textContent = 'Error: ' + error.message;
    }
  };
}

// Asignar permisos a rol
if (formAsignarPermisos) {
  formAsignarPermisos.onsubmit = async e => {
    e.preventDefault();
    const fd = new FormData(formAsignarPermisos);
    const rolId = fd.get('rol_id');
    
    // Obtener permisos seleccionados
    const permisosSeleccionados = [];
    const checkboxes = document.querySelectorAll('#permisos-disponibles input[type="checkbox"]:checked');
    checkboxes.forEach(cb => {
      permisosSeleccionados.push(parseInt(cb.value));
    });
    
    if (permisosSeleccionados.length === 0) {
      alert('Selecciona al menos un permiso');
      return;
    }
    
    try {
      const res = await api(`/roles/${rolId}/permisos`, 'POST', { permisos: permisosSeleccionados }, 'admin');
      resultAsignarPermisos.textContent = JSON.stringify(res, null, 2);
      
      // Actualizar vista de permisos actuales
      setTimeout(() => {
        cargarPermisosDelRol();
      }, 500);
    } catch (error) {
      resultAsignarPermisos.textContent = 'Error: ' + error.message;
    }
  };
}

// Verificar permiso
if (formVerificarPermiso) {
  formVerificarPermiso.onsubmit = async e => {
    e.preventDefault();
    const fd = new FormData(formVerificarPermiso);
    const rolNombre = fd.get('rol_nombre');
    const endpoint = fd.get('endpoint');
    const metodo = fd.get('metodo');
    
    try {
      const res = await api(`/roles/${rolNombre}/permiso?endpoint=${encodeURIComponent(endpoint)}&metodo=${metodo}`, 'GET', null, 'admin');
      
      let html = `<div style="padding: 1em; border-radius: 5px; ${res.tiene_permiso ? 'background: #d4edda; color: #155724;' : 'background: #f8d7da; color: #721c24;'}">`;
      html += `<h4>${res.tiene_permiso ? '✅ ACCESO PERMITIDO' : '❌ ACCESO DENEGADO'}</h4>`;
      html += `<p><strong>Rol:</strong> ${res.rol}</p>`;
      html += `<p><strong>Endpoint:</strong> ${res.endpoint}</p>`;
      html += `<p><strong>Método:</strong> ${res.metodo}</p>`;
      html += `</div>`;
      
      resultVerificarPermiso.innerHTML = html;
    } catch (error) {
      resultVerificarPermiso.textContent = 'Error: ' + error.message;
    }
  };
}

// Listar roles
window.listarRoles = async function() {
  try {
    const res = await api('/roles', 'GET', null, 'admin');
    
    if (res.roles && res.roles.length > 0) {
      let html = '<table class="table">';
      html += '<thead><tr><th>ID</th><th>Nombre</th><th>Descripción</th><th>Permisos</th><th>Estado</th></tr></thead>';
      html += '<tbody>';
      
      res.roles.forEach(rol => {
        html += '<tr>';
        html += `<td>${rol.id}</td>`;
        html += `<td class="font-mono">${rol.nombre}</td>`;
        html += `<td>${rol.descripcion}</td>`;
        html += `<td>${rol.permisos ? rol.permisos.length : 0} permisos</td>`;
        html += `<td><span class="${rol.activo ? 'text-green-500' : 'text-red-500'}">${rol.activo ? 'Activo' : 'Inactivo'}</span></td>`;
        html += '</tr>';
      });
      
      html += '</tbody></table>';
      resultRoles.innerHTML = html;
    } else {
      resultRoles.textContent = 'No hay roles registrados.';
    }
  } catch (error) {
    resultRoles.textContent = 'Error: ' + error.message;
  }
};

// Listar permisos
window.listarPermisos = async function() {
  try {
    const res = await api('/permisos', 'GET', null, 'admin');
    
    if (res.permisos && res.permisos.length > 0) {
      let html = '<table class="table">';
      html += '<thead><tr><th>ID</th><th>Endpoint</th><th class="text-center">Método</th><th>Descripción</th></tr></thead>';
      html += '<tbody>';
      
      res.permisos.forEach(permiso => {
        html += '<tr>';
        html += `<td>${permiso.id}</td>`;
        html += `<td class="font-mono">${permiso.endpoint}</td>`;
        html += `<td class="text-center"><span class="badge">${permiso.metodo}</span></td>`;
        html += `<td>${permiso.descripcion}</td>`;
        html += '</tr>';
      });
      
      html += '</tbody></table>';
      resultPermisos.innerHTML = html;
    } else {
      resultPermisos.textContent = 'No hay permisos registrados.';
    }
  } catch (error) {
    resultPermisos.textContent = 'Error: ' + error.message;
  }
};

// Cargar roles en select
async function cargarRolesEnSelect() {
  try {
    const res = await api('/roles', 'GET', null, 'admin');
    const selectRol = document.getElementById('select-rol-permisos');
    
    if (selectRol) {
      selectRol.innerHTML = '<option value="">Selecciona un rol...</option>';
      
      if (res.roles) {
        res.roles.forEach(rol => {
          const option = document.createElement('option');
          option.value = rol.id;
          option.textContent = `${rol.nombre} - ${rol.descripcion}`;
          selectRol.appendChild(option);
        });
      }
    }
  } catch (error) {
    console.error('Error cargando roles:', error);
  }
}

// Cargar permisos del rol seleccionado
window.cargarPermisosDelRol = async function() {
  const selectRol = document.getElementById('select-rol-permisos');
  const permisosContainer = document.getElementById('permisos-disponibles');
  
  if (!selectRol || !permisosContainer) return;
  
  const rolId = selectRol.value;
  
  if (!rolId) {
    permisosContainer.innerHTML = '<p>Selecciona un rol para ver los permisos disponibles</p>';
    return;
  }
  
  try {
    // Cargar todos los permisos y los permisos del rol
    const [todosPermisos, permisosDelRol] = await Promise.all([
      api('/permisos', 'GET', null, 'admin'),
      api(`/roles/${rolId}/permisos`, 'GET', null, 'admin')
    ]);
    
    const permisosAsignados = permisosDelRol.permisos.map(p => p.id);
    
    let html = '<h4>Permisos Disponibles (marca los que quieres asignar):</h4>';
    html += '<div>';
    
    todosPermisos.permisos.forEach(permiso => {
      const checked = permisosAsignados.includes(permiso.id) ? 'checked' : '';
      html += `<label class="label alert mb-2">`;
      html += `<input type="checkbox" class="input" value="${permiso.id}" ${checked}>`;
      html += `<span class="font-mono">${permiso.endpoint}</span>`;
      html += `<span>[${permiso.metodo}]</span>`;
      html += `<span>${permiso.descripcion}</span>`;
      html += `</label>`;
    });
    
    html += '</div>';
    html += `<p><strong>Permisos actuales:</strong> ${permisosAsignados.length} de ${todosPermisos.permisos.length}</p>`;
    
    permisosContainer.innerHTML = html;
  } catch (error) {
    permisosContainer.innerHTML = '<p class="text-red-500">Error cargando permisos: ' + error.message + '</p>';
  }
};

// Inicializar gestión de roles al cargar la página
document.addEventListener('DOMContentLoaded', function() {
  // Cargar datos iniciales si estamos en la sección de roles
  if (document.getElementById('form-nuevo-rol')) {
    cargarRolesEnSelect();
  }
});
