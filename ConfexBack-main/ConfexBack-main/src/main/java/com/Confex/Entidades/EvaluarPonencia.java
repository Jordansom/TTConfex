package com.Confex.Entidades;

import javax.persistence.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
    name = "evaluar_ponencia",
    uniqueConstraints = @UniqueConstraint(columnNames = {"id_evaluador", "id_ponencia"})
)
public class EvaluarPonencia {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_evaluar_ponencia")
    private Integer idEvaluarPonencia;
    
    @ManyToOne
    @JoinColumn(name = "id_evaluador", nullable = false)
    private Evaluador evaluador;

    @ManyToOne
    @JoinColumn(name = "id_ponencia", nullable = false)
    private Ponencia ponencia;

    // Elimina este campo, ya que NO existe en la tabla real:
    // @Column(name = "decision")
    // private String decision;
}
