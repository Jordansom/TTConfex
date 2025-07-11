package com.example.confex.auth
import com.example.confex.api.*
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class LoginViewModel(
    private val authRepository: AuthRepository,
    private val userManager: UserManager
) : ViewModel() {

    private val _loginState = MutableStateFlow<LoginState>(LoginState.Initial)
    val loginState: StateFlow<LoginState> = _loginState

    private val _usuario = MutableStateFlow<UsuarioDTO?>(null)
    val usuario: StateFlow<UsuarioDTO?> = _usuario

    init {
        // Observar el estado de login al iniciar
        viewModelScope.launch {
            userManager.usuario.collect { user ->
                _usuario.value = user
            }
        }
    }

    fun login(identifier: String, password: String) {
        viewModelScope.launch {
            _loginState.value = LoginState.Loading

            authRepository.login(identifier, password).fold(
                onSuccess = { usuario ->
                    userManager.saveUser(usuario)
                    _usuario.value = usuario
                    _loginState.value = LoginState.Success(usuario)
                },
                onFailure = { exception ->
                    _loginState.value = LoginState.Error(exception.message ?: "Error desconocido")
                }
            )
        }
    }

    fun logout() {
        viewModelScope.launch {
            userManager.logout()
            _usuario.value = null
            _loginState.value = LoginState.Initial
        }
    }

    fun clearError() {
        _loginState.value = LoginState.Initial
    }
}

sealed class LoginState {
    object Initial : LoginState()
    object Loading : LoginState()
    data class Success(val usuario: UsuarioDTO) : LoginState()
    data class Error(val message: String) : LoginState()
}