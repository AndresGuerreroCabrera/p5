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

function guardarIdCarrito(idCarrito) {
  localStorage.setItem(STORAGE_CARRITO_ID, idCarrito);
}

function borrarIdCarritoGuardado() {
  localStorage.removeItem(STORAGE_CARRITO_ID);
}

async function crearCarrito() {
  const carrito = await fetchJson(API_CARRITO, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      idUsuario: 1,
      correoUsuario: "cliente@agcdrones.com",
      precioTotal: 0
    })
  });

  guardarIdCarrito(carrito.idCarrito);
  return carrito.idCarrito;
}

async function asegurarCarrito() {
  const idCarrito = getIdCarritoGuardado();

  if (idCarrito) {
    try {
      await fetchJson(`${API_CARRITO}/${idCarrito}`);
      return idCarrito;
    } catch (error) {
      borrarIdCarritoGuardado();
    }
  }

  return crearCarrito();
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

async function añadirProductoAlCarrito(idArticulo) {
  const producto = PRODUCTOS[idArticulo];

  if (!producto) {
    mostrarMensaje("Producto no encontrado.", "error");
    return;
  }

  try {
    mostrarMensaje("Añadiendo producto al carrito...", "info");

    const idCarrito = await asegurarCarrito();

    await fetchJson(`${API_CARRITO}/${idCarrito}/lineas`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        idArticulo: producto.idArticulo,
        precioUnitario: producto.precioUnitario,
        numUnidades: 1
      })
    });

    mostrarMensaje(`${producto.nombre} añadido al carrito.`, "ok");
    actualizarContadorCarrito();
  } catch (error) {
    console.error(error);
    mostrarMensaje("No se pudo añadir el producto. Revisa que el backend esté arrancado.", "error");
  }
}

function inicializarProductos() {
  const botones = document.querySelectorAll("[data-add-carrito]");

  botones.forEach(boton => {
    boton.addEventListener("click", () => {
      const idArticulo = Number(boton.dataset.addCarrito);
      añadirProductoAlCarrito(idArticulo);
    });
  });

  actualizarContadorCarrito();
}

document.addEventListener("DOMContentLoaded", inicializarProductos);