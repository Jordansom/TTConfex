package com.example.confex

import android.content.Intent
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import com.example.confex.databinding.ActivityMainBinding

class MainActivity : AppCompatActivity() {
    private lateinit var binding: ActivityMainBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupButtons()
        setupUI()
    }

    private fun setupUI() {
        // Solo mostrar texto fijo, sin selección de congreso ni modo offline
        binding.tvSelectedCongreso?.text = "Gestor de Asistencia Local"
        binding.btnSelectCongreso?.isEnabled = false
        binding.btnSelectCongreso?.text = "Sincronización deshabilitada"
        binding.btnNewList.isEnabled = true
        binding.btnContinueList?.isEnabled = true
        binding.btnViewFiles?.isEnabled = true
    }

    private fun setupButtons() {
        // Botón para nueva lista
        binding.btnNewList.setOnClickListener {
            val intent = Intent(this, ScanActivity::class.java)
            intent.putExtra("MODE", "NEW")
            startActivity(intent)
        }

        // Botón para continuar lista existente
        binding.btnContinueList?.setOnClickListener {
            val intent = Intent(this, FileSelectionActivity::class.java)
            startActivity(intent)
        }

        // Botón para ver archivos
        binding.btnViewFiles?.setOnClickListener {
            val intent = Intent(this, FileSelectionActivity::class.java)
            intent.putExtra("VIEW_ONLY", true)
            startActivity(intent)
        }

        // Botón de logout (opcional, puede ocultarse si no hay login)
        binding.btnLogout?.setOnClickListener {
            AlertDialog.Builder(this)
                .setTitle("Cerrar Sesión")
                .setMessage("¿Estás seguro de que deseas cerrar la aplicación?")
                .setPositiveButton("Sí") { _, _ ->
                    finishAffinity()
                }
                .setNegativeButton("No", null)
                .show()
        }
    }
}