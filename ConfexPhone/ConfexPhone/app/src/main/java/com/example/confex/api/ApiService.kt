package com.example.confex.api

import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.POST
import retrofit2.http.Path

interface ApiService {
    @POST("LogIn/buscar")
    suspend fun login(@Body loginData: LogInDTO): Response<UsuarioDTO>

    @POST("Congresos/buscarRegistrador")
    suspend fun getMisCongresos(@Body data: Map<String, Int>): Response<List<CongresoDTO>>

    @POST("Congresos/registrador/asistencia/{idCongreso}/registrar")
    suspend fun registrarAsistente(
        @Path("idCongreso") idCongreso: Int,
        @Body data: Map<String, Any>
    ): Response<AsistenteResponseDTO>

    @POST("Congresos/registrador/asistencia/{idCongreso}")
    suspend fun subirAsistencias(
        @Path("idCongreso") idCongreso: Int,
        @Body asistencias: List<Map<String, Any>>
    ): Response<String>

    @POST("Congresos/registrador/asistencia/{idCongreso}/verificar")
    suspend fun verificarAsistentes(
        @Path("idCongreso") idCongreso: Int,
        @Body data: Map<String, List<Int>>
    ): Response<Map<String, List<AsistenteVerificacionDTO>>>
}

data class AsistenteResponseDTO(
    val mensaje: String,
    val asistente: AsistenteDetalleDTO
)

data class AsistenteDetalleDTO(
    val idAsistente: Int,
    val usuario: UsuarioBasicoDTO,
    val horasAcumuladas: Double
)

data class UsuarioBasicoDTO(
    val idUsuario: Int,
    val nombre: String,
    val apellidoPaterno: String,
    val apellidoMaterno: String
)

data class AsistenteVerificacionDTO(
    val idUsuario: Int,
    val registrado: Boolean
)
