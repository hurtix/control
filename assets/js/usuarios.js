// ============== GESTIÓN DE USUARIOS ==============

// Listar usuarios
async function listarUsuarios() {
  try {
    const usuarios = await api('/usuarios');
    const container = document.getElementById('result-usuarios');
    
    if (!usuarios || usuarios.length === 0) {
      container.innerHTML = '<p>No hay usuarios registrados.</p>';
      return;
    }
    
    let html = `
      <table class="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Empleado</th>
            <th>DNI</th>
            <th>Rol</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
    `;
    
    usuarios.forEach(usuario => {
      const estadoBadge = usuario.activo ? 
        '<span class="badge bg-green-100 text-green-500">Activo</span>' :
        '<span class="badge bg-red-100 text-red-500">Inactivo</span>';
      
      html += `
        <tr>
          <td>${usuario.id}</td>
          <td class="font-bold">${usuario.empleado ? usuario.empleado.nombre : 'Sin empleado'}</td>
          <td>${usuario.empleado ? usuario.empleado.dni || 'Sin DNI' : '-'}</td>
          <td>
            <span class="font-mono text-xs bg-gray-100 text-gray-800 py-1 px-2">
              ${usuario.rol ? usuario.rol.nombre : 'Sin rol'}
            </span>
          </td>
          <td>${estadoBadge}</td>
          <td>
            <button onclick="editarUsuario(${usuario.id})" class="btn-outline">Editar</button>
            ${usuario.activo ? 
              `<button onclick="desactivarUsuario(${usuario.id})" class="btn-destructive">Desactivar</button>` :
              `<button onclick="activarUsuario(${usuario.id})" class="btn bg-green-500 text-white">Activar</button>`
            }
          </td>
        </tr>
      `;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
    
  } catch (error) {
    console.error('Error listando usuarios:', error);
    document.getElementById('result-usuarios').innerHTML = 
      `<div class="error">Error: ${error.message}</div>`;
  }
}

// Cargar roles para los selects
async function cargarRolesParaUsuarios() {
  try {
    const response = await api('/roles');
    // El endpoint devuelve {roles: [...]} así que extraemos el array
    const roles = response.roles || response;
    
    const selectCrear = document.getElementById('select-rol-usuario');
    const selectEditar = document.getElementById('select-rol-editar');
    
    const options = roles.map(rol => 
      `<option value="${rol.id}">${rol.nombre} - ${rol.descripcion}</option>`
    ).join('');
    
    if (selectCrear) {
      selectCrear.innerHTML = '<option value="">-- Seleccionar rol --</option>' + options;
    }
    
    if (selectEditar) {
      selectEditar.innerHTML = '<option value="">-- Seleccionar rol --</option>' + options;
    }
    
  } catch (error) {
    console.error('Error cargando roles:', error);
  }
}

// Cargar empleados para los selects
async function cargarEmpleadosParaUsuarios() {
  try {
    const maestros = await api('/maestros');
    const empleados = maestros.filter(m => m.tipo === 'empleado' && m.activo);
    
    const selectCrear = document.getElementById('select-empleado-usuario');
    const selectEditar = document.getElementById('select-empleado-editar');
    
    const options = empleados.map(empleado => 
      `<option value="${empleado.id}">${empleado.nombre}${empleado.dni ? ' - DNI: ' + empleado.dni : ''}</option>`
    ).join('');
    
    if (selectCrear) {
      selectCrear.innerHTML = '<option value="">-- Seleccionar empleado --</option>' + options;
    }
    
    if (selectEditar) {
      selectEditar.innerHTML = '<option value="">-- Seleccionar empleado --</option>' + options;
    }
    
  } catch (error) {
    console.error('Error cargando empleados:', error);
  }
}

// Editar usuario
async function editarUsuario(id) {
  try {
    const usuarios = await api('/usuarios');
    const usuario = usuarios.find(u => u.id === id);
    
    if (!usuario) {
      alert('Usuario no encontrado');
      return;
    }
    
  const dialog = document.getElementById('dialog-editar-usuario');
  const form = document.getElementById('form-editar-usuario');
  dialog.showModal();
    
    // Llenar el formulario
    form.querySelector('input[name="id"]').value = usuario.id;
    form.querySelector('select[name="empleado_id"]').value = usuario.empleado_id;
    form.querySelector('input[name="password"]').value = ''; // Vacío por seguridad
    form.querySelector('select[name="rol_id"]').value = usuario.rol_id;
    form.querySelector('select[name="activo"]').value = usuario.activo ? '1' : '0';
    
    // Scroll al formulario
    form.scrollIntoView({ behavior: 'smooth' });
    
  } catch (error) {
    console.error('Error cargando usuario:', error);
    alert('Error cargando usuario: ' + error.message);
  }
}

// Cancelar edición
function cancelarEdicionUsuario() {
  const form = document.getElementById('form-editar-usuario');
  form.style.display = 'none';
  form.reset();
}

// Desactivar usuario
async function desactivarUsuario(id) {
  if (!confirm('¿Estás seguro de que quieres desactivar este usuario?')) {
    return;
  }
  
  try {
    await api(`/usuarios/${id}`, 'DELETE');
    await listarUsuarios(); // Refrescar la lista
    document.getElementById('result-usuarios').innerHTML += 
      '<div class="success">Usuario desactivado exitosamente</div>';
  } catch (error) {
    console.error('Error desactivando usuario:', error);
    alert('Error desactivando usuario: ' + error.message);
  }
}

// Activar usuario
async function activarUsuario(id) {
  try {
    await api(`/usuarios/${id}`, 'PUT', { activo: true });
    await listarUsuarios(); // Refrescar la lista
    document.getElementById('result-usuarios').innerHTML += 
      '<div class="success">Usuario activado exitosamente</div>';
  } catch (error) {
    console.error('Error activando usuario:', error);
    alert('Error activando usuario: ' + error.message);
  }
}

// Event listeners para formularios de usuarios
document.addEventListener('DOMContentLoaded', function() {
  
  // Crear usuario
  const formNuevoUsuario = document.getElementById('form-nuevo-usuario');
  if (formNuevoUsuario) {
    formNuevoUsuario.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const formData = new FormData(this);
      const data = Object.fromEntries(formData);
      
      try {
        const result = await api('/usuarios', 'POST', data);
        document.getElementById('result-nuevo-usuario').innerHTML = 
          `<div class="success">Usuario creado exitosamente: ${result.usuario.nombre}</div>`;
        this.reset();
        await listarUsuarios(); // Refrescar la lista
      } catch (error) {
        console.error('Error creando usuario:', error);
        document.getElementById('result-nuevo-usuario').innerHTML = 
          `<div class="error">Error: ${error.message}</div>`;
      }
    });
  }
  
  // Editar usuario
  const formEditarUsuario = document.getElementById('form-editar-usuario');
  if (formEditarUsuario) {
    formEditarUsuario.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const formData = new FormData(this);
      const data = Object.fromEntries(formData);
      const id = data.id;
      delete data.id;
      
      // Remover password si está vacío
      if (!data.password) {
        delete data.password;
      }
      
      // Convertir activo a booleano
      data.activo = data.activo === '1';
      
      try {
        const result = await api(`/usuarios/${id}`, 'PUT', data);
        document.getElementById('result-editar-usuario').innerHTML = 
          `<div class="success">Usuario actualizado exitosamente</div>`;
        document.getElementById('dialog-editar-usuario').close();
        await listarUsuarios(); // Refrescar la lista
      } catch (error) {
        console.error('Error actualizando usuario:', error);
        document.getElementById('result-editar-usuario').innerHTML = 
          `<div class="error">Error: ${error.message}</div>`;
      }
    });
  }
  
  // Cargar roles y empleados al inicio
  cargarRolesParaUsuarios();
  cargarEmpleadosParaUsuarios();
  cargarEmpleadosParaUsuarios();
});
