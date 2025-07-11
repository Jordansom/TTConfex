package com.Confex.DataTransferObjects;

import com.Confex.Entidades.Tematica;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.Accessors;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Accessors(chain = true)
public class CongresoDTO {
    
    @NotNull(message = "El ID del congreso es obligatorio")
    private Integer idCongreso;
    
    @NotNull(message = "El ID del usuario es obligatorio")
    private Integer idUsuario;

    private String fotoCongresoUrl;

    @NotBlank(message = "El nombre del congreso es obligatorio")
    private String nombreCongreso;

    @NotNull(message = "Las horas mínimas son obligatorias")
    @Min(value = 1, message = "Debe haber al menos una hora mínima de asistencia")
    private Integer horasMinimas;

    private String correoContacto;
    private String telefonoContacto;
    private String sitioWeb;

    @NotNull(message = "Las fechas del congreso son obligatorias")
    private FechasCongresoDTO fechasCongreso;

    @NotNull(message = "Las temáticas del congreso son obligatorias")
    private TematicasDTO tematicas;

    @NotNull(message = "La ubicación del congreso es obligatoria")
    private UbicacionDTO ubicacion;

    @NotEmpty(message = "Debe asignarse al menos un miembro del staff")
    private List<StaffDTO> staff;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FechasCongresoDTO {
        @NotNull private LocalDateTime convocatoriaInicio;
        @NotNull private LocalDateTime convocatoriaFin;
        @NotNull private LocalDateTime evaluacionInicio;
        @NotNull private LocalDateTime evaluacionFin;
        @NotNull private LocalDateTime dictamenInicio;
        @NotNull private LocalDateTime dictamenFin;
        @NotNull private LocalDateTime eventoInicio;
        @NotNull private LocalDateTime eventoFin;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TematicasDTO {
        @NotEmpty(message = "Debe seleccionar al menos una temática")
        private List<Tematica> tematicas;

        private List<String> tematicasExtra;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UbicacionDTO {
        @NotNull(message = "Latitud requerida")
        private BigDecimal latitud;

        @NotNull(message = "Longitud requerida")
        private BigDecimal longitud;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StaffDTO {
        
        @NotNull(message = "El ID del usuario es obligatorio")
        private Integer idUsuario;

        private String nombre;
        private String apellidoPaterno;
        private String apellidoMaterno;
        private String correo;
        private String nombreUsuario;
        private String telefono;
        private boolean evaluador;
        private boolean registrador;
        private boolean conferencista;
        private boolean ponente;
        private List<Integer> tematicasEvaluador = new ArrayList<>();
    }
}
