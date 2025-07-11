package com.example.confex

import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView

class AttendanceRecordAdapter(
    private val records: List<AttendanceRecord>
) : RecyclerView.Adapter<AttendanceRecordAdapter.ViewHolder>() {

    companion object {
        private const val TAG = "AttendanceRecordAdapter"
    }

    class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val tvName: TextView = view.findViewById(R.id.tvName)
        val tvRole: TextView = view.findViewById(R.id.tvRole)
        val tvEntryTime: TextView = view.findViewById(R.id.tvEntryTime)
        val tvExitTime: TextView = view.findViewById(R.id.tvExitTime)
        val tvAccumulatedHours: TextView = view.findViewById(R.id.tvAccumulatedHours)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        Log.d(TAG, "onCreateViewHolder called")
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_attendance_record, parent, false)
        return ViewHolder(view)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        try {
            val record = records[position]
            holder.tvName.text = "${record.nombre} ${record.apellidoPaterno} ${record.apellidoMaterno}"
            holder.tvRole.text = "Rol: ${record.rol}"
            holder.tvEntryTime.text = "Entrada: ${record.horaEntrada}"
            holder.tvExitTime.text = "Salida: ${record.horaSalida ?: "No registrada"}"
            holder.tvAccumulatedHours.text = "Horas: ${"%.2f".format(record.horasAcumuladas)}"
        } catch (e: Exception) {
            Log.e(TAG, "Error binding view at position $position: ${e.message}", e)
        }
    }

    override fun getItemCount(): Int {
        Log.d(TAG, "getItemCount: ${records.size}")
        return records.size
    }
}
