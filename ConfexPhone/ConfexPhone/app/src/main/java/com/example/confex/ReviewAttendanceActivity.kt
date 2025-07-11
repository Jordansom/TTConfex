package com.example.confex

import android.os.Bundle
import android.text.InputType
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.*
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView

class ReviewAttendanceActivity : AppCompatActivity() {
    private lateinit var recyclerView: RecyclerView
    private lateinit var adapter: ReviewAttendanceAdapter
    private lateinit var btnSaveChanges: Button
    private lateinit var progressBar: ProgressBar
    private lateinit var statusTextView: TextView

    private lateinit var attendanceManager: AttendanceManager
    private var attendanceRecords = mutableListOf<AttendanceRecord>()
    private var filePath: String = ""

    companion object {
        private const val TAG = "ReviewAttendanceActivity"
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        try {
            setContentView(R.layout.activity_review_attendance)
            Log.d(TAG, "Activity created successfully")
            
            initializeViews()
            getIntentData()
            
            if (filePath.isEmpty()) {
                Log.e(TAG, "File path is empty")
                showErrorAndFinish("Ruta de archivo no válida")
                return
            }
            
            setupRecyclerView()
            loadAttendanceData()
            setupButtons()
            
        } catch (e: Exception) {
            Log.e(TAG, "Error in onCreate: ${e.message}", e)
            showErrorAndFinish("Error al inicializar la actividad: ${e.message}")
        }
    }

    private fun initializeViews() {
        try {
            recyclerView = findViewById(R.id.recyclerViewReview)
            btnSaveChanges = findViewById(R.id.btnSaveChanges)
            progressBar = findViewById(R.id.progressBar)
            statusTextView = findViewById(R.id.tvStatus)
            
            // Ocultar botón de sincronización si existe
            findViewById<Button>(R.id.btnSyncWithServer)?.visibility = View.GONE
            
            Log.d(TAG, "Views initialized successfully")
        } catch (e: Exception) {
            Log.e(TAG, "Error initializing views: ${e.message}", e)
            throw e
        }
    }

    private fun getIntentData() {
        filePath = intent.getStringExtra("FILE_PATH") ?: ""
        Log.d(TAG, "File path received: $filePath")
        
        if (filePath.isNotEmpty()) {
            attendanceManager = AttendanceManager(filePath)
            supportActionBar?.title = "Revisar Asistencias"
        }
    }

    private fun setupRecyclerView() {
        try {
            adapter = ReviewAttendanceAdapter(
                attendanceRecords,
                onEditHours = { record -> showEditHoursDialog(record) },
                onDeleteRecord = { record -> showDeleteConfirmation(record) }
            )
            recyclerView.layoutManager = LinearLayoutManager(this)
            recyclerView.adapter = adapter
            Log.d(TAG, "RecyclerView setup completed")
        } catch (e: Exception) {
            Log.e(TAG, "Error setting up RecyclerView: ${e.message}", e)
            throw e
        }
    }

    private fun loadAttendanceData() {
        try {
            attendanceRecords.clear()
            val records = attendanceManager.getAllRecords()
            attendanceRecords.addAll(records)
            adapter.notifyDataSetChanged()
            statusTextView.text = "Total de registros: ${attendanceRecords.size}"
            Log.d(TAG, "Loaded ${attendanceRecords.size} attendance records")
        } catch (e: Exception) {
            Log.e(TAG, "Error loading attendance data: ${e.message}", e)
            showErrorMessage("Error al cargar los datos: ${e.message}")
        }
    }

    private fun setupButtons() {
        btnSaveChanges.setOnClickListener {
            saveChangesToFile()
        }
    }

    private fun showEditHoursDialog(record: AttendanceRecord) {
        try {
            val builder = AlertDialog.Builder(this)
            builder.setTitle("Editar Horas Acumuladas")
            builder.setMessage("${record.nombre} ${record.apellidoPaterno}")

            val input = EditText(this)
            // Permitir números decimales
            input.inputType = InputType.TYPE_CLASS_NUMBER or InputType.TYPE_NUMBER_FLAG_DECIMAL
            input.setText(String.format("%.2f", record.horasAcumuladas))
            builder.setView(input)

            builder.setPositiveButton("Guardar") { _, _ ->
                try {
                    val newHours = input.text.toString().toDoubleOrNull()
                    if (newHours != null && newHours >= 0) {
                        record.horasAcumuladas = newHours
                        adapter.notifyDataSetChanged()
                        Toast.makeText(this, "Horas actualizadas", Toast.LENGTH_SHORT).show()
                    } else {
                        Toast.makeText(this, "Ingrese un número válido", Toast.LENGTH_SHORT).show()
                    }
                } catch (e: Exception) {
                    Log.e(TAG, "Error updating hours: ${e.message}", e)
                    Toast.makeText(this, "Error al actualizar horas", Toast.LENGTH_SHORT).show()
                }
            }

            builder.setNegativeButton("Cancelar", null)
            builder.show()
        } catch (e: Exception) {
            Log.e(TAG, "Error showing edit dialog: ${e.message}", e)
            showErrorMessage("Error al mostrar el diálogo de edición")
        }
    }

    private fun showDeleteConfirmation(record: AttendanceRecord) {
        try {
            AlertDialog.Builder(this)
                .setTitle("Eliminar Registro")
                .setMessage("¿Estás seguro de que quieres eliminar el registro de ${record.nombre} ${record.apellidoPaterno}?")
                .setPositiveButton("Eliminar") { _, _ ->
                    try {
                        attendanceRecords.remove(record)
                        adapter.notifyDataSetChanged()
                        statusTextView.text = "Total de registros: ${attendanceRecords.size}"
                        Toast.makeText(this, "Registro eliminado", Toast.LENGTH_SHORT).show()
                    } catch (e: Exception) {
                        Log.e(TAG, "Error deleting record: ${e.message}", e)
                        Toast.makeText(this, "Error al eliminar registro", Toast.LENGTH_SHORT).show()
                    }
                }
                .setNegativeButton("Cancelar", null)
                .show()
        } catch (e: Exception) {
            Log.e(TAG, "Error showing delete confirmation: ${e.message}", e)
            showErrorMessage("Error al mostrar confirmación de eliminación")
        }
    }

    private fun saveChangesToFile() {
        try {
            attendanceManager.updateAllRecords(attendanceRecords)
            Toast.makeText(this, "Cambios guardados exitosamente", Toast.LENGTH_SHORT).show()
            setResult(RESULT_OK)
        } catch (e: Exception) {
            Log.e(TAG, "Error saving changes: ${e.message}", e)
            Toast.makeText(this, "Error al guardar: ${e.message}", Toast.LENGTH_SHORT).show()
        }
    }

    private fun showErrorMessage(message: String) {
        Toast.makeText(this, message, Toast.LENGTH_LONG).show()
    }

    private fun showErrorAndFinish(message: String) {
        Toast.makeText(this, message, Toast.LENGTH_LONG).show()
        finish()
    }
}

class ReviewAttendanceAdapter(
    private val records: List<AttendanceRecord>,
    private val onEditHours: (AttendanceRecord) -> Unit,
    private val onDeleteRecord: (AttendanceRecord) -> Unit
) : RecyclerView.Adapter<ReviewAttendanceAdapter.ViewHolder>() {

    companion object {
        private const val TAG = "ReviewAttendanceAdapter"
    }

    class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val tvName: TextView = view.findViewById(R.id.tvName)
        val tvRole: TextView = view.findViewById(R.id.tvRole)
        val tvEntryTime: TextView = view.findViewById(R.id.tvEntryTime)
        val tvExitTime: TextView = view.findViewById(R.id.tvExitTime)
        val tvHours: TextView = view.findViewById(R.id.tvHours)
        val btnEditHours: Button = view.findViewById(R.id.btnEditHours)
        val btnDelete: Button = view.findViewById(R.id.btnDelete)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        try {
            val view = LayoutInflater.from(parent.context)
                .inflate(R.layout.item_review_attendance, parent, false)
            return ViewHolder(view)
        } catch (e: Exception) {
            Log.e(TAG, "Error creating ViewHolder: ${e.message}", e)
            throw e
        }
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        try {
            val record = records[position]

            holder.tvName.text = "${record.nombre} ${record.apellidoPaterno} ${record.apellidoMaterno}"
            holder.tvRole.text = "Rol: ${record.rol}"
            holder.tvEntryTime.text = "Entrada: ${record.horaEntrada}"
            holder.tvExitTime.text = "Salida: ${record.horaSalida ?: "No registrada"}"
            holder.tvHours.text = "Horas: ${String.format("%.2f", record.horasAcumuladas)}"

            holder.btnEditHours.setOnClickListener { onEditHours(record) }
            holder.btnDelete.setOnClickListener { onDeleteRecord(record) }
        } catch (e: Exception) {
            Log.e(TAG, "Error binding ViewHolder at position $position: ${e.message}", e)
        }
    }

    override fun getItemCount() = records.size
}

data class AttendanceRecord(
    val id: String,
    val nombre: String,
    val apellidoPaterno: String,
    val apellidoMaterno: String,
    val rol: String,
    val horaEntrada: String,
    var horaSalida: String?,
    var horasAcumuladas: Double
)