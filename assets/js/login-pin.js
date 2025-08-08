// Lógica para el pin input de login
// Sin dependencias externas, solo vanilla JS

document.addEventListener('DOMContentLoaded', function() {
  const pinInputs = document.querySelectorAll('[data-hs-pin-input-item]');
  const hiddenPassword = document.querySelector('input[name="password"][type="hidden"]');

  if (!pinInputs.length || !hiddenPassword) return;

  function updateHiddenPassword() {
    let pin = '';
    pinInputs.forEach(input => {
      pin += input.value.replace(/\D/g, '');
    });
    hiddenPassword.value = pin;
  }

  pinInputs.forEach((input, idx) => {
    input.addEventListener('input', function(e) {
      // Solo permitir números y un solo dígito
      this.value = this.value.replace(/\D/g, '').slice(0, 1);
      updateHiddenPassword();
      if (this.value && idx < pinInputs.length - 1) {
        pinInputs[idx + 1].focus();
      }
    });
    input.addEventListener('keydown', function(e) {
      if (e.key === 'Backspace' && !this.value && idx > 0) {
        pinInputs[idx - 1].focus();
      }
    });
  });
});
