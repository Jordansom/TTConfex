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
public class AdminOrganizadoresDTO {
    @NotNull(message = "El ID del administrador es obligatorio.")
    private Integer idAdmin;
    
    private String identificadorUsuario;
    private Boolean organizador;
}
