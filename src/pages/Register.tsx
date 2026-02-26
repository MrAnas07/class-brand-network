import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  createUserWithEmailAndPassword,
  type User as FirebaseUser
} from 'firebase/auth';
import {
  doc,
  setDoc,
  serverTimestamp
} from 'firebase/firestore';
import { auth, db, signInWithGoogle } from '../services/firebase';
import { Toast } from '../components/Toast';
import { useToast } from '../hooks/useToast';
import { getFirebaseError } from '../utils/errorMessages';

const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast, showToast, hideToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password || !confirmPassword) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    if (password !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    if (password.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }

    try {
      setLoading(true);

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user: FirebaseUser = userCredential.user;

      // Create user profile in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        role: 'student',
        banned: false,
        createdAt: serverTimestamp()
      });

      showToast('Account created successfully! Welcome aboard 🎉', 'success');
      navigate('/dashboard');
    } catch (error: any) {
      showToast(getFirebaseError(error), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      showToast('Account created successfully! Welcome aboard 🎉', 'success');
      navigate('/dashboard');
    } catch (error: any) {
      showToast(getFirebaseError(error), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 pt-24 flex items-center justify-center animate-fadeIn">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
      <div className="w-full max-w-md bg-white/60 backdrop-blur-xl border border-white/50 shadow-2xl rounded-3xl p-8 mx-auto animate-scaleIn">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent animate-fadeInDown">
            Create Account
          </h1>
          <p className="text-gray-600 mt-2">Get started with your dashboard</p>
        </div>

        {/* Google Sign In Button */}
        <div className="space-y-4">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className={`w-full flex items-center justify-center gap-3 rounded-xl py-3 animate-fadeInUp delay-100 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5 font-semibold border ${
              loading
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:opacity-90'
            }`}
            style={{backgroundColor: 'white', borderColor: '#e5e7eb'}}
            onMouseEnter={e => {
              if(!loading) e.currentTarget.style.backgroundColor = '#f9fafb';
            }}
            onMouseLeave={e => {
              if(!loading) e.currentTarget.style.backgroundColor = 'white';
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.66 15.63 16.88 16.79 15.71 17.57V20.34H19.28C21.36 18.42 22.56 15.6 22.56 12.25Z" fill="#4285F4"/>
              <path d="M12 23C14.97 23 17.46 22.02 19.28 20.34L15.71 17.57C14.73 18.23 13.48 18.64 12 18.64C9.14 18.64 6.72 16.63 5.84 14.05H2.18V16.96C4 20.6 7.7 23 12 23Z" fill="#34A853"/>
              <path d="M5.84 14.05C5.62 13.4 5.49 12.71 5.49 12C5.49 11.29 5.62 10.6 5.84 9.95V7.04H2.18C1.43 8.55 1 10.22 1 12C1 13.78 1.43 15.45 2.18 16.96L5.84 14.05Z" fill="#FBBC05"/>
              <path d="M12 5.36C13.62 5.36 15.06 5.93 16.21 7.04L19.36 4.07C17.45 2.24 14.97 1 12 1C7.7 1 4 3.4 2.18 7.04L5.84 9.95C6.72 7.37 9.14 5.36 12 5.36Z" fill="#EA4335"/>
            </svg>
            <span style={{color: '#1f2937'}}>Continue with Google</span>
          </button>

          {/* Divider */}
          <div className="relative flex items-center">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="flex-shrink mx-4 text-gray-500 text-sm">or continue with email</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#ffafcc]">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white/50 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-300 focus:scale-[1.01] text-gray-700"
              placeholder="your@email.com"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#ffafcc]">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white/50 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-300 focus:scale-[1.01] text-gray-700"
              placeholder="••••••••"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#ffafcc]">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white/50 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-300 focus:scale-[1.01] text-gray-700"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full text-white rounded-xl py-3 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 active:scale-95 font-semibold ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            style={{backgroundImage: 'linear-gradient(to right, #ec4899, #a855f7)'}}
            onMouseEnter={e => {
              if(!loading) e.currentTarget.style.backgroundImage = 'linear-gradient(to right, #db2777, #9333ea)';
            }}
            onMouseLeave={e => {
              if(!loading) e.currentTarget.style.backgroundImage = 'linear-gradient(to right, #ec4899, #a855f7)';
            }}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating account...
              </div>
            ) : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-[#ffafcc]">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-[#ffafcc] hover:text-[#ffc8dd] hover:underline transition-colors duration-300"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;