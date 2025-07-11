package com.example.confex

import android.os.Bundle
import android.util.Log
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView

class AttendanceListActivity : AppCompatActivity() {
    companion object {
        private const val TAG = "AttendanceListActivity"
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        Log.d(TAG, "onCreate called")
        setContentView(R.layout.activity_attendance_list)

        val filePath = intent.getStringExtra("FILE_PATH")
        Log.d(TAG, "Received filePath: $filePath")
        if (filePath.isNullOrBlank()) {
            Log.e(TAG, "No file path provided, finishing activity")
            finish()
            return
        }

        try {
            val attendanceManager = AttendanceManager(filePath)
            val records = attendanceManager.getAllRecords()
            Log.d(TAG, "Loaded ${records.size} records from file")

            val recyclerView = findViewById<RecyclerView>(R.id.rvAttendance)
            recyclerView.layoutManager = LinearLayoutManager(this)
            recyclerView.adapter = AttendanceRecordAdapter(records)
            Log.d(TAG, "RecyclerView and adapter set")

            val tvTotalRecords = findViewById<android.widget.TextView>(R.id.tvTotalRecords)
            tvTotalRecords?.let {
                it.text = "Total de registros: ${records.size}"
                it.visibility = android.view.View.VISIBLE
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error initializing AttendanceListActivity: ${e.message}", e)
            finish()
        }
    }
}
