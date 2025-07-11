package com.Confex.Entidades;


import javax.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "asistencias")
public class Asistencia {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_asistencia")
    private Integer idAsistencia;
    
    @Column(name = "id_asistente", nullable = false)
    private Integer idAsistente;
    
    @Column(name = "horas", nullable = false, precision = 5, scale = 2)
    private BigDecimal horas = BigDecimal.ZERO;
    
    // Relación
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_asistente", insertable = false, updatable = false)
    private Asistente asistente;
    
    // Constructors
    public Asistencia() {}
    
    public Asistencia(Integer idAsistente, BigDecimal horas) {
        this.idAsistente = idAsistente;
        this.horas = horas;
    }
    
    // Getters and Setters
    public Integer getIdAsistencia() {
        return idAsistencia;
    }
    
    public void setIdAsistencia(Integer idAsistencia) {
        this.idAsistencia = idAsistencia;
    }
    
    public Integer getIdAsistente() {
        return idAsistente;
    }
    
    public void setIdAsistente(Integer idAsistente) {
        this.idAsistente = idAsistente;
    }
    
    public BigDecimal getHoras() {
        return horas;
    }
    
    public void setHoras(BigDecimal horas) {
        this.horas = horas;
    }
    
    public Asistente getAsistente() {
        return asistente;
    }
    
    public void setAsistente(Asistente asistente) {
        this.asistente = asistente;
    }
}
