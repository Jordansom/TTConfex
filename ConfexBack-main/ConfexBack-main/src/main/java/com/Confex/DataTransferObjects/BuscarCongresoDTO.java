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
public class BuscarCongresoDTO {
    @NotNull(message = "El ID es obligatorio.")
    private Integer idUsuario;
}
