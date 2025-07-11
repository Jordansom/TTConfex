package com.Confex.DataTransferObjects;

import javax.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VerifyAccountDTO {
    
    @NotBlank(message = "El nombre de usuario es obligatorio.")
    private String nombreUsuario;
    
    @NotBlank(message = "El correo es obligatorio.")
    private String correo;
}
