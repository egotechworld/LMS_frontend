/**
 * Reusable status badge — used across assignments, submissions, quiz results, etc.
 * Props:
 *   status: 'graded' | 'submitted' | 'not_submitted' | 'late' | 'pending' | string
 *   label:  optional override text
 */
const STATUS_CONFIG = {
  graded:        { label: 'Graded',        color: '#1a7f4b', bg: '#e6f4ed' },
  submitted:     { label: 'Submitted',     color: '#1565c0', bg: '#e3f0fb' },
  not_submitted: { label: 'Not Submitted', color: '#b26a00', bg: '#fff3e0' },
  late:          { label: 'Late',          color: '#c62828', bg: '#fdecea' },
  pending:       { label: 'Pending',       color: '#6a1b9a', bg: '#f3e5f5' },
  active:        { label: 'Active',        color: '#1a7f4b', bg: '#e6f4ed' },
  draft:         { label: 'Draft',         color: '#555',    bg: '#eee'    },
};

const StatusBadge = ({ status, label }) => {
  const key = (status || '').toLowerCase().replace(' ', '_');
  const cfg = STATUS_CONFIG[key] || { label: status, color: '#555', bg: '#eee' };

  return (
    <span
      style={{
        display: 'inline-block',
        padding: '3px 10px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: 600,
        letterSpacing: '0.3px',
        color: cfg.color,
        backgroundColor: cfg.bg,
        whiteSpace: 'nowrap',
      }}
    >
      {label || cfg.label}
    </span>
  );
};

export default StatusBadge;
