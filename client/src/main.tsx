import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Custom styles to match the design requirements
import { createGlobalStyle } from "styled-components";

const GlobalStyles = createGlobalStyle`
  body {
    font-family: 'Inter', sans-serif;
  }
  
  h1, h2, h3, h4, h5, h6 {
    font-family: 'Plus Jakarta Sans', sans-serif;
  }
`;

createRoot(document.getElementById("root")!).render(
  <>
    <GlobalStyles />
    <App />
  </>
);
