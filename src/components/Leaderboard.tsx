import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../services/firebase';
import ReputationBadge from './ReputationBadge';

const Leaderboard = () => {
  const [topBrands, setTopBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: any;

    try {
      const q = query(
        collection(db, 'brands'),
        orderBy('engagementScore', 'desc'),
        limit(5)
      );
      unsubscribe = onSnapshot(q, (snapshot) => {
        const brands = snapshot.docs.map((doc, index) => ({
          id: doc.id,
          rank: index + 1,
          ...doc.data()
        }));
        setTopBrands(brands);
        setLoading(false);
      }, (error) => {
        // Fallback: fetch all and sort client side
        const fallbackQ = collection(db, 'brands');
        unsubscribe = onSnapshot(fallbackQ, (snap) => {
          const brands = snap.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .sort((a: any, b: any) => (b.engagementScore || 0) - (a.engagementScore || 0))
            .slice(0, 5)
            .map((brand: any, index: number) => ({ ...brand, rank: index + 1 }));
          setTopBrands(brands);
          setLoading(false);
        });
      });
    } catch (err) {
      setLoading(false);
    }

    return () => unsubscribe && unsubscribe();
  }, []);

  const getRankStyle = (rank: number) => {
    if (rank === 1) return { bg: 'linear-gradient(135deg, #FFD700, #FFA500)', emoji: '🥇', color: '#92400e' };
    if (rank === 2) return { bg: 'linear-gradient(135deg, #C0C0C0, #A0A0A0)', emoji: '🥈', color: '#374151' };
    if (rank === 3) return { bg: 'linear-gradient(135deg, #CD7F32, #A0522D)', emoji: '🥉', color: '#7c2d12' };
    return { bg: 'linear-gradient(135deg, #ec4899, #a855f7)', emoji: `#${rank}`, color: 'white' };
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
      <div style={{
        width: '40px', height: '40px',
        border: '4px solid #ec4899',
        borderTopColor: 'transparent',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }} />
    </div>
  );

  if (topBrands.length === 0) return (
    <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
      <p style={{ fontSize: '16px' }}>No brands yet. Be the first! 🚀</p>
    </div>
  );

  return (
    <div style={{ width: '100%' }}>
      {topBrands.map((brand, index) => {
        const rankStyle = getRankStyle(brand.rank);
        const isTop3 = brand.rank <= 3;

        return (
          <div
            key={brand.id}
            className="animate-fadeInUp"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '14px',
              marginBottom: '10px',
              borderRadius: '16px',
              background: isTop3
                ? 'linear-gradient(135deg, rgba(253,242,248,0.9), rgba(243,232,255,0.9))'
                : 'rgba(255,255,255,0.7)',
              border: isTop3 ? '2px solid #f9a8d4' : '1px solid #e5e7eb',
              boxShadow: isTop3
                ? '0 4px 20px rgba(236,72,153,0.12)'
                : '0 2px 8px rgba(0,0,0,0.04)',
              backdropFilter: 'blur(8px)',
              transition: 'all 0.3s ease',
              animationDelay: `${index * 0.1}s`,
              opacity: 0,
              width: '100%',
              boxSizing: 'border-box',
              flexWrap: 'nowrap',
              overflow: 'hidden'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateX(4px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(236,72,153,0.18)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateX(0)';
              e.currentTarget.style.boxShadow = isTop3
                ? '0 4px 20px rgba(236,72,153,0.12)'
                : '0 2px 8px rgba(0,0,0,0.04)';
            }}
          >
            {/* Rank Badge — fixed size, never shrinks */}
            <div style={{
              width: '40px',
              height: '40px',
              minWidth: '40px',
              borderRadius: '50%',
              background: rankStyle.bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: isTop3 ? '20px' : '12px',
              fontWeight: '800',
              color: rankStyle.color,
              flexShrink: 0,
              boxShadow: '0 4px 10px rgba(0,0,0,0.12)'
            }}>
              {rankStyle.emoji}
            </div>

            {/* Brand Info — takes remaining space, truncates */}
            <div style={{
              flex: 1,
              minWidth: 0,
              overflow: 'hidden'
            }}>
              <p style={{
                fontWeight: '700',
                fontSize: '14px',
                color: '#1f2937',
                marginBottom: '4px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '100%'
              }}>
                {brand.brandName || 'Unnamed'}
              </p>
              <div style={{
                display: 'flex',
                gap: '8px',
                flexWrap: 'wrap',
                alignItems: 'center'
              }}>
                <span style={{
                  fontSize: '11px',
                  color: '#6b7280',
                  whiteSpace: 'nowrap'
                }}>
                  ❤️ {brand.likeCount || 0}
                </span>
                <span style={{
                  fontSize: '11px',
                  color: '#6b7280',
                  whiteSpace: 'nowrap'
                }}>
                  👥 {brand.followerCount || 0}
                </span>
                <span style={{
                  fontSize: '10px',
                  fontWeight: '600',
                  color: '#ec4899',
                  background: '#fdf2f8',
                  padding: '1px 7px',
                  borderRadius: '9999px',
                  border: '1px solid #fce7f3',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '90px'
                }}>
                  {brand.category || 'General'}
                </span>
              </div>
            </div>

            {/* Score Badge — fixed width, never shrinks */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              flexShrink: 0,
              minWidth: '56px'
            }}>
              <div
                key={brand.engagementScore}
                style={{
                  background: 'linear-gradient(135deg, #ec4899, #a855f7)',
                  color: 'white',
                  padding: '5px 10px',
                  borderRadius: '10px',
                  fontWeight: '800',
                  fontSize: '14px',
                  boxShadow: '0 3px 10px rgba(236,72,153,0.28)',
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                  animation: 'scoreUpdate 0.4s ease-out'
                }}
              >
                ⚡ {brand.engagementScore || 0}
              </div>
              <span style={{
                fontSize: '10px',
                color: '#9ca3af',
                marginTop: '3px'
              }}>
                score
              </span>
            </div>
          </div>
        );
      })}

      {/* Score formula */}
      <div style={{
        marginTop: '12px',
        padding: '10px 14px',
        background: 'rgba(253,242,248,0.5)',
        borderRadius: '12px',
        border: '1px solid #fce7f3'
      }}>
        <p style={{
          fontSize: '11px',
          color: '#9ca3af',
          textAlign: 'center',
          margin: 0
        }}>
          ⚡ Score = (Likes × 1) + (Followers × 2) + Completeness Bonus (10)
        </p>
      </div>
    </div>
  );
};

export default Leaderboard;