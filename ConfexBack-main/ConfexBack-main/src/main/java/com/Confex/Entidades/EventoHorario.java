package com.Confex.Entidades;

import java.time.LocalTime;
import javax.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "eventos_horario")
public class EventoHorario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_evento")
    private Integer idEvento;

    @Column(name = "id_horario", nullable = false)
    private Integer idHorario;

    @Column(name = "titulo", nullable = false)
    private String titulo;

    @Column(name = "tipo", nullable = false)
    private String tipo;

    @Column(name = "hora_inicio", nullable = false)
    private LocalTime horaInicio;

    @Column(name = "duracion", nullable = false)
    private Integer duracion;

    @Column(name = "color", length = 7)
    private String color;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_horario", insertable = false, updatable = false)
    private HorarioCongreso horario;

    @Column(name = "id_sala")
    private Integer idSala;

    public Integer getIdSala() {
        return idSala;
    }

    public void setIdSala(Integer idSala) {
        this.idSala = idSala;
    }
}