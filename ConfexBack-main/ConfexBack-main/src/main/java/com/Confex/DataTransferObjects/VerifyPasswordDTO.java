package com.Confex.DataTransferObjects;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VerifyPasswordDTO {
    @NotNull(message = "Se necesita el ID de usuario.")
    private Integer idUsuario;
    
    @NotBlank(message = "La contraseña es obligatoria.")
    private String password;
}
