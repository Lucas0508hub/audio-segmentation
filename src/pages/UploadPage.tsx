import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("audio_file", file);
    const res = await fetch(import.meta.env.VITE_API_URL + "/upload", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    navigate(`/annotate/${data.job_id}`);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Upload Audio</h2>
      <input
        type="file"
        accept="audio/wav"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      <br />
      <br />
      <button disabled={!file || uploading} onClick={handleUpload}>
        {uploading ? "Uploading..." : "Upload"}
      </button>
    </div>
  );
}
