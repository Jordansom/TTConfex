package com.example.confex

import android.util.Log
import java.io.*
import java.text.SimpleDateFormat
import java.util.*

class AttendanceManager(private val filePath: String) {
    private val csvFile = File(filePath)
    private val dateFormat = SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.getDefault())

    companion object {
        private const val TAG = "AttendanceManager"
        private const val HEADER = "ID,Nombre,ApellidoPaterno,ApellidoMaterno,Rol,HoraEntrada,HoraSalida,HorasAcumuladas"
    }

    init {
        try {
            ensureFileExists()
            Log.d(TAG, "AttendanceManager initialized with file: $filePath")
        } catch (e: Exception) {
            Log.e(TAG, "Error initializing AttendanceManager: ${e.message}", e)
            throw e
        }
    }

    private fun ensureFileExists() {
        try {
            if (!csvFile.exists()) {
                csvFile.parentFile?.mkdirs()
                csvFile.createNewFile()
                csvFile.writeText("$HEADER\n")
                Log.d(TAG, "Created new CSV file with header")
            } else {
                Log.d(TAG, "CSV file already exists")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error ensuring file exists: ${e.message}", e)
            throw e
        }
    }

    fun registerEntry(id: String, nombre: String, apellidoPaterno: String,
                      apellidoMaterno: String, rol: String, timestamp: String): Boolean {
        return try {
            val line = "$id,$nombre,$apellidoPaterno,$apellidoMaterno,$rol,$timestamp,,0\n"
            csvFile.appendText(line)
            Log.d(TAG, "Entry registered for ID: $id")
            true
        } catch (e: Exception) {
            Log.e(TAG, "Error registering entry for ID $id: ${e.message}", e)
            false
        }
    }

    fun registerExit(id: String, timestamp: String): Boolean {
        return try {
            val lines = csvFile.readLines().toMutableList()
            var updated = false

            for (i in 1 until lines.size) { // Skip header
                val parts = lines[i].split(",", limit = 8)
                if (parts.size >= 8 && parts[0] == id && parts[6].isEmpty()) {
                    val entryTime = dateFormat.parse(parts[5])
                    val exitTime = dateFormat.parse(timestamp)
                    val hoursWorked = if (entryTime != null && exitTime != null) {
                        val diffMillis = exitTime.time - entryTime.time
                        String.format("%.2f", diffMillis / (1000.0 * 60.0 * 60.0)).toDouble()
                    } else 0.0

                    val updatedParts = parts.toMutableList()
                    updatedParts[6] = timestamp
                    updatedParts[7] = hoursWorked.toString()
                    lines[i] = updatedParts.joinToString(",")
                    updated = true
                    break
                }
            }

            if (updated) {
                csvFile.writeText(lines.joinToString("\n") + "\n")
                Log.d(TAG, "Exit registered for ID: $id")
            } else {
                Log.w(TAG, "No entry found to update exit for ID: $id")
            }
            updated
        } catch (e: Exception) {
            Log.e(TAG, "Error registering exit for ID $id: ${e.message}", e)
            false
        }
    }

    fun isPersonRegistered(id: String): Boolean {
        return try {
            csvFile.readLines().any { line ->
                val parts = line.split(",")
                parts.size > 0 && parts[0] == id
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error checking if person is registered: ${e.message}", e)
            false
        }
    }

    fun getAllRecords(): List<AttendanceRecord> {
        return try {
            if (!csvFile.exists()) {
                Log.w(TAG, "CSV file does not exist")
                return emptyList()
            }

            val lines = csvFile.readLines()
            if (lines.isEmpty()) {
                Log.w(TAG, "CSV file is empty")
                return emptyList()
            }

            val records = lines.drop(1)
                .filter { it.trim().isNotEmpty() }
                .mapNotNull { line ->
                    try {
                        val parts = line.split(",")
                        if (parts.size >= 8) {
                            AttendanceRecord(
                                id = parts[0].trim(),
                                nombre = parts[1].trim(),
                                apellidoPaterno = parts[2].trim(),
                                apellidoMaterno = parts[3].trim(),
                                rol = parts[4].trim(),
                                horaEntrada = parts[5].trim(),
                                horaSalida = if (parts[6].trim().isNotEmpty()) parts[6].trim() else null,
                                horasAcumuladas = parts[7].trim().toDoubleOrNull() ?: 0.0
                            )
                        } else null
                    } catch (e: Exception) {
                        null
                    }
                }

            Log.d(TAG, "Retrieved ${records.size} records from CSV")
            records
        } catch (e: Exception) {
            Log.e(TAG, "Error getting all records: ${e.message}", e)
            emptyList()
        }
    }

    fun updateAllRecords(records: List<AttendanceRecord>) {
        try {
            val content = buildString {
                appendLine(HEADER)
                records.forEach { record ->
                    if (record.id.isNotBlank() && record.nombre.isNotBlank()) {
                        appendLine("${record.id},${record.nombre},${record.apellidoPaterno},${record.apellidoMaterno},${record.rol},${record.horaEntrada},${record.horaSalida ?: ""},${record.horasAcumuladas}")
                    }
                }
            }
            csvFile.writeText(content.trimEnd() + "\n")
            Log.d(TAG, "Updated ${records.size} records in CSV")
        } catch (e: Exception) {
            Log.e(TAG, "Error updating all records: ${e.message}", e)
            throw Exception("Error al actualizar registros: ${e.message}")
        }
    }

    fun getRecordCount(): Int {
        return try {
            val lines = csvFile.readLines()
            maxOf(0, lines.size - 1)
        } catch (e: Exception) {
            Log.e(TAG, "Error getting record count: ${e.message}", e)
            0
        }
    }

    fun getRecordsWithoutExit(): List<AttendanceRecord> {
        return try {
            getAllRecords().filter { it.horaSalida == null }
        } catch (e: Exception) {
            Log.e(TAG, "Error getting records without exit: ${e.message}", e)
            emptyList()
        }
    }

    fun exportToCSV(outputPath: String): Boolean {
        return try {
            val outputFile = File(outputPath)
            csvFile.copyTo(outputFile, overwrite = true)
            Log.d(TAG, "Exported CSV to: $outputPath")
            true
        } catch (e: Exception) {
            Log.e(TAG, "Error exporting CSV: ${e.message}", e)
            false
        }
    }
}