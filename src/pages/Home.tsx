import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db, toggleFollow, toggleLike } from '../services/firebase';
import BrandCard from '../components/BrandCard';
import Leaderboard from '../components/Leaderboard';
import TrendingBrands from '../components/TrendingBrands';
import ReputationBadge from '../components/ReputationBadge';
import ExploreSection from '../components/ExploreSection';
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
        brandsData.sort((a, b) => (b.engagementScore || 0) - (a.engagementScore || 0));
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

      {/* AI Explore Section */}
      {brands.length > 0 && (
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '40px 24px 0 24px'
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.6)',
            backdropFilter: 'blur(16px)',
            border: '1.5px solid #e0e7ff',
            borderRadius: '24px',
            padding: '28px',
            boxShadow: '0 8px 32px rgba(99,102,241,0.08)'
          }}>
            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              marginBottom: '24px',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div>
                <h2 style={{
                  fontSize: '22px',
                  fontWeight: '800',
                  background: 'linear-gradient(to right, #6366f1, #a855f7)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  marginBottom: '4px'
                }}>
                  🤖 Recommended For You
                </h2>
                <p style={{ fontSize: '13px', color: '#9ca3af' }}>
                  {currentUser
                    ? 'Personalized picks based on your interests and activity'
                    : 'Top brands picked for you — login for personalized recommendations'
                  }
                </p>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'linear-gradient(135deg, #ede9fe, #e0e7ff)',
                border: '1px solid #c4b5fd',
                borderRadius: '12px',
                padding: '8px 14px'
              }}>
                <span style={{ fontSize: '16px' }}>🧠</span>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#5b21b6' }}>
                  AI Powered
                </span>
              </div>
            </div>

            <ExploreSection allBrands={brands} showToast={showToast} />

            {/* Algorithm explanation */}
            <div style={{
              marginTop: '20px',
              padding: '12px 16px',
              background: 'rgba(237,233,254,0.4)',
              borderRadius: '12px',
              border: '1px solid #e0e7ff',
              textAlign: 'center'
            }}>
              <p style={{ fontSize: '11px', color: '#9ca3af' }}>
                🤖 Score = (Followers × 1.5) + (Likes × 1) + (Category Match × 4) + (Mutual Follows × 2) + (Trending × 1.5)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Section */}
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '40px 24px 0 24px',
        overflowX: 'hidden',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <div style={{
          background: 'rgba(255,255,255,0.6)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.5)',
          borderRadius: '24px',
          padding: '28px',
          boxShadow: '0 8px 32px rgba(236,72,153,0.1)'
        }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '24px'
          }}>
            <div>
              <h2 style={{
                fontSize: '22px',
                fontWeight: '800',
                background: 'linear-gradient(to right, #ec4899, #a855f7)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                marginBottom: '4px'
              }}>
                🏆 Top Brands Leaderboard
              </h2>
              <p style={{ fontSize: '13px', color: '#9ca3af' }}>
                Ranked by engagement score — updates in real-time
              </p>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, #fdf2f8, #f3e8ff)',
              border: '1px solid #f9a8d4',
              borderRadius: '12px',
              padding: '8px 14px',
              fontSize: '12px',
              fontWeight: '600',
              color: '#ec4899'
            }}>
              🔴 Live
            </div>
          </div>

          <Leaderboard />
        </div>
      </div>

      {/* Trending Section */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '40px 24px 0 24px'
      }}>
        <div style={{
          background: 'rgba(255,255,255,0.6)',
          backdropFilter: 'blur(16px)',
          border: '1.5px solid #fed7aa',
          borderRadius: '24px',
          padding: '28px',
          boxShadow: '0 8px 32px rgba(249,115,22,0.08)'
        }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '24px',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div>
              <h2 style={{
                fontSize: '22px',
                fontWeight: '800',
                background: 'linear-gradient(to right, #f97316, #ef4444)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                marginBottom: '4px'
              }}>
                🔥 Trending This Week
              </h2>
              <p style={{ fontSize: '13px', color: '#9ca3af' }}>
                Brands gaining the most activity in last 7 days
              </p>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, #fed7aa, #fef3c7)',
              border: '1px solid #fb923c',
              borderRadius: '12px',
              padding: '8px 14px'
            }}>
              <span style={{
                width: '8px', height: '8px',
                backgroundColor: '#f97316',
                borderRadius: '50%',
                animation: 'pulse-soft 1.5s infinite'
              }} />
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#92400e' }}>
                Live Trending
              </span>
            </div>
          </div>

          <TrendingBrands />

          {/* Formula explanation */}
          <div style={{
            marginTop: '20px',
            padding: '12px 16px',
            background: 'rgba(254,215,170,0.3)',
            borderRadius: '12px',
            border: '1px solid #fed7aa'
          }}>
            <p style={{ fontSize: '11px', color: '#9ca3af', textAlign: 'center' }}>
              🔥 Trending Score = (Recent Likes × 2) + (Recent Follows × 3) + New Brand Bonus (15)
            </p>
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
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '8px',
                        gap: '8px',
                        flexWrap: 'nowrap'
                      }}>
                        <div>
                          <h3 className="text-lg font-bold text-pink-600 mb-2">{brand.brandName}</h3>
                          <p className="text-sm text-gray-600 mb-3">{brand.description}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span style={{
                            backgroundImage: 'linear-gradient(to right, #ec4899, #a855f7)',
                            color: 'white',
                            fontWeight: '600',
                            padding: '6px 12px',
                            borderRadius: '9999px',
                            fontSize: '12px',
                            whiteSpace: 'nowrap',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            flexShrink: 0
                          }}>
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

                      {/* LINE 1: Category + Score side by side */}
                      <div style={{
                        display: 'flex',
                        gap: '8px',
                        alignItems: 'center',
                        marginBottom: '8px',
                        flexWrap: 'wrap'
                      }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '5px 12px',
                          borderRadius: '9999px',
                          fontSize: '12px',
                          fontWeight: '600',
                          background: '#fce7f3',
                          color: '#ec4899',
                          border: '1px solid #fbcfe8'
                        }}>
                          {brand.category || 'General'}
                        </span>

                        <span
                          key={brand.engagementScore}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                            padding: '5px 12px',
                            borderRadius: '9999px',
                            fontSize: '12px',
                            fontWeight: '700',
                            background: 'linear-gradient(to right, #ec4899, #a855f7)',
                            color: 'white',
                            boxShadow: '0 2px 8px rgba(236,72,153,0.25)'
                          }}
                        >
                          ⚡ Score: {brand.engagementScore || 0}
                        </span>
                      </div>

                      {/* LINE 2: Reputation badge — own row */}
                      <div style={{ marginBottom: '10px' }}>
                        <ReputationBadge score={brand.reputationScore || 0} size="sm" />
                      </div>

                      {/* LINE 3: Instagram + Facebook — own row (keep existing styles exactly) */}
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                        {brand.instagramUrl && (
                          <a href={brand.instagramUrl} target="_blank" rel="noopener noreferrer"
                            style={{
                              backgroundImage: 'linear-gradient(to right, #ec4899, #a855f7)',
                              color: 'white', fontWeight: '600', padding: '6px 16px',
                              borderRadius: '9999px', fontSize: '13px', textDecoration: 'none'
                            }}>
                            Instagram
                          </a>
                        )}
                        {brand.facebookUrl && (
                          <a href={brand.facebookUrl} target="_blank" rel="noopener noreferrer"
                            style={{
                              backgroundImage: 'linear-gradient(to right, #6366f1, #3b82f6)',
                              color: 'white', fontWeight: '600', padding: '6px 16px',
                              borderRadius: '9999px', fontSize: '13px', textDecoration: 'none'
                            }}>
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