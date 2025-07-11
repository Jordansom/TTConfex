package com.Confex.DataTransferObjects;

import javax.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NuevoUsuarioDTO {
    
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
    
    @NotBlank(message = "La contraseña es obligatoria.")
    private String password;
    
    private String confirmPassword;
    
    private String token;
}
