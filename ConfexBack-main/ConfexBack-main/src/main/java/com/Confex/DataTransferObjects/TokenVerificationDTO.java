package com.Confex.DataTransferObjects;

import javax.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TokenVerificationDTO {
    @NotBlank(message = "Se necesita el nombre de usuario o correo electronico.")
    private String identifier;
    
    @NotBlank(message = "El token es obligatorio.")
    private String token;
}
