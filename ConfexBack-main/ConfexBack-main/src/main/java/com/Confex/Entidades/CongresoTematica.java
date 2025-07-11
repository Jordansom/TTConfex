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
    name = "congreso_tematicas",
    uniqueConstraints = @UniqueConstraint(columnNames = {"id_congreso", "id_tematica"})
)
public class CongresoTematica implements Serializable {
    
    private static final long serialVersionUID = 1L;
    
    @EqualsAndHashCode.Include
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_congreso_tematica")
    private Integer idCongresoTematica;

    @EqualsAndHashCode.Include
    @ToString.Exclude
    @ManyToOne
    @JoinColumn(name = "id_congreso", nullable = false)
    private Congreso congreso;

    @EqualsAndHashCode.Include
    @ToString.Exclude
    @ManyToOne
    @JoinColumn(name = "id_tematica", nullable = false)
    private Tematica tematica;
}
