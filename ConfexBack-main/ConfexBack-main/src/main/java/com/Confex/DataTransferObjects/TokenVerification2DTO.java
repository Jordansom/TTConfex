
package com.Confex.DataTransferObjects;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TokenVerification2DTO {
    @NotNull(message = "Se necesita el ID de usuario.")
    private Integer idUsuario;
    
    @NotBlank(message = "El correo es obligatorio.")
    private String correo;
    
    @NotBlank(message = "El token es obligatorio.")
    private String token;
}
