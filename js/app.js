const API_BASE_URL = localStorage.getItem("API_BASE_URL") || "http://localhost:8080";
const API_CARRITO = `${API_BASE_URL}/api/carrito`;
const STORAGE_CARRITO_ID = "agcdrones_idCarrito";

const PRODUCTOS = {
  1: {
    idArticulo: 1,
    nombre: "DJI Mavic 4 Pro",
    descripcion: "Dron profesional, fácil de transportar, con calidad 6K de grabación",
    precioUnitario: 2099,
    imagen: "img/MAVIC-4-PRO.jpg"
  },
  2: {
    idArticulo: 2,
    nombre: "XAG P100 Pro",
    descripcion: "Dron robusto, pensado para el campo y agricultores con grandes extensiones",
    precioUnitario: 25800,
    imagen: "img/XAG-P100-PRO-MAIN-REVOCAST3-1.jpg"
  },
  3: {
    idArticulo: 3,
    nombre: "iFlight Nazgul Evoque F5 V3",
    descripcion: "Modelo para comenzar con el mundo FPV, fácil de manejar y resistente",
    precioUnitario: 780,
    imagen: "img/nazgul-evoque-f5-v3-o4-gps-preorder-5123941.jpg"
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
  const idCarritoGuardado = getIdCarritoGuardado();

  if (idCarritoGuardado) {
    try {
      await fetchJson(`${API_CARRITO}/${idCarritoGuardado}`);
      return idCarritoGuardado;
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

async function añadirProductoAlCarrito(idArticulo) {
  const producto = PRODUCTOS[idArticulo];

  if (!producto) {
    mostrarMensaje("Producto no encontrado.", "error");
    return;
  }

  try {
    mostrarMensaje("Añadiendo producto al carrito...");

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

async function borrarLineaCarrito(idLinea) {
  const idCarrito = getIdCarritoGuardado();

  if (!idCarrito) return;

  try {
    mostrarMensaje("Eliminando línea del carrito...");

    await fetchJson(`${API_CARRITO}/${idCarrito}/lineas/${idLinea}`, {
      method: "DELETE"
    });

    mostrarMensaje("Producto eliminado del carrito.", "ok");
    cargarPaginaCarrito();
    actualizarContadorCarrito();
  } catch (error) {
    console.error(error);
    mostrarMensaje("No se pudo eliminar la línea del carrito.", "error");
  }
}

async function actualizarContadorCarrito() {
  const contador = document.getElementById("contador-carrito");
  if (!contador) return;

  const carrito = await obtenerCarritoActual();
  const unidades = carrito?.lineas?.reduce((total, linea) => total + linea.numUnidades, 0) || 0;

  contador.textContent = unidades;
}

function inicializarPaginaProductos() {
  const botones = document.querySelectorAll("[data-add-carrito]");

  botones.forEach(boton => {
    boton.addEventListener("click", () => {
      const idArticulo = Number(boton.dataset.addCarrito);
      añadirProductoAlCarrito(idArticulo);
    });
  });

  actualizarContadorCarrito();
}

async function cargarPaginaCarrito() {
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
    if (botonCheckout) botonCheckout.classList.add("disabled");
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
  if (botonCheckout) botonCheckout.classList.remove("disabled");

  document.querySelectorAll("[data-delete-linea]").forEach(boton => {
    boton.addEventListener("click", () => {
      borrarLineaCarrito(Number(boton.dataset.deleteLinea));
    });
  });
}

function inicializarPaginaCarrito() {
  cargarPaginaCarrito();
  actualizarContadorCarrito();
}

function inicializarPaginaCheckout() {
  const formulario = document.getElementById("form-checkout");
  const resumen = document.getElementById("resumen-checkout");

  actualizarResumenCheckout(resumen);

  if (!formulario) return;

  formulario.addEventListener("submit", async event => {
    event.preventDefault();

    const carrito = await obtenerCarritoActual();

    if (!carrito || !carrito.lineas || carrito.lineas.length === 0) {
      mostrarMensaje("No puedes finalizar el pedido porque el carrito está vacío.", "error");
      return;
    }

    const email = document.getElementById("email").value;
    const nombre = document.getElementById("nombre").value;

    mostrarMensaje(`Pedido finalizado correctamente. Gracias, ${nombre}. Enviaremos la confirmación a ${email}.`, "ok");

    borrarIdCarritoGuardado();
    formulario.reset();
    actualizarResumenCheckout(resumen);
    actualizarContadorCarrito();
  });
}

async function actualizarResumenCheckout(resumen) {
  if (!resumen) return;

  const carrito = await obtenerCarritoActual();

  if (!carrito || !carrito.lineas || carrito.lineas.length === 0) {
    resumen.textContent = "Carrito vacío. Añade productos antes de finalizar el pedido.";
    return;
  }

  const unidades = carrito.lineas.reduce((total, linea) => total + linea.numUnidades, 0);
  resumen.textContent = `Tienes ${unidades} producto(s) en el carrito. Total: ${formatoEuros(carrito.precioTotal)}.`;
}

function inicializarApp() {
  const pagina = document.body.dataset.page;

  actualizarContadorCarrito();

  if (pagina === "productos") {
    inicializarPaginaProductos();
  }

  if (pagina === "carrito") {
    inicializarPaginaCarrito();
  }

  if (pagina === "checkout") {
    inicializarPaginaCheckout();
  }
}

document.addEventListener("DOMContentLoaded", inicializarApp);