import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import AppRoutes from "./AppRoutes.jsx";
import LanguageProvider from "./i18n/LanguageProvider";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <AppRoutes />
      </LanguageProvider>
    </BrowserRouter>
  </StrictMode>,
);
