import React from "react";
import UploadModalComp from "./components/UploadModalComp";
import NavBar from "./components/Nav";
import ListFilesComp from "./components/ListFilesComp";

import "./App.css";

function App() {
  return (
    <div className="App">
      <NavBar />
      <UploadModalComp />
      <ListFilesComp />
    </div>
  );
}

export default App;
