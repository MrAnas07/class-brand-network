import React, { useState, useEffect } from 'react';
import {
  collection,
  getDocs,
  query,
  updateDoc,
  doc,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { Toast } from '../components/Toast';
import { useToast } from '../hooks/useToast';
import { getFirebaseError } from '../utils/errorMessages';

interface User {
  id: string;
  email: string;
  role: string;
  banned: boolean;
  createdAt: any;
}

interface Brand {
  id: string;
  brandName: string;
  description: string;
  ownerId: string;
  likeCount: number;
  followerCount: number;
  createdAt: any;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBrands: 0,
    totalLikes: 0,
    totalFollowers: 0
  });
  const { toast, showToast, hideToast } = useToast();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load users
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersData = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as User[];
      setUsers(usersData);

      // Load brands
      const brandsSnapshot = await getDocs(collection(db, 'brands'));
      const brandsData = brandsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Brand[];
      setBrands(brandsData);

      // Calculate stats
      setStats({
        totalUsers: usersData.length,
        totalBrands: brandsData.length,
        totalLikes: brandsData.reduce((sum, brand) => sum + (brand.likeCount || 0), 0),
        totalFollowers: brandsData.reduce((sum, brand) => sum + (brand.followerCount || 0), 0)
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      showToast('Failed to load dashboard data. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleUserBan = async (userId: string, isBanned: boolean) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        banned: !isBanned,
        updatedAt: serverTimestamp()
      });

      // Refresh data
      loadDashboardData();
      showToast(isBanned ? 'User unbanned successfully.' : 'User banned successfully.', 'info');
    } catch (error) {
      console.error('Error updating user ban status:', error);
      showToast(getFirebaseError(error), 'error');
    }
  };

  const handleMakeAdmin = async (userId: string) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        role: 'admin',
        updatedAt: serverTimestamp()
      });

      // Refresh data
      loadDashboardData();
      showToast('User role updated to Admin ✅', 'success');
    } catch (error) {
      console.error('Error updating user role:', error);
      showToast(getFirebaseError(error), 'error');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user? This will also delete their brands.')) {
      try {
        await deleteDoc(doc(db, 'users', userId));
        // Refresh data
        loadDashboardData();
        showToast('User deleted successfully.', 'info');
      } catch (error) {
        console.error('Error deleting user:', error);
        showToast(getFirebaseError(error), 'error');
      }
    }
  };

  const handleDeleteBrand = async (brandId: string) => {
    if (window.confirm('Are you sure you want to delete this brand?')) {
      try {
        await deleteDoc(doc(db, 'brands', brandId));
        // Refresh data
        loadDashboardData();
        showToast('Brand deleted successfully.', 'info');
      } catch (error) {
        console.error('Error deleting brand:', error);
        showToast(getFirebaseError(error), 'error');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-100 pt-24 px-6 pb-12 animate-fadeIn">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent animate-fadeInDown">
            Admin Dashboard
          </h1>
          <p className="text-gray-500 mt-1">Manage users and brands across the platform</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {/* Total Users */}
          <div
            className="bg-white/70 backdrop-blur-md border border-white/50 shadow-lg rounded-2xl p-6 animate-fadeInUp"
            style={{ animationDelay: '0.1s', opacity: 0 }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-500 text-sm font-medium">Total Users</span>
              <span className="text-2xl">👥</span>
            </div>
            <p className="text-3xl font-bold text-pink-600">{stats.totalUsers}</p>
          </div>

          {/* Total Brands */}
          <div
            className="bg-white/70 backdrop-blur-md border border-white/50 shadow-lg rounded-2xl p-6 animate-fadeInUp"
            style={{ animationDelay: '0.2s', opacity: 0 }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-500 text-sm font-medium">Total Brands</span>
              <span className="text-2xl">🏷️</span>
            </div>
            <p className="text-3xl font-bold text-purple-600">{stats.totalBrands}</p>
          </div>

          {/* Total Likes */}
          <div
            className="bg-white/70 backdrop-blur-md border border-white/50 shadow-lg rounded-2xl p-6 animate-fadeInUp"
            style={{ animationDelay: '0.3s', opacity: 0 }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-500 text-sm font-medium">Total Likes</span>
              <span className="text-2xl">❤️</span>
            </div>
            <p className="text-3xl font-bold text-rose-500">{stats.totalLikes}</p>
          </div>

          {/* Total Followers */}
          <div
            className="bg-white/70 backdrop-blur-md border border-white/50 shadow-lg rounded-2xl p-6 animate-fadeInUp"
            style={{ animationDelay: '0.4s', opacity: 0 }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-500 text-sm font-medium">Total Followers</span>
              <span className="text-2xl">⭐</span>
            </div>
            <p className="text-3xl font-bold text-indigo-600">{stats.totalFollowers}</p>
          </div>
        </div>

        {/* Two column management section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Users Management card */}
          <div className="bg-white/70 backdrop-blur-md border border-white/50 shadow-lg rounded-2xl p-6 animate-fadeInLeft">
            <h2 className="text-xl font-bold text-gray-800 mb-5 flex items-center gap-2">
              👥 Users Management
            </h2>
            <div className="space-y-3">
              {users.map((user, index) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between bg-white/60 border border-gray-100 rounded-xl px-4 py-3 animate-fadeInUp hover-lift"
                  style={{ animationDelay: `${index * 0.05}s`, opacity: 0 }}
                >
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{user.email || user.displayName || 'Unknown User'}</p>
                    <div className="flex gap-2 mt-1">
                      <span className={`${
                        user.role === 'admin'
                          ? 'bg-purple-100 text-purple-600'
                          : 'bg-blue-100 text-blue-600'
                      } text-xs font-medium px-2 py-0.5 rounded-full`}>
                        {user.role || 'user'}
                      </span>
                      <span className={`${
                        user.banned
                          ? 'bg-red-100 text-red-600'
                          : 'bg-green-100 text-green-600'
                      } text-xs font-medium px-2 py-0.5 rounded-full`}>
                        {user.banned ? 'Banned' : 'Active'}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {user.role !== 'admin' && (
                      <button
                        onClick={() => handleMakeAdmin(user.id)}
                        className="text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-300 hover:scale-105 active:scale-95"
                        style={{backgroundImage: 'linear-gradient(to right, #a855f7, #6366f1)'}}
                        onMouseEnter={e => e.currentTarget.style.backgroundImage='linear-gradient(to right, #9333ea, #4f46e5)'}
                        onMouseLeave={e => e.currentTarget.style.backgroundImage='linear-gradient(to right, #a855f7, #6366f1)'}
                      >
                        Make Admin
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="text-red-500 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-300 hover:scale-105 active:scale-95 border-2 border-red-400"
                      style={{backgroundColor: 'transparent'}}
                      onMouseEnter={e => { e.currentTarget.style.backgroundColor='#ef4444'; e.currentTarget.style.color='white'; }}
                      onMouseLeave={e => { e.currentTarget.style.backgroundColor='transparent'; e.currentTarget.style.color='#ef4444'; }}
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => toggleUserBan(user.id, user.banned)}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-300 hover:scale-105 active:scale-95 border-2"
                      style={{backgroundColor: 'transparent', borderColor: user.banned ? '#22c55e' : '#ef4444', color: user.banned ? '#22c55e' : '#ef4444'}}
                      onMouseEnter={e => {
                        e.currentTarget.style.backgroundColor = user.banned ? '#22c55e' : '#ef4444';
                        e.currentTarget.style.color = 'white';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = user.banned ? '#22c55e' : '#ef4444';
                      }}
                    >
                      {user.banned ? 'Unban' : 'Ban'}
                    </button>
                  </div>
                </div>
              ))}
              {users.length === 0 && (
                <p className="text-center text-gray-400 py-6">No users found</p>
              )}
            </div>
          </div>

          {/* Brands Management card */}
          <div className="bg-white/70 backdrop-blur-md border border-white/50 shadow-lg rounded-2xl p-6 animate-fadeInRight">
            <h2 className="text-xl font-bold text-gray-800 mb-5 flex items-center gap-2">
              🏷️ Brands Management
            </h2>
            <div className="space-y-3">
              {brands.map((brand, index) => (
                <div
                  key={brand.id}
                  className="flex items-center justify-between bg-white/60 border border-gray-100 rounded-xl px-4 py-3 animate-fadeInUp hover-lift"
                  style={{ animationDelay: `${index * 0.05}s`, opacity: 0 }}
                >
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{brand.brandName || 'Unnamed Brand'}</p>
                    <div className="flex gap-2 mt-1 flex-wrap">
                      <span className="bg-pink-100 text-pink-600 text-xs font-medium px-2 py-0.5 rounded-full">
                        {brand.category || 'General'}
                      </span>
                      <span className="text-xs text-gray-400">
                        ❤️ {brand.likeCount || 0} · 👥 {brand.followerCount || 0}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteBrand(brand.id)}
                    className="text-red-500 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-300 hover:scale-105 active:scale-95 border-2 border-red-400"
                    style={{backgroundColor: 'transparent'}}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor='#ef4444'; e.currentTarget.style.color='white'; }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor='transparent'; e.currentTarget.style.color='#ef4444'; }}
                  >
                    Delete
                  </button>
                </div>
              ))}
              {brands.length === 0 && (
                <p className="text-center text-gray-400 py-6">No brands found</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}