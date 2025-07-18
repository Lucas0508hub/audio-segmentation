import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import WaveSurfer from "wavesurfer.js";
import RegionsPlugin from "wavesurfer.js/dist/plugins/regions";

type Segment = { id: string; start: number; end: number };

export default function AnnotatePage() {
  const { jobId } = useParams();
  const [segments, setSegments] = useState<Segment[]>([]);
  const [current, setCurrent] = useState(0);
  const [transcript, setTranscript] = useState("");
  const wsRef = useRef<WaveSurfer | null>(null);
  const regionRef = useRef<any>(null);

  /* ───────────────────────────── fetch & poll for segments ────────────────── */
  useEffect(() => {
    let timer: NodeJS.Timeout;
    const poll = () => {
      fetch(`${import.meta.env.VITE_API_URL}/jobs/${jobId}`)
        .then(r => r.json())
        .then((data) => {
          if (data.segments?.length) {
            setSegments(data.segments);
          } else {
            timer = setTimeout(poll, 3000);      // try again in 3 s
          }
        });
    };
    poll();
    return () => clearTimeout(timer);
  }, [jobId]);

  /* ───────────────────────── waveform for the current segment ─────────────── */
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
      // draw editable region spanning the whole segment
      regionRef.current = ws.addRegion({
        start: 0,
        end: ws.getDuration(),
        color: "rgba(40,167,69,0.2)"
      });
    });
    wsRef.current = ws;
  }, [segments, current, jobId]);

  /* ───────────────────── save transcript + (possibly) new boundaries ──────── */
  const handleSave = async () => {
    if (!segments.length) return;
    const seg = segments[current];
    const { start, end } = regionRef.current;      // user‑adjusted values
    await fetch(`${import.meta.env.VITE_API_URL}/segments/${seg.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcript, start, end })
    });
    setTranscript("");
    setCurrent(i => i + 1);
  };

  /* ─────────────────────────────── UI layout ──────────────────────────────── */
  if (!segments.length) {
    return <p style={{ padding: 40 }}>Processing… please wait.</p>;
  }
  const seg = segments[current];
  return (
    <div style={{ padding: 20, maxWidth: 800, margin: "40px auto",
                  backgroundColor: "#fff", borderRadius: 8,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
      <h2 style={{ color: "#28a745" }}>Annotate &amp; Edit Sentence</h2>
      <p style={{ fontSize: "1.1rem" }}>
        Segment {current + 1} / {segments.length}
        {"  "}({seg.start.toFixed(2)} s → {seg.end.toFixed(2)} s)
      </p>

      <div id="waveform" />

      <textarea
        value={transcript}
        onChange={(e) => setTranscript(e.target.value)}
        rows={3}
        placeholder="Type what you hear..."
        style={{ width: "100%", padding: 10, fontSize: "1rem",
                 borderRadius: 4, border: "1px solid #ccc", margin: "20px 0" }}
      />

      <button
        onClick={handleSave}
        style={{ backgroundColor: "#28a745", color: "#fff", border: "none",
                 padding: "10px 20px", borderRadius: 4, cursor: "pointer" }}>
        Save & Next
      </button>

      {current + 1 === segments.length && (
        <div style={{ marginTop: 30 }}>
          <p>All done!</p>
          <Link to={`/export/${jobId}`}>
            <button style={{ backgroundColor: "#ffc107", color: "#212529",
                             border: "none", padding: "10px 20px",
                             borderRadius: 4, cursor: "pointer" }}>
              Export
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}
