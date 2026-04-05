import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';

// Components
import Header from './components/Header';
import Footer from './components/Footer';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import IdentifyPage from './pages/IdentifyPage';
import MapPage from './pages/MapPage';
import PickupPage from './pages/PickupPage';
import CommunityPage from './pages/CommunityPage';
import ProfilePage from './pages/ProfilePage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-off-white">

          <Header />

          <main className="flex-grow">
            <Routes>

              {/* ✅ FIXED ROUTES */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/identify" element={<IdentifyPage />} />
              <Route path="/map" element={<MapPage />} />
              <Route path="/community" element={<CommunityPage />} />
              <Route path="/pickup" element={<PickupPage />} />
              <Route path="/profile" element={<ProfilePage />} />

            </Routes>
          </main>

          <Footer />

          <ToastContainer position="top-right" autoClose={3000} />

        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;