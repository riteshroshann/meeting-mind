"use client"

import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Upload, FileAudio, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface AudioUploadProps {
  onFileUpload: (file: File) => void
}

export function AudioUpload({ onFileUpload }: AudioUploadProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (file) {
        setUploadedFile(file)
        onFileUpload(file)
      }
    },
    [onFileUpload],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "audio/*": [".mp3", ".wav", ".m4a", ".aac", ".flac", ".ogg"],
    },
    maxFiles: 1,
    maxSize: 500 * 1024 * 1024, // 500MB
  })

  const removeFile = () => {
    setUploadedFile(null)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const formatDuration = (file: File) => {
    // This would typically require loading the audio file to get duration
    // For demo purposes, we'll show a placeholder
    return "Duration will be calculated"
  }

  if (uploadedFile) {
    return (
      <div className="border-2 border-dashed border-green-500/30 rounded-lg p-6 bg-green-500/10 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FileAudio className="w-8 h-8 text-green-400" />
            <div>
              <p className="font-medium text-white">{uploadedFile.name}</p>
              <p className="text-sm text-white/70">
                {formatFileSize(uploadedFile.size)} • {uploadedFile.type}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={removeFile} className="text-white/70 hover:text-white">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
        isDragActive ? "border-white/50 bg-white/10" : "border-white/20 hover:border-white/50 hover:bg-white/5",
      )}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center space-y-4">
        <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
          <Upload className="w-8 h-8 text-white" />
        </div>

        {isDragActive ? (
          <div>
            <p className="text-lg font-medium text-white">Drop your audio file here</p>
            <p className="text-white/70">Release to upload</p>
          </div>
        ) : (
          <div>
            <p className="text-lg font-medium text-white">Drag & drop your audio file here</p>
            <p className="text-white/70 mb-4">or click to browse files</p>
            <Button variant="outline" className="bg-transparent border-white/30 text-white hover:bg-white/10">
              <FileAudio className="w-4 h-4 mr-2" />
              Choose Audio File
            </Button>
          </div>
        )}

        <div className="text-xs text-white/70">
          <p>Supported formats: MP3, WAV, M4A, AAC, FLAC, OGG</p>
          <p>Maximum file size: 500MB</p>
        </div>
      </div>
    </div>
  )
}
