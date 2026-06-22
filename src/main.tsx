import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { registerSW } from "virtual:pwa-register";
import { usePwaUpdateStore } from "@/store/pwaUpdateStore";
import App from "./App";
import "./index.css";

const updateSW = registerSW({
  immediate: true,
  onRegisteredSW(_swUrl, registration) {
    usePwaUpdateStore.getState().setRegistration(registration);
  },
});

usePwaUpdateStore.getState().setUpdateSW(updateSW);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
