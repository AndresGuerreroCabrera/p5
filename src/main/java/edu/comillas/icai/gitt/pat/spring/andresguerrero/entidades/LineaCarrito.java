package edu.comillas.icai.gitt.pat.spring.andresguerrero.entidades;
import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;

@Entity
public class LineaCarrito {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int idLinea;

    @JsonIgnore
    @ManyToOne(optional = false)
    @JoinColumn(name = "id_carrito")
    private Carrito carrito;

    private int idArticulo;
    private double precioUnitario;
    private int numUnidades;

    private double costeLineaArticulo;

    public LineaCarrito() {}

    public LineaCarrito(Carrito carrito, int idArticulo, double precioUnitario, int numUnidades) {
        this.carrito = carrito;
        this.idArticulo = idArticulo;
        this.precioUnitario = precioUnitario;
        this.numUnidades = numUnidades;
        recalcularCoste();
    }

    private void recalcularCoste() {
        this.costeLineaArticulo = this.precioUnitario * this.numUnidades;
    }

    public int getIdLinea() {
        return idLinea;
    }

    public void setIdLinea(int idLinea) {
        this.idLinea = idLinea;
    }

    public Carrito getCarrito() {
        return carrito;
    }

    public void setCarrito(Carrito carrito) {
        this.carrito = carrito;
    }

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
        recalcularCoste();
    }

    public int getNumUnidades() {
        return numUnidades;
    }

    public void setNumUnidades(int numUnidades) {
        this.numUnidades = numUnidades;
        recalcularCoste();
    }

    public double getCosteLineaArticulo() {
        return costeLineaArticulo;
    }

    // Si lo calculas siempre, este setter no hace falta, pero lo dejo por compatibilidad
    public void setCosteLineaArticulo(double costeLineaArticulo) {
        this.costeLineaArticulo = costeLineaArticulo;
    }
}