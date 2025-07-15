import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import Interview from './Pages/Interview'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Summary from './Components/Summary';
import Home from './Pages/Home';
import Profile from './Pages/Profile';



function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />}/>
        <Route path="/Summary" element={<Summary />}/>
        <Route path="/Profile" element={<Profile/>}/>
        <Route path="/Interview" element={<Interview/>}/>
      </Routes>
    </Router>
  );
}

export default App
