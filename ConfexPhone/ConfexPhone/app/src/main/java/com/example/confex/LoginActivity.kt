package com.example.confex

import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity

class LoginActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // Ir directo a MainActivity, login deshabilitado
        val intent = Intent(this, MainActivity::class.java)
        startActivity(intent)
        finish()
    }
}