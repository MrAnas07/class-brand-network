import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../services/firebase';

const TrendingBrands = () => {
  const [trendingBrands, setTrendingBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try ordered query first, fallback to client sort
    const q = collection(db, 'brands');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const brands = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() as any }))
        .filter(brand => (brand.trendingScore || 0) > 0)
        .sort((a, b) => (b.trendingScore || 0) - (a.trendingScore || 0))
        .slice(0, 6);
      setTrendingBrands(brands);
      setLoading(false);
    }, () => setLoading(false));

    return () => unsubscribe();
  }, []);

  const getFireBadge = (score: number) => {
    if (score >= 30) return { emoji: '🔥🔥🔥', label: 'On Fire', color: '#ef4444' };
    if (score >= 20) return { emoji: '🔥🔥', label: 'Hot', color: '#f97316' };
    if (score >= 10) return { emoji: '🔥', label: 'Trending', color: '#f59e0b' };
    return { emoji: '⭐', label: 'Rising', color: '#a855f7' };
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '30px' }}>
      <div style={{
        width: '36px', height: '36px',
        border: '4px solid #f97316',
        borderTopColor: 'transparent',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }} />
    </div>
  );

  if (trendingBrands.length === 0) return (
    <div style={{ textAlign: 'center', padding: '30px', color: '#9ca3af' }}>
      <p>No trending brands yet — start liking and following! 🚀</p>
    </div>
  );

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
      gap: '16px'
    }}>
      {trendingBrands.map((brand, index) => {
        const fire = getFireBadge(brand.trendingScore || 0);
        return (
          <div
            key={brand.id}
            className="animate-fadeInUp"
            style={{
              background: 'rgba(255,255,255,0.7)',
              backdropFilter: 'blur(12px)',
              border: '1.5px solid #fed7aa',
              borderRadius: '20px',
              padding: '18px',
              boxShadow: '0 4px 20px rgba(249,115,22,0.1)',
              transition: 'all 0.3s ease',
              animationDelay: `${index * 0.1}s`,
              opacity: 0,
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 12px 30px rgba(249,115,22,0.2)';
              e.currentTarget.style.borderColor = '#fb923c';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(249,115,22,0.1)';
              e.currentTarget.style.borderColor = '#fed7aa';
            }}
          >
            {/* Trending badge top right */}
            <div style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              background: 'linear-gradient(135deg, #fed7aa, #fef3c7)',
              border: '1px solid #fb923c',
              borderRadius: '9999px',
              padding: '3px 10px',
              fontSize: '11px',
              fontWeight: '700',
              color: fire.color,
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              {fire.emoji} {fire.label}
            </div>

            {/* Brand name */}
            <p style={{
              fontWeight: '800',
              fontSize: '15px',
              color: '#1f2937',
              marginBottom: '6px',
              marginRight: '80px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {brand.brandName || 'Unnamed'}
            </p>

            {/* Category */}
            <span style={{
              display: 'inline-block',
              background: 'linear-gradient(to right, #fed7aa, #fef3c7)',
              color: '#92400e',
              fontSize: '11px',
              fontWeight: '600',
              padding: '2px 10px',
              borderRadius: '9999px',
              marginBottom: '12px'
            }}>
              {brand.category || 'General'}
            </span>

            {/* Stats row */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '8px'
            }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>
                  ❤️ {brand.likeCount || 0}
                </span>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>
                  👥 {brand.followerCount || 0}
                </span>
              </div>
              {/* Trending score */}
              <div
                key={brand.trendingScore}
                style={{
                  background: 'linear-gradient(135deg, #f97316, #ef4444)',
                  color: 'white',
                  padding: '4px 10px',
                  borderRadius: '10px',
                  fontSize: '12px',
                  fontWeight: '800',
                  boxShadow: '0 2px 8px rgba(249,115,22,0.3)',
                  animation: 'scoreUpdate 0.4s ease-out'
                }}
              >
                🔥 {brand.trendingScore || 0}
              </div>
            </div>

            {/* Recent activity indicator */}
            {(brand.recentLikes > 0 || brand.recentFollows > 0) && (
              <div style={{
                marginTop: '10px',
                paddingTop: '10px',
                borderTop: '1px solid #fed7aa',
                display: 'flex',
                gap: '12px'
              }}>
                {brand.recentLikes > 0 && (
                  <span style={{ fontSize: '11px', color: '#f97316', fontWeight: '600' }}>
                    +{brand.recentLikes} recent likes
                  </span>
                )}
                {brand.recentFollows > 0 && (
                  <span style={{ fontSize: '11px', color: '#ef4444', fontWeight: '600' }}>
                    +{brand.recentFollows} recent follows
                  </span>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default TrendingBrands;