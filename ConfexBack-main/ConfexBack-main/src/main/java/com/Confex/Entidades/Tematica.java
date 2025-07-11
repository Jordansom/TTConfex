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
import javax.persistence.PreRemove;
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
    name = "tematicas",
    uniqueConstraints = { 
        @UniqueConstraint(columnNames = "nombre")
    }
)
public class Tematica implements Serializable {
    
    private static final long serialVersionUID = 1L;
    
    @EqualsAndHashCode.Include
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_tematica")
    private Integer idTematica;
    
    @Column(nullable = false)
    private String nombre;
    
    @JsonIgnore
    @ToString.Exclude
    @OneToMany(mappedBy = "tematica", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<CongresoTematica> congresoTematicas = new HashSet<>();
    
    @JsonIgnore
    @ToString.Exclude
    @OneToMany(mappedBy = "tematica", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<EvaluadorTematica> evaluadorTematicas = new HashSet<>();

    @PreRemove
    private void preRemove() {
        new HashSet<>(congresoTematicas).stream().map(ct -> {
            ct.getCongreso().getCongresoTematicas().remove(ct);
            return ct;
        }).forEachOrdered(ct -> {
            congresoTematicas.remove(ct);
        });
        
        new HashSet<>(evaluadorTematicas).stream().map(et -> {
            et.getEvaluador().getEvaluadorTematicas().remove(et);
            return et;
        }).forEachOrdered(et -> {
            evaluadorTematicas.remove(et);
        });
    }
}
