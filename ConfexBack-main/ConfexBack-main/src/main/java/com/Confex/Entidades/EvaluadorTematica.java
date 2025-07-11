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
    name = "evaluador_tematicas",
    uniqueConstraints = @UniqueConstraint(columnNames = {"id_evaluador", "id_tematica"})
)
public class EvaluadorTematica implements Serializable {
    
    private static final long serialVersionUID = 1L;
    
    @EqualsAndHashCode.Include
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_evaluador_tematica")
    private Integer idEvaluadorTematica;
    
    @EqualsAndHashCode.Include
    @ToString.Exclude
    @ManyToOne
    @JoinColumn(name = "id_evaluador", nullable = false)
    private Evaluador evaluador;
    
    @EqualsAndHashCode.Include
    @ToString.Exclude
    @ManyToOne
    @JoinColumn(name = "id_tematica", nullable = true)
    private Tematica tematica;
}
