import { createRoot } from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import App from "./App";
import "./index.css";
import { queryClient } from "./lib/queryClient";

// Create root element and render the app
createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <Router>
      <App />
      <Toaster position="top-right" richColors />
    </Router>
  </QueryClientProvider>
);
