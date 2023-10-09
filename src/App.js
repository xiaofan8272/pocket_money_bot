
import React, { useEffect } from "react";
import './App.css';
import Home from './Home';
import xglobal from "./util/xglobal";
import {defBaseUrl} from "./util/xdef";
function App() {
  useEffect(() => {
    xglobal.inst().baseUrl = defBaseUrl;
  }, []);
  return (
    <div className="App">
      <Home/>
    </div>
  );
}

export default App;
