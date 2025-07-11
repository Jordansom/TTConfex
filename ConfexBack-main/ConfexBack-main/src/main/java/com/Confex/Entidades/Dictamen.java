package com.Confex.Entidades;

import lombok.*;
import javax.persistence.*;
import java.io.Serializable;
import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
    name = "dictamen",
    uniqueConstraints = @UniqueConstraint(columnNames = {"id_congreso", "id_ponencia"})
)
public class Dictamen implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_dictamen")
    private Integer idDictamen;

    @ManyToOne
    @JoinColumn(name = "id_congreso", referencedColumnName = "id_congreso")
    private Congreso congreso;

    @ManyToOne
    @JoinColumn(name = "id_ponencia", referencedColumnName = "id_ponencia")
    private Ponencia ponencia;

    @Column(name = "veredicto", nullable = false)
    private String veredicto; // "aceptado", "rechazado", "devuelto"

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "fecha_dictamen", nullable = false)
    private Date fechaDictamen;
}
