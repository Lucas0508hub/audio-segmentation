import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// File: src/App.tsx
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
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();

  const handleUpload = () => {
    if (!file) return;
    setUploading(true);
    const xhr = new XMLHttpRequest();
    xhr.open("POST", import.meta.env.VITE_API_URL + "/upload");

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        setProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        setUploading(false);
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText);
          navigate(`/annotate/${data.job_id}`);
        } else {
          alert("Upload failed");
        }
      }
    };

    xhr.onerror = () => {
      setUploading(false);
      alert("Upload failed");
    };

    const formData = new FormData();
    formData.append("audio_file", file);
    xhr.send(formData);
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
      {uploading && (
        <div style={{ marginBottom: 20 }}>
          <progress value={progress} max={100} style={{ width: '100%' }} />
          <span>{progress}%</span>
        </div>
      )}
      <button
        disabled={!file || uploading}
        onClick={handleUpload}
        style={{ backgroundColor: '#007bff', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 4, cursor: file && !uploading ? 'pointer' : 'not-allowed' }}
      >
        {uploading ? "Uploading..." : "Upload"}
      </button>
    </div>
  );
}

// File: src/pages/AnnotatePage.tsx
import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import WaveSurfer from "wavesurfer.js";
import RegionsPlugin from "wavesurfer.js/dist/plugins/regions.esm.js";

type Segment = { id: string; start: number; end: number };

export default function AnnotatePage() {
  const { jobId } = useParams();
  const [segments, setSegments] = useState<Segment[]>([]);
  const [current, setCurrent] = useState(0);
  const [transcript, setTranscript] = useState("");
  const wsRef = useRef<WaveSurfer | null>(null);
  const regionRef = useRef<any>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    const poll = () => {
      fetch(`${import.meta.env.VITE_API_URL}/jobs/${jobId}`)
        .then(r => r.json())
        .then(data => {
          if (data.segments?.length) {
            setSegments(data.segments);
          } else {
            timer = setTimeout(poll, 3000);
          }
        });
    };
    poll();
    return () => clearTimeout(timer);
  }, [jobId]);

  useEffect(() => {
    if (!segments.length) return;
    wsRef.current?.destroy();
    const ws = WaveSurfer.create({
      container: "#waveform",
      waveColor: "#ccc",
      progressColor: "#28a745",
      height: 80,
      plugins: [RegionsPlugin.create({ dragSelection: { slop: 5 } })]
    });
    ws.load(
      `${import.meta.env.VITE_API_URL}/audio/${jobId}/${segments[current].id}.wav`
    );
    ws.on("ready", () => {
      regionRef.current = ws.addRegion({
        start: 0,
        end: ws.getDuration(),
        color: "rgba(40,167,69,0.2)"
      });
    });
    wsRef.current = ws;
  }, [segments, current, jobId]);

  const handleSave = async () => {
    if (!segments.length) return;
    const seg = segments[current];
    const { start, end } = regionRef.current;
    await fetch(`${import.meta.env.VITE_API_URL}/segments/${seg.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcript, start, end })
    });
    setTranscript("");
    setCurrent(i => i + 1);
  };

  if (!segments.length) {
    return <p style={{ padding: 40 }}>Processing… please wait.</p>;
  }
  const seg = segments[current];

  return (
    <div style={{ padding: 20, maxWidth: 800, margin: '40px auto', backgroundColor: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <h2 style={{ color: '#28a745' }}>Annotate & Edit Sentence</h2>
      <p style={{ fontSize: '1.1rem' }}>
        Segment {current + 1} / {segments.length} ({seg.start.toFixed(2)}s → {seg.end.toFixed(2)}s)
      </p>
      <div id="waveform" />
      <textarea
        value={transcript}
        onChange={e => setTranscript(e.target.value)}
        rows={3}
        placeholder="Type what you hear..."
        style={{ width: '100%', padding: 10, fontSize: '1rem', borderRadius: 4, border: '1px solid #ccc', margin: '20px 0' }}
      />
      <button
        onClick={handleSave}
        style={{ backgroundColor: '#28a745', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 4, cursor: 'pointer' }}
      >Save & Next</button>
      {current + 1 === segments.length && (
        <div style={{ marginTop: 30 }}>
          <p>All done!</p>
          <Link to={`/export/${jobId}`}>
            <button style={{ backgroundColor: '#ffc107', color: '#212529', border: 'none', padding: '10px 20px', borderRadius: 4, cursor: 'pointer' }}>
              Export
            </button>
          </Link>
        </div>
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
      >Download ZIP</button>
    </div>
  );
}
