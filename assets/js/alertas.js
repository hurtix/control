// Marcar todas las notificaciones como leídas para el usuario actual
async function marcarTodasAlertasLeidas() {
  const ul = document.getElementById('notifications-list');
  if (!ul) return;
  // Obtener todos los botones de marcar como leída
  const botones = ul.querySelectorAll('button[onclick^="marcarAlertaLeida"]');
  // Marcar todas en paralelo
  await Promise.all(Array.from(botones).map(btn => {
    const alertaId = btn.getAttribute('onclick').match(/marcarAlertaLeida\((\d+),/);
    if (alertaId && alertaId[1]) {
      return api(`/alertas/${alertaId[1]}/read`, 'POST');
    }
    return Promise.resolve();
  }));
  // Limpiar la lista visualmente
  ul.innerHTML = '<li class="text-gray-500">No hay notificaciones nuevas</li>';
  // Actualizar badge
  const badge = document.getElementById('notifications-badge');
  if (badge) {
    badge.textContent = '';
    badge.style.display = 'none';
  }
}

// Enlazar el botón de limpiar notificaciones
document.addEventListener('DOMContentLoaded', () => {
  cargarAlertas();
  const clearBtn = document.getElementById('clear-all-notifications');
  if (clearBtn) {
    clearBtn.onclick = marcarTodasAlertasLeidas;
  }
});
// Notificaciones de alertas persistentes

async function cargarAlertas() {
  const ul = document.getElementById('notifications-list');
  const bell = document.getElementById('notifications-trigger');
  const badgeId = 'notifications-badge';
  if (!ul) return;
  ul.innerHTML = '<li>Cargando...</li>';
  const alertas = await api('/alertas');
  ul.innerHTML = '';
  let unread = 0;
  if (!Array.isArray(alertas) || alertas.length === 0) {
    ul.innerHTML = '<li class="text-gray-500">No hay notificaciones nuevas</li>';
    unread = 0;
  } else {
    const noLeidas = alertas.filter(a => !a.read);
    unread = noLeidas.length;
    noLeidas.forEach(alerta => {
      const li = document.createElement('li');
      let bg = '';
      switch (alerta.tipo) {
        case 'info':
          bg = 'bg-green-50 border-green-200';
          break;
        case 'warning':
          bg = 'bg-yellow-50 border-yellow-200';
          break;
        case 'critico':
        case 'error':
          bg = 'bg-red-50 border-red-200';
          break;
        default:
          bg = 'bg-gray-50 border-gray-200';
      }
      li.className = `alerta-item ${alerta.tipo} flex flex-col gap-2 p-4 mb-2 border rounded ${bg}`;
      let icon = '';
      switch (alerta.tipo) {
        case 'info':
          icon = `<svg class="inline w-4 h-4 text-green-500 mr-1" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor"/><line x1="12" y1="16" x2="12" y2="12" stroke="currentColor"/><circle cx="12" cy="8" r="1" fill="currentColor"/></svg>`;
          break;
        case 'warning':
          icon = `<svg class="inline w-4 h-4 text-yellow-500 mr-1" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor"/><line x1="12" y1="8" x2="12" y2="12" stroke="currentColor"/><line x1="12" y1="16" x2="12" y2="16" stroke="currentColor"/></svg>`;
          break;
        case 'critico':
        case 'error':
          icon = `<svg class="inline w-4 h-4 text-red-500 mr-1" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor"/><line x1="8" y1="8" x2="16" y2="16" stroke="currentColor"/><line x1="16" y1="8" x2="8" y2="16" stroke="currentColor"/></svg>`;
          break;
        default:
          icon = `<svg class="inline w-4 h-4 text-gray-400 mr-1" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor"/></svg>`;
      }
      li.innerHTML = `
        <div class="flex flex-col">
        <div class="flex justify-between items-center gap-2 mb-4">
            ${icon} 
            <span class="text-xs text-gray-400">${formatearFechaHora(alerta.fecha)}</span>
        </div>
          <p class="leading-none">${alerta.mensaje}</p>
        </div>
        <button class="btn-link block text-right p-0" onclick="marcarAlertaLeida(${alerta.id}, this)">Marcar como leída</button>
      `;
      ul.appendChild(li);
    });
  }
  // Actualizar badge de notificaciones
  let badge = document.getElementById(badgeId);
  if (!badge) {
    badge = document.createElement('span');
    badge.id = badgeId;
    badge.className = 'inline-block bg-red-500 text-white text-xs rounded-full px-2 absolute top-0 right-0 translate-x-1/2 -translate-y-1/2';
    bell.style.position = 'relative';
    bell.appendChild(badge);
  }
  badge.textContent = unread > 0 ? unread : '';
  badge.style.display = unread > 0 ? 'inline-block' : 'none';
}


async function marcarAlertaLeida(id, btn) {
  btn.disabled = true;
  await api(`/alertas/${id}/read`, 'POST');
  // Ocultar la notificación visualmente
  const li = btn.closest('li');
  if (li) li.remove();
  // Actualizar el contador de notificaciones inmediatamente
  const ul = document.getElementById('notifications-list');
  let unread = 0;
  if (ul) {
    // Contar los elementos restantes con botón "Marcar como leída"
    unread = ul.querySelectorAll('button[onclick^="marcarAlertaLeida"]').length;
    if (unread === 0) {
      ul.innerHTML = '<li class="text-gray-500">No hay notificaciones nuevas</li>';
    }
  }
  // Actualizar badge
  const badge = document.getElementById('notifications-badge');
  if (badge) {
    badge.textContent = unread > 0 ? unread : '';
    badge.style.display = unread > 0 ? 'inline-block' : 'none';
  }
}

// (La inicialización de cargarAlertas ahora está dentro del otro DOMContentLoaded)
