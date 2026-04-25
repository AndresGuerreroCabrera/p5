const API_BASE_URL = "http://localhost:8080";
const API_CARRITO = `${API_BASE_URL}/api/carrito`;
const STORAGE_CARRITO_ID = "agcdrones_idCarrito";

async function fetchJson(url, opciones = {}) {
  const respuesta = await fetch(url, opciones);

  if (!respuesta.ok) {
    throw new Error(`Error HTTP ${respuesta.status}`);
  }

  if (respuesta.status === 204) {
    return null;
  }

  return respuesta.json();
}

function getIdCarritoGuardado() {
  return localStorage.getItem(STORAGE_CARRITO_ID);
}

async function obtenerCarritoActual() {
  const idCarrito = getIdCarritoGuardado();

  if (!idCarrito) {
    return null;
  }

  try {
    return await fetchJson(`${API_CARRITO}/${idCarrito}`);
  } catch (error) {
    localStorage.removeItem(STORAGE_CARRITO_ID);
    return null;
  }
}

async function actualizarContadorCarrito() {
  const contador = document.getElementById("contador-carrito");

  if (!contador) return;

  const carrito = await obtenerCarritoActual();

  const unidades =
    carrito?.lineas?.reduce((total, linea) => total + linea.numUnidades, 0) || 0;

  contador.textContent = unidades;
}

document.addEventListener("DOMContentLoaded", () => {
  actualizarContadorCarrito();
});