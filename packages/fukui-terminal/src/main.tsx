import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { Header } from "./components/parts/header";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Header />
    <App />
  </StrictMode>,
);
