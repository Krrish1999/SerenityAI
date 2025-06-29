import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Instagram, Twitter, Facebook } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="flex items-center">
              <div className="flex items-center justify-center bg-accent-coral w-8 h-8 rounded-md text-white mr-2">
                <Heart className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-gray-800">Serenity Ai</span>
            </div>
            <p className="mt-4 text-gray-500 text-sm">
              Empowering you on your mental health journey through accessible resources, professional support, and self-care tools.
            </p>
            <div className="mt-4 flex space-x-4">
              <a href="#" className="text-gray-500 hover:text-accent-teal transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-accent-teal transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-accent-teal transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-800 tracking-wider uppercase">Resources</h3>
            <ul className="mt-4 space-y-2">
              <li><Link to="/resources" className="text-gray-500 hover:text-accent-teal transition-colors">Articles</Link></li>
              <li><Link to="/resources" className="text-gray-500 hover:text-accent-teal transition-colors">Self-help</Link></li>
              <li><Link to="/resources" className="text-gray-500 hover:text-accent-teal transition-colors">Crisis Support</Link></li>
              <li><Link to="/resources" className="text-gray-500 hover:text-accent-teal transition-colors">Wellness Tips</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-800 tracking-wider uppercase">Company</h3>
            <ul className="mt-4 space-y-2">
              <li><Link to="/about" className="text-gray-500 hover:text-accent-teal transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="text-gray-500 hover:text-accent-teal transition-colors">Contact</Link></li>
              <li><Link to="/careers" className="text-gray-500 hover:text-accent-teal transition-colors">Careers</Link></li>
              <li><Link to="/for-therapists" className="text-gray-500 hover:text-accent-teal transition-colors">For Therapists</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-800 tracking-wider uppercase">Legal</h3>
            <ul className="mt-4 space-y-2">
              <li><Link to="/privacy" className="text-gray-500 hover:text-accent-teal transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-gray-500 hover:text-accent-teal transition-colors">Terms of Service</Link></li>
              <li><Link to="/accessibility" className="text-gray-500 hover:text-accent-teal transition-colors">Accessibility</Link></li>
              <li><Link to="/cookie-policy" className="text-gray-500 hover:text-accent-teal transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} MindWell. All rights reserved.
          </p>
          <p className="text-sm text-gray-500 mt-2 md:mt-0 flex items-center">
            Made with <Heart className="w-4 h-4 mx-1 text-accent-coral" /> for mental well-being
          </p>
        </div>
      </div>
    </footer>
  );
};
