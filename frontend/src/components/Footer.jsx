import React from 'react';
import { Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-charcoal text-white py-8 mt-auto">
      <div className="container mx-auto px-4 text-center">
        <p className="flex items-center justify-center gap-2 mb-4">
          Made with <Heart className="w-4 h-4 text-red-500 fill-current" /> for a cleaner planet.
        </p>
        <div className="text-gray-400 text-sm">
          &copy; {new Date().getFullYear()} GreenSort. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;