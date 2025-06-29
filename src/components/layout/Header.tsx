import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, UserCircle, LogOut, Heart, CreditCard, DollarSign } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuthStore } from '../../store/authStore';
import { useTherapistStore } from '../../store/therapistStore';

export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const { isTherapist, checkTherapistStatus } = useTherapistStore();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      checkTherapistStatus(user.id);
    }
  }, [user]);

  

  // Generate navigation items based on user role
  const getNavItems = () => {
    if (!user) return [];
    
    const commonItems = [
    
      { label: 'Resources', path: '/resources' },
      { label: 'Messages', path: '/messages' },
      { label: 'Payments', path: '/payment-history' },
    
    ];
    
    if (user.role === 'therapist') {
      return [
        { label: 'Doctor Dashboard', path: '/doctor-dashboard' },
        { label: 'Earnings', path: '/earnings' },
        ...commonItems,
      ];
    } else {
      return [
        { label: 'Dashboard', path: '/dashboard' },
          { label: 'Therapists', path: '/therapists' },
      { label: 'AI Chat', path: '/ai-chat' },
       { label: 'Journal', path: '/journal' },
        { label: 'Subscriptions', path: '/subscriptions' },
        ...commonItems,
      ];
    }
  };
  
  const navItems = getNavItems();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className=" mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <div className="flex items-center justify-center bg-accent-coral w-8 h-8 rounded-md text-white mr-2">
                <Heart className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-gray-800">Serenity Ai</span>
            </Link>
          </div>
          
          {/* Desktop navigation */}
          <nav className="hidden md:flex space-x-8">
            {user && navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  location.pathname === item.path
                    ? 'text-accent-teal bg-neutral-light-gray'
                    : 'text-gray-600 hover:bg-neutral-light-gray hover:text-accent-teal'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          
          <div className="hidden md:flex items-center">
            {user ? (
              <div className="flex items-center space-x-3">
                <Link to="/profile" className="flex items-center text-gray-600 hover:text-gray-800 transition-colors">
                  {user.avatar_url ? (
                    <img 
                      src={user.avatar_url} 
                      alt={user.full_name} 
                      className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm"
                    />
                  ) : (
                    <UserCircle className="w-9 h-9" />
                  )}
                  <span className="ml-2 font-medium">{user.full_name}</span>
                  {user.role === 'therapist' && (
                    <span className="ml-2 px-2 py-0.5 text-xs bg-pastel-sage text-accent-teal border border-accent-teal/20 rounded-full">
                      Therapist
                    </span>
                  )}
                </Link>
                
              </div>
            ) : (
              <div className="flex space-x-4">
                <Button variant="outline" onClick={() => navigate('/login')}>
                  Sign In
                </Button>
                <Button onClick={() => navigate('/signup')}>
                  Sign Up
                </Button>
              </div>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              className="p-2 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors"
              onClick={toggleMenu}
            >
              {isMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-md animate-fade-in">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {user && navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`block px-3 py-2 rounded-lg text-base font-medium transition-colors ${
                  location.pathname === item.path
                    ? 'text-accent-teal bg-neutral-light-gray'
                    : 'text-gray-600 hover:bg-neutral-light-gray hover:text-accent-teal'
                }`}
                onClick={closeMenu}
              >
                {item.label}
              </Link>
            ))}
            
            {user ? (
              <>
                <Link 
                  to="/profile" 
                  className="flex items-center px-3 py-2 rounded-lg text-base font-medium text-gray-600 hover:bg-neutral-light-gray hover:text-accent-teal transition-colors"
                  onClick={closeMenu}
                >
                  <UserCircle className="w-5 h-5 mr-2 text-accent-teal" />
                  Profile
                </Link>
                <button 
                  className="flex w-full items-center px-3 py-2 rounded-lg text-base font-medium text-gray-600 hover:bg-neutral-light-gray hover:text-red-500 transition-colors"
                  onClick={() => {
                    handleLogout();
                    closeMenu();
                  }}
                >
                  <LogOut className="w-5 h-5 mr-2 text-red-500" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block px-3 py-2 rounded-lg text-base font-medium text-gray-600 hover:bg-neutral-light-gray hover:text-accent-teal transition-colors"
                  onClick={closeMenu}
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="block px-3 py-2 rounded-lg text-base font-medium text-gray-600 hover:bg-neutral-light-gray hover:text-accent-teal transition-colors"
                  onClick={closeMenu}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};