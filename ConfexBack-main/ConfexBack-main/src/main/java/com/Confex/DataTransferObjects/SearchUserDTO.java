package com.Confex.DataTransferObjects;

import javax.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SearchUserDTO {
    @NotBlank(message = "Se necesita el nombre de usuario o correo electronico.")
    private String identifier;
}
