import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Bell, 
  Star, 
  UserPlus, 
  AlertTriangle, 
  Trophy,
  Image,
  Info,
  Check,
  Trash2
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useAuth } from '../context/AppContext';
import { formatRelativeTime } from '../utils/helpers';
import { Notification } from '../types';
import { storage } from '../utils/helpers';

// Generate mock notifications based on user activity
const generateMockNotifications = (_userId: string): Notification[] => {
  const now = new Date();
  
  return [
    {
      id: 'notif-1',
      type: 'rating',
      title: 'New Rating!',
      message: 'Your photo "Golden Hour Magic" received a 9/10 rating from @james_chen',
      imageUrl: 'https://picsum.photos/seed/1/100/100',
      linkTo: '/photo/image-1',
      isRead: false,
      createdAt: new Date(now.getTime() - 1000 * 60 * 30).toISOString(), // 30 mins ago
    },
    {
      id: 'notif-2',
      type: 'follow',
      title: 'New Follower',
      message: '@sofia_rodriguez started following you',
      linkTo: '/profile/sofia_rodriguez',
      isRead: false,
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    },
    {
      id: 'notif-3',
      type: 'leaderboard',
      title: '🎉 Congratulations!',
      message: 'You moved up to #5 on the leaderboard!',
      linkTo: '/leaderboard',
      isRead: false,
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
    },
    {
      id: 'notif-4',
      type: 'rating',
      title: 'Multiple Ratings',
      message: 'Your photo "Urban Dreams" received 5 new ratings',
      imageUrl: 'https://picsum.photos/seed/2/100/100',
      linkTo: '/photo/image-2',
      isRead: true,
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    },
    {
      id: 'notif-5',
      type: 'system',
      title: 'Welcome to RateGallery!',
      message: 'Start by uploading your first photo and get rated by the community.',
      linkTo: '/upload',
      isRead: true,
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
    },
    {
      id: 'notif-6',
      type: 'follow',
      title: 'New Follower',
      message: '@liam_patel and 2 others started following you',
      linkTo: '/profile/liam_patel',
      isRead: true,
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
    },
  ];
};

// Admin warning notifications
const adminWarningNotifications: Notification[] = [
  {
    id: 'warning-1',
    type: 'warning',
    title: '⚠️ Content Warning',
    message: 'One of your images has been flagged for review. Please ensure all uploads are original content.',
    linkTo: '/settings',
    isRead: false,
    createdAt: new Date().toISOString(),
  },
];

export function NotificationsPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'warnings'>('all');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Load notifications from storage or generate mock ones
    const savedNotifications = storage.get<Notification[]>(`notifications_${user?.id}`, []);
    
    if (savedNotifications.length === 0 && user) {
      // Generate mock notifications for demo
      const mockNotifs = generateMockNotifications(user.id);
      
      // Add warning if user has warnings
      if (user.warnings > 0) {
        mockNotifs.unshift(adminWarningNotifications[0]);
      }
      
      setNotifications(mockNotifs);
      storage.set(`notifications_${user.id}`, mockNotifs);
    } else {
      setNotifications(savedNotifications);
    }
  }, [isAuthenticated, navigate, user]);

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const warningCount = notifications.filter(n => n.type === 'warning').length;

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.isRead;
    if (filter === 'warnings') return n.type === 'warning';
    return true;
  });

  const markAsRead = (notifId: string) => {
    const updated = notifications.map(n => 
      n.id === notifId ? { ...n, isRead: true } : n
    );
    setNotifications(updated);
    storage.set(`notifications_${user?.id}`, updated);
  };

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, isRead: true }));
    setNotifications(updated);
    storage.set(`notifications_${user?.id}`, updated);
  };

  const deleteNotification = (notifId: string) => {
    const updated = notifications.filter(n => n.id !== notifId);
    setNotifications(updated);
    storage.set(`notifications_${user?.id}`, updated);
  };

  const clearAll = () => {
    setNotifications([]);
    storage.set(`notifications_${user?.id}`, []);
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'rating':
        return <Star className="text-yellow-500" size={20} />;
      case 'follow':
        return <UserPlus className="text-blue-500" size={20} />;
      case 'warning':
        return <AlertTriangle className="text-red-500" size={20} />;
      case 'leaderboard':
        return <Trophy className="text-purple-500" size={20} />;
      case 'upload':
        return <Image className="text-green-500" size={20} />;
      case 'system':
        return <Info className="text-gray-500" size={20} />;
      default:
        return <Bell className="text-gray-500" size={20} />;
    }
  };

  const getNotificationStyle = (type: Notification['type'], isRead: boolean) => {
    const baseStyle = isRead ? 'bg-white' : 'bg-blue-50';
    
    if (type === 'warning') {
      return isRead ? 'bg-red-50/50 border-red-200' : 'bg-red-50 border-red-300';
    }
    
    return `${baseStyle} ${isRead ? 'border-gray-100' : 'border-blue-200'}`;
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary-light rounded-xl flex items-center justify-center">
            <Bell size={24} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-dark">Notifications</h1>
            <p className="text-dark-muted">
              {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              <Check size={16} className="mr-1" />
              Mark all read
            </Button>
          )}
          {notifications.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearAll}>
              <Trash2 size={16} className="mr-1" />
              Clear all
            </Button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-full font-medium transition-colors ${
            filter === 'all'
              ? 'bg-dark text-white'
              : 'bg-gray-100 text-dark hover:bg-gray-200'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 rounded-full font-medium transition-colors ${
            filter === 'unread'
              ? 'bg-dark text-white'
              : 'bg-gray-100 text-dark hover:bg-gray-200'
          }`}
        >
          Unread ({unreadCount})
        </button>
        {warningCount > 0 && (
          <button
            onClick={() => setFilter('warnings')}
            className={`px-4 py-2 rounded-full font-medium transition-colors ${
              filter === 'warnings'
                ? 'bg-red-500 text-white'
                : 'bg-red-50 text-red-600 hover:bg-red-100'
            }`}
          >
            <AlertTriangle size={16} className="inline mr-1" />
            Warnings ({warningCount})
          </button>
        )}
      </div>

      {/* Notifications List */}
      {filteredNotifications.length > 0 ? (
        <div className="space-y-3">
          {filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              className={`flex items-start gap-4 p-4 rounded-2xl border-2 transition-all hover:shadow-md ${getNotificationStyle(notif.type, notif.isRead)}`}
            >
              {/* Icon */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                notif.type === 'warning' ? 'bg-red-100' : 'bg-gray-100'
              }`}>
                {getNotificationIcon(notif.type)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className={`font-semibold ${notif.type === 'warning' ? 'text-red-700' : 'text-dark'}`}>
                    {notif.title}
                  </p>
                  {!notif.isRead && (
                    <span className="w-2 h-2 bg-primary rounded-full"></span>
                  )}
                  {notif.type === 'warning' && (
                    <Badge variant="danger" size="sm">Important</Badge>
                  )}
                </div>
                <p className={`text-sm mb-2 ${notif.type === 'warning' ? 'text-red-600' : 'text-dark-muted'}`}>
                  {notif.message}
                </p>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-dark-muted">
                    {formatRelativeTime(notif.createdAt)}
                  </span>
                  {notif.linkTo && (
                    <Link 
                      to={notif.linkTo}
                      onClick={() => markAsRead(notif.id)}
                      className="text-xs text-primary hover:underline"
                    >
                      View details →
                    </Link>
                  )}
                </div>
              </div>

              {/* Image Preview (if any) */}
              {notif.imageUrl && (
                <img
                  src={notif.imageUrl}
                  alt=""
                  className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                />
              )}

              {/* Actions */}
              <div className="flex flex-col gap-1 flex-shrink-0">
                {!notif.isRead && (
                  <button
                    onClick={() => markAsRead(notif.id)}
                    className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                    title="Mark as read"
                  >
                    <Check size={16} className="text-dark-muted" />
                  </button>
                )}
                <button
                  onClick={() => deleteNotification(notif.id)}
                  className="p-2 rounded-full hover:bg-red-100 transition-colors"
                  title="Delete"
                >
                  <Trash2 size={16} className="text-red-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bell size={32} className="text-dark-muted" />
          </div>
          <h3 className="text-lg font-semibold text-dark mb-2">
            {filter === 'all' ? 'No notifications yet' : 
             filter === 'unread' ? 'No unread notifications' : 
             'No warnings'}
          </h3>
          <p className="text-dark-muted">
            {filter === 'all' 
              ? "When you get new activity, it'll show up here."
              : filter === 'unread'
              ? "You're all caught up!"
              : "Great! You have no warnings."}
          </p>
        </div>
      )}
    </div>
  );
}
