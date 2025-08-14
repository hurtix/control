<!-- <div class="fixed left-0 bottom-0 w-full bg-white border-t border-gray-200 p-4">
  <ul class="grid grid-cols-3 [&_li]:text-center [&_li_a]:block">
    <li><a href="/dashboard.php">Home</a></li>
    <li><a href="/ajustes.php">Notificaciones</a></li>
    <li><a href="/ayuda.php">Ayuda</a></li>
  </ul>
</div> -->


<!-- Scripts -->

<!-- Basecoat toaster container -->
<div id="toaster" class="toaster"></div>
  <script src="assets/js/main.js"></script>
  <script src="assets/js/forms.js"></script>
  <script src="assets/js/lotes.js"></script>
  <script src="assets/js/pedidos.js"></script>
  <script src="assets/js/workflow.js"></script>
  <script src="assets/js/events.js"></script>
  <script src="assets/js/maestros.js"></script>
  <script src="assets/js/roles.js"></script>
  <script src="assets/js/usuarios.js"></script>
  <script src="assets/js/inventario.js"></script>
  <script src="assets/js/familias.js"></script>

  <!-- Sistema de autenticación -->
  <script>
    // currentUser ya está declarado en main.js como variable global

    // Verificar autenticación al cargar la página
    async function checkAuth() {
      try {
        const response = await fetch('/session');
        if (!response.ok) {
          window.location.href = '/login.php';
          return;
        }

        const result = await response.json();
        if (!result.authenticated) {
          window.location.href = '/login.php';
          return;
        }

        // Usuario autenticado
        currentUser = result.usuario;
        updateUserInfo();

      } catch (error) {
        console.error('Error verificando autenticación:', error);
  window.location.href = '/login.php';
      }
    }

    // Actualizar información del usuario en el header
    function updateUserInfo() {
      const userInfo = document.getElementById('user-info');
      if (currentUser) {
        userInfo.innerHTML = `${currentUser.nombre} <span class="badge-secondary">${currentUser.rol}</span>`;

        // Establecer automáticamente el nombre del empleado en todos los formularios
        if (currentUser.nombre) {
          // Establecer el valor en los campos ocultos de empleado
          document.querySelectorAll('[id^="select-empleado"]').forEach(select => {
            //console.log(`Actualizando campo empleado: ${select.id} con valor ${currentUser.nombre}`);
            select.value = currentUser.nombre;
          });

          // Establecer explícitamente el valor del campo oculto de producción
          if (document.getElementById('select-empleado')) {
            document.getElementById('select-empleado').value = currentUser.nombre;
            //console.log(`Campo select-empleado actualizado con: ${currentUser.nombre}`);
          }
        }
      }
    }

    // Función de logout
    async function logout() {
      try {
        await fetch('/logout', { method: 'POST' });
      } catch (error) {
        console.error('Error en logout:', error);
      } finally {
  window.location.href = '/login.php';
      }
    }

    // Verificar autenticación al cargar
    checkAuth();
  </script>
</body>

  <script src="assets/js/alertas.js"></script>
</html>