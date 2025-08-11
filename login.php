<?php ?>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Login - Imperium</title>
  <link rel="stylesheet" href="assets/css/styles.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/basecoat-css@0.3.1/dist/basecoat.cdn.min.css">
  <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
  <script src="https://cdn.jsdelivr.net/npm/basecoat-css@0.3.1/dist/js/all.min.js" defer></script>
  <!-- <style>
    .error-message {
      color: #dc3545;
      text-align: center;
      margin-top: 1em;
      padding: 0.5em;
      background: #f8d7da;
      border: 1px solid #f5c6cb;
      border-radius: 4px;
    }
  </style> -->
</head>
<body>
  <div class="max-w-[400px] mx-auto flex flex-col justify-center items-center h-screen">
    <div class="border border-gray-200 p-8 rounded-lg shadow-lg flex flex-col gap-y-4">
    <h1 class="text-center">Imperium</h1>

    <form id="form-login" class="flex flex-col gap-y-4">
      
      <label class="label">
        Usuario
        </label>
        <select class="select w-full" name="usuario_id" id="select-usuario" required>
          <option value="">-- Seleccionar usuario --</option>
        </select>
      
      <div id="password-container">
      <label class="label mb-3">
        Contraseña</label>
        <div class="flex gap-x-3 [&_input]:text-center [&_input]:text-xl [&_input]:h-12" data-hs-pin-input="">
          <input type="password" inputmode="numeric" pattern="[0-9]*" maxlength="1" class="input" data-hs-pin-input-item required autofocus>
          <input type="password" inputmode="numeric" pattern="[0-9]*" maxlength="1" class="input" data-hs-pin-input-item required>
          <input type="password" inputmode="numeric" pattern="[0-9]*" maxlength="1" class="input" data-hs-pin-input-item required>
          <input type="password" inputmode="numeric" pattern="[0-9]*" maxlength="1" class="input" data-hs-pin-input-item required>
          <input type="password" inputmode="numeric" pattern="[0-9]*" maxlength="1" class="input" data-hs-pin-input-item required>
          <input type="password" inputmode="numeric" pattern="[0-9]*" maxlength="1" class="input" data-hs-pin-input-item required>
        </div>
        <input type="hidden" name="password" required>
      </div>
      
      <button type="submit" class="btn" id="btn-login">
        <span id="btn-text">Ingresar</span>
        <span id="btn-loading" style="display: none;">Verificando...</span>
      </button>
      
      <div id="error-message" class="alert-destructive" style="display: none; align-items: flex-start; gap: 0.75em;">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" /></svg>
        <div>
          <h2 id="error-title" style="margin:0; font-size:1.1em; font-weight:bold;">¡Algo salió mal!</h2>
          <section id="error-detail" style="margin:0; font-size:0.97em;">Tu sesión ha expirado. Por favor inicia sesión de nuevo.</section>
        </div>
      </div>
    </form>
    
    <div style="margin-top: 2em; padding-top: 1em; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: 0.9em;">
      <p><strong>Para crear usuarios:</strong></p>
      <p>1. Crear empleado en "Datos Maestros"</p>
      <p>2. Crear rol en "Administración de Roles"</p>
      <p>3. Crear usuario en "Gestión de Usuarios"</p>
    </div>
  </div>
</div>
  <script src="assets/js/login-pin.js"></script>
  <script>
    document.addEventListener('DOMContentLoaded', function() {
      const selectUsuario = document.getElementById('select-usuario');
      const pinInputs = document.querySelectorAll('[data-hs-pin-input-item]');
      const btnLogin = document.getElementById('btn-login');

      // Al inicio, deshabilitar pin y botón
      pinInputs.forEach(input => { input.disabled = true; });
      btnLogin.disabled = true;

      // Habilitar pin cuando se selecciona usuario
      selectUsuario.addEventListener('change', function() {
        if (this.value) {
          pinInputs.forEach(input => { input.disabled = false; });
          pinInputs[0].focus();
        } else {
          pinInputs.forEach(input => { input.value = ''; input.disabled = true; });
          btnLogin.disabled = true;
        }
      });

      // Habilitar botón solo si todos los pin están llenos
      pinInputs.forEach(input => {
        input.addEventListener('input', function() {
          const allFilled = Array.from(pinInputs).every(i => i.value.length === 1);
          btnLogin.disabled = !allFilled;
        });
      });
    });
  </script>
  <script>
    // Cargar lista de usuarios al cargar la página
    async function cargarUsuarios() {
      try {
        const response = await fetch('/usuarios-login');
        if (response.ok) {
          const usuarios = await response.json();
          const select = document.getElementById('select-usuario');
          
          // Limpiar opciones existentes (excepto la primera)
          select.innerHTML = '<option value="">-- Seleccionar usuario --</option>';
          
          // Agregar usuarios
          usuarios.forEach(usuario => {
            const option = document.createElement('option');
            option.value = usuario.id;
            option.textContent = `${usuario.empleado_nombre} (${usuario.rol_nombre})`;
            select.appendChild(option);
          });
        }
      } catch (error) {
        console.error('Error cargando usuarios:', error);
      }
    }

    document.getElementById('form-login').addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const btnLogin = document.getElementById('btn-login');
      const btnText = document.getElementById('btn-text');
      const btnLoading = document.getElementById('btn-loading');
      const errorDiv = document.getElementById('error-message');
      
      // UI de loading
      btnLogin.disabled = true;
      btnText.style.display = 'none';
      btnLoading.style.display = 'inline';
      errorDiv.style.display = 'none';
      
      const formData = new FormData(this);
      const data = {
        usuario_id: formData.get('usuario_id'),
        password: formData.get('password')
      };
      
      try {
        const response = await fetch('/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
          // Login exitoso - redirigir al dashboard
          window.location.href = '/dashboard.php';
        } else {
          // Mostrar error visual mejorado
          document.getElementById('error-title').textContent = '¡Algo salió mal!';
          document.getElementById('error-detail').textContent = result.error || 'Error de autenticación';
          errorDiv.style.display = 'flex';
        }
        
      } catch (error) {
  console.error('Error en login:', error);
  document.getElementById('error-title').textContent = '¡Algo salió mal!';
  document.getElementById('error-detail').textContent = 'Error de conexión. Intenta nuevamente.';
  errorDiv.style.display = 'flex';
      } finally {
        // Restaurar UI
        btnLogin.disabled = false;
        btnText.style.display = 'inline';
        btnLoading.style.display = 'none';
      }
    });
    
    // Verificar si ya está logueado al cargar la página
    async function checkSession() {
      try {
        const response = await fetch('/session');
        if (response.ok) {
          const result = await response.json();
          if (result.authenticated) {
            // Ya está logueado, ir al dashboard
            window.location.href = '/dashboard.php';
          }
        }
      } catch (error) {
        console.log('No hay sesión activa');
      }
    }
    
    // Inicializar página
    async function initLogin() {
      await cargarUsuarios();
      await checkSession();
    }
    
    // Ejecutar al cargar la página
    initLogin();
  </script>
</body>
</html>