import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Share2, Flag, MoreHorizontal } from 'lucide-react';
import { ImagePost } from '../../types';
import { StarRating } from '../ui/StarRating';
import { Avatar } from '../ui/Avatar';
import { useAuth } from '../../context/AppContext';

interface ImageCardProps {
  image: ImagePost;
  onShare?: (image: ImagePost) => void;
  onReport?: (image: ImagePost) => void;
}

export function ImageCard({ image, onShare, onReport }: ImageCardProps) {
  const { isAuthenticated } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div 
      className="masonry-item group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowMenu(false);
      }}
    >
      <Link to={`/photo/${image.id}`}>
        <div className="relative rounded-2xl overflow-hidden bg-gray-100">
          {!imageLoaded && (
            <div className="absolute inset-0 animate-pulse bg-gray-200" />
          )}
          <img
            src={image.imageUrl}
            alt={image.title}
            className={`w-full object-cover transition-opacity duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
          />
          
          {/* Hover Overlay */}
          <div 
            className={`absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 transition-opacity duration-200 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
          />

          {/* Top Actions */}
          <div 
            className={`absolute top-3 right-3 flex gap-2 transition-opacity duration-200 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {isAuthenticated && (
              <>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    onShare?.(image);
                  }}
                  className="p-2 bg-white rounded-full shadow-lg hover:scale-110 transition-transform"
                >
                  <Share2 size={16} className="text-dark" />
                </button>
                
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setShowMenu(!showMenu);
                    }}
                    className="p-2 bg-white rounded-full shadow-lg hover:scale-110 transition-transform"
                  >
                    <MoreHorizontal size={16} className="text-dark" />
                  </button>
                  
                  {showMenu && (
                    <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-gray-100 py-1 w-40 z-10">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          onReport?.(image);
                          setShowMenu(false);
                        }}
                        className="flex items-center gap-2 w-full px-4 py-2 text-left text-dark hover:bg-gray-50 transition-colors"
                      >
                        <Flag size={16} className="text-red-500" />
                        Report
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Bottom Info */}
          <div 
            className={`absolute bottom-0 left-0 right-0 p-3 transition-opacity duration-200 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <h3 className="text-white font-semibold truncate mb-1">{image.title}</h3>
            <StarRating rating={image.starRating} size="sm" showValue />
          </div>
        </div>
      </Link>

      {/* User Info - Always visible */}
      <div className="flex items-center gap-2 mt-2 px-1">
        <Link to={`/profile/${image.username}`}>
          <Avatar src={image.userAvatar} alt={image.username} size="xs" />
        </Link>
        <Link 
          to={`/profile/${image.username}`}
          className="text-sm text-dark-muted hover:text-dark truncate"
        >
          {image.username}
        </Link>
      </div>
    </div>
  );
}
