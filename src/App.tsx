import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import UploadPage from "./pages/UploadPage";
import AnnotatePage from "./pages/AnnotatePage";
import ExportPage from "./pages/ExportPage";

export default function App() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f4f8' }}>
      <header style={{ backgroundColor: '#007bff', color: '#fff', padding: '20px 0', textAlign: 'center' }}>
        <h1 style={{ margin: 0, fontSize: '2rem' }}>Welcome Ready Vessels</h1>
      </header>
      <Router>
        <Routes>
          <Route path="/" element={<UploadPage />} />
          <Route path="/annotate/:jobId" element={<AnnotatePage />} />
          <Route path="/export/:jobId" element={<ExportPage />} />
        </Routes>
      </Router>
    </div>
  );
}

// File: src/pages/UploadPage.tsx
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
    <div style={{ padding: 20, maxWidth: 600, margin: '40px auto', backgroundColor: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <h2 style={{ color: '#007bff' }}>Upload Audio</h2>
      <input
        type="file"
        accept="audio/wav"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        style={{ display: 'block', margin: '20px 0' }}
      />
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

// File: src/pages/AnnotatePage.tsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import WaveSurfer from "wavesurfer.js";

export default function AnnotatePage() {
  const { jobId } = useParams();
  const [segments, setSegments] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [wave, setWave] = useState<any>(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/jobs/${jobId}`)
      .then((r) => r.json())
      .then((data) => data.segments && setSegments(data.segments));
  }, [jobId]);

  useEffect(() => {
    if (!segments.length) return;
    wave?.destroy();
    const newWave = WaveSurfer.create({
      container: "#waveform",
      waveColor: "#ccc",
      progressColor: "#28a745",
      height: 80,
    });
    newWave.load(
      `${import.meta.env.VITE_API_URL}/audio/${jobId}/${segments[currentIndex].id}.wav`
    );
    setWave(newWave);
  }, [segments, currentIndex]);

  const handleSubmit = async () => {
    const seg = segments[currentIndex];
    await fetch(`${import.meta.env.VITE_API_URL}/segments/${seg.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcript }),
    });
    setTranscript("");
    setCurrentIndex((i) => i + 1);
  };

  const seg = segments[currentIndex];

  return (
    <div style={{ padding: 20, maxWidth: 800, margin: '40px auto', backgroundColor: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <h2 style={{ color: '#28a745' }}>Annotate Sentences</h2>
      {seg ? (
        <>
          <p style={{ fontSize: '1.1rem' }}>
            Segment {currentIndex + 1} of {segments.length} ({seg.start} → {seg.end} seconds)
          </p>
          <div id="waveform" />
          <br />
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            rows={3}
            cols={60}
            placeholder="Type what you hear..."
            style={{ width: '100%', padding: 10, fontSize: '1rem', borderRadius: 4, border: '1px solid #ccc' }}
          />
          <br />
          <button
            onClick={handleSubmit}
            style={{ backgroundColor: '#28a745', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 4, cursor: 'pointer' }}
          >
            Submit
          </button>
        </>
      ) : (
        <>
          <p style={{ fontSize: '1.2rem' }}>Done! You can now export your data.</p>
          <Link to={`/export/${jobId}`}>
            <button style={{ backgroundColor: '#ffc107', color: '#212529', border: 'none', padding: '10px 20px', borderRadius: 4, cursor: 'pointer' }}>
              Go to Export
            </button>
          </Link>
        </>
      )}
    </div>
  );
}

// File: src/pages/ExportPage.tsx
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
