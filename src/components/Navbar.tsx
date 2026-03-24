import React from 'react';
import { LogIn, LogOut, LayoutDashboard, User, ShieldCheck, DollarSign } from 'lucide-react';
import { auth } from '../firebase';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { UserProfile } from '../types';

interface NavbarProps {
  user: UserProfile | null;
  onViewChange: (view: 'offers' | 'dashboard' | 'admin') => void;
  currentView: string;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onViewChange, currentView }) => {
  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleLogout = () => signOut(auth);

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onViewChange('offers')}>
            <div className="bg-indigo-600 p-2 rounded-lg">
              <DollarSign className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">CPA ELITE</span>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <button 
              onClick={() => onViewChange('offers')}
              className={`text-sm font-medium transition-colors ${currentView === 'offers' ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Offers
            </button>
            {user && (
              <button 
                onClick={() => onViewChange('dashboard')}
                className={`text-sm font-medium transition-colors ${currentView === 'dashboard' ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-900'}`}
              >
                Dashboard
              </button>
            )}
            {user?.role === 'admin' && (
              <button 
                onClick={() => onViewChange('admin')}
                className={`text-sm font-medium transition-colors ${currentView === 'admin' ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-900'}`}
              >
                Admin
              </button>
            )}
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-sm font-semibold text-gray-900">${user.balance.toFixed(2)}</span>
                  <span className="text-xs text-gray-500">Balance</span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <button 
                onClick={handleLogin}
                className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-full hover:bg-indigo-700 transition-all shadow-sm hover:shadow-md"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
