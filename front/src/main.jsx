import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import Page from "./components/Page.jsx";
createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* <App /> */}
    <Page />
  </StrictMode>
);
