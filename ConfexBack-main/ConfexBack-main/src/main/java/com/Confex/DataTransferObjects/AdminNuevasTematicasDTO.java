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
public class AdminNuevasTematicasDTO {
    @NotNull(message = "El ID del administrador es obligatorio.")
    private Integer idAdmin;
    
    @NotBlank(message = "El nombre de la tematica es obligatorio.")
    private String nombre;
}
