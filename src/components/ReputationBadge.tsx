import { getReputationBadge } from '../services/firebase';

interface Props {
  score: number;
  showProgress?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const ReputationBadge = ({ score, showProgress = false, size = 'md' }: Props) => {
  const badge = getReputationBadge(score);

  const sizes = {
    sm: { padding: '2px 8px', fontSize: '10px', emojiSize: '12px' },
    md: { padding: '4px 12px', fontSize: '12px', emojiSize: '14px' },
    lg: { padding: '8px 16px', fontSize: '14px', emojiSize: '18px' }
  };

  const s = sizes[size];

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', gap: '6px' }}>
      {/* Badge */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        background: badge.bg,
        border: `1.5px solid ${badge.border}`,
        borderRadius: '9999px',
        padding: s.padding,
        boxShadow: `0 2px 8px ${badge.color}33`,
        transition: 'all 0.3s ease'
      }}>
        <span style={{ fontSize: s.emojiSize }}>{badge.emoji}</span>
        <span style={{
          fontSize: s.fontSize,
          fontWeight: '700',
          color: badge.textColor
        }}>
          {badge.label}
        </span>
        <span style={{
          fontSize: s.fontSize,
          fontWeight: '800',
          color: badge.color,
          marginLeft: '2px'
        }}>
          {score}
        </span>
      </div>

      {/* Progress bar to next level */}
      {showProgress && badge.nextLevel && (
        <div style={{ width: '100%' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '3px'
          }}>
            <span style={{ fontSize: '10px', color: '#9ca3af' }}>
              {badge.minScore}
            </span>
            <span style={{ fontSize: '10px', color: '#9ca3af' }}>
              Next: {badge.nextLevel} pts
            </span>
          </div>
          <div style={{
            width: '100%',
            height: '5px',
            backgroundColor: '#e5e7eb',
            borderRadius: '9999px',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              width: `${badge.progress}%`,
              background: `linear-gradient(to right, ${badge.color}, ${badge.border})`,
              borderRadius: '9999px',
              transition: 'width 0.8s ease-out'
            }} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ReputationBadge;