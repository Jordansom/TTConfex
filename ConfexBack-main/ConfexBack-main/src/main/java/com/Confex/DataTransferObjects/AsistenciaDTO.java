package com.Confex.DataTransferObjects;

import java.math.BigDecimal;

public class AsistenciaDTO {
    private Integer idAsistencia;
    private Integer idAsistente;
    private BigDecimal horas;
    private String horaEntrada;
    private String horaSalida;
    private AsistenteDTO asistente;
    
    // Constructors
    public AsistenciaDTO() {}
    
    public AsistenciaDTO(Integer idAsistencia, Integer idAsistente, BigDecimal horas, String horaEntrada, String horaSalida) {
        this.idAsistencia = idAsistencia;
        this.idAsistente = idAsistente;
        this.horas = horas;
        this.horaEntrada = horaEntrada;
        this.horaSalida = horaSalida;
    }
    
    // Getters and Setters
    public Integer getIdAsistencia() {
        return idAsistencia;
    }
    
    public void setIdAsistencia(Integer idAsistencia) {
        this.idAsistencia = idAsistencia;
    }
    
    public Integer getIdAsistente() {
        return idAsistente;
    }
    
    public void setIdAsistente(Integer idAsistente) {
        this.idAsistente = idAsistente;
    }
    
    public BigDecimal getHoras() {
        return horas;
    }
    
    public void setHoras(BigDecimal horas) {
        this.horas = horas;
    }
    
    public String getHoraEntrada() {
        return horaEntrada;
    }
    
    public void setHoraEntrada(String horaEntrada) {
        this.horaEntrada = horaEntrada;
    }
    
    public String getHoraSalida() {
        return horaSalida;
    }
    
    public void setHoraSalida(String horaSalida) {
        this.horaSalida = horaSalida;
    }
    
    public AsistenteDTO getAsistente() {
        return asistente;
    }
    
    public void setAsistente(AsistenteDTO asistente) {
        this.asistente = asistente;
    }
}
