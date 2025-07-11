package com.Confex.DataTransferObjects;

import java.util.List;
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
public class BajaCongresoDTO {
    
    @NotBlank(message = "El nombre del congreso es obligatorio.")
    private String nombreCongreso;
    
    @NotNull(message = "La lista de roles es obligatoria.")
    private List<String> roles;
}
