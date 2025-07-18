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
    <div style={{ padding: 20 }}>
      <h2>Export Results</h2>
      <button onClick={handleExport}>Download ZIP</button>
    </div>
  );
}
