package com.example.confex

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageButton
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import java.io.File
import java.text.SimpleDateFormat
import java.util.*

class FileAdapter(
    private var files: List<File>,
    private val onFileClick: (File) -> Unit,
    private val onFileMenuClick: (File, View) -> Unit
) : RecyclerView.Adapter<FileAdapter.FileViewHolder>() {

    class FileViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val tvFileName: TextView = view.findViewById(R.id.tvFileName)
        val tvFileDate: TextView = view.findViewById(R.id.tvFileDate)
        val btnMore: ImageButton = view.findViewById(R.id.btnMore)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): FileViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_file, parent, false)
        return FileViewHolder(view)
    }

    override fun onBindViewHolder(holder: FileViewHolder, position: Int) {
        val file = files[position]
        holder.tvFileName.text = file.name

        // Format the date
        val dateFormat = SimpleDateFormat("dd/MM/yyyy HH:mm", Locale.getDefault())
        val lastModified = Date(file.lastModified())
        holder.tvFileDate.text = dateFormat.format(lastModified)

        holder.itemView.setOnClickListener {
            onFileClick(file)
        }
        holder.btnMore.setOnClickListener {
            onFileMenuClick(file, it)
        }
    }

    override fun getItemCount() = files.size

    fun updateFiles(newFiles: List<File>) {
        this.files = newFiles
        notifyDataSetChanged()
    }
}