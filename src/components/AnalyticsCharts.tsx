import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#ec4899', '#a855f7', '#6366f1', '#f97316', '#10b981', '#06b6d4', '#f59e0b', '#ef4444'];

const AnalyticsCharts = () => {
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'brands'), (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() as any }));
      setBrands(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '30px' }}>
      <div style={{
        width: '36px', height: '36px',
        border: '4px solid #ec4899',
        borderTopColor: 'transparent',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }} />
    </div>
  );

  // Engagement bar chart data — top 8 brands
  const engagementData = [...brands]
    .sort((a, b) => (b.engagementScore || 0) - (a.engagementScore || 0))
    .slice(0, 8)
    .map(b => ({
      name: (b.brandName || 'N/A').slice(0, 10),
      score: b.engagementScore || 0,
      likes: b.likeCount || 0,
      followers: b.followerCount || 0
    }));

  // Category pie chart data
  const categoryMap: Record<string, number> = {};
  brands.forEach(b => {
    const cat = b.category || 'Other';
    categoryMap[cat] = (categoryMap[cat] || 0) + 1;
  });
  const categoryData = Object.entries(categoryMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  // Trending line chart data
  const trendingData = [...brands]
    .sort((a, b) => (b.trendingScore || 0) - (a.trendingScore || 0))
    .slice(0, 8)
    .map(b => ({
      name: (b.brandName || 'N/A').slice(0, 10),
      trending: b.trendingScore || 0,
      recentLikes: b.recentLikes || 0,
      recentFollows: b.recentFollows || 0
    }));

  // Likes vs Followers scatter data
  const likesFollowersData = brands.map(b => ({
    name: (b.brandName || 'N/A').slice(0, 10),
    likes: b.likeCount || 0,
    followers: b.followerCount || 0,
    score: b.engagementScore || 0
  }));

  const customTooltipStyle = {
    background: 'rgba(255,255,255,0.95)',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '10px 14px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

      {/* Chart 1: Engagement Score Bar Chart */}
      <div style={{
        background: 'rgba(255,255,255,0.6)',
        borderRadius: '16px',
        padding: '20px',
        border: '1px solid #e5e7eb'
      }}>
        <h3 style={{
          fontSize: '15px',
          fontWeight: '700',
          marginBottom: '16px',
          background: 'linear-gradient(to right, #ec4899, #a855f7)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          ⚡ Top Brands by Engagement Score
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={engagementData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} />
            <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} />
            <Tooltip contentStyle={customTooltipStyle} />
            <Bar dataKey="score" name="Score" fill="url(#scoreGrad)" radius={[6, 6, 0, 0]} />
            <Bar dataKey="likes" name="Likes" fill="#fce7f3" radius={[6, 6, 0, 0]} />
            <Bar dataKey="followers" name="Followers" fill="#ede9fe" radius={[6, 6, 0, 0]} />
            <defs>
              <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ec4899" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Chart 2 + 3 side by side */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px'
      }}>
        {/* Category Pie Chart */}
        <div style={{
          background: 'rgba(255,255,255,0.6)',
          borderRadius: '16px',
          padding: '20px',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{
            fontSize: '15px',
            fontWeight: '700',
            marginBottom: '16px',
            color: '#374151'
          }}>
            📂 Brands by Category
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
              >
                {categoryData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                    stroke="none"
                  />
                ))}
              </Pie>
              <Tooltip contentStyle={customTooltipStyle} />
              <Legend
                formatter={(value) => (
                  <span style={{ fontSize: '11px', color: '#6b7280' }}>{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Trending Line Chart */}
        <div style={{
          background: 'rgba(255,255,255,0.6)',
          borderRadius: '16px',
          padding: '20px',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{
            fontSize: '15px',
            fontWeight: '700',
            marginBottom: '16px',
            color: '#374151'
          }}>
            🔥 Trending Score Comparison
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trendingData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#6b7280' }} />
              <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} />
              <Tooltip contentStyle={customTooltipStyle} />
              <Line
                type="monotone"
                dataKey="trending"
                name="Trending"
                stroke="#f97316"
                strokeWidth={3}
                dot={{ fill: '#f97316', r: 5 }}
                activeDot={{ r: 7 }}
              />
              <Line
                type="monotone"
                dataKey="recentLikes"
                name="Recent Likes"
                stroke="#ec4899"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: '#ec4899', r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="recentFollows"
                name="Recent Follows"
                stroke="#a855f7"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: '#a855f7', r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary stats row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '12px'
      }}>
        {[
          {
            label: 'Avg Engagement',
            value: brands.length
              ? Math.round(brands.reduce((s, b) => s + (b.engagementScore || 0), 0) / brands.length)
              : 0,
            icon: '⚡',
            color: '#ec4899'
          },
          {
            label: 'Avg Likes',
            value: brands.length
              ? Math.round(brands.reduce((s, b) => s + (b.likeCount || 0), 0) / brands.length)
              : 0,
            icon: '❤️',
            color: '#f43f5e'
          },
          {
            label: 'Avg Followers',
            value: brands.length
              ? Math.round(brands.reduce((s, b) => s + (b.followerCount || 0), 0) / brands.length)
              : 0,
            icon: '👥',
            color: '#a855f7'
          },
          {
            label: 'Top Score',
            value: brands.length
              ? Math.max(...brands.map(b => b.engagementScore || 0))
              : 0,
            icon: '🏆',
            color: '#f97316'
          }
        ].map(stat => (
          <div key={stat.label} style={{
            background: 'rgba(255,255,255,0.7)',
            borderRadius: '14px',
            padding: '14px',
            border: '1px solid #e5e7eb',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '22px', marginBottom: '4px' }}>{stat.icon}</p>
            <p style={{
              fontSize: '22px',
              fontWeight: '800',
              color: stat.color,
              marginBottom: '2px'
            }}>
              {stat.value}
            </p>
            <p style={{ fontSize: '11px', color: '#9ca3af', fontWeight: '500' }}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnalyticsCharts;