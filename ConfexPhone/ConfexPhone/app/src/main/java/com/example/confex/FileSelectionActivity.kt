package com.example.confex

import android.content.Intent
import android.os.Bundle
import android.os.Environment
import android.view.MenuItem
import android.view.View
import android.widget.EditText
import android.widget.PopupMenu
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.widget.Toolbar
import androidx.core.content.FileProvider
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import java.io.File

class FileSelectionActivity : AppCompatActivity() {

    private lateinit var fileAdapter: FileAdapter
    private lateinit var recyclerView: RecyclerView
    private var csvFiles = mutableListOf<File>()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_file_selection)

        // Toolbar back button
        findViewById<Toolbar>(R.id.toolbar)?.setNavigationOnClickListener {
            finish()
        }

        recyclerView = findViewById(R.id.rvFiles)
        recyclerView.layoutManager = LinearLayoutManager(this)

        loadCsvFiles()

        fileAdapter = FileAdapter(csvFiles,
            onFileClick = { file ->
                val intent = Intent(this, ScanActivity::class.java)
                intent.putExtra("MODE", "CONTINUE")
                intent.putExtra("FILE_PATH", file.absolutePath)
                startActivity(intent)
            },
            onFileMenuClick = { file, anchorView ->
                showFileMenu(file, anchorView)
            }
        )

        recyclerView.adapter = fileAdapter
    }

    private fun loadCsvFiles() {
        csvFiles.clear()
        val directory = getExternalFilesDir(Environment.DIRECTORY_DOCUMENTS)
        if (directory != null && directory.exists()) {
            val files = directory.listFiles()
            files?.forEach { file ->
                if (file.name.endsWith(".csv")) {
                    csvFiles.add(file)
                }
            }
            if (csvFiles.isEmpty()) {
                Toast.makeText(this, "No se encontraron archivos CSV", Toast.LENGTH_SHORT).show()
            }
        } else {
            Toast.makeText(this, "No se pudo acceder al directorio", Toast.LENGTH_SHORT).show()
        }
    }

    private fun showFileMenu(file: File, anchorView: View) {
        val popup = PopupMenu(this, anchorView)
        popup.menu.add("Cambiar nombre")
        popup.menu.add("Ver tabla")
        popup.menu.add("Compartir")
        popup.setOnMenuItemClickListener { menuItem: MenuItem ->
            when (menuItem.title) {
                "Cambiar nombre" -> showRenameDialog(file)
                "Ver tabla" -> {
                    if (file.exists()) {
                        val uri = FileProvider.getUriForFile(
                            this,
                            "${applicationContext.packageName}.provider",
                            file
                        )
                        val intent = Intent(Intent.ACTION_VIEW).apply {
                            setDataAndType(uri, "text/csv")
                            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                        }
                        // Mostrar el chooser para que el usuario elija la app
                        startActivity(Intent.createChooser(intent, "Abrir archivo CSV con..."))
                    } else {
                        Toast.makeText(this, "El archivo no existe", Toast.LENGTH_SHORT).show()
                    }
                }
                "Compartir" -> shareFile(file)
            }
            true
        }
        popup.show()
    }

    private fun showRenameDialog(file: File) {
        val input = EditText(this)
        input.setText(file.nameWithoutExtension)
        AlertDialog.Builder(this)
            .setTitle("Cambiar nombre")
            .setView(input)
            .setPositiveButton("Guardar") { _, _ ->
                val newName = input.text.toString().trim()
                if (newName.isNotBlank()) {
                    val newFile = File(file.parent, "$newName.csv")
                    if (file.renameTo(newFile)) {
                        Toast.makeText(this, "Archivo renombrado", Toast.LENGTH_SHORT).show()
                        loadCsvFiles()
                        fileAdapter.updateFiles(csvFiles)
                    } else {
                        Toast.makeText(this, "No se pudo renombrar", Toast.LENGTH_SHORT).show()
                    }
                }
            }
            .setNegativeButton("Cancelar", null)
            .show()
    }

    private fun shareFile(file: File) {
        val uri = FileProvider.getUriForFile(
            this,
            "${applicationContext.packageName}.provider",
            file
        )
        val intent = Intent(Intent.ACTION_SEND).apply {
            type = "text/csv"
            putExtra(Intent.EXTRA_STREAM, uri)
            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
        }
        startActivity(Intent.createChooser(intent, "Compartir archivo CSV"))
    }
}