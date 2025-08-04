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
      <table style="width: 100%; border-collapse: collapse; margin-top: 1em;">
        <thead>
          <tr style="background: #f8f9fa; border-bottom: 2px solid #dee2e6;">
            <th style="padding: 0.5em; text-align: left; border: 1px solid #dee2e6;">ID</th>
            <th style="padding: 0.5em; text-align: left; border: 1px solid #dee2e6;">Empleado</th>
            <th style="padding: 0.5em; text-align: left; border: 1px solid #dee2e6;">DNI</th>
            <th style="padding: 0.5em; text-align: left; border: 1px solid #dee2e6;">Rol</th>
            <th style="padding: 0.5em; text-align: left; border: 1px solid #dee2e6;">Estado</th>
            <th style="padding: 0.5em; text-align: left; border: 1px solid #dee2e6;">Acciones</th>
          </tr>
        </thead>
        <tbody>
    `;
    
    usuarios.forEach(usuario => {
      const estadoBadge = usuario.activo ? 
        '<span style="background: #d4edda; color: #155724; padding: 0.2em 0.5em; border-radius: 3px; font-size: 0.8em;">Activo</span>' :
        '<span style="background: #f8d7da; color: #721c24; padding: 0.2em 0.5em; border-radius: 3px; font-size: 0.8em;">Inactivo</span>';
      
      html += `
        <tr style="border-bottom: 1px solid #dee2e6;">
          <td style="padding: 0.5em; border: 1px solid #dee2e6;">${usuario.id}</td>
          <td style="padding: 0.5em; border: 1px solid #dee2e6; font-weight: bold;">${usuario.empleado ? usuario.empleado.nombre : 'Sin empleado'}</td>
          <td style="padding: 0.5em; border: 1px solid #dee2e6; font-weight: bold; color: #0056b3;">${usuario.empleado ? usuario.empleado.dni || 'Sin DNI' : '-'}</td>
          <td style="padding: 0.5em; border: 1px solid #dee2e6;">
            <span style="background: #e7f3ff; color: #004085; padding: 0.2em 0.5em; border-radius: 3px; font-size: 0.8em;">
              ${usuario.rol ? usuario.rol.nombre : 'Sin rol'}
            </span>
          </td>
          <td style="padding: 0.5em; border: 1px solid #dee2e6;">${estadoBadge}</td>
          <td style="padding: 0.5em; border: 1px solid #dee2e6;">
            <button onclick="editarUsuario(${usuario.id})" style="background: #007bff; color: white; border: none; padding: 0.2em 0.5em; border-radius: 3px; cursor: pointer; margin-right: 0.2em;">Editar</button>
            ${usuario.activo ? 
              `<button onclick="desactivarUsuario(${usuario.id})" style="background: #dc3545; color: white; border: none; padding: 0.2em 0.5em; border-radius: 3px; cursor: pointer;">Desactivar</button>` :
              `<button onclick="activarUsuario(${usuario.id})" style="background: #28a745; color: white; border: none; padding: 0.2em 0.5em; border-radius: 3px; cursor: pointer;">Activar</button>`
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
    
    const form = document.getElementById('form-editar-usuario');
    form.style.display = 'block';
    
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
        cancelarEdicionUsuario();
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
