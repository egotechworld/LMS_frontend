import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '../../services/notificationService';
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

const timeAgo = (dateStr) => {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60)   return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { fetchNotifications(); }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getMyNotifications();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: 1 } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setMarkingAll(true);
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    } finally {
      setMarkingAll(false);
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.is_read) {
      try {
        await notificationService.markAsRead(notification.id);
        setNotifications(prev =>
          prev.map(n => n.id === notification.id ? { ...n, is_read: 1 } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (err) {
        console.error(err);
      }
    }
    navigate(`/notifications/${notification.id}`, { state: { notification } });
  };

  if (loading) return <div className="loading">Loading notifications...</div>;

  return (
    <div className="notif-page">
      <div className="notif-header">
        <div>
          <h1>Notifications</h1>
          <p className="notif-subtitle">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button className="mark-all-btn" onClick={handleMarkAllAsRead} disabled={markingAll}>
            ✓ Mark all as read
          </button>
        )}
      </div>

      <div className="notif-list">
        {notifications.length === 0 && (
          <div className="notif-empty">
            <span className="notif-empty-icon">🔔</span>
            <p>No notifications yet</p>
          </div>
        )}
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`notif-item ${n.is_read ? 'read' : 'unread'}`}
            onClick={() => handleNotificationClick(n)}
          >
            <div className="notif-icon-wrap">
              <span className="notif-type-icon">{typeIcon(n.type)}</span>
            </div>
            <div className="notif-content">
              <p className="notif-message">{n.message}</p>
              <span className="notif-time">{timeAgo(n.created_at)}</span>
            </div>
            {!n.is_read && (
              <div className="notif-right">
                <span className="unread-dot" />
                <button
                  className="mark-read-btn"
                  onClick={(e) => handleMarkAsRead(n.id, e)}
                  title="Mark as read"
                >✓</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notifications;
