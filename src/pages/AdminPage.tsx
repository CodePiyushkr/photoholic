import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Users, 
  Image, 
  Flag, 
  AlertTriangle, 
  Shield, 
  Check, 
  Eye,
  Trash2,
  AlertCircle,
  BarChart3,
  Search
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { useAuth, useImages } from '../context/AppContext';
import { mockUsers } from '../data/mockData';
import { formatRelativeTime } from '../utils/helpers';
import { User, ImagePost } from '../types';

type AdminTab = 'overview' | 'users' | 'flagged' | 'reports';

export function AdminPage() {
  const navigate = useNavigate();
  const { user, banUser, warnUser, bannedUsers } = useAuth();
  const { images, approveImage, deleteImage, clearReports } = useImages();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [selectedImage, setSelectedImage] = useState<ImagePost | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Redirect if not admin
  if (!user?.isAdmin) {
    navigate('/');
    return null;
  }

  const flaggedImages = images.filter(img => img.isFlagged);
  const reportedImages = images.filter(img => img.reports.length > 0);
  const allUsers = mockUsers.filter(u => !u.isAdmin);

  // Show success/error message for 3 seconds
  const showMessage = (type: 'success' | 'error', text: string) => {
    setActionMessage({ type, text });
    setTimeout(() => setActionMessage(null), 3000);
  };

  const filteredUsers = useMemo(() => {
    if (!searchQuery) return allUsers;
    const q = searchQuery.toLowerCase();
    return allUsers.filter(u => 
      u.name.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    );
  }, [allUsers, searchQuery]);

  const stats = {
    totalUsers: allUsers.length,
    totalImages: images.length,
    flaggedImages: flaggedImages.length,
    totalReports: reportedImages.reduce((sum, img) => sum + img.reports.length, 0),
  };

  const handleApproveImage = (imageId: string) => {
    approveImage(imageId);
    clearReports(imageId);
    setShowImageModal(false);
    setSelectedImage(null);
    showMessage('success', 'Image approved successfully!');
  };

  const handleDeleteImage = (imageId: string) => {
    deleteImage(imageId);
    setShowImageModal(false);
    setSelectedImage(null);
    showMessage('success', 'Image deleted successfully!');
  };

  const handleBanUser = (userId: string, username: string) => {
    banUser(userId);
    setShowUserModal(false);
    setSelectedUser(null);
    showMessage('success', `User @${username} has been banned!`);
  };

  const handleWarnUser = (userId: string, username: string) => {
    warnUser(userId);
    showMessage('success', `Warning sent to @${username}!`);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'flagged', label: 'Flagged Images', icon: AlertTriangle, badge: stats.flaggedImages },
    { id: 'reports', label: 'Reports', icon: Flag, badge: stats.totalReports },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
          <Shield size={24} className="text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-dark">Admin Panel</h1>
          <p className="text-dark-muted">Manage users, images, and reports</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-200 pb-4">

        {/* Action Message */}
        {actionMessage && (
          <div className={`fixed top-20 right-4 z-50 px-6 py-3 rounded-xl shadow-lg animate-fadeIn ${
            actionMessage.type === 'success' 
              ? 'bg-green-500 text-white' 
              : 'bg-red-500 text-white'
          }`}>
            {actionMessage.text}
          </div>
        )}

        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as AdminTab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-dark text-white'
                : 'bg-gray-100 text-dark hover:bg-gray-200'
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
            {tab.badge !== undefined && tab.badge > 0 && (
              <span className={`px-2 py-0.5 text-xs rounded-full ${
                activeTab === tab.id ? 'bg-white text-dark' : 'bg-primary text-white'
              }`}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Users size={24} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-dark">{stats.totalUsers}</p>
                  <p className="text-dark-muted">Total Users</p>
                </div>
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Image size={24} className="text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-dark">{stats.totalImages}</p>
                  <p className="text-dark-muted">Total Images</p>
                </div>
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <AlertTriangle size={24} className="text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-dark">{stats.flaggedImages}</p>
                  <p className="text-dark-muted">Flagged Images</p>
                </div>
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <Flag size={24} className="text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-dark">{stats.totalReports}</p>
                  <p className="text-dark-muted">Pending Reports</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          {(stats.flaggedImages > 0 || stats.totalReports > 0) && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
              <h3 className="font-bold text-dark mb-4 flex items-center gap-2">
                <AlertCircle className="text-yellow-600" />
                Requires Attention
              </h3>
              <div className="space-y-2">
                {stats.flaggedImages > 0 && (
                  <button
                    onClick={() => setActiveTab('flagged')}
                    className="w-full text-left p-4 bg-white rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <p className="font-medium text-dark">{stats.flaggedImages} images flagged for review</p>
                    <p className="text-sm text-dark-muted">AI detected potential copyright issues</p>
                  </button>
                )}
                {stats.totalReports > 0 && (
                  <button
                    onClick={() => setActiveTab('reports')}
                    className="w-full text-left p-4 bg-white rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <p className="font-medium text-dark">{stats.totalReports} user reports pending</p>
                    <p className="text-sm text-dark-muted">Users have reported content</p>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-muted" size={20} />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-full bg-gray-100 text-dark placeholder-dark-muted focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Users List */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-dark">User</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-dark">Email</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-dark">Location</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-dark">Status</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-dark">Images</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-dark">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar src={user.avatar} alt={user.name} size="sm" />
                          <div>
                            <p className="font-medium text-dark">{user.name}</p>
                            <p className="text-sm text-dark-muted">@{user.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-dark-muted">{user.email}</td>
                      <td className="px-6 py-4 text-dark-muted">{user.location.city}, {user.location.country}</td>
                      <td className="px-6 py-4">
                        {bannedUsers.includes(user.id) ? (
                          <Badge variant="danger">Banned</Badge>
                        ) : (
                          <Badge variant={user.isPrivate ? 'default' : 'success'}>
                            {user.isPrivate ? 'Private' : 'Public'}
                          </Badge>
                        )}
                        {user.warnings > 0 && (
                          <Badge variant="warning" size="sm" className="ml-1">
                            {user.warnings} warning{user.warnings > 1 ? 's' : ''}
                          </Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 text-dark">{user.totalImages}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowUserModal(true);
                          }}
                          className="text-primary hover:underline"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Flagged Images Tab */}
      {activeTab === 'flagged' && (
        <div className="space-y-4">
          {flaggedImages.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {flaggedImages.map((image) => (
                <div key={image.id} className="bg-white border-2 border-yellow-200 rounded-2xl overflow-hidden">
                  <div className="relative aspect-square">
                    <img src={image.imageUrl} alt={image.title} className="w-full h-full object-cover" />
                    <div className="absolute top-2 right-2">
                      <Badge variant="warning">
                        <AlertTriangle size={12} className="mr-1" />
                        Flagged
                      </Badge>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-dark mb-1">{image.title}</h3>
                    <p className="text-sm text-dark-muted mb-2">by @{image.username}</p>
                    <p className="text-sm text-yellow-700 bg-yellow-50 p-2 rounded-lg mb-4">
                      {image.flagReason}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          setSelectedImage(image);
                          setShowImageModal(true);
                        }}
                      >
                        <Eye size={16} className="mr-1" />
                        Review
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleApproveImage(image.id)}
                      >
                        <Check size={16} />
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteImage(image.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Check size={48} className="mx-auto text-green-500 mb-4" />
              <p className="text-dark-muted text-lg">No flagged images</p>
              <p className="text-dark-muted">All images have been reviewed</p>
            </div>
          )}
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          {reportedImages.length > 0 ? (
            reportedImages.map((image) => (
              <div key={image.id} className="bg-white border border-gray-200 rounded-2xl p-6">
                <div className="flex gap-6">
                  <img
                    src={image.imageUrl}
                    alt={image.title}
                    className="w-32 h-32 object-cover rounded-xl"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-dark mb-1">{image.title}</h3>
                    <p className="text-sm text-dark-muted mb-4">by @{image.username}</p>
                    
                    <div className="space-y-2">
                      {image.reports.map((report) => (
                        <div key={report.id} className="bg-gray-50 p-3 rounded-xl">
                          <div className="flex items-center justify-between mb-1">
                            <Badge 
                              variant={report.reason === 'copyright' ? 'danger' : 'warning'}
                              size="sm"
                            >
                              {report.reason.replace('_', ' ')}
                            </Badge>
                            <span className="text-xs text-dark-muted">
                              {formatRelativeTime(report.createdAt)}
                            </span>
                          </div>
                          {report.description && (
                            <p className="text-sm text-dark-muted">{report.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedImage(image);
                        setShowImageModal(true);
                      }}
                    >
                      <Eye size={16} className="mr-1" />
                      View
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteImage(image.id)}
                    >
                      <Trash2 size={16} className="text-red-500" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16">
              <Check size={48} className="mx-auto text-green-500 mb-4" />
              <p className="text-dark-muted text-lg">No pending reports</p>
            </div>
          )}
        </div>
      )}

      {/* Image Review Modal */}
      <Modal
        isOpen={showImageModal}
        onClose={() => {
          setShowImageModal(false);
          setSelectedImage(null);
        }}
        title="Review Image"
        size="full"
      >
        {selectedImage && (
          <div className="grid md:grid-cols-2 gap-6">
            <img
              src={selectedImage.imageUrl}
              alt={selectedImage.title}
              className="w-full rounded-xl"
            />
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold text-dark">{selectedImage.title}</h3>
                <Link to={`/profile/${selectedImage.username}`} className="text-primary hover:underline">
                  @{selectedImage.username}
                </Link>
              </div>

              {selectedImage.isFlagged && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                  <p className="font-medium text-yellow-700 mb-1">AI Flag Reason:</p>
                  <p className="text-yellow-600">{selectedImage.flagReason}</p>
                </div>
              )}

              {selectedImage.reports.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="font-medium text-red-700 mb-2">User Reports ({selectedImage.reports.length}):</p>
                  {selectedImage.reports.map((report) => (
                    <div key={report.id} className="mb-2 last:mb-0">
                      <Badge variant="danger" size="sm">{report.reason}</Badge>
                      {report.description && (
                        <p className="text-sm text-red-600 mt-1">{report.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={() => handleApproveImage(selectedImage.id)}
                >
                  <Check size={18} className="mr-2" />
                  Approve
                </Button>
                <Button
                  variant="danger"
                  className="flex-1"
                  onClick={() => handleDeleteImage(selectedImage.id)}
                >
                  <Trash2 size={18} className="mr-2" />
                  Delete & Warn User
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* User Detail Modal */}
      <Modal
        isOpen={showUserModal}
        onClose={() => {
          setShowUserModal(false);
          setSelectedUser(null);
        }}
        title="User Details"
        size="md"
      >
        {selectedUser && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar src={selectedUser.avatar} alt={selectedUser.name} size="xl" />
              <div>
                <h3 className="text-xl font-bold text-dark">{selectedUser.name}</h3>
                <p className="text-dark-muted">@{selectedUser.username}</p>
                {bannedUsers.includes(selectedUser.id) && (
                  <Badge variant="danger" className="mt-1">Banned</Badge>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-dark-muted">Email</p>
                <p className="font-medium text-dark">{selectedUser.email}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-dark-muted">Phone</p>
                <p className="font-medium text-dark">{selectedUser.phone}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-dark-muted">Location</p>
                <p className="font-medium text-dark">
                  {selectedUser.location.city}, {selectedUser.location.state}, {selectedUser.location.country}
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-dark-muted">Joined</p>
                <p className="font-medium text-dark">{formatRelativeTime(selectedUser.createdAt)}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-dark-muted">Total Images</p>
                <p className="font-medium text-dark">{selectedUser.totalImages}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-dark-muted">Warnings</p>
                <p className={`font-medium ${selectedUser.warnings > 0 ? 'text-red-600' : 'text-dark'}`}>
                  {selectedUser.warnings}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Link to={`/profile/${selectedUser.username}`} className="flex-1">
                <Button variant="outline" className="w-full">View Profile</Button>
              </Link>
              {!bannedUsers.includes(selectedUser.id) && (
                <Button 
                  variant="outline"
                  onClick={() => handleWarnUser(selectedUser.id, selectedUser.username)}
                  className="border-yellow-500 text-yellow-600 hover:bg-yellow-50"
                >
                  Warn User
                </Button>
              )}
              {bannedUsers.includes(selectedUser.id) ? (
                <Button variant="ghost" disabled className="text-dark-muted">
                  User Banned
                </Button>
              ) : (
                <Button 
                  variant="danger"
                  onClick={() => handleBanUser(selectedUser.id, selectedUser.username)}
                >
                  Ban User
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
