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
    const ws = WaveSurfer.create({
      container: "#waveform",
      waveColor: "#ccc",
      progressColor: "#28a745",
      height: 80,
    });
    ws.load(`${import.meta.env.VITE_API_URL}/audio/${jobId}/${segments[currentIndex].id}.wav`);
    setWave(ws);
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
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            rows={3}
            placeholder="Type what you hear..."
            style={{ width: '100%', padding: 10, fontSize: '1rem', borderRadius: 4, border: '1px solid #ccc', margin: '20px 0' }}
          />
          <button
            onClick={handleSubmit}
            style={{ backgroundColor: '#28a745', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 4, cursor: 'pointer' }}
          >
            Submit
          </button>
        </>
      ) : (
        <>
          <p style={{ fontSize: '1.2rem', marginBottom: 20 }}>Done! You can now export your data.</p>
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
