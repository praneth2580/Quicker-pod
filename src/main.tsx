import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { registerSW } from "virtual:pwa-register";
import { usePwaUpdateStore } from "@/store/pwaUpdateStore";
import App from "./App";
import "./index.css";

const swUrl = `${import.meta.env.BASE_URL}sw.js`;
const scope = import.meta.env.BASE_URL;

usePwaUpdateStore.getState().setSwConfig(swUrl, scope);

const updateSW = registerSW({
  immediate: true,
  onRegisteredSW(registeredSwUrl, registration) {
    usePwaUpdateStore.getState().setSwConfig(registeredSwUrl, scope);
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
