package com.example.confex.auth
import com.example.confex.api.*
import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.*
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import com.google.gson.Gson

private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "user_preferences")

class UserManager(private val context: Context) {
    private val gson = Gson()

    companion object {
        private val USER_DATA_KEY = stringPreferencesKey("user_data")
        private val IS_LOGGED_IN_KEY = booleanPreferencesKey("is_logged_in")
    }

    suspend fun saveUser(usuario: UsuarioDTO) {
        context.dataStore.edit { preferences ->
            preferences[USER_DATA_KEY] = gson.toJson(usuario)
            preferences[IS_LOGGED_IN_KEY] = true
        }
    }

    suspend fun logout() {
        context.dataStore.edit { preferences ->
            preferences.remove(USER_DATA_KEY)
            preferences[IS_LOGGED_IN_KEY] = false
        }
    }

    val usuario: Flow<UsuarioDTO?> = context.dataStore.data.map { preferences ->
        preferences[USER_DATA_KEY]?.let { json ->
            try {
                gson.fromJson(json, UsuarioDTO::class.java)
            } catch (e: Exception) {
                null
            }
        }
    }

    val isLoggedIn: Flow<Boolean> = context.dataStore.data.map { preferences ->
        preferences[IS_LOGGED_IN_KEY] ?: false
    }
}