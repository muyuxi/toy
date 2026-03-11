'use client'
import { useState } from 'react'

export default function UploadPage() {
  const [uploading, setUploading] = useState(false)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    await fetch('/api/admin/upload', { method: 'POST', body: formData })
    setUploading(false)
    alert('Upload complete!')
  }

  return (
    <div className="bg-white rounded-lg p-6">
      <h1 className="text-2xl font-bold mb-4">Upload Excel</h1>
      <input type="file" accept=".xlsx,.xls" onChange={handleUpload} disabled={uploading} className="mb-4" />
      {uploading && <p>Uploading...</p>}
    </div>
  )
}
