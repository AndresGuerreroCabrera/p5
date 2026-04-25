package edu.comillas.icai.gitt.pat.spring.andresguerrero.controlador;

import edu.comillas.icai.gitt.pat.spring.andresguerrero.entidades.Carrito;
import edu.comillas.icai.gitt.pat.spring.andresguerrero.entidades.LineaCarrito;
import edu.comillas.icai.gitt.pat.spring.andresguerrero.servicios.ServicioCarrito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/carrito")
public class CarritoControlador {

    @Autowired
    private ServicioCarrito servicioCarrito;

    //GET carrito
    @GetMapping
    public List<Carrito> getCarritos() {
        return servicioCarrito.listarCarritos();
    }

    // -------------------------
    // POST /api/carrito
    // -------------------------
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Carrito creaCarrito(@RequestBody Carrito carrito) {
        return servicioCarrito.crearCarrito(carrito);
    }

    // -------------------------
    // GET /api/carrito/{id}
    // -------------------------
    @GetMapping("/{idCarrito}")
    public Carrito getCarrito(@PathVariable int idCarrito) {
        return servicioCarrito.obtenerCarrito(idCarrito);
    }

    // -------------------------
    // DELETE /api/carrito/{id}
    // -------------------------
    @DeleteMapping("/{idCarrito}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void borrarCarrito(@PathVariable int idCarrito) {
        // si quieres devolver el carrito borrado, cambia el void por Carrito y ajusta el service
        servicioCarrito.borrarCarrito(idCarrito);
    }

    // -------------------------
    // POST /api/carrito/{id}/lineas
    // -------------------------
    @PostMapping("/{idCarrito}/lineas")
    @ResponseStatus(HttpStatus.CREATED)
    public LineaCarrito añadirLinea(@PathVariable int idCarrito, @RequestBody LineaRequest request) {
        return servicioCarrito.añadirLinea(
                idCarrito,
                request.getIdArticulo(),
                request.getPrecioUnitario(),
                request.getNumUnidades()
        );
    }

    // -------------------------
    // DELETE /api/carrito/{id}/lineas/{idLinea}
    // -------------------------
    @DeleteMapping("/{idCarrito}/lineas/{idLinea}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void borrarLinea(@PathVariable int idCarrito, @PathVariable int idLinea) {
        servicioCarrito.borrarLineaPorIdLinea(idCarrito, idLinea);
    }

    // DTO interno para el body del POST /lineas
    // (evitas reutilizar la entidad y te llega solo lo necesario)
    public static class LineaRequest {
        private int idArticulo;
        private double precioUnitario;
        private int numUnidades;

        public int getIdArticulo() {
            return idArticulo;
        }

        public void setIdArticulo(int idArticulo) {
            this.idArticulo = idArticulo;
        }

        public double getPrecioUnitario() {
            return precioUnitario;
        }

        public void setPrecioUnitario(double precioUnitario) {
            this.precioUnitario = precioUnitario;
        }

        public int getNumUnidades() {
            return numUnidades;
        }

        public void setNumUnidades(int numUnidades) {
            this.numUnidades = numUnidades;
        }
    }
}