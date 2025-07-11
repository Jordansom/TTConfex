package com.Confex.Entidades;


import javax.persistence.*;

@Entity
@Table(name = "asistentes")
public class Asistente {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_asistente")
    private Integer idAsistente;
    
    @Column(name = "id_congreso", nullable = false)
    private Integer idCongreso;
    
    @Column(name = "id_usuario", nullable = false)
    private Integer idUsuario;
    
    @Column(name = "beifi", nullable = false)
    private Boolean beifi;
    
    // Relaciones
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_congreso", insertable = false, updatable = false)
    private Congreso congreso;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", insertable = false, updatable = false)
    private Usuario usuario;
    
    @OneToOne(mappedBy = "asistente", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Asistencia asistencia;
    
    // Constructors
    public Asistente() {}
    
    public Asistente(Integer idCongreso, Integer idUsuario, Boolean beifi) {
        this.idCongreso = idCongreso;
        this.idUsuario = idUsuario;
        this.beifi = beifi;
    }
    
    // Getters and Setters
    public Integer getIdAsistente() {
        return idAsistente;
    }
    
    public void setIdAsistente(Integer idAsistente) {
        this.idAsistente = idAsistente;
    }
    
    public Integer getIdCongreso() {
        return idCongreso;
    }
    
    public void setIdCongreso(Integer idCongreso) {
        this.idCongreso = idCongreso;
    }
    
    public Integer getIdUsuario() {
        return idUsuario;
    }
    
    public void setIdUsuario(Integer idUsuario) {
        this.idUsuario = idUsuario;
    }
    
    public Boolean getBeifi() {
        return beifi;
    }
    
    public void setBeifi(Boolean beifi) {
        this.beifi = beifi;
    }
    
    public Congreso getCongreso() {
        return congreso;
    }
    
    public void setCongreso(Congreso congreso) {
        this.congreso = congreso;
    }
    
    public Usuario getUsuario() {
        return usuario;
    }
    
    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }
    
    public Asistencia getAsistencia() {
        return asistencia;
    }
    
    public void setAsistencia(Asistencia asistencia) {
        this.asistencia = asistencia;
    }
}
