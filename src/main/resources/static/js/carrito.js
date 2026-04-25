const API_BASE_URL = "http://localhost:8080";
const API_CARRITO = `${API_BASE_URL}/api/carrito`;
const STORAGE_CARRITO_ID = "agcdrones_idCarrito";

const PRODUCTOS = {
  1: {
    idArticulo: 1,
    nombre: "DJI Mavic 4 Pro",
    precioUnitario: 2099
  },
  2: {
    idArticulo: 2,
    nombre: "XAG P100 Pro",
    precioUnitario: 25800
  },
  3: {
    idArticulo: 3,
    nombre: "iFlight Nazgul Evoque F5 V3",
    precioUnitario: 780
  }
};

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

async function borrarLineaCarrito(idLinea) {
  const idCarrito = getIdCarritoGuardado();

  if (!idCarrito) return;

  try {
    mostrarMensaje("Eliminando producto...", "info");

    await fetchJson(`${API_CARRITO}/${idCarrito}/lineas/${idLinea}`, {
      method: "DELETE"
    });

    mostrarMensaje("Producto eliminado del carrito.", "ok");

    cargarCarrito();
    actualizarContadorCarrito();
  } catch (error) {
    console.error(error);
    mostrarMensaje("No se pudo eliminar el producto.", "error");
  }
}

async function cargarCarrito() {
  const tbody = document.getElementById("tbody-carrito");
  const totalCarrito = document.getElementById("total-carrito");
  const botonCheckout = document.getElementById("btn-checkout");

  if (!tbody || !totalCarrito) return;

  tbody.innerHTML = `
    <tr>
      <td colspan="5">Cargando carrito...</td>
    </tr>
  `;

  const carrito = await obtenerCarritoActual();

  if (!carrito || !carrito.lineas || carrito.lineas.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5">Tu carrito está vacío.</td>
      </tr>
    `;

    totalCarrito.textContent = formatoEuros(0);

    if (botonCheckout) {
      botonCheckout.classList.add("disabled");
    }

    return;
  }

  tbody.innerHTML = "";

  carrito.lineas.forEach(linea => {
    const producto = PRODUCTOS[linea.idArticulo] || {
      nombre: `Artículo ${linea.idArticulo}`
    };

    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${producto.nombre}</td>
      <td>${formatoEuros(linea.precioUnitario)}</td>
      <td>${linea.numUnidades}</td>
      <td>${formatoEuros(linea.costeLineaArticulo)}</td>
      <td>
        <button type="button" class="button button-small" data-delete-linea="${linea.idLinea}">
          Eliminar
        </button>
      </td>
    `;

    tbody.appendChild(tr);
  });

  totalCarrito.textContent = formatoEuros(carrito.precioTotal);

  if (botonCheckout) {
    botonCheckout.classList.remove("disabled");
  }

  const botonesEliminar = document.querySelectorAll("[data-delete-linea]");

  botonesEliminar.forEach(boton => {
    boton.addEventListener("click", () => {
      const idLinea = Number(boton.dataset.deleteLinea);
      borrarLineaCarrito(idLinea);
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  cargarCarrito();
  actualizarContadorCarrito();
});