package com.Confex.DataTransferObjects;

public class AsistenteDTO {
    private Integer idAsistente;
    private Integer idCongreso;
    private Integer idUsuario;
    private Boolean beifi;
    private UsuarioDTO usuario;
    
    // Constructors
    public AsistenteDTO() {}
    
    public AsistenteDTO(Integer idAsistente, Integer idCongreso, Integer idUsuario, Boolean beifi) {
        this.idAsistente = idAsistente;
        this.idCongreso = idCongreso;
        this.idUsuario = idUsuario;
        this.beifi = beifi;
    }
    
    // Getters and Setters
    public Integer getIdAsistente() {
        return idAsistente;
    }
    
    public void setIdAsistente(Integer idAsistente) {
        this.idAsistente = idAsistente;
    }
    
    public Integer getIdCongreso() {
        return idCongreso;
    }
    
    public void setIdCongreso(Integer idCongreso) {
        this.idCongreso = idCongreso;
    }
    
    public Integer getIdUsuario() {
        return idUsuario;
    }
    
    public void setIdUsuario(Integer idUsuario) {
        this.idUsuario = idUsuario;
    }
    
    public Boolean getBeifi() {
        return beifi;
    }
    
    public void setBeifi(Boolean beifi) {
        this.beifi = beifi;
    }
    
    public UsuarioDTO getUsuario() {
        return usuario;
    }
    
    public void setUsuario(UsuarioDTO usuario) {
        this.usuario = usuario;
    }
}

