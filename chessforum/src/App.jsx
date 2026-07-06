import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css'

import { LandingPage } from './frontend/pages/landingpage.jsx'
import { LoginPage } from './frontend/pages/login.jsx';
import { SignupPage } from './frontend/pages/signup.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element = {< LandingPage/>}/> 
        <Route path="/login" element = {< LoginPage/>}/> 
        <Route path="/signup" element = {< SignupPage/>}/> 

      </Routes>
    </BrowserRouter>
  );
}

export default App
