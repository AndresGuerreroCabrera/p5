package edu.comillas.icai.gitt.pat.spring.andresguerrero.servicios;

import edu.comillas.icai.gitt.pat.spring.andresguerrero.entidades.Carrito;
import edu.comillas.icai.gitt.pat.spring.andresguerrero.entidades.LineaCarrito;
import edu.comillas.icai.gitt.pat.spring.andresguerrero.repositorios.CarritoRepository;
import edu.comillas.icai.gitt.pat.spring.andresguerrero.repositorios.LineaCarritoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ServicioCarrito {

    //Acceso a los repositorios --> Puede leer y escribir en la base de datos
    @Autowired
    private CarritoRepository carritoRepository;

    @Autowired
    private LineaCarritoRepository lineaCarritoRepository;

    //Crear carrito (metodo) --> Guarda carrito nuevo en la base de datos
    //Cliente hace  POST /api/carrito --> Controller recibe JSON llama: servicio.crearCarrito(carrito)
    //Servicio ejecuta: carritoRepository.save(carrito) --> Spring Data JPA genera un "INSERT INTO carrito (...)"
    public Carrito crearCarrito(Carrito carrito) {
        if (carrito.getPrecioTotal() < 0) {
            carrito.setPrecioTotal(0);
        }
        return carritoRepository.save(carrito);
    }

    //Obtener carrito (busca carrito en base de datos) --> Cliente : GET /api/carrito/5
    // --> Servicio: carritoRepository.findById(5)
    //--> JPA: SELECT * FROM carrito WHERE id_carrito = 5 (si no existe = excepcion)
    public Carrito obtenerCarrito(int idCarrito) {
        return carritoRepository.findById(idCarrito)
                .orElseThrow(() -> new RuntimeException("No existe carrito con id " + idCarrito));
    }

    //Añadir línea (añade artículo al carrito) (primero comprueba si ya existe)
    @Transactional
    public LineaCarrito añadirLinea(int idCarrito, int idArticulo, double precioUnitario, int numUnidades) {
        if (numUnidades <= 0) {
            throw new RuntimeException("numUnidades debe ser > 0");
        }
        if (precioUnitario < 0) {
            throw new RuntimeException("precioUnitario no puede ser negativo");
        }

        Carrito carrito = obtenerCarrito(idCarrito);//Busca si existe

        // Si ya existe ese artículo en ese carrito sumamos unidades
        LineaCarrito linea = lineaCarritoRepository
                .findByCarrito_IdCarritoAndIdArticulo(idCarrito, idArticulo)
                .orElse(null);

        if (linea == null) {
            linea = new LineaCarrito(carrito, idArticulo, precioUnitario, numUnidades);
        } else {
            linea.setPrecioUnitario(precioUnitario);
            linea.setNumUnidades(linea.getNumUnidades() + numUnidades);
        }

        LineaCarrito guardada = lineaCarritoRepository.save(linea);

        recalcularPrecioTotal(idCarrito);
        return guardada;
    }

    //Borrar línea
    @Transactional //transactional está en métodos que hacen varias operaciones en la base de datos
    public void borrarLineaPorIdLinea(int idCarrito, int idLinea) {
        //Verifica que el carrito exista
        obtenerCarrito(idCarrito);

        LineaCarrito linea = lineaCarritoRepository.findById(idLinea)
                .orElseThrow(() -> new RuntimeException("No existe línea con id " + idLinea));

        //Aseguramos que pertenece al carrito correcto
        if (linea.getCarrito().getIdCarrito() != idCarrito) {
            throw new RuntimeException("La línea " + idLinea + " no pertenece al carrito " + idCarrito);
        }

        lineaCarritoRepository.delete(linea);
        recalcularPrecioTotal(idCarrito);
    }

    //Borrar por artículo
    @Transactional
    public void borrarLineaPorArticulo(int idCarrito, int idArticulo) {
        obtenerCarrito(idCarrito);

        LineaCarrito linea = lineaCarritoRepository
                .findByCarrito_IdCarritoAndIdArticulo(idCarrito, idArticulo)
                .orElseThrow(() -> new RuntimeException(
                        "No existe línea para el artículo " + idArticulo + " en el carrito " + idCarrito));

        lineaCarritoRepository.delete(linea);
        recalcularPrecioTotal(idCarrito);
    }

    @Transactional
    public void borrarCarrito(int idCarrito) {
        if (!carritoRepository.existsById(idCarrito)) {
            throw new RuntimeException("No existe carrito con id " + idCarrito);
        }
        carritoRepository.deleteById(idCarrito);
    }

    //Calcular precio total
    @Transactional
    public void recalcularPrecioTotal(int idCarrito) {
        Carrito carrito = obtenerCarrito(idCarrito);

        List<LineaCarrito> lineas = lineaCarritoRepository.findByCarrito_IdCarrito(idCarrito);

        double total = 0.0;
        for (LineaCarrito l : lineas) {
            total += l.getCosteLineaArticulo();
        }

        carrito.setPrecioTotal(total);
        carritoRepository.save(carrito);
    }

    public List<Carrito> listarCarritos() {
        return carritoRepository.findAll();
    }
}