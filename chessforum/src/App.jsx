import './App.css'
import React from 'react';

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './auth/protectedRoute.jsx';
import { AuthProvider } from './auth/AuthContext.jsx';

import { LandingPage } from './frontend/pages/landingpage.jsx'
import { LoginPage } from './frontend/pages/login.jsx';
import { SignupPage } from './frontend/pages/signup.jsx';
import { CreateCommunity } from './frontend/pages/createCommunity.jsx';


function App() {
  return (
    <AuthProvider>
    <BrowserRouter>
      <Routes>
        
        <Route path="/" element = {< LandingPage/>}/> 
        <Route path="/login" element = {< LoginPage/>}/> 
        <Route path="/signup" element = {< SignupPage/>}/> 

        <Route element={<ProtectedRoute />}>
          <Route path="/createCommunity" element= {<CreateCommunity/>}/>
        </Route>

      </Routes>
    </BrowserRouter>
    </AuthProvider>
  );
}

export default App
