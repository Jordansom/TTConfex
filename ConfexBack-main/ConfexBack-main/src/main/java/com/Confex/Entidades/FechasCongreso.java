package com.Confex.Entidades;

import java.io.Serializable;
import java.time.LocalDateTime;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
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
@Table(name = "fechas_congreso")
public class FechasCongreso implements Serializable {
    
    private static final long serialVersionUID = 1L;
    
    @EqualsAndHashCode.Include
    @Id
    @Column(name = "id_congreso")
    private Integer idCongreso;
    
    @Column(name = "convocatoria_inicio", nullable = false)
    private LocalDateTime convocatoriaInicio;
    
    @Column(name = "convocatoria_fin", nullable = false)
    private LocalDateTime convocatoriaFin;
    
    @Column(name = "evaluacion_inicio", nullable = false)
    private LocalDateTime evaluacionInicio;
    
    @Column(name = "evaluacion_fin", nullable = false)
    private LocalDateTime evaluacionFin;
    
    @Column(name = "dictamen_inicio", nullable = false)
    private LocalDateTime dictamenInicio;
    
    @Column(name = "dictamen_fin", nullable = false)
    private LocalDateTime dictamenFin;
    
    @Column(name = "evento_inicio", nullable = false)
    private LocalDateTime eventoInicio;
    
    @Column(name = "evento_fin", nullable = false)
    private LocalDateTime eventoFin;

    @ToString.Exclude
    @OneToOne
    @MapsId
    @JoinColumn(name = "id_congreso", referencedColumnName = "id_congreso")
    private Congreso congreso;
}
