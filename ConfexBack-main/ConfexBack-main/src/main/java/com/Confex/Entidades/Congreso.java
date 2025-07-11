package com.Confex.Entidades;

import java.io.IOException;
import java.io.Serializable;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashSet;
import java.util.Set;
import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.persistence.OneToOne;
import javax.persistence.PreRemove;
import javax.persistence.Table;
import javax.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;
import lombok.experimental.Accessors;

@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Accessors(chain = true)
@Entity
@Table(
    name = "congresos",
    uniqueConstraints = { 
        @UniqueConstraint(columnNames = "nombre")
    }
)
public class Congreso implements Serializable {
    
    private static final long serialVersionUID = 1L;
    
    @EqualsAndHashCode.Include
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_congreso")
    private Integer idCongreso;
    
    @Column(nullable = false, unique = true)
    private String nombre;
    
    @Column(name = "horas_minimas", nullable = false)
    private Integer horasMinimasAsistencia;
    
    @Column(nullable = true)
    private String correo;
    
    @Column(nullable = true)
    private String telefono;
    
    @Column(name = "sitio_web", nullable = true)
    private String sitioWeb;
    
    @ToString.Exclude
    @ManyToOne
    @JoinColumn(name = "id_administrador", referencedColumnName = "id_usuario")
    private Administrador administrador;
    
    @ToString.Exclude
    @OneToOne(mappedBy = "congreso", optional = true, cascade = CascadeType.ALL, orphanRemoval = true)
    private FotoCongreso foto;

    @EqualsAndHashCode.Include
    @ToString.Exclude
    @OneToOne(mappedBy = "congreso", cascade = CascadeType.ALL, orphanRemoval = true)
    private FechasCongreso fechas;

    @EqualsAndHashCode.Include
    @ToString.Exclude
    @OneToOne(mappedBy = "congreso", cascade = CascadeType.ALL, orphanRemoval = true)
    private UbicacionCongreso ubicacion;

    @ToString.Exclude
    @OneToMany(mappedBy = "congreso", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private Set<CongresoTematica> congresoTematicas = new HashSet<>();

    @ToString.Exclude
    @OneToMany(mappedBy = "congreso", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<TematicaExtra> tematicasExtra = new HashSet<>();


    @ToString.Exclude
    @OneToMany(mappedBy = "congreso", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Evaluador> evaluadores = new HashSet<>();
    

    @ToString.Exclude
    @OneToMany(mappedBy = "congreso", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Conferencista> conferencistas = new HashSet<>();
    

    @ToString.Exclude
    @OneToMany(mappedBy = "congreso", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Registrador> registradores = new HashSet<>();
    

    @ToString.Exclude
    @OneToMany(mappedBy = "congreso", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Ponente> ponentes = new HashSet<>();
    
    @PreRemove
    public void eliminarConvocatoriaDelSistema() {
        Path ruta = Paths.get(System.getProperty("user.dir"), "/uploads/convocatorias/"+idCongreso+".pdf");
        try {
            Files.deleteIfExists(ruta);
        } catch (IOException e) {
            System.err.println("No se pudo eliminar el archivo: " + ruta + " - " + e.getMessage());
        }
    }
}
