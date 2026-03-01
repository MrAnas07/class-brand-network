import { useState } from 'react';
import { toggleFollow, toggleLike, getRecommendedBrands, getReputationBadge } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import ReputationBadge from './ReputationBadge';

interface Props {
  allBrands: any[];
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

const ExploreSection = ({ allBrands, showToast }: Props) => {
  const { currentUser } = useAuth();
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  // Get user's following and liked lists
  const userFollowing = allBrands
    .filter(b => currentUser && (b.followers || []).includes(currentUser.uid))
    .map(b => b.id);

  const userLiked = allBrands
    .filter(b => currentUser && (b.likes || []).includes(currentUser.uid))
    .map(b => b.id);

  const recommended = getRecommendedBrands(allBrands, currentUser, userFollowing, userLiked);

  const handleFollow = async (brand: any) => {
    if (!currentUser) {
      showToast('Please login to follow brands 👋', 'info');
      return;
    }
    setLoadingStates(prev => ({ ...prev, [`follow-${brand.id}`]: true }));
    try {
      await toggleFollow(brand.id, currentUser.uid, brand.ownerId || brand.userId);
      const isNowFollowing = !(brand.followers || []).includes(currentUser.uid);
      showToast(isNowFollowing ? 'Following! 🎉' : 'Unfollowed', 'success');
    } catch (err: any) {
      showToast(err.message || 'Something went wrong', 'error');
    } finally {
      setLoadingStates(prev => ({ ...prev, [`follow-${brand.id}`]: false }));
    }
  };

  const handleLike = async (brand: any) => {
    if (!currentUser) {
      showToast('Please login to like brands 👋', 'info');
      return;
    }
    setLoadingStates(prev => ({ ...prev, [`like-${brand.id}`]: true }));
    try {
      await toggleLike(brand.id, currentUser.uid, brand.ownerId || brand.userId);
    } catch (err: any) {
      showToast(err.message || 'Something went wrong', 'error');
    } finally {
      setLoadingStates(prev => ({ ...prev, [`like-${brand.id}`]: false }));
    }
  };

  if (recommended.length === 0) return null;

  return (
    <div style={{ width: '100%' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: '16px'
      }}>
        {recommended.map((brand, index) => {
          const isFollowing = currentUser
            ? (brand.followers || []).includes(currentUser.uid)
            : false;
          const isLiked = currentUser
            ? (brand.likes || []).includes(currentUser.uid)
            : false;
          const isOwner = currentUser?.uid === (brand.ownerId || brand.userId);
          const followLoading = loadingStates[`follow-${brand.id}`];
          const likeLoading = loadingStates[`like-${brand.id}`];

          return (
            <div
              key={brand.id}
              className="animate-fadeInUp"
              style={{
                background: 'rgba(255,255,255,0.75)',
                backdropFilter: 'blur(16px)',
                border: '1.5px solid rgba(255,255,255,0.5)',
                borderRadius: '20px',
                padding: '18px',
                boxShadow: '0 4px 20px rgba(99,102,241,0.08)',
                transition: 'all 0.3s ease',
                animationDelay: `${index * 0.1}s`,
                opacity: 0,
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 32px rgba(99,102,241,0.15)';
                e.currentTarget.style.borderColor = '#c7d2fe';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(99,102,241,0.08)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)';
              }}
            >
              {/* AI Recommended tag */}
              <div style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'linear-gradient(135deg, #ede9fe, #e0e7ff)',
                border: '1px solid #c4b5fd',
                borderRadius: '9999px',
                padding: '2px 8px',
                fontSize: '10px',
                fontWeight: '700',
                color: '#5b21b6',
                display: 'flex',
                alignItems: 'center',
                gap: '3px'
              }}>
                🤖 AI Pick
              </div>

              {/* Brand name */}
              <p style={{
                fontWeight: '800',
                fontSize: '16px',
                color: '#1f2937',
                marginBottom: '6px',
                marginRight: '65px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {brand.brandName || 'Unnamed'}
              </p>

              {/* Reputation badge */}
              <div style={{ marginBottom: '8px' }}>
                <ReputationBadge score={brand.reputationScore || 0} size="sm" />
              </div>

              {/* Description */}
              {brand.description && (
                <p style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  marginBottom: '10px',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {brand.description}
                </p>
              )}

              {/* Category */}
              <span style={{
                display: 'inline-block',
                background: 'linear-gradient(to right, #ede9fe, #e0e7ff)',
                color: '#5b21b6',
                fontSize: '11px',
                fontWeight: '600',
                padding: '2px 10px',
                borderRadius: '9999px',
                marginBottom: '10px'
              }}>
                {brand.category || 'General'}
              </span>

              {/* Reason tags */}
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '4px',
                marginBottom: '12px'
              }}>
                {(brand.reasons || []).slice(0, 2).map((reason: string, i: number) => (
                  <span key={i} style={{
                    fontSize: '10px',
                    fontWeight: '600',
                    color: '#059669',
                    background: '#d1fae5',
                    border: '1px solid #6ee7b7',
                    borderRadius: '9999px',
                    padding: '2px 8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px'
                  }}>
                    ✔ {reason}
                  </span>
                ))}
              </div>

              {/* Stats */}
              <div style={{
                display: 'flex',
                gap: '10px',
                marginBottom: '12px'
              }}>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>
                  ❤️ {brand.likeCount || 0}
                </span>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>
                  👥 {brand.followerCount || 0}
                </span>
                <span style={{
                  fontSize: '12px',
                  fontWeight: '700',
                  background: 'linear-gradient(to right, #ec4899, #a855f7)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  ⚡ {brand.engagementScore || 0}
                </span>
              </div>

              {/* Social links */}
              <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', flexWrap: 'wrap' }}>
                {brand.instagramUrl && (
                  <a
                    href={brand.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      backgroundImage: 'linear-gradient(to right, #ec4899, #a855f7)',
                      color: 'white',
                      fontWeight: '600',
                      padding: '4px 12px',
                      borderRadius: '9999px',
                      fontSize: '11px',
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
                      padding: '4px 12px',
                      borderRadius: '9999px',
                      fontSize: '11px',
                      textDecoration: 'none',
                      display: 'inline-block'
                    }}
                  >
                    Facebook
                  </a>
                )}
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: '8px' }}>
                {/* Like button */}
                <button
                  onClick={() => handleLike(brand)}
                  disabled={isOwner || likeLoading}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '10px',
                    border: '1.5px solid #fce7f3',
                    background: isLiked ? '#fce7f3' : 'white',
                    color: isLiked ? '#ec4899' : '#6b7280',
                    fontWeight: '700',
                    fontSize: '13px',
                    cursor: isOwner ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                    opacity: isOwner ? 0 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                  onMouseEnter={e => {
                    if (!isOwner) {
                      e.currentTarget.style.background = '#fce7f3';
                      e.currentTarget.style.borderColor = '#ec4899';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isOwner) {
                      e.currentTarget.style.background = isLiked ? '#fce7f3' : 'white';
                      e.currentTarget.style.borderColor = '#fce7f3';
                    }
                  }}
                >
                  {likeLoading ? '...' : isLiked ? '❤️' : '🤍'} {brand.likeCount || 0}
                </button>

                {/* Follow button */}
                <button
                  onClick={() => handleFollow(brand)}
                  disabled={isOwner || followLoading}
                  style={{
                    flex: 1,
                    padding: '8px 16px',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundImage: isOwner
                      ? 'none'
                      : isFollowing
                        ? 'none'
                        : 'linear-gradient(to right, #6366f1, #a855f7)',
                    background: isOwner
                      ? '#f3f4f6'
                      : isFollowing
                        ? '#ede9fe'
                        : undefined,
                    color: isOwner ? '#9ca3af' : isFollowing ? '#5b21b6' : 'white',
                    fontWeight: '700',
                    fontSize: '13px',
                    cursor: isOwner ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                    border: isFollowing ? '1.5px solid #c4b5fd' : 'none'
                  }}
                  onMouseEnter={e => {
                    if (!isOwner && !isFollowing) {
                      e.currentTarget.style.backgroundImage = 'linear-gradient(to right, #4f46e5, #9333ea)';
                      e.currentTarget.style.transform = 'scale(1.02)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isOwner && !isFollowing) {
                      e.currentTarget.style.backgroundImage = 'linear-gradient(to right, #6366f1, #a855f7)';
                      e.currentTarget.style.transform = 'scale(1)';
                    }
                  }}
                >
                  {followLoading ? '...' : isOwner ? 'Your Brand' : isFollowing ? 'Following ✓' : '+ Follow'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ExploreSection;