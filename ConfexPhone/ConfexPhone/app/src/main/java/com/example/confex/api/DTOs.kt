package com.example.confex.api
data class LogInDTO(
    val identifier: String,
    val password: String
)

data class UsuarioDTO(
    val idUsuario: Int,
    val nombre: String,
    val apellidoPaterno: String,
    val apellidoMaterno: String,
    val nombreUsuario: String,
    val correo: String,
    val telefono: String?,
    val fotoUsuarioBase64: String?,
    val administrador: Boolean,
    val organizador: Boolean,
    val evaluador: Boolean,
    val conferencista: Boolean,
    val ponente: Boolean,
    val registrador: Boolean
)
data class CongresoDTO(
    val idCongreso: Int,
    val nombreCongreso: String,
    val fechasCongreso: FechasCongresoDTO
)

data class FechasCongresoDTO(
    val eventoInicio: String,
    val eventoFin: String
)

data class ErrorResponse(
    val error: String
)