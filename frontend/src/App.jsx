import { BrowserRouter } from "react-router-dom";
import React from 'react';
import Routes from "./Routes";

function App() {
  return (
    <BrowserRouter>
      <Routes />
    </BrowserRouter>
  );
}

export default App;
