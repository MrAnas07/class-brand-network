import { useEffect, useState } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../services/firebase';

interface StudentRank {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  totalEngagement: number;
  totalLikes: number;
  totalFollowers: number;
  totalBrands: number;
  activityScore: number;
  finalScore: number;
  rank: number;
  previousRank?: number;
}

const StudentRankings = () => {
  const [rankings, setRankings] = useState<StudentRank[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to both users and brands collections
    const unsubBrands = onSnapshot(collection(db, 'brands'), (brandsSnap) => {
      const unsubUsers = onSnapshot(collection(db, 'users'), (usersSnap) => {
        const brands = brandsSnap.docs.map(d => ({ id: d.id, ...d.data() as any }));
        const users = usersSnap.docs.map(d => ({ id: d.id, ...d.data() as any }));

        // Calculate score per user
        const userScores: Record<string, StudentRank> = {};

        users.forEach(user => {
          userScores[user.uid] = {
            uid: user.uid,
            displayName: user.displayName || user.email?.split('@')[0] || 'Unknown',
            email: user.email || '',
            photoURL: user.photoURL || '',
            totalEngagement: 0,
            totalLikes: 0,
            totalFollowers: 0,
            totalBrands: 0,
            activityScore: 0,
            finalScore: 0,
            rank: 0
          };
        });

        // Sum up brand scores per owner
        brands.forEach(brand => {
          const ownerId = brand.ownerId || brand.userId;
          if (!ownerId) return;

          if (!userScores[ownerId]) {
            userScores[ownerId] = {
              uid: ownerId,
              displayName: 'Unknown User',
              email: '',
              photoURL: '',
              totalEngagement: 0,
              totalLikes: 0,
              totalFollowers: 0,
              totalBrands: 0,
              activityScore: 0,
              finalScore: 0,
              rank: 0
            };
          }

          userScores[ownerId].totalLikes += brand.likeCount || 0;
          userScores[ownerId].totalFollowers += brand.followerCount || 0;
          userScores[ownerId].totalEngagement += brand.engagementScore || 0;
          userScores[ownerId].totalBrands += 1;
        });

        // Calculate activity score (likes given + follows given)
        brands.forEach(brand => {
          // likes given by users
          if (brand.likes && Array.isArray(brand.likes)) {
            brand.likes.forEach((uid: string) => {
              if (userScores[uid]) {
                userScores[uid].activityScore += 1;
              }
            });
          }
          // follows given by users
          if (brand.followers && Array.isArray(brand.followers)) {
            brand.followers.forEach((uid: string) => {
              if (userScores[uid]) {
                userScores[uid].activityScore += 2;
              }
            });
          }
        });

        // Final score formula
        Object.values(userScores).forEach(student => {
          student.finalScore =
            (student.totalEngagement * 2) +
            (student.activityScore * 1) +
            (student.totalBrands * 5);
        });

        // Sort and rank top 20
        const sorted = Object.values(userScores)
          .filter(s => s.finalScore > 0 || s.totalBrands > 0)
          .sort((a, b) => b.finalScore - a.finalScore)
          .slice(0, 20)
          .map((student, index) => ({
            ...student,
            rank: index + 1
          }));

        setRankings(sorted);
        setLoading(false);
      });

      return () => unsubUsers();
    });

    return () => unsubBrands();
  }, []);

  const getRankBadge = (rank: number) => {
    if (rank === 1) return { bg: 'linear-gradient(135deg, #FFD700, #FFA500)', text: '🥇', shadow: 'rgba(255,215,0,0.4)' };
    if (rank === 2) return { bg: 'linear-gradient(135deg, #C0C0C0, #A0A0A0)', text: '🥈', shadow: 'rgba(192,192,192,0.4)' };
    if (rank === 3) return { bg: 'linear-gradient(135deg, #CD7F32, #A0522D)', text: '🥉', shadow: 'rgba(205,127,50,0.4)' };
    return { bg: 'linear-gradient(135deg, #ec4899, #a855f7)', text: `#${rank}`, shadow: 'rgba(236,72,153,0.2)' };
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

  if (rankings.length === 0) return (
    <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
      <p style={{ fontSize: '16px' }}>No student data yet 📊</p>
    </div>
  );

  return (
    <div>
      {/* Top 3 podium */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '16px',
        marginBottom: '32px',
        flexWrap: 'wrap'
      }}>
        {rankings.slice(0, 3).map((student, i) => {
          const badge = getRankBadge(student.rank);
          const heights = ['180px', '140px', '120px'];
          const order = [1, 0, 2]; // 2nd, 1st, 3rd visual order
          return (
            <div
              key={student.uid}
              className="animate-fadeInUp"
              style={{
                order: order[i],
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                animationDelay: `${i * 0.15}s`,
                opacity: 0
              }}
            >
              {/* Avatar */}
              <div style={{
                width: i === 0 ? '72px' : '56px',
                height: i === 0 ? '72px' : '56px',
                borderRadius: '50%',
                background: badge.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 4px 16px ${badge.shadow}`,
                border: '3px solid white',
                overflow: 'hidden'
              }}>
                {student.photoURL ? (
                  <img
                    src={student.photoURL}
                    alt={student.displayName}
                    referrerPolicy="no-referrer"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <span style={{
                    fontSize: i === 0 ? '28px' : '22px',
                    fontWeight: '800',
                    color: 'white'
                  }}>
                    {student.displayName.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              <p style={{
                fontWeight: '700',
                fontSize: i === 0 ? '14px' : '12px',
                color: '#1f2937',
                textAlign: 'center',
                maxWidth: '90px',
                wordBreak: 'break-word'
              }}>
                {student.displayName}
              </p>

              {/* Podium block */}
              <div style={{
                width: i === 0 ? '110px' : '90px',
                height: heights[i],
                background: badge.bg,
                borderRadius: '12px 12px 0 0',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                boxShadow: `0 8px 24px ${badge.shadow}`
              }}>
                <span style={{ fontSize: i === 0 ? '28px' : '22px' }}>
                  {badge.text}
                </span>
                <span style={{
                  fontSize: '13px',
                  fontWeight: '800',
                  color: 'white'
                }}>
                  {student.finalScore}
                </span>
                <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.8)' }}>
                  points
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Rest of rankings table */}
      <div style={{
        background: 'rgba(255,255,255,0.5)',
        borderRadius: '16px',
        border: '1px solid #e5e7eb',
        overflow: 'hidden'
      }}>
        {/* Table header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '50px 1fr 80px 80px 80px 90px',
          padding: '12px 16px',
          background: 'linear-gradient(135deg, #fdf2f8, #f3e8ff)',
          borderBottom: '1px solid #e5e7eb',
          gap: '8px'
        }}>
          {['Rank', 'Student', 'Brands', 'Likes', 'Followers', 'Score'].map(h => (
            <span key={h} style={{
              fontSize: '11px',
              fontWeight: '700',
              color: '#9ca3af',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>{h}</span>
          ))}
        </div>

        {/* Table rows */}
        {rankings.slice(3).map((student, index) => {
          const badge = getRankBadge(student.rank);
          return (
            <div
              key={student.uid}
              className="animate-fadeInUp"
              style={{
                display: 'grid',
                gridTemplateColumns: '50px 1fr 80px 80px 80px 90px',
                padding: '12px 16px',
                borderBottom: '1px solid #f3f4f6',
                alignItems: 'center',
                gap: '8px',
                transition: 'background 0.2s',
                animationDelay: `${index * 0.05}s`,
                opacity: 0
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#fdf2f8'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {/* Rank */}
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: badge.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '11px',
                fontWeight: '800',
                color: 'white'
              }}>
                {student.rank}
              </div>

              {/* Student info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                <div style={{
                  width: '32px', height: '32px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #ec4899, #a855f7)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, overflow: 'hidden'
                }}>
                  {student.photoURL ? (
                    <img
                      src={student.photoURL}
                      referrerPolicy="no-referrer"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <span style={{ fontSize: '13px', fontWeight: '700', color: 'white' }}>
                      {student.displayName.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{
                    fontWeight: '600', fontSize: '13px', color: '#1f2937',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                  }}>
                    {student.displayName}
                  </p>
                  <p style={{
                    fontSize: '11px', color: '#9ca3af',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                  }}>
                    {student.email}
                  </p>
                </div>
              </div>

              {/* Stats */}
              <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: '600' }}>
                🏷️ {student.totalBrands}
              </span>
              <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: '600' }}>
                ❤️ {student.totalLikes}
              </span>
              <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: '600' }}>
                👥 {student.totalFollowers}
              </span>

              {/* Score */}
              <div style={{
                background: 'linear-gradient(135deg, #ec4899, #a855f7)',
                color: 'white',
                padding: '4px 10px',
                borderRadius: '9999px',
                fontSize: '12px',
                fontWeight: '800',
                textAlign: 'center'
              }}>
                ⚡ {student.finalScore}
              </div>
            </div>
          );
        })}
      </div>

      {/* Score formula */}
      <div style={{
        marginTop: '16px',
        padding: '12px 16px',
        background: 'rgba(253,242,248,0.5)',
        borderRadius: '12px',
        border: '1px solid #fce7f3',
        textAlign: 'center'
      }}>
        <p style={{ fontSize: '11px', color: '#9ca3af' }}>
          ⚡ Final Score = (Engagement × 2) + (Activity × 1) + (Brands × 5)
        </p>
      </div>
    </div>
  );
};

export default StudentRankings;