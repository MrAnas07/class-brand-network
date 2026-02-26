import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar: React.FC = () => {
  const { currentUser, logout, userRole, isAdmin, loading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      setIsMobileMenuOpen(false);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  // Don't render navbar during loading
  if (loading) {
    return null;
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 w-full backdrop-blur-md bg-white/20 border-b border-white/30 shadow-lg animate-fadeInDown">
      <div className="max-w-7xl mx-auto px-4 w-full flex justify-between items-center">
        <div className="flex-shrink-0">
          <div className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent animate-fadeInLeft">
            <Link to="/" className="hover:opacity-80 transition-opacity">
              Class Brand Network
            </Link>
          </div>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:block">
          <div className="ml-10 flex items-baseline space-x-4">
            <Link
              to="/"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105 ${
                isActive('/')
                  ? 'text-pink-600 bg-white/30'
                  : 'text-gray-700 hover:text-pink-600'
              }`}
            >
              Home
            </Link>

            {currentUser && (
              <Link
                to="/dashboard"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105 ${
                  isActive('/dashboard')
                    ? 'text-pink-600 bg-white/30'
                    : 'text-gray-700 hover:text-pink-600'
                }`}
              >
                Dashboard
              </Link>
            )}

            {isAdmin && (
              <Link
                to="/admin"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105 ${
                  isActive('/admin')
                    ? 'text-pink-600 bg-white/30'
                    : 'text-gray-700 hover:text-pink-600'
                }`}
              >
                Admin Panel
              </Link>
            )}
          </div>
        </div>

        <div className="hidden md:block">
          <div className="flex items-center space-x-4">
            {!currentUser ? (
              <>
                <Link
                  to="/login"
                  className="text-pink-600 rounded-full px-5 py-2 animate-fadeInRight transition-all duration-300 hover:scale-105 border border-pink-400"
                  style={{backgroundColor: 'transparent'}}
                  onMouseEnter={e => {
                    e.currentTarget.style.backgroundColor = '#fce7f3';
                    e.currentTarget.style.borderColor = '#f472b6';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.borderColor = '#f9a8d4';
                  }}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-white rounded-full px-5 py-2 animate-fadeInRight delay-100 transition-all duration-300 hover:scale-105"
                  style={{backgroundImage: 'linear-gradient(to right, #ec4899, #a855f7)'}}
                  onMouseEnter={e => e.currentTarget.style.backgroundImage='linear-gradient(to right, #db2777, #9333ea)'}
                  onMouseLeave={e => e.currentTarget.style.backgroundImage='linear-gradient(to right, #ec4899, #a855f7)'}
                >
                  Register
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-500 px-3 py-1.5 rounded-full">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt="Profile"
                    referrerPolicy="no-referrer"
                    className="w-8 h-8 rounded-full object-cover border-2 border-white flex-shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                    <span className="text-pink-500 font-bold text-sm">
                      {currentUser.email?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                )}
                <span className="text-white font-semibold text-sm hidden sm:block">
                  {currentUser.displayName || currentUser.email?.split('@')[0] || 'User'}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-white font-semibold text-sm px-3 py-1 rounded-md animate-fadeInRight transition-all duration-300 hover:scale-105"
                  style={{backgroundImage: 'linear-gradient(to right, #ec4899, #a855f7)'}}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="inline-flex items-center justify-center p-2 rounded-md text-[#ffafcc] hover:text-[#ffc8dd] hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#ffafcc]"
          >
            <svg
              className={`${isMobileMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <svg
              className={`${isMobileMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:hidden backdrop-blur-lg bg-white/70 border-t border-white/20`}>
        <div className="px-2 pt-2 pb-3 space-y-1">
          <Link
            to="/"
            className={`block px-3 py-2 rounded-lg text-base font-medium transition-all duration-300 ${
              isActive('/')
                ? 'text-[#ffafcc] bg-white/20'
                : 'text-[#ffafcc] hover:text-[#ffc8dd] hover:bg-white/20'
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Home
          </Link>

          {currentUser && (
            <Link
              to="/dashboard"
              className={`block px-3 py-2 rounded-lg text-base font-medium transition-all duration-300 ${
                isActive('/dashboard')
                  ? 'text-[#ffafcc] bg-white/20'
                  : 'text-[#ffafcc] hover:text-[#ffc8dd] hover:bg-white/20'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
          )}

          {isAdmin && (
            <Link
              to="/admin"
              className={`block px-3 py-2 rounded-lg text-base font-medium transition-all duration-300 ${
                isActive('/admin')
                  ? 'text-[#ffafcc] bg-white/20'
                  : 'text-[#ffafcc] hover:text-[#ffc8dd] hover:bg-white/20'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Admin Panel
            </Link>
          )}

          {!currentUser ? (
            <>
              <Link
                to="/login"
                className="block px-3 py-2 rounded-lg text-base font-medium transition-all duration-300 text-[#ffafcc]"
                style={{backgroundColor: isActive('/login') ? 'rgba(255, 255, 255, 0.2)' : 'transparent'}}
                onMouseEnter={e => {
                  if(!isActive('/login')) {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                    e.currentTarget.style.color = '#ffc8dd';
                  }
                }}
                onMouseLeave={e => {
                  if(!isActive('/login')) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#ffafcc';
                  }
                }}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="block w-full text-left px-3 py-2 rounded-lg text-base font-medium text-black transition-all duration-300"
                style={{backgroundColor: '#ffafcc'}}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = '#ffc8dd';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = '#ffafcc';
                }}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Register
              </Link>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-500 px-3 py-1.5 rounded-full">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt="Profile"
                    referrerPolicy="no-referrer"
                    className="w-8 h-8 rounded-full object-cover border-2 border-white flex-shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                    <span className="text-pink-500 font-bold text-sm">
                      {currentUser.email?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                )}
                <span className="text-white font-semibold text-sm hidden sm:block">
                  {currentUser.displayName || currentUser.email?.split('@')[0] || 'User'}
                </span>
              </div>
              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full text-left px-3 py-2 rounded-lg text-base font-medium text-black transition-all duration-300"
                style={{backgroundColor: '#ffafcc'}}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = '#ffc8dd';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = '#ffafcc';
                }}
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;