/**
 * Reusable stat card — top summary cards on assignments/quiz pages.
 * Props: count, label, accent (CSS color string), active (bool)
 */
const StatCard = ({ count, label, accent = '#1a1a2e', active = false }) => (
  <div
    style={{
      background: active ? accent : '#fff',
      border: `1.5px solid ${active ? accent : '#e8e8f0'}`,
      borderRadius: '10px',
      padding: '18px 24px',
      flex: 1,
      minWidth: 0,
      transition: 'box-shadow 0.2s',
      boxShadow: active ? `0 2px 12px ${accent}33` : '0 1px 4px rgba(0,0,0,0.06)',
    }}
  >
    <p
      style={{
        fontSize: '32px',
        fontWeight: 700,
        color: active ? '#fff' : accent,
        margin: 0,
        lineHeight: 1.1,
      }}
    >
      {count}
    </p>
    <p
      style={{
        fontSize: '13px',
        color: active ? 'rgba(255,255,255,0.85)' : '#666',
        margin: '4px 0 0',
        textTransform: 'capitalize',
      }}
    >
      {label}
    </p>
  </div>
);

export default StatCard;
