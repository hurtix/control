// Funciones para toggle entre select e input
const toggleProductoInput = (tipo) => {
  const select = document.getElementById(`select-producto-${tipo}`);
  const input = document.getElementById(`input-producto-${tipo}`);
  const isInputVisible = input.style.display !== 'none';
  
  if (isInputVisible) {
    input.style.display = 'none';
    select.style.display = 'block';
    input.removeAttribute('required');
    select.setAttribute('required', '');
  } else {
    input.style.display = 'block';
    select.style.display = 'none';
    input.setAttribute('required', '');
    select.removeAttribute('required');
  }
};

const toggleTiendaInput = (tipo) => {
  const select = document.getElementById(`select-tienda-${tipo}`);
  const input = document.getElementById(`input-tienda-${tipo}`);
  const isInputVisible = input.style.display !== 'none';
  
  if (isInputVisible) {
    input.style.display = 'none';
    select.style.display = 'block';
    input.removeAttribute('required');
    select.setAttribute('required', '');
  } else {
    input.style.display = 'block';
    select.style.display = 'none';
    input.setAttribute('required', '');
    select.removeAttribute('required');
  }
};
