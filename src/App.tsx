// File: src/main.tsx
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
