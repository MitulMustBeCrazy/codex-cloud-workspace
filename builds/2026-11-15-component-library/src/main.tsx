import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./lib/motionbrew/tailwind.css";
import "./styles.css";
import "./QuietCanvas.css";

const root = document.getElementById("root");
if (!root) throw new Error("Missing root element");
createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
