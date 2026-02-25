import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Share2, 
  Flag, 
  Calendar,
  Copy,
  Check,
  Twitter,
  Facebook
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { StarRating, RatingSlider } from '../components/ui/StarRating';
import { Modal } from '../components/ui/Modal';
import { TextArea } from '../components/ui/Input';
import { useImages, useAuth } from '../context/AppContext';
import { mockUsers } from '../data/mockData';
import { formatRelativeTime, getShareUrl, copyToClipboard } from '../utils/helpers';

export function PhotoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { images, rateImage, reportImage } = useImages();
  const { user, isAuthenticated } = useAuth();
  
  const [showShareModal, setShowShareModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [userRating, setUserRating] = useState(5);
  const [hasRated, setHasRated] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);

  const image = images.find(img => img.id === id);
  const imageOwner = mockUsers.find(u => u.id === image?.userId);

  useEffect(() => {
    if (image && user) {
      const existingRating = image.ratings.find(r => r.userId === user.id);
      if (existingRating) {
        setUserRating(existingRating.rating);
        setHasRated(true);
      }
    }
  }, [image, user]);

  if (!image) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-dark mb-4">Photo not found</h1>
        <Link to="/explore">
          <Button>Back to Explore</Button>
        </Link>
      </div>
    );
  }

  const handleCopyLink = async () => {
    const success = await copyToClipboard(getShareUrl(image.id));
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRate = () => {
    if (user) {
      rateImage(image.id, user.id, userRating);
      setHasRated(true);
    }
  };

  const handleReport = () => {
    if (user && reportReason) {
      reportImage(image.id, user.id, reportReason, reportDescription);
      setReportSubmitted(true);
      setTimeout(() => {
        setShowReportModal(false);
        setReportReason('');
        setReportDescription('');
        setReportSubmitted(false);
      }, 2000);
    }
  };

  const reportReasons = [
    { value: 'spam', label: 'Spam' },
    { value: 'nudity', label: 'Nudity or sexual content' },
    { value: 'hate_speech', label: 'Hate speech or symbols' },
    { value: 'violence', label: 'Violence or dangerous organizations' },
    { value: 'harassment', label: 'Bullying or harassment' },
    { value: 'copyright', label: '⚠️ Copyright or intellectual property violation' },
    { value: 'false_information', label: 'False information' },
    { value: 'other', label: 'Something else' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-dark-muted hover:text-dark mb-6 transition-colors"
      >
        <ArrowLeft size={20} />
        Back
      </button>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Image */}
        <div className="lg:col-span-2">
          <div className="rounded-3xl overflow-hidden bg-gray-100">
            <img
              src={image.imageUrl}
              alt={image.title}
              className="w-full object-contain max-h-[80vh]"
            />
          </div>
        </div>

        {/* Details */}
        <div className="space-y-6">
          {/* User Info */}
          <div className="flex items-center justify-between">
            <Link to={`/profile/${image.username}`} className="flex items-center gap-3">
              <Avatar src={image.userAvatar} alt={image.username} size="lg" />
              <div>
                <p className="font-semibold text-dark">{imageOwner?.name}</p>
                <p className="text-sm text-dark-muted">@{image.username}</p>
              </div>
            </Link>
            
            {isAuthenticated && user?.id !== image.userId && (
              <Button variant="outline" size="sm">
                Follow
              </Button>
            )}
          </div>

          {/* Title & Tags */}
          <div>
            <h1 className="text-2xl font-bold text-dark mb-2">{image.title}</h1>
            <div className="flex flex-wrap gap-2">
              {image.tags.map((tag) => (
                <Link
                  key={tag}
                  to={`/search?q=${tag}`}
                  className="px-3 py-1 bg-gray-100 text-dark-muted text-sm rounded-full hover:bg-gray-200 transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          </div>

          {/* Rating Display */}
          <div className="bg-gray-50 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-dark-muted">Average Rating</span>
              <span className="text-2xl font-bold text-dark">{image.averageRating}/10</span>
            </div>
            <StarRating rating={image.starRating} size="lg" showValue />
            <p className="text-sm text-dark-muted mt-2">
              Based on {image.totalRatings} rating{image.totalRatings !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Rate This Photo (only for logged in users) */}
          {isAuthenticated && user?.id !== image.userId && (
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-4">
              <RatingSlider value={userRating} onChange={setUserRating} />
              <Button 
                className="w-full mt-4" 
                onClick={handleRate}
                variant={hasRated ? 'secondary' : 'primary'}
              >
                {hasRated ? 'Update Rating' : 'Submit Rating'}
              </Button>
              {hasRated && (
                <p className="text-sm text-green-600 text-center mt-2">
                  You rated this photo {userRating}/10
                </p>
              )}
            </div>
          )}

          {/* Login prompt for non-authenticated users */}
          {!isAuthenticated && (
            <div className="bg-gray-50 rounded-2xl p-4 text-center">
              <p className="text-dark-muted mb-3">Sign in to rate this photo</p>
              <Link to="/login">
                <Button size="sm">Sign In</Button>
              </Link>
            </div>
          )}

          {/* Date */}
          <div className="flex items-center gap-2 text-dark-muted">
            <Calendar size={18} />
            <span>Posted {formatRelativeTime(image.createdAt)}</span>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowShareModal(true)}
            >
              <Share2 size={18} className="mr-2" />
              Share
            </Button>
            {isAuthenticated && (
              <Button
                variant="ghost"
                onClick={() => setShowReportModal(true)}
              >
                <Flag size={18} className="text-red-500" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Share Modal */}
      <Modal
        isOpen={showShareModal}
        onClose={() => {
          setShowShareModal(false);
          setCopied(false);
        }}
        title="Share this photo"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => {
                window.open(
                  `https://twitter.com/intent/tweet?url=${encodeURIComponent(getShareUrl(image.id))}&text=${encodeURIComponent(`Check out this photo: ${image.title}`)}`,
                  '_blank'
                );
              }}
              className="p-3 bg-[#1DA1F2] text-white rounded-full hover:scale-110 transition-transform"
            >
              <Twitter size={24} />
            </button>
            <button
              onClick={() => {
                window.open(
                  `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getShareUrl(image.id))}`,
                  '_blank'
                );
              }}
              className="p-3 bg-[#4267B2] text-white rounded-full hover:scale-110 transition-transform"
            >
              <Facebook size={24} />
            </button>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={getShareUrl(image.id)}
              readOnly
              className="flex-1 px-4 py-2 rounded-xl bg-gray-100 text-dark text-sm"
            />
            <Button
              variant={copied ? 'secondary' : 'outline'}
              size="sm"
              onClick={handleCopyLink}
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Report Modal */}
      <Modal
        isOpen={showReportModal}
        onClose={() => {
          setShowReportModal(false);
          setReportReason('');
          setReportDescription('');
          setReportSubmitted(false);
        }}
        title="Report this photo"
        size="md"
      >
        {reportSubmitted ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check size={32} className="text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-dark mb-2">Report Submitted</h3>
            <p className="text-dark-muted">Thank you for helping keep our community safe.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-dark-muted">Why are you reporting this photo?</p>
            
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {reportReasons.map((reason) => (
                <label
                  key={reason.value}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${
                    reportReason === reason.value
                      ? 'border-primary bg-primary-light'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="report-reason"
                    value={reason.value}
                    checked={reportReason === reason.value}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="hidden"
                  />
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      reportReason === reason.value
                        ? 'border-primary'
                        : 'border-gray-300'
                    }`}
                  >
                    {reportReason === reason.value && (
                      <div className="w-3 h-3 rounded-full bg-primary" />
                    )}
                  </div>
                  <span className={`${reason.value === 'copyright' ? 'text-primary font-medium' : 'text-dark'}`}>
                    {reason.label}
                  </span>
                </label>
              ))}
            </div>

            {reportReason && (
              <TextArea
                label="Additional details (optional)"
                placeholder="Provide more information..."
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                rows={3}
              />
            )}

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowReportModal(false);
                  setReportReason('');
                  setReportDescription('');
                }}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                className="flex-1"
                disabled={!reportReason}
                onClick={handleReport}
              >
                Submit Report
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
