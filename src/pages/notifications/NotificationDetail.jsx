import { useLocation, useParams, useNavigate } from 'react-router-dom';
import './Notifications.css';

const typeIcon = (type) => {
  const icons = {
    lesson_added:        '📘',
    assignment_created:  '📋',
    assignment_updated:  '📋',
    assignment_deadline: '⏰',
    assignment_graded:   '⭐',
    quiz_available:      '🧠',
    submission_received: '📄',
    enrollment:          '👤',
    general:             '🔔',
  };
  return icons[type] || '🔔';
};

const typeLabel = (type) => {
  const labels = {
    lesson_added:        'New Lesson',
    assignment_created:  'Assignment',
    assignment_updated:  'Assignment Updated',
    assignment_deadline: 'Deadline Reminder',
    assignment_graded:   'Assignment Graded',
    quiz_available:      'Quiz Available',
    submission_received: 'Submission Received',
    enrollment:          'New Enrollment',
    general:             'General',
  };
  return labels[type] || 'Notification';
};

const NotificationDetail = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const notification = state?.notification;

  if (!notification) {
    return (
      <div className="notif-page">
        <div className="notif-detail-card">
          <p>Notification not found.</p>
          <button className="back-notif-btn" onClick={() => navigate('/notifications')}>
            ← Back to Notifications
          </button>
        </div>
      </div>
    );
  }

  const date = new Date(notification.created_at).toLocaleString();

  return (
    <div className="notif-page">
      <button className="back-notif-btn" onClick={() => navigate('/notifications')}>
        ← Back to Notifications
      </button>

      <div className="notif-detail-card">
        <div className="notif-detail-header">
          <span className="notif-detail-icon">{typeIcon(notification.type)}</span>
          <div>
            <span className="notif-detail-type">{typeLabel(notification.type)}</span>
            <p className="notif-detail-date">{date}</p>
          </div>
        </div>

        <p className="notif-detail-message">{notification.message}</p>

        <div className="notif-detail-meta">
          <span className={`notif-status-badge ${notification.is_read ? 'read' : 'unread'}`}>
            {notification.is_read ? 'Read' : 'Unread'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default NotificationDetail;
