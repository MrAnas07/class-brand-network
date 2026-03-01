import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface BrandAnalyticsProps {
  brand: any;
  analyticsData: any[];
}

const BrandAnalytics: React.FC<BrandAnalyticsProps> = ({ brand, analyticsData }) => {
  // Sample data for the charts - would be replaced with real data in implementation
  const dailyEngagementData = [
    { date: 'Mon', views: 45, likes: 12, follows: 3 },
    { date: 'Tue', views: 52, likes: 18, follows: 5 },
    { date: 'Wed', views: 48, likes: 15, follows: 4 },
    { date: 'Thu', views: 61, likes: 22, follows: 7 },
    { date: 'Fri', views: 55, likes: 20, follows: 6 },
    { date: 'Sat', views: 67, likes: 25, follows: 9 },
    { date: 'Sun', views: 72, likes: 28, follows: 11 },
  ];

  const weeklyTrendData = [
    { week: 'Week 1', likes: 45, followers: 12 },
    { week: 'Week 2', likes: 52, followers: 18 },
    { week: 'Week 3', likes: 61, followers: 25 },
    { week: 'Week 4', likes: 72, followers: 32 },
  ];

  return (
    <div style={{
      width: '100%',
      background: 'rgba(255,255,255,0.85)',
      backdropFilter: 'blur(10px)',
      borderRadius: '20px',
      padding: '24px',
      border: '1px solid rgba(255,255,255,0.4)',
      boxShadow: '0 8px 32px rgba(99,102,241,0.1)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: '700',
          background: 'linear-gradient(to right, #6366f1, #ec4899)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          📊 {brand.brandName} Analytics
        </h2>
        <div style={{
          display: 'flex',
          gap: '8px',
          fontSize: '12px',
          fontWeight: '600',
          padding: '4px 12px',
          borderRadius: '9999px',
          background: 'linear-gradient(135deg, #ede9fe, #fce7f3)',
          color: '#7c3aed'
        }}>
          {brand.category}
        </div>
      </div>

      {/* Stats Overview */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)',
          borderRadius: '12px',
          padding: '16px',
          border: '1px solid #bae6fd'
        }}>
          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Total Views</div>
          <div style={{ fontSize: '22px', fontWeight: '700', color: '#0369a1' }}>
            {brand.views || 0}
          </div>
        </div>
        <div style={{
          background: 'linear-gradient(135deg, #fef2f2, #ffe4e6)',
          borderRadius: '12px',
          padding: '16px',
          border: '1px solid #fecaca'
        }}>
          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Likes</div>
          <div style={{ fontSize: '22px', fontWeight: '700', color: '#dc2626' }}>
            {brand.likeCount || 0}
          </div>
        </div>
        <div style={{
          background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
          borderRadius: '12px',
          padding: '16px',
          border: '1px solid #bbf7d0'
        }}>
          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Followers</div>
          <div style={{ fontSize: '22px', fontWeight: '700', color: '#15803d' }}>
            {brand.followerCount || 0}
          </div>
        </div>
        <div style={{
          background: 'linear-gradient(135deg, #f0f9ff, #dbeafe)',
          borderRadius: '12px',
          padding: '16px',
          border: '1px solid #93c5fd'
        }}>
          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Score</div>
          <div style={{ fontSize: '22px', fontWeight: '700', color: '#1d4ed8' }}>
            {brand.engagementScore || 0}
          </div>
        </div>
      </div>

      {/* Engagement Chart */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{
          fontSize: '16px',
          fontWeight: '600',
          color: '#374151',
          marginBottom: '12px'
        }}>
          Daily Engagement
        </h3>
        <div style={{ height: '200px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyEngagementData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  background: 'rgba(255,255,255,0.9)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="views" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="likes" fill="#ec4899" radius={[4, 4, 0, 0]} />
              <Bar dataKey="follows" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Trend Chart */}
      <div>
        <h3 style={{
          fontSize: '16px',
          fontWeight: '600',
          color: '#374151',
          marginBottom: '12px'
        }}>
          Weekly Trend
        </h3>
        <div style={{ height: '200px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weeklyTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="week" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  background: 'rgba(255,255,255,0.9)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Area
                type="monotone"
                dataKey="likes"
                stroke="#ec4899"
                fill="url(#colorLikes)"
                fillOpacity={0.2}
              />
              <Area
                type="monotone"
                dataKey="followers"
                stroke="#10b981"
                fill="url(#colorFollowers)"
                fillOpacity={0.2}
              />
              <defs>
                <linearGradient id="colorLikes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorFollowers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recommendations */}
      <div style={{
        marginTop: '24px',
        padding: '16px',
        background: 'linear-gradient(135deg, #fefce8, #fef9c3)',
        borderRadius: '12px',
        border: '1px solid #fbbf24'
      }}>
        <h4 style={{
          fontSize: '14px',
          fontWeight: '700',
          color: '#92400e',
          marginBottom: '8px'
        }}>
          🎯 Recommendations to Improve
        </h4>
        <ul style={{
          fontSize: '12px',
          color: '#92400e',
          listStyle: 'none',
          margin: 0,
          padding: 0
        }}>
          <li style={{ marginBottom: '4px' }}>• Post more content on weekends when engagement is highest</li>
          <li style={{ marginBottom: '4px' }}>• Add more complete profile information to increase reach</li>
          <li>• Engage with similar category brands to gain more followers</li>
        </ul>
      </div>
    </div>
  );
};

export default BrandAnalytics;