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
public class EliminaUsuarioDTO {
    @NotNull(message = "El ID de usuario es obligatorio.")
    private Integer idUsuario;
    
    @NotBlank(message = "La contraseña es obligatoria.")
    private String password;
}
