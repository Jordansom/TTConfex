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
public class AdminDeleteTematicasDTO {
    @NotNull(message = "El ID del administrador es obligatorio.")
    private Integer idAdmin;
    
    @NotNull(message = "El ID de la temática es obligatorio.")
    private Integer idTematica;
}
