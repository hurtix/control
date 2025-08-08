// Gestión de Familias de Productos

// Cargar lista de familias
async function cargarFamilias() {
    try {
        const response = await fetch('/familias');
        const data = await response.json();
        
        const container = document.getElementById('lista-familias');
        
        if (data.success && data.familias.length > 0) {
            let html = '<div class="grid gap-3">';
            data.familias.forEach(familia => {
                html += `
                    <div class="flex justify-between items-center p-3 border border-gray-200 rounded">
                        <div>
                            <strong>${familia.nombre}</strong>
                            ${familia.descripcion ? `<p class="text-sm text-gray-600">${familia.descripcion}</p>` : ''}
                        </div>
                        <div class="flex gap-2">
                            <button class="btn-outline btn-sm" onclick="editarFamilia(${familia.id}, '${familia.nombre}', '${familia.descripcion || ''}')">
                                ✏️ Editar
                            </button>
                            <button class="btn-outline btn-sm text-red-600" onclick="eliminarFamilia(${familia.id}, '${familia.nombre}')">
                                🗑️ Eliminar
                            </button>
                        </div>
                    </div>
                `;
            });
            html += '</div>';
            container.innerHTML = html;
        } else {
            container.innerHTML = '<p class="text-gray-500">No hay familias registradas.</p>';
        }
    } catch (error) {
        console.error('Error al cargar familias:', error);
        document.getElementById('lista-familias').innerHTML = 
            '<p class="text-red-500">Error al cargar las familias. Verifica la conexión al servidor.</p>';
    }
}

// Crear nueva familia
document.addEventListener('DOMContentLoaded', function() {
    const formNuevaFamilia = document.getElementById('form-nueva-familia');
    if (formNuevaFamilia) {
        formNuevaFamilia.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const data = {
                nombre: formData.get('nombre'),
                descripcion: formData.get('descripcion')
            };
            
            try {
                const response = await fetch('/familias', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                
                if (result.success) {
                    document.getElementById('result-nueva-familia').innerHTML = 
                        `<div class="success">✅ Familia "${data.nombre}" creada exitosamente</div>`;
                    this.reset();
                    cargarFamilias(); // Actualizar la lista
                } else {
                    document.getElementById('result-nueva-familia').innerHTML = 
                        `<div class="error">❌ Error: ${result.message}</div>`;
                }
            } catch (error) {
                console.error('Error al crear familia:', error);
                document.getElementById('result-nueva-familia').innerHTML = 
                    '<div class="error">❌ Error de conexión al servidor</div>';
            }
        });
    }
});

// Editar familia
function editarFamilia(id, nombre, descripcion) {
    const container = document.getElementById('form-editar-familia-container');
    const form = document.getElementById('form-editar-familia');
    
    // Mostrar el formulario de edición
    container.style.display = 'block';
    
    // Llenar los campos
    form.querySelector('input[name="id"]').value = id;
    form.querySelector('input[name="nombre"]').value = nombre;
    form.querySelector('textarea[name="descripcion"]').value = descripcion;
    
    // Scroll al formulario
    container.scrollIntoView({ behavior: 'smooth' });
}

// Cancelar edición
function cancelarEdicionFamilia() {
    document.getElementById('form-editar-familia-container').style.display = 'none';
    document.getElementById('form-editar-familia').reset();
    document.getElementById('result-editar-familia').innerHTML = '';
}

// Procesar edición de familia
document.addEventListener('DOMContentLoaded', function() {
    const formEditarFamilia = document.getElementById('form-editar-familia');
    if (formEditarFamilia) {
        formEditarFamilia.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const data = {
                nombre: formData.get('nombre'),
                descripcion: formData.get('descripcion')
            };
            const id = formData.get('id');
            
            try {
                const response = await fetch(`/familias/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                
                if (result.success) {
                    document.getElementById('result-editar-familia').innerHTML = 
                        `<div class="success">✅ Familia actualizada exitosamente</div>`;
                    cargarFamilias(); // Actualizar la lista
                    
                    // Ocultar formulario después de un momento
                    setTimeout(() => {
                        cancelarEdicionFamilia();
                    }, 2000);
                } else {
                    document.getElementById('result-editar-familia').innerHTML = 
                        `<div class="error">❌ Error: ${result.message}</div>`;
                }
            } catch (error) {
                console.error('Error al actualizar familia:', error);
                document.getElementById('result-editar-familia').innerHTML = 
                    '<div class="error">❌ Error de conexión al servidor</div>';
            }
        });
    }
});

// Eliminar familia
async function eliminarFamilia(id, nombre) {
    if (!confirm(`¿Estás seguro de que quieres eliminar la familia "${nombre}"?\n\nEsta acción no se puede deshacer.`)) {
        return;
    }
    
    try {
        const response = await fetch(`/familias/${id}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (result.success) {
            cargarFamilias(); // Actualizar la lista
            // Mostrar mensaje temporal
            const container = document.getElementById('lista-familias');
            const mensajeTemp = document.createElement('div');
            mensajeTemp.className = 'success mb-4';
            mensajeTemp.innerHTML = `✅ Familia "${nombre}" eliminada exitosamente`;
            container.insertBefore(mensajeTemp, container.firstChild);
            
            setTimeout(() => {
                if (mensajeTemp.parentNode) {
                    mensajeTemp.remove();
                }
            }, 3000);
        } else {
            alert(`Error al eliminar la familia: ${result.message}`);
        }
    } catch (error) {
        console.error('Error al eliminar familia:', error);
        alert('Error de conexión al servidor');
    }
}
