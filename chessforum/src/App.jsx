import "./App.css";
import React from "react";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./auth/protectedRoute.jsx";
import { AuthProvider } from "./auth/AuthContext.jsx";

import { Header } from "./frontend/components/header.jsx";

import { LandingPage } from "./frontend/pages/landingpage.jsx";
import { LoginPage } from "./frontend/pages/login.jsx";
import { SignupPage } from "./frontend/pages/signup.jsx";
import { CreateCommunity } from "./frontend/pages/createCommunity.jsx";
import { ShowPost } from "./frontend/pages/showSpecificPost.jsx";
import { ShowCommunity } from "./frontend/pages/showSpecificCommunity.jsx";


function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          <Route element={<Header />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/showSpecificPost" element={<ShowPost />} />
            <Route path="/showSpecificCommunity" element={<ShowCommunity />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/createCommunity" element={<CreateCommunity />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
