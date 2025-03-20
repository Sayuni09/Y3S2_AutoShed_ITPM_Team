import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./App.css";


import '@fortawesome/fontawesome-free/css/all.min.css';


// Modern way of rendering with React 18
const container = document.getElementById("root");
const root = createRoot(container);
root.render(<App />);

// The old way that's causing the error:
// ReactDOM.render(<App />, document.getElementById("root"));