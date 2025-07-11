package com.Confex.Entidades;

import com.fasterxml.jackson.annotation.JsonIgnore;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;
import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.OneToMany;
import javax.persistence.OneToOne;
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
    name = "usuarios", 
    uniqueConstraints = { 
        @UniqueConstraint(columnNames = "nombre_usuario"),
        @UniqueConstraint(columnNames = "correo"),
        @UniqueConstraint(columnNames = "telefono")
    }
)
public class Usuario implements Serializable {
    
    private static final long serialVersionUID = 1L;
    
    @EqualsAndHashCode.Include
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_usuario")
    private Integer idUsuario;

    @Column(nullable = false)
    private String nombre;

    @Column(name = "apellido_paterno", nullable = false)
    private String apellidoPaterno;

    @Column(name = "apellido_materno", nullable = false)
    private String apellidoMaterno;

    @Column(name = "nombre_usuario", nullable = false, unique = true)
    private String nombreUsuario;

    @Column(nullable = false, unique = true)
    private String correo;

    @ToString.Exclude
    @JsonIgnore
    @Column(nullable = false)
    private String password;

    @Column(nullable = true, unique = true)
    private String telefono;

    @ToString.Exclude
    @OneToOne(mappedBy = "usuario", optional = true, cascade = CascadeType.ALL, orphanRemoval = true)
    private FotoUsuario foto;
    
    @ToString.Exclude
    @OneToOne(mappedBy = "usuario", optional = true, cascade = CascadeType.ALL, orphanRemoval = true)
    private Administrador administrador;
    
    @ToString.Exclude
    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Evaluador> evaluador = new HashSet<>();
    
    @ToString.Exclude
    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Conferencista> conferencista = new HashSet<>();
    
    @ToString.Exclude
    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Registrador> registrador = new HashSet<>();
    
    @ToString.Exclude
    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Ponente> ponente = new HashSet<>();
}
