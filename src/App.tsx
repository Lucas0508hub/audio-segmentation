import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import UploadPage from "./pages/UploadPage";
import AnnotatePage from "./pages/AnnotatePage";
import ExportPage from "./pages/ExportPage";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<UploadPage />} />
        <Route path="/annotate/:jobId" element={<AnnotatePage />} />
        <Route path="/export/:jobId" element={<ExportPage />} />
      </Routes>
    </Router>
  );
}
