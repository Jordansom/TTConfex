package com.example.confex

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Bundle
import android.os.Environment
import android.text.InputType
import android.util.Log
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.camera.core.*
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.view.PreviewView
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.lifecycle.lifecycleScope
import com.google.mlkit.vision.barcode.BarcodeScanner
import com.google.mlkit.vision.barcode.BarcodeScannerOptions
import com.google.mlkit.vision.barcode.BarcodeScanning
import com.google.mlkit.vision.barcode.common.Barcode
import com.google.mlkit.vision.common.InputImage
import kotlinx.coroutines.launch
import org.json.JSONObject
import java.io.File
import java.text.SimpleDateFormat
import java.util.*
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors
import android.os.Handler
import android.os.Looper

class ScanActivity : AppCompatActivity() {
    private lateinit var cameraExecutor: ExecutorService
    private lateinit var previewView: PreviewView
    private lateinit var attendanceManager: AttendanceManager
    private lateinit var scanModeButton: Button
    private lateinit var statusTextView: TextView
    private lateinit var btnReviewAttendance: Button
    private var scanMode = ScanMode.CHECK_IN
    private var imageAnalyzer: ImageAnalysis? = null
    private var cameraProvider: ProcessCameraProvider? = null
    private var currentFilePath: String = ""

    private var isProcessingQR = false

    enum class ScanMode {
        CHECK_IN, CHECK_OUT
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_scan)

        previewView = findViewById(R.id.previewView)
        scanModeButton = findViewById(R.id.btnScanMode)
        statusTextView = findViewById(R.id.tvStatus)
        btnReviewAttendance = findViewById(R.id.btnReviewAttendance)

        // Manejar el botón de regreso de la Toolbar
        findViewById<androidx.appcompat.widget.Toolbar>(R.id.toolbar)?.setNavigationOnClickListener {
            showSaveDialogOrFinish()
        }

        // Solo modo local, sin congreso ni offline
        val mode = intent.getStringExtra("MODE") ?: "NEW"

        if (mode == "NEW") {
            showFileNameDialog()
        } else {
            val filePath = intent.getStringExtra("FILE_PATH")
            if (filePath != null) {
                currentFilePath = filePath
                attendanceManager = AttendanceManager(filePath)
                Toast.makeText(this, "Usando archivo existente", Toast.LENGTH_SHORT).show()
                setupCameraAndUI()
            } else {
                Toast.makeText(this, "Error: No se especificó un archivo", Toast.LENGTH_SHORT).show()
                finish()
            }
        }

        cameraExecutor = Executors.newSingleThreadExecutor()
    }

    private fun showFileNameDialog() {
        val builder = AlertDialog.Builder(this)
        builder.setTitle("Nombre del archivo")
        builder.setMessage("Archivo nuevo de asistencia")

        val input = EditText(this)
        input.inputType = InputType.TYPE_CLASS_TEXT
        val currentDate = SimpleDateFormat("yyyyMMdd", Locale.getDefault()).format(Date())
        val suggestedName = "asistencia_$currentDate"
        input.setText(suggestedName)
        builder.setView(input)

        builder.setPositiveButton("OK") { _, _ ->
            var fileName = input.text.toString().trim()
            if (fileName.isBlank()) {
                fileName = suggestedName
            }

            // Clean filename (remove invalid characters)
            fileName = fileName.replace(Regex("[^a-zA-Z0-9_\\-]"), "_")

            if (!fileName.endsWith(".csv")) {
                fileName = "$fileName.csv"
            }

            val directory = getExternalFilesDir(Environment.DIRECTORY_DOCUMENTS)
            val file = File(directory, fileName)
            currentFilePath = file.absolutePath
            attendanceManager = AttendanceManager(file.absolutePath)

            Toast.makeText(this, "Nuevo archivo creado: $fileName", Toast.LENGTH_SHORT).show()
            setupCameraAndUI()
        }

        builder.setNegativeButton("Cancelar") { _, _ ->
            finish()
        }

        builder.setCancelable(false)
        builder.show()
    }

    private fun setupCameraAndUI() {
        updateScanModeUI()
        scanModeButton.setOnClickListener {
            toggleScanMode()
        }

        btnReviewAttendance.setOnClickListener {
            // Abrir el archivo CSV con una app externa
            val file = File(currentFilePath)
            if (file.exists()) {
                val uri = androidx.core.content.FileProvider.getUriForFile(
                    this,
                    "${applicationContext.packageName}.provider",
                    file
                )
                val intent = Intent(Intent.ACTION_VIEW).apply {
                    setDataAndType(uri, "text/csv")
                    addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                }
                startActivity(Intent.createChooser(intent, "Abrir archivo CSV con..."))
            } else {
                Toast.makeText(this, "El archivo no existe", Toast.LENGTH_SHORT).show()
            }
        }

        if (allPermissionsGranted()) {
            startCamera()
        } else {
            ActivityCompat.requestPermissions(
                this, REQUIRED_PERMISSIONS, REQUEST_CODE_PERMISSIONS
            )
        }
    }

    private fun toggleScanMode() {
        scanMode = if (scanMode == ScanMode.CHECK_IN) ScanMode.CHECK_OUT else ScanMode.CHECK_IN
        updateScanModeUI()
    }

    private fun updateScanModeUI() {
        when (scanMode) {
            ScanMode.CHECK_IN -> {
                scanModeButton.text = "Modo: Registro de Entrada"
                statusTextView.text = "Escanea QR para registrar entrada"
                scanModeButton.setBackgroundColor(ContextCompat.getColor(this, android.R.color.holo_green_dark))
            }
            ScanMode.CHECK_OUT -> {
                scanModeButton.text = "Modo: Registro de Salida"
                statusTextView.text = "Escanea QR para registrar salida"
                scanModeButton.setBackgroundColor(ContextCompat.getColor(this, android.R.color.holo_orange_dark))
            }
        }
    }

    private fun startCamera() {
        val cameraProviderFuture = ProcessCameraProvider.getInstance(this)

        cameraProviderFuture.addListener({
            cameraProvider = cameraProviderFuture.get()

            val preview = Preview.Builder()
                .build()
                .also {
                    it.setSurfaceProvider(previewView.surfaceProvider)
                }

            imageAnalyzer = ImageAnalysis.Builder()
                .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
                .build()
                .also {
                    it.setAnalyzer(cameraExecutor, QRCodeAnalyzer { qrContent ->
                        if (!isProcessingQR) {
                            isProcessingQR = true
                            processQRCode(qrContent)
                        }
                    })
                }

            try {
                cameraProvider?.unbindAll()
                cameraProvider?.bindToLifecycle(
                    this,
                    CameraSelector.DEFAULT_BACK_CAMERA,
                    preview,
                    imageAnalyzer
                )
            } catch (exc: Exception) {
                Log.e(TAG, "Error al iniciar la cámara", exc)
            }

        }, ContextCompat.getMainExecutor(this))
    }

    private fun processQRCode(qrContent: String) {
        lifecycleScope.launch {
            try {
                val jsonObject = JSONObject(qrContent)
                val currentDateTime = SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.getDefault()).format(Date())

                // Registrar directamente sin verificación
                processNormalRegistration(
                    id = jsonObject.optString("id", ""),
                    nombre = jsonObject.optString("nombre", ""),
                    apellidoPaterno = jsonObject.optString("apellidoPaterno", ""),
                    apellidoMaterno = jsonObject.optString("apellidoMaterno", ""),
                    rol = jsonObject.optString("rol", "").lowercase(),
                    currentDateTime = currentDateTime
                )
                
            } catch (e: Exception) {
                runOnUiThread {
                    Toast.makeText(this@ScanActivity, 
                        "Error al procesar QR: ${e.message}", 
                        Toast.LENGTH_SHORT).show()
                }
            }
        }
    }



    private fun processNormalRegistration(
        id: String,
        nombre: String,
        apellidoPaterno: String,
        apellidoMaterno: String,
        rol: String,
        currentDateTime: String
    ) {
        when (scanMode) {
            ScanMode.CHECK_IN -> {
                val isAlreadyRegistered = attendanceManager.isPersonRegistered(id)
                if (isAlreadyRegistered) {
                    runOnUiThread {
                        Toast.makeText(
                            this@ScanActivity,
                            "⚠️ ¡Registro duplicado! Esta persona ya está registrada",
                            Toast.LENGTH_LONG
                        ).show()
                        statusTextView.text = "Duplicado: $nombre $apellidoPaterno"
                        Handler(Looper.getMainLooper()).postDelayed({
                            isProcessingQR = false
                        }, 3000)
                    }
                } else {
                    val success = attendanceManager.registerEntry(
                        id,
                        nombre,
                        apellidoPaterno,
                        apellidoMaterno,
                        rol,
                        currentDateTime
                    )
                    runOnUiThread {
                        if (success) {
                            Toast.makeText(
                                this@ScanActivity,
                                "✅ Entrada registrada: $nombre $apellidoPaterno ($rol)",
                                Toast.LENGTH_LONG
                            ).show()
                            statusTextView.text = "✅ Entrada: $nombre $apellidoPaterno ($rol)"
                        } else {
                            Toast.makeText(
                                this@ScanActivity,
                                "❌ Error al registrar entrada",
                                Toast.LENGTH_SHORT
                            ).show()
                            statusTextView.text = "❌ Error de registro"
                        }
                        Handler(Looper.getMainLooper()).postDelayed({
                            isProcessingQR = false
                        }, 3000)
                    }
                }
            }
            ScanMode.CHECK_OUT -> {
                // Verifica si ya tiene salida registrada
                val record = attendanceManager.getAllRecords().find { it.id == id }
                if (record == null) {
                    runOnUiThread {
                        Toast.makeText(
                            this@ScanActivity,
                            "❌ Error: No se encontró registro de entrada para esta persona",
                            Toast.LENGTH_LONG
                        ).show()
                        statusTextView.text = "❌ Sin registro de entrada previo"
                        Handler(Looper.getMainLooper()).postDelayed({
                            isProcessingQR = false
                        }, 3000)
                    }
                } else if (record.horaSalida != null && record.horaSalida!!.isNotBlank()) {
                    runOnUiThread {
                        Toast.makeText(
                            this@ScanActivity,
                            "⚠️ Esta persona ya tiene registrada una salida",
                            Toast.LENGTH_LONG
                        ).show()
                        statusTextView.text = "Duplicado salida: $nombre $apellidoPaterno"
                        Handler(Looper.getMainLooper()).postDelayed({
                            isProcessingQR = false
                        }, 3000)
                    }
                } else {
                    val success = attendanceManager.registerExit(id, currentDateTime)
                    runOnUiThread {
                        if (success) {
                            Toast.makeText(
                                this@ScanActivity,
                                "✅ Salida registrada: $nombre $apellidoPaterno",
                                Toast.LENGTH_LONG
                            ).show()
                            statusTextView.text = "✅ Salida: $nombre $apellidoPaterno"
                        } else {
                            Toast.makeText(
                                this@ScanActivity,
                                "❌ Error al registrar salida",
                                Toast.LENGTH_SHORT
                            ).show()
                            statusTextView.text = "❌ Error de registro de salida"
                        }
                        Handler(Looper.getMainLooper()).postDelayed({
                            isProcessingQR = false
                        }, 3000)
                    }
                }
            }
        }
    }

    private fun allPermissionsGranted() = REQUIRED_PERMISSIONS.all {
        ContextCompat.checkSelfPermission(baseContext, it) == PackageManager.PERMISSION_GRANTED
    }

    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<String>,
        grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == REQUEST_CODE_PERMISSIONS) {
            if (allPermissionsGranted()) {
                startCamera()
            } else {
                Toast.makeText(this, "Permisos de cámara requeridos para escanear QR", Toast.LENGTH_LONG).show()
                finish()
            }
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        cameraExecutor.shutdown()
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode == REQUEST_CODE_REVIEW && resultCode == RESULT_OK) {
            Toast.makeText(this, "Registros actualizados exitosamente", Toast.LENGTH_SHORT).show()
        }
    }

    private fun showSaveDialogOrFinish() {
        val builder = AlertDialog.Builder(this)
        builder.setTitle("Guardar cambios")
        builder.setMessage("¿Desea guardar los cambios antes de salir?")

        builder.setPositiveButton("Guardar") { _, _ ->
            // Lógica para guardar los cambios
            Toast.makeText(this, "Cambios guardados", Toast.LENGTH_SHORT).show()
            finish()
        }

        builder.setNegativeButton("No guardar") { _, _ ->
            finish()
        }

        builder.setNeutralButton("Cancelar") { dialog, _ ->
            dialog.dismiss()
        }

        builder.setCancelable(false)
        builder.show()
    }

    companion object {
        private const val TAG = "ScanActivity"
        private const val REQUEST_CODE_PERMISSIONS = 10
        private const val REQUEST_CODE_REVIEW = 11
        private val REQUIRED_PERMISSIONS = arrayOf(Manifest.permission.CAMERA)
    }

    inner class QRCodeAnalyzer(private val onQRCodeDetected: (String) -> Unit) : ImageAnalysis.Analyzer {
        private val options = BarcodeScannerOptions.Builder()
            .setBarcodeFormats(Barcode.FORMAT_QR_CODE)
            .build()

        private val scanner: BarcodeScanner = BarcodeScanning.getClient(options)

        @androidx.camera.core.ExperimentalGetImage
        override fun analyze(imageProxy: ImageProxy) {
            val mediaImage = imageProxy.image
            if (mediaImage != null) {
                val image = InputImage.fromMediaImage(mediaImage, imageProxy.imageInfo.rotationDegrees)

                scanner.process(image)
                    .addOnSuccessListener { barcodes ->
                        barcodes.firstOrNull()?.rawValue?.let { rawValue ->
                            onQRCodeDetected(rawValue)
                        }
                    }
                    .addOnFailureListener {
                        Log.e(TAG, "Error al procesar la imagen para QR", it)
                    }
                    .addOnCompleteListener {
                        imageProxy.close()
                    }
            } else {
                imageProxy.close()
            }
        }
    }
}