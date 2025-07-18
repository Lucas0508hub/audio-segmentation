import React from "react";
import { useParams } from "react-router-dom";

export default function ExportPage() {
  const { jobId } = useParams();

  const handleExport = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/export`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ job_id: jobId, format: "xlsx" }),
    });
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${jobId}_export.zip`;
    a.click();
  };

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: '40px auto', backgroundColor: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <h2 style={{ color: '#17a2b8' }}>Export Results</h2>
      <button
        onClick={handleExport}
        style={{ backgroundColor: '#17a2b8', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 4, cursor: 'pointer' }}
      >
        Download ZIP
      </button>
    </div>
  );
}
