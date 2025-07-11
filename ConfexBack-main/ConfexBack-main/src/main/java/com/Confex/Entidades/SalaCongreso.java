package com.Confex.Entidades;

import javax.persistence.*;

@Entity
@Table(name = "salas_congreso")
public class SalaCongreso {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_sala")
    private Integer idSala;
    
    @Column(name = "id_congreso", nullable = false)
    private Integer idCongreso;
    
    @Column(name = "nombre_sala", nullable = false, length = 100)
    private String nombreSala;
    
    // Constructores
    public SalaCongreso() {}
    
    public SalaCongreso(Integer idCongreso, String nombreSala) {
        this.idCongreso = idCongreso;
        this.nombreSala = nombreSala;
    }
    
    // Getters y Setters
    public Integer getIdSala() {
        return idSala;
    }
    
    public void setIdSala(Integer idSala) {
        this.idSala = idSala;
    }
    
    public Integer getIdCongreso() {
        return idCongreso;
    }
    
    public void setIdCongreso(Integer idCongreso) {
        this.idCongreso = idCongreso;
    }
    
    public String getNombreSala() {
        return nombreSala;
    }
    
    public void setNombreSala(String nombreSala) {
        this.nombreSala = nombreSala;
    }
}
