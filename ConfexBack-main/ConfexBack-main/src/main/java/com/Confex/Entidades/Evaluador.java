package com.Confex.Entidades;

import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;
import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
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
    name = "evaluadores",
    uniqueConstraints = @UniqueConstraint(columnNames = {"id_congreso", "id_usuario"})
)
public class Evaluador implements Serializable {

    private static final long serialVersionUID = 1L;

    @EqualsAndHashCode.Include
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_evaluador")
    private Integer idEvaluador;

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

    @ToString.Exclude
    @OneToMany(mappedBy = "evaluador", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<EvaluadorTematica> evaluadorTematicas = new HashSet<>();
}
