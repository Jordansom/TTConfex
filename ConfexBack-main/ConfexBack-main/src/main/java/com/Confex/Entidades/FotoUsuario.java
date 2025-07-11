package com.Confex.Entidades;

import java.io.Serializable;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.Lob;
import javax.persistence.MapsId;
import javax.persistence.OneToOne;
import javax.persistence.Table;
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
@Table(name = "fotos_usuarios")
public class FotoUsuario implements Serializable {
    
    private static final long serialVersionUID = 1L;
    
    @EqualsAndHashCode.Include
    @Id
    @Column(name = "id_usuario")
    private Integer idFoto;

    @Lob
    @Column(nullable = false)
    private byte[] foto;
    
    @Column(nullable = false)
    private String mime;

    @ToString.Exclude
    @OneToOne
    @MapsId
    @JoinColumn(name = "id_usuario", referencedColumnName = "id_usuario")
    private Usuario usuario;
}
