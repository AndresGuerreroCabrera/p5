package edu.comillas.icai.gitt.pat.spring.andresguerrero.repositorios;

import edu.comillas.icai.gitt.pat.spring.andresguerrero.entidades.Carrito;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CarritoRepository extends JpaRepository<Carrito, Integer> {
}