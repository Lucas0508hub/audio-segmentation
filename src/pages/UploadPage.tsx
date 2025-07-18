import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append("audio_file", file);
      const res = await fetch(import.meta.env.VITE_API_URL + "/upload", {
        method: "POST",
        body: form,
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`${res.status}: ${text}`);
      }
      const { job_id } = await res.json();
      navigate(`/annotate/${job_id}`);
    } catch (err: any) {
      console.error("Upload failed", err);
      alert(`Upload failed: ${err.message}`);
      setUploading(false);
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: '40px auto', backgroundColor: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <h2 style={{ color: '#007bff' }}>Upload Audio</h2>
      <input
        type="file"
        accept="audio/wav"
        onChange={e => setFile(e.target.files?.[0] || null)}
        style={{ display: 'block', margin: '20px 0' }}
      />
      {uploading && (
        <div style={{ marginBottom: 20 }}>
          <progress value={progress} max={100} style={{ width: '100%' }} />
          <span>{progress}%</span>
        </div>
      )}
      <button
        disabled={!file || uploading}
        onClick={handleUpload}
        style={{
          backgroundColor: '#007bff',
          color: '#fff',
          border: 'none',
          padding: '10px 20px',
          borderRadius: 4,
          cursor: file && !uploading ? 'pointer' : 'not-allowed'
        }}
      >
        {uploading ? "Uploading..." : "Upload"}
      </button>
    </div>
  );
}
