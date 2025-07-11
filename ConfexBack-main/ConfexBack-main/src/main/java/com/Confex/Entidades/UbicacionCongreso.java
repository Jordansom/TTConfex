package com.Confex.Entidades;

import java.io.Serializable;
import java.math.BigDecimal;
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
@Table(name = "ubicacion_congresos")
public class UbicacionCongreso implements Serializable {
    
    private static final long serialVersionUID = 1L;
    
    @EqualsAndHashCode.Include
    @Id
    @Column(name = "id_congreso")
    private Integer idCongreso;
    
    @Column(nullable = false, precision = 9, scale = 6)
    private BigDecimal latitud;
    
    @Column(nullable = false, precision = 9, scale = 6)
    private BigDecimal longitud;
    
    @ToString.Exclude
    @OneToOne
    @MapsId
    @JoinColumn(name = "id_congreso", referencedColumnName = "id_congreso")
    private Congreso congreso;
}
