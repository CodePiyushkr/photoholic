import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input, TextArea } from '../components/ui/Input';
import { Avatar } from '../components/ui/Avatar';
import { useAuth } from '../context/AppContext';

export function EditProfilePage() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    isPrivate: user?.isPrivate || false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    updateUser({
      name: formData.name,
      bio: formData.bio,
      isPrivate: formData.isPrivate,
    });

    setSuccess(true);
    setIsLoading(false);

    setTimeout(() => {
      navigate(`/profile/${user.username}`);
    }, 1000);
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-dark-muted hover:text-dark mb-6 transition-colors"
      >
        <ArrowLeft size={20} />
        Back
      </button>

      <h1 className="text-3xl font-bold text-dark mb-8">Edit Profile</h1>

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-2xl text-green-600 text-sm mb-6">
          Profile updated successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar */}
        <div className="flex flex-col items-center">
          <div className="relative">
            <Avatar src={user.avatar} alt={user.name} size="xl" className="w-24 h-24" />
            <button
              type="button"
              className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full hover:bg-primary-hover transition-colors"
            >
              <Camera size={16} />
            </button>
          </div>
          <p className="text-sm text-dark-muted mt-2">Click to change avatar</p>
        </div>

        {/* Name */}
        <Input
          label="Display Name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          required
        />

        {/* Username (read-only) */}
        <div>
          <label className="block text-sm font-medium text-dark mb-1">Username</label>
          <div className="px-4 py-3 rounded-2xl border-2 border-gray-200 bg-gray-50 text-dark-muted">
            @{user.username}
          </div>
          <p className="text-xs text-dark-muted mt-1">Username cannot be changed</p>
        </div>

        {/* Bio */}
        <TextArea
          label="Bio"
          placeholder="Tell us about yourself..."
          value={formData.bio}
          onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
          rows={4}
        />

        {/* Privacy Toggle */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
          <div>
            <p className="font-medium text-dark">Private Account</p>
            <p className="text-sm text-dark-muted">
              Only followers can see your photos
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isPrivate}
              onChange={(e) => setFormData(prev => ({ ...prev, isPrivate: e.target.checked }))}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-dark mb-1">Location</label>
          <div className="px-4 py-3 rounded-2xl border-2 border-gray-200 bg-gray-50 text-dark">
            {user.location.city}, {user.location.state}, {user.location.country}
          </div>
          <p className="text-xs text-dark-muted mt-1">Location is auto-detected</p>
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => navigate(-1)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1"
            isLoading={isLoading}
          >
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
