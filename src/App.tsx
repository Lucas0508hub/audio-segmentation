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
