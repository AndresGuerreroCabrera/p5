const API_BASE_URL = "http://localhost:8080";
const API_CARRITO = `${API_BASE_URL}/api/carrito`;
const STORAGE_CARRITO_ID = "agcdrones_idCarrito";

function formatoEuros(cantidad) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR"
  }).format(cantidad || 0);
}

function mostrarMensaje(texto, tipo = "info") {
  const mensaje = document.getElementById("mensaje-api");

  if (!mensaje) return;

  mensaje.textContent = texto;
  mensaje.className = `mensaje-api ${tipo}`;
}

async function fetchJson(url, opciones = {}) {
  const respuesta = await fetch(url, opciones);

  if (!respuesta.ok) {
    const textoError = await respuesta.text().catch(() => "");
    throw new Error(`Error HTTP ${respuesta.status}${textoError ? `: ${textoError}` : ""}`);
  }

  if (respuesta.status === 204) {
    return null;
  }

  return respuesta.json();
}

function getIdCarritoGuardado() {
  return localStorage.getItem(STORAGE_CARRITO_ID);
}

function borrarIdCarritoGuardado() {
  localStorage.removeItem(STORAGE_CARRITO_ID);
}

async function obtenerCarritoActual() {
  const idCarrito = getIdCarritoGuardado();

  if (!idCarrito) {
    return null;
  }

  try {
    return await fetchJson(`${API_CARRITO}/${idCarrito}`);
  } catch (error) {
    borrarIdCarritoGuardado();
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

async function actualizarResumenCheckout() {
  const resumen = document.getElementById("resumen-checkout");

  if (!resumen) return;

  const carrito = await obtenerCarritoActual();

  if (!carrito || !carrito.lineas || carrito.lineas.length === 0) {
    resumen.textContent = "Carrito vacío. Añade productos antes de finalizar el pedido.";
    return;
  }

  const unidades = carrito.lineas.reduce((total, linea) => total + linea.numUnidades, 0);

  resumen.textContent = `Tienes ${unidades} producto(s) en el carrito. Total: ${formatoEuros(carrito.precioTotal)}.`;
}

function inicializarCheckout() {
  const formulario = document.getElementById("form-checkout");

  actualizarResumenCheckout();
  actualizarContadorCarrito();

  if (!formulario) return;

  formulario.addEventListener("submit", async event => {
    event.preventDefault();

    const carrito = await obtenerCarritoActual();

    if (!carrito || !carrito.lineas || carrito.lineas.length === 0) {
      mostrarMensaje("No puedes finalizar el pedido porque el carrito está vacío.", "error");
      return;
    }

    const nombre = document.getElementById("nombre").value;
    const email = document.getElementById("email").value;

    mostrarMensaje(
      `Pedido finalizado correctamente. Gracias, ${nombre}. Enviaremos la confirmación a ${email}.`,
      "ok"
    );

    borrarIdCarritoGuardado();
    formulario.reset();

    actualizarResumenCheckout();
    actualizarContadorCarrito();
  });
}

document.addEventListener("DOMContentLoaded", inicializarCheckout);