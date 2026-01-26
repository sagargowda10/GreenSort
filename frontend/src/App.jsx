import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
// ... other imports
import ProfilePage from './pages/ProfilePage'; // <--- Import this

// Inside Routes:
<Route path="/profile" element={<ProfilePage />} />

// --- Component Imports ---
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import IdentifyPage from './pages/IdentifyPage'; 
import MapPage from './pages/MapPage'; // The corrected map component
import PickupPage from './pages/PickupPage';
import CommunityPage from './pages/CommunityPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-off-white">
          
          <Header />
          
          <main className="flex-grow">
            <Routes>
              <Route path="/login" element={<HomePage />} />
              <Route path="/" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/identify" element={<IdentifyPage />} />
              <Route path="/map" element={<MapPage />} />
           <Route path="/community" element={<CommunityPage />} />
            <Route path="/pickup" element={<PickupPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            </Routes>
          </main>
          
          <Footer />
          
          {/* Global Toast Container for notifications */}
          <ToastContainer position="top-right" autoClose={3000} />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;