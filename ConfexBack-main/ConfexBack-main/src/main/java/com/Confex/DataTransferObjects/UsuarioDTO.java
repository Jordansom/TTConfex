package com.Confex.DataTransferObjects;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UsuarioDTO {
    
    @NotNull(message = "El ID es obligatorio.")
    private Integer idUsuario;

    @NotBlank(message = "El nombre es obligatorio.")
    private String nombre;

    @NotBlank(message = "El apellido paterno es obligatorio.")
    private String apellidoPaterno;

    @NotBlank(message = "El apellido materno es obligatorio.")
    private String apellidoMaterno;

    @NotBlank(message = "El nombre de usuario es obligatorio.")
    private String nombreUsuario;

    @NotBlank(message = "El correo es obligatorio.")
    private String correo;

    @NotNull(message = "La comprobación de administrador es obligatoria.")
    private Boolean administrador;

    @NotNull(message = "La comprobación de organizador es obligatoria.")
    private Boolean organizador;
    
    @NotNull(message = "La comprobación de evaluador es obligatoria.")
    private Boolean evaluador;
    
    @NotNull(message = "La comprobación de conferencista es obligatoria.")
    private Boolean conferencista;
    
    @NotNull(message = "La comprobación de ponente es obligatoria.")
    private Boolean ponente;
    
    @NotNull(message = "La comprobación de registrador es obligatoria.")
    private Boolean registrador;

    private String telefono;
    private String fotoUsuarioUrl;
}
