import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Menu, X, Recycle, MapPin, Camera, 
  Truck, Users, User, Home, ChevronRight 
} from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  // Detect scroll to change header styling dynamically
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Helper to check if a link is active
  const isActive = (path) => location.pathname === path;

  // Navigation Items Configuration
  const navItems = [
    { name: 'Home', path: '/login', icon: Home },
    { name: 'Identify', path: '/identify', icon: Camera },
    { name: 'Map', path: '/map', icon: MapPin },
    { name: 'Pickup', path: '/pickup', icon: Truck },
    { name: 'Community', path: '/community', icon: Users },
  ];

  return (
    <header 
      className={`sticky top-0 z-50 transition-all duration-300 border-b ${
        isScrolled 
          ? 'bg-white/90 backdrop-blur-md shadow-md py-2 border-gray-200' 
          : 'bg-white py-4 border-transparent'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          
          {/* --- Logo Section --- */}
          <Link 
            to="/" 
            className="flex items-center space-x-2 group"
            onClick={() => setIsMenuOpen(false)}
          >
            <div className="bg-green-100 p-2 rounded-lg group-hover:bg-green-500 transition-colors duration-300">
              <Recycle className="w-6 h-6 text-green-600 group-hover:text-white transition-colors" />
            </div>
            <span className="text-xl font-bold font-heading text-gray-800 tracking-tight">
              Green<span className="text-green-600">Sort</span>
            </span>
          </Link>

          {/* --- Desktop Navigation --- */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  isActive(item.path)
                    ? 'bg-green-50 text-green-700 shadow-sm ring-1 ring-green-200'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-green-600'
                }`}
              >
                <item.icon className={`w-4 h-4 ${isActive(item.path) ? 'fill-current' : ''}`} />
                <span>{item.name}</span>
              </Link>
            ))}

            {/* Profile Button (Distinct Style) */}
            <div className="pl-2 ml-2 border-l border-gray-200">
              <Link 
                to="/profile" 
                className={`flex items-center space-x-2 pl-4 pr-2 py-1 transition-colors ${
                   isActive('/profile') ? 'text-green-600' : 'text-gray-500 hover:text-green-600'
                }`}
              >
                 <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-green-400 to-teal-500 flex items-center justify-center text-white shadow-sm">
                    <User className="w-4 h-4" />
                 </div>
              </Link>
            </div>
          </nav>

          {/* --- Mobile Menu Button --- */}
          <button 
            className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* --- Mobile Menu Dropdown (Animated) --- */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-h-96 opacity-100 border-t' : 'max-h-0 opacity-0'}`}>
        <div className="bg-white px-4 py-4 space-y-2 shadow-inner">
          {navItems.map((item) => (
            <Link 
              key={item.name}
              to={item.path} 
              className={`flex items-center justify-between p-3 rounded-xl transition ${
                isActive(item.path) 
                  ? 'bg-green-50 text-green-700 font-semibold' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              <div className="flex items-center space-x-3">
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </div>
              {isActive(item.path) && <div className="w-2 h-2 bg-green-500 rounded-full"></div>}
            </Link>
          ))}
          
          <div className="border-t border-gray-100 my-2 pt-2">
            <Link 
              to="/profile" 
              className="flex items-center justify-between p-3 text-gray-600 hover:bg-gray-50 rounded-xl"
              onClick={() => setIsMenuOpen(false)}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="w-4 h-4" />
                </div>
                <span>My Profile</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;