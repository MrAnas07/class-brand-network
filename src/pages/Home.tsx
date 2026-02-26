import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db, toggleFollow, toggleLike } from '../services/firebase';
import BrandCard from '../components/BrandCard';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Toast } from '../components/Toast';
import { useToast } from '../hooks/useToast';
import { getFirebaseError } from '../utils/errorMessages';

interface Brand {
  id: string;
  userId: string;
  brandName: string;
  description: string;
  category?: string;
  instagramUrl: string;
  facebookUrl: string;
  followers: number;
  createdAt: any;
  updatedAt: any;
  followers?: string[];
  likes?: string[];
  followerCount?: number;
  likeCount?: number;
  ownerId?: string;
}

const Home: React.FC = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { toast, showToast, hideToast } = useToast();

  useEffect(() => {
    console.log('Home useEffect running');
    const q = query(collection(db, 'brands'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        console.log('Snapshot received, size:', snapshot.size);
        const brandsData = snapshot.docs.map(doc => {
          const data = doc.data();
          console.log('Brand data:', doc.id, data);
          return {
            id: doc.id,
            ...data,
            category: data.category || 'Technology'
          } as Brand;
        });

        // Sort client-side instead of Firestore orderBy
        brandsData.sort((a, b) => (b.followerCount || 0) - (a.followerCount || 0));
        console.log('Sorted brands:', brandsData);

        setBrands(brandsData);
        setLoading(false);
        console.log('Brands set, loading false');
      },
      (error) => {
        console.error("Firestore error:", error);
        setError("Failed to load brands");
        showToast('Could not load brands. Please try again.', 'error');
        setLoading(false);
        console.log('Error set, loading false');
      }
    );

    return () => {
      console.log('Unsubscribing from snapshot');
      unsubscribe();
    };
  }, []);

  const handleFollow = async (brandId: string, brandOwnerId: string) => {
    if (!currentUser) {
      showToast('Please login to follow brands 👋', 'info');
      return;
    }
    if (currentUser.uid === brandOwnerId) return;

    try {
      await toggleFollow(brandId, currentUser.uid, brandOwnerId);
      const brand = brands.find(b => b.id === brandId);
      const isFollowing = brand?.followers?.includes(currentUser.uid);
      showToast(isFollowing ? 'Unfollowed successfully' : 'Following! 🎉', 'success');
    } catch (error) {
      console.error('Error following brand:', error);
      showToast(getFirebaseError(error), 'error');
    }
  };

  const handleAddBrand = () => {
    if (currentUser) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 w-full pt-20 animate-fadeIn">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
      {/* Hero Section */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-6 animate-fadeInUp">
            Discover Student Brands
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-10 animate-fadeInUp delay-200">
            Connect, follow and support brands created by students in your class.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fadeInUp delay-300">
            <button
              onClick={() => document.getElementById('brands')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full px-8 py-3 transition-all duration-300 hover:scale-110 hover:-translate-y-1 font-semibold"
            >
              Explore Brands
            </button>
            <button
              onClick={handleAddBrand}
              className="border-2 border-pink-400 text-pink-600 rounded-full px-8 py-3 hover:bg-pink-50 transition-all duration-300 hover:scale-105 hover:-translate-y-1 font-semibold"
            >
              Add Your Brand
            </button>
          </div>
        </div>
      </div>

      {/* Loading, Error and Brands Section */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500">Loading brands...</p>
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="text-center py-20">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Failed to load brands</h3>
            <p className="text-gray-600">Please refresh the page or try again later.</p>
          </div>
        )}

        {!loading && !error && brands.length === 0 && (
          <div className="text-center py-20">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">No brands available yet</h3>
            <p className="text-gray-600">Be the first to create a brand and inspire others!</p>
            <button
              onClick={handleAddBrand}
              className="mt-6 bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-3 rounded-full hover:shadow-xl hover:scale-105 transition-all font-semibold"
            >
              Create Your Brand
            </button>
          </div>
        )}

        {!loading && !error && brands.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-700 animate-fadeInLeft">Featured Brands</h2>
              <div className="text-sm text-gray-600 animate-fadeInRight">
                {brands.length} {brands.length === 1 ? 'brand' : 'brands'} available
              </div>
            </div>

            <div id="brands" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
              {brands.map((brand, index) => {
                const followers = Array.isArray(brand.followers) ? brand.followers : [];
                const isFollowing = followers.includes(currentUser?.uid);
                const likes = Array.isArray(brand.likes) ? brand.likes : [];
                const isLiked = likes.includes(currentUser?.uid);
                const isOwner = currentUser?.uid === brand.ownerId;

                return (
                  <div
                    key={brand.id}
                    className="animate-fadeInUp hover-lift"
                    style={{ animationDelay: `${index * 0.1}s`, opacity: 0 }}
                  >
                    <div className="bg-white/70 backdrop-blur-md border border-white/50 shadow-lg hover:shadow-xl hover:scale-105 transition-all rounded-2xl p-6 h-full">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-pink-600 mb-2">{brand.brandName}</h3>
                          <p className="text-sm text-gray-600 mb-3">{brand.description}</p>
                          <span className="bg-gradient-to-r from-pink-100 to-purple-100 text-pink-700 text-xs px-2 py-1 rounded-full">{brand.category}</span>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-2.5 py-0.5 rounded-full text-sm font-medium">
                            {brand.followerCount || 0} followers
                          </span>
                          <button
                            onClick={async () => {
                              if (!currentUser) {
                                showToast('Please login to like brands 👋', 'info');
                                return;
                              }
                              if (isOwner) return;
                              try {
                                await toggleLike(brand.id, currentUser.uid, brand.ownerId || '');
                                const brandData = brands.find(b => b.id === brand.id);
                                const isLiked = brandData?.likes?.includes(currentUser.uid);
                                showToast(isLiked ? 'Like removed' : 'Liked! ❤️', 'success');
                              } catch (error) {
                                console.error('Error liking brand:', error);
                                showToast(getFirebaseError(error), 'error');
                              }
                            }}
                            disabled={isOwner}
                            className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium transition-all duration-300 hover:scale-110 ${
                              isLiked
                                ? 'text-pink-600'
                                : 'text-gray-500'
                            }`}
                            style={{
                              backgroundColor: isLiked ? '#fce7f3' : '#f3f4f6'
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.backgroundColor = isLiked ? '#fbcfe8' : '#fbcfe8';
                              e.currentTarget.style.color = isLiked ? '#be123c' : '#ec4899';
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.backgroundColor = isLiked ? '#fce7f3' : '#f3f4f6';
                              e.currentTarget.style.color = isLiked ? '#be123c' : '#6b7280';
                            }}
                          >
                            {isLiked ? '❤️' : '🤍'} {brand.likeCount || 0}
                          </button>
                        </div>
                      </div>

                      <div className="flex space-x-2 mb-4">
                        {brand.instagramUrl && (
                          <a
                            href={brand.instagramUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              backgroundImage: 'linear-gradient(to right, #ec4899, #a855f7)',
                              color: 'white',
                              fontWeight: '600',
                              padding: '6px 14px',
                              borderRadius: '9999px',
                              fontSize: '12px',
                              textDecoration: 'none',
                              display: 'inline-block'
                            }}
                          >
                            Instagram
                          </a>
                        )}
                        {brand.facebookUrl && (
                          <a
                            href={brand.facebookUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              backgroundImage: 'linear-gradient(to right, #6366f1, #3b82f6)',
                              color: 'white',
                              fontWeight: '600',
                              padding: '6px 14px',
                              borderRadius: '9999px',
                              fontSize: '12px',
                              textDecoration: 'none',
                              display: 'inline-block'
                            }}
                          >
                            Facebook
                          </a>
                        )}
                      </div>

                      <button
                        onClick={async () => {
                          if (!currentUser) {
                            showToast('Please login to follow brands 👋', 'info');
                            return;
                          }
                          if (isOwner) return;
                          try {
                            await toggleFollow(brand.id, currentUser.uid, brand.ownerId || '');
                            const brandData = brands.find(b => b.id === brand.id);
                            const isFollowing = brandData?.followers?.includes(currentUser.uid);
                            showToast(isFollowing ? 'Unfollowed successfully' : 'Following! 🎉', 'success');
                          } catch (error) {
                            console.error('Error following brand:', error);
                            showToast(getFirebaseError(error), 'error');
                          }
                        }}
                        disabled={isOwner}
                        className={`w-full py-2 px-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 ${
                          isOwner
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : isFollowing
                              ? 'text-purple-600 border-2 border-purple-400'
                              : 'text-white'
                        }`}
                        style={{
                          backgroundImage: isOwner || isFollowing ? 'none' : 'linear-gradient(to right, #ec4899, #a855f7)',
                          backgroundColor: isOwner ? '#f3f4f6' : isFollowing ? '#f3e8ff' : 'transparent',
                          borderColor: isOwner ? '#d1d5db' : isFollowing ? '#a855f7' : '#a855f7'
                        }}
                        onMouseEnter={e => {
                          if(!isOwner && !isFollowing) {
                            e.currentTarget.style.backgroundImage = 'linear-gradient(to right, #db2777, #9333ea)';
                          }
                        }}
                        onMouseLeave={e => {
                          if(!isOwner && !isFollowing) {
                            e.currentTarget.style.backgroundImage = 'linear-gradient(to right, #ec4899, #a855f7)';
                          }
                        }}
                      >
                        {isOwner ? 'Your Brand' : isFollowing ? 'Following ✓' : 'Follow'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;