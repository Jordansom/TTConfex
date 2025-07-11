package com.example.confex.auth
import com.example.confex.api.*
// 6. Repository para manejo de datos
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class AuthRepository {
    private val apiService = ApiClient.apiService

    suspend fun login(identifier: String, password: String): Result<UsuarioDTO> {
        return withContext(Dispatchers.IO) {
            try {
                val loginDTO = LogInDTO(identifier, password)
                val response = apiService.login(loginDTO)

                if (response.isSuccessful) {
                    response.body()?.let { usuario ->
                        Result.success(usuario)
                    } ?: Result.failure(Exception("Respuesta vacía del servidor"))
                } else {
                    // Manejar errores del servidor
                    val errorMessage = when (response.code()) {
                        400 -> "Credenciales incorrectas"
                        500 -> "Error interno del servidor"
                        else -> "Error de conexión: ${response.code()}"
                    }
                    Result.failure(Exception(errorMessage))
                }
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
    }
}