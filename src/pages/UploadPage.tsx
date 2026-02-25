import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X, AlertTriangle, Check } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth, useImages } from '../context/AppContext';
import { ImagePost } from '../types';

export function UploadPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addImage } = useImages();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [scanningImage, setScanningImage] = useState(false);
  const [scanResult, setScanResult] = useState<'clean' | 'flagged' | null>(null);
  const [error, setError] = useState('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('Image must be less than 10MB');
        return;
      }
      
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError('');
      
      // Simulate AI scanning
      simulateImageScan();
    }
  };

  const simulateImageScan = () => {
    setScanningImage(true);
    setScanResult(null);
    
    // Simulate AI scan delay
    setTimeout(() => {
      // 90% chance clean, 10% flagged (for demo)
      const isFlagged = Math.random() < 0.1;
      setScanResult(isFlagged ? 'flagged' : 'clean');
      setScanningImage(false);
    }, 2000);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError('');
      simulateImageScan();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile || !user) return;
    if (!title.trim()) {
      setError('Please enter a title');
      return;
    }

    setIsUploading(true);

    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const tagList = tags
      .split(',')
      .map(tag => tag.trim().toLowerCase())
      .filter(tag => tag.length > 0);

    const newImage: ImagePost = {
      id: `image-${Date.now()}`,
      userId: user.id,
      username: user.username,
      userAvatar: user.avatar,
      imageUrl: previewUrl || '', // In real app, this would be the uploaded URL
      title: title.trim(),
      tags: tagList,
      createdAt: new Date().toISOString(),
      ratings: [],
      averageRating: 0,
      totalRatings: 0,
      starRating: 0,
      isFlagged: scanResult === 'flagged',
      flagReason: scanResult === 'flagged' ? 'Potential internet image detected - pending review' : undefined,
      isApproved: scanResult !== 'flagged',
      reports: [],
    };

    addImage(newImage);
    
    if (scanResult === 'flagged') {
      alert('Your image has been uploaded but flagged for review. It will be visible after admin approval.');
    }
    
    navigate(`/profile/${user.username}`);
  };

  const removeImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setScanResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-dark mb-2">Upload Photo</h1>
      <p className="text-dark-muted mb-8">Share your original photography with the community</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Image Upload Area */}
        {!selectedFile ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-gray-300 rounded-3xl p-12 text-center cursor-pointer hover:border-primary hover:bg-primary-light/10 transition-colors"
          >
            <Upload size={48} className="mx-auto text-dark-muted mb-4" />
            <p className="text-lg font-medium text-dark mb-2">
              Click to upload or drag and drop
            </p>
            <p className="text-dark-muted">PNG, JPG, WEBP up to 10MB</p>
          </div>
        ) : (
          <div className="relative rounded-3xl overflow-hidden bg-gray-100">
            <img
              src={previewUrl || ''}
              alt="Preview"
              className="w-full max-h-96 object-contain"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
            >
              <X size={20} />
            </button>

            {/* Scan Status */}
            <div className="absolute bottom-4 left-4 right-4">
              {scanningImage && (
                <div className="bg-white rounded-xl p-4 shadow-lg flex items-center gap-3">
                  <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full" />
                  <span className="text-dark">Scanning for originality...</span>
                </div>
              )}
              
              {scanResult === 'clean' && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                  <Check size={20} className="text-green-600" />
                  <span className="text-green-700">Image appears to be original</span>
                </div>
              )}
              
              {scanResult === 'flagged' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center gap-3">
                  <AlertTriangle size={20} className="text-yellow-600" />
                  <div>
                    <p className="text-yellow-700 font-medium">Image flagged for review</p>
                    <p className="text-yellow-600 text-sm">This image may exist online. It will be reviewed by admin.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Title */}
        <Input
          label="Title"
          placeholder="Give your photo a title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        {/* Tags */}
        <Input
          label="Tags"
          placeholder="nature, landscape, photography (comma separated)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />
        <p className="text-sm text-dark-muted -mt-4">Separate tags with commas</p>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full"
          disabled={!selectedFile || scanningImage || isUploading}
          isLoading={isUploading}
        >
          {isUploading ? 'Uploading...' : 'Upload Photo'}
        </Button>

        {/* Terms Notice */}
        <p className="text-sm text-dark-muted text-center">
          By uploading, you confirm this is your original work and agree to our{' '}
          <a href="/terms" className="text-primary hover:underline">Terms of Service</a>
        </p>
      </form>
    </div>
  );
}
