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
      progressColor: "#007bff",
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
    <div style={{ padding: 20 }}>
      <h2>Annotate Sentences</h2>
      {seg ? (
        <>
          <p>
            Segment {currentIndex + 1} of {segments.length} (
            {seg.start} → {seg.end} seconds)
          </p>
          <div id="waveform" />
          <br />
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            rows={3}
            cols={60}
            placeholder="Type what you hear..."
          />
          <br />
          <br />
          <button onClick={handleSubmit}>Submit</button>
        </>
      ) : (
        <>
          <p>Done! You can now export your data.</p>
          <Link to={`/export/${jobId}`}>
            <button>Go to Export</button>
          </Link>
        </>
      )}
    </div>
  );
}
