package com.Confex.Entidades;

import javax.persistence.*;
import java.io.Serializable;
import java.util.Date;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "ponencias")
public class Ponencia implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_ponencia")
    private Integer idPonencia;

    @ManyToOne
    @JoinColumn(name = "id_congreso", nullable = false)
    private Congreso congreso;

    @ManyToOne
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @ManyToOne
    @JoinColumn(name = "id_tematica", nullable = false)
    private Tematica tematica;

    @Lob
    @Column(name = "archivo_pdf", nullable = false)
    private byte[] archivoPdf;

    @Column(name = "nombre_archivo", nullable = false)
    private String nombreArchivo;

    @Column(name = "mime", nullable = false)
    private String mime;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "fecha_subida", nullable = false, updatable = false, insertable = false, columnDefinition = "DATETIME DEFAULT CURRENT_TIMESTAMP")
    private Date fechaSubida;

    // Relación con Dictamen (el dictamen depende de la ponencia)
    @OneToMany(mappedBy = "ponencia", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Dictamen> dictamenes = new HashSet<>();

    // Relación con EvaluarPonencia (las asignaciones de evaluación dependen de la ponencia)
    @OneToMany(mappedBy = "ponencia", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<EvaluarPonencia> evaluaciones = new HashSet<>();

    // Getters y setters
    public Integer getIdPonencia() { return idPonencia; }
    public void setIdPonencia(Integer idPonencia) { this.idPonencia = idPonencia; }

    public Congreso getCongreso() { return congreso; }
    public void setCongreso(Congreso congreso) { this.congreso = congreso; }

    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }

    public Tematica getTematica() { return tematica; }
    public void setTematica(Tematica tematica) { this.tematica = tematica; }

    public byte[] getArchivoPdf() { return archivoPdf; }
    public void setArchivoPdf(byte[] archivoPdf) { this.archivoPdf = archivoPdf; }

    public String getNombreArchivo() { return nombreArchivo; }
    public void setNombreArchivo(String nombreArchivo) { this.nombreArchivo = nombreArchivo; }

    public String getMime() { return mime; }
    public void setMime(String mime) { this.mime = mime; }

    public Date getFechaSubida() { return fechaSubida; }
    public void setFechaSubida(Date fechaSubida) { this.fechaSubida = fechaSubida; }

    public Set<EvaluarPonencia> getEvaluaciones() { return evaluaciones; }
    public void setEvaluaciones(Set<EvaluarPonencia> evaluaciones) { this.evaluaciones = evaluaciones; }

    public Set<Dictamen> getDictamenes() { return dictamenes; }
    public void setDictamenes(Set<Dictamen> dictamenes) { this.dictamenes = dictamenes; }
}
