import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import HomePage from "./Pages/HomePage";
import CollectionsPage from "./Pages/CollectionsPage";

export default function App() {
  return (
    <BrowserRouter>
      <main
        dir="rtl"
        className="min-h-screen bg-[#F7F3EE] text-[#041E42] font-doran"
      >
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/collections" element={<CollectionsPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}