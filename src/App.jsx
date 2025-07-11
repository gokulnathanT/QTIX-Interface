import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import Interview from './Pages/Interview'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Summary from './Components/Summary';

// import './App.css'



function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Interview />}></Route>
        <Route path="/Summary" element={<Summary />}></Route>
      </Routes>
    </Router>
  );
}

export default App
