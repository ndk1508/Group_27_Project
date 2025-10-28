import React from "react";
import { createRoot } from "react-dom/client";
// Explicitly import the .jsx file to avoid resolving App.js (which has no default export)
import App from "./App.jsx";

const root = createRoot(document.getElementById("root"));
root.render(<App />);
