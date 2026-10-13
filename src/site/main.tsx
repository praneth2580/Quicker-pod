import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { LandingPage } from "@/pages/LandingPage";
import { VsSuperTripperPage } from "@/pages/VsSuperTripperPage";
import { InstallPage } from "@/pages/InstallPage";
import { FaqPage } from "@/pages/FaqPage";
import "@/index.css";

/**
 * Marketing / GitHub Pages entry — SEO landing + long-tail pages.
 * Functional companion UI lives in src/app (Capacitor / APK).
 */
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/vs-supertripper" element={<VsSuperTripperPage />} />
        <Route path="/install" element={<InstallPage />} />
        <Route path="/faq" element={<FaqPage />} />
        <Route path="/download" element={<Navigate to="/#download" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
