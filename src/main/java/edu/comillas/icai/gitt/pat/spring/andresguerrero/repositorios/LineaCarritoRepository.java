package edu.comillas.icai.gitt.pat.spring.andresguerrero.repositorios;

import edu.comillas.icai.gitt.pat.spring.andresguerrero.entidades.LineaCarrito;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LineaCarritoRepository extends JpaRepository<LineaCarrito, Integer> {

    // Todas las líneas de un carrito
    List<LineaCarrito> findByCarrito_IdCarrito(int idCarrito);

    // Buscar una línea concreta por carrito + artículo (útil para sumar unidades o borrar por artículo)
    Optional<LineaCarrito> findByCarrito_IdCarritoAndIdArticulo(int idCarrito, int idArticulo);
}