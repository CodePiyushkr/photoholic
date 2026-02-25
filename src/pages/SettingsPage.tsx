import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, Bell, Shield, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { useAuth } from '../context/AppContext';

export function SettingsPage() {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();
  const [activeSection, setActiveSection] = useState<'account' | 'password' | 'notifications' | 'privacy'>('account');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  if (!user) {
    navigate('/login');
    return null;
  }

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    
    if (passwordData.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    // Simulate password change
    setPasswordSuccess(true);
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setTimeout(() => setPasswordSuccess(false), 3000);
  };

  const handleDeleteAccount = () => {
    logout();
    navigate('/');
  };

  const sections = [
    { id: 'account', label: 'Account', icon: Shield },
    { id: 'password', label: 'Password', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-dark-muted hover:text-dark mb-6 transition-colors"
      >
        <ArrowLeft size={20} />
        Back
      </button>

      <h1 className="text-3xl font-bold text-dark mb-8">Settings</h1>

      <div className="grid md:grid-cols-4 gap-8">
        {/* Sidebar */}
        <nav className="space-y-1">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                activeSection === section.id
                  ? 'bg-dark text-white'
                  : 'text-dark hover:bg-gray-100'
              }`}
            >
              <section.icon size={20} />
              {section.label}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className="md:col-span-3">
          {activeSection === 'account' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-dark">Account Information</h2>
              
              <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
                <div>
                  <label className="text-sm text-dark-muted">Email</label>
                  <p className="text-dark font-medium">{user.email}</p>
                </div>
                <div>
                  <label className="text-sm text-dark-muted">Phone</label>
                  <p className="text-dark font-medium">{user.phone}</p>
                </div>
                <div>
                  <label className="text-sm text-dark-muted">Location</label>
                  <p className="text-dark font-medium">
                    {user.location.city}, {user.location.state}, {user.location.country}
                  </p>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="border-2 border-red-200 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-red-600 mb-2">Danger Zone</h3>
                <p className="text-dark-muted mb-4">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
                <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
                  <Trash2 size={18} className="mr-2" />
                  Delete Account
                </Button>
              </div>
            </div>
          )}

          {activeSection === 'password' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-dark">Change Password</h2>
              
              {passwordSuccess && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-2xl text-green-600">
                  Password changed successfully!
                </div>
              )}

              {passwordError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600">
                  {passwordError}
                </div>
              )}

              <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                <Input
                  type="password"
                  label="Current Password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  required
                />
                <Input
                  type="password"
                  label="New Password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  required
                />
                <Input
                  type="password"
                  label="Confirm New Password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  required
                />
                <Button type="submit">Update Password</Button>
              </form>
            </div>
          )}

          {activeSection === 'notifications' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-dark">Notification Preferences</h2>
              
              <div className="space-y-4">
                {[
                  { id: 'new_ratings', label: 'New ratings on your photos', description: 'Get notified when someone rates your photo' },
                  { id: 'new_followers', label: 'New followers', description: 'Get notified when someone follows you' },
                  { id: 'leaderboard', label: 'Leaderboard updates', description: 'Get notified about your ranking changes' },
                ].map((notification) => (
                  <div key={notification.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                    <div>
                      <p className="font-medium text-dark">{notification.label}</p>
                      <p className="text-sm text-dark-muted">{notification.description}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'privacy' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-dark">Privacy Settings</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                  <div>
                    <p className="font-medium text-dark">Private Account</p>
                    <p className="text-sm text-dark-muted">
                      Only approved followers can see your photos
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={user.isPrivate}
                      onChange={(e) => updateUser({ isPrivate: e.target.checked })}
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                  <div>
                    <p className="font-medium text-dark">Show on Leaderboard</p>
                    <p className="text-sm text-dark-muted">
                      Allow your profile to appear on public leaderboards
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Account Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Account"
        size="sm"
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={32} className="text-red-600" />
          </div>
          <p className="text-dark mb-6">
            Are you sure you want to delete your account? This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              onClick={handleDeleteAccount}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
