import { useState } from 'react';
import { ImagePost } from '../../types';
import { ImageCard } from './ImageCard';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { TextArea } from '../ui/Input';
import { Copy, Check, Twitter, Facebook } from 'lucide-react';
import { getShareUrl, copyToClipboard } from '../../utils/helpers';
import { useImages } from '../../context/AppContext';
import { useAuth } from '../../context/AppContext';

interface ImageGridProps {
  images: ImagePost[];
}

export function ImageGrid({ images }: ImageGridProps) {
  const { user } = useAuth();
  const { reportImage } = useImages();
  const [shareImage, setShareImage] = useState<ImagePost | null>(null);
  const [reportImageData, setReportImageData] = useState<ImagePost | null>(null);
  const [copied, setCopied] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);

  const handleCopyLink = async () => {
    if (shareImage) {
      const success = await copyToClipboard(getShareUrl(shareImage.id));
      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  const handleReport = () => {
    if (reportImageData && user && reportReason) {
      reportImage(reportImageData.id, user.id, reportReason, reportDescription);
      setReportSubmitted(true);
      setTimeout(() => {
        setReportImageData(null);
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

  if (images.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-dark-muted text-lg">No images found</p>
      </div>
    );
  }

  return (
    <>
      <div className="masonry-grid">
        {images.map((image) => (
          <ImageCard
            key={image.id}
            image={image}
            onShare={setShareImage}
            onReport={setReportImageData}
          />
        ))}
      </div>

      {/* Share Modal */}
      <Modal
        isOpen={!!shareImage}
        onClose={() => {
          setShareImage(null);
          setCopied(false);
        }}
        title="Share this photo"
        size="sm"
      >
        {shareImage && (
          <div className="space-y-4">
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => {
                  window.open(
                    `https://twitter.com/intent/tweet?url=${encodeURIComponent(getShareUrl(shareImage.id))}&text=${encodeURIComponent(`Check out this photo: ${shareImage.title}`)}`,
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
                    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getShareUrl(shareImage.id))}`,
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
                value={getShareUrl(shareImage.id)}
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
        )}
      </Modal>

      {/* Report Modal */}
      <Modal
        isOpen={!!reportImageData}
        onClose={() => {
          setReportImageData(null);
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
            
            <div className="space-y-2">
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
                placeholder="Provide more information about why you're reporting this content..."
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
                  setReportImageData(null);
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
    </>
  );
}
