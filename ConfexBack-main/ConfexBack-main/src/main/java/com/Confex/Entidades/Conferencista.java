package com.Confex.Entidades;

import java.io.Serializable;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
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
    name = "conferencistas",
    uniqueConstraints = @UniqueConstraint(columnNames = {"id_congreso", "id_usuario"})
)
public class Conferencista implements Serializable {
    
    private static final long serialVersionUID = 1L;
    
    @EqualsAndHashCode.Include
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_conferencista")
    private Integer idConferencista;
    
    @EqualsAndHashCode.Include
    @ToString.Exclude
    @ManyToOne
    @JoinColumn(name = "id_congreso", referencedColumnName = "id_congreso")
    private Congreso congreso;
    
    @EqualsAndHashCode.Include
    @ToString.Exclude
    @ManyToOne
    @JoinColumn(name = "id_usuario", referencedColumnName = "id_usuario")
    private Usuario usuario;
}
