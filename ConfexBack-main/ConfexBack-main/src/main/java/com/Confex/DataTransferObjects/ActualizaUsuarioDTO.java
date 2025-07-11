package com.Confex.DataTransferObjects;

import javax.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActualizaUsuarioDTO {
    
    @NotNull(message = "El ID es obligatorio.")
    private Integer idUsuario;
    
    private String nombre;
    private String apellidoPaterno;
    private String apellidoMaterno;
    private String nombreUsuario;    
    private String correo;    
    private String telefono;    
    private String password;    
    private String confirmPassword;         
}