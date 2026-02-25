import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number; // 0-5 scale
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  interactive?: boolean;
  onRate?: (rating: number) => void;
}

export function StarRating({ 
  rating, 
  size = 'md', 
  showValue = false,
  interactive = false,
  onRate 
}: StarRatingProps) {
  const sizes = {
    sm: 14,
    md: 18,
    lg: 24,
  };

  const iconSize = sizes[size];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.25 && rating % 1 < 0.75;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0) - (rating % 1 >= 0.75 ? 1 : 0);
  const extraFullStar = rating % 1 >= 0.75 ? 1 : 0;

  const handleClick = (index: number) => {
    if (interactive && onRate) {
      // Convert 1-5 click to 1-10 rating
      onRate((index + 1) * 2);
    }
  };

  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {/* Full stars */}
        {Array.from({ length: fullStars + extraFullStar }, (_, i) => (
          <Star
            key={`full-${i}`}
            size={iconSize}
            className={`text-primary fill-primary ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
            onClick={() => handleClick(i)}
          />
        ))}
        
        {/* Half star */}
        {hasHalfStar && (
          <div className="relative" onClick={() => handleClick(fullStars)}>
            <Star size={iconSize} className="text-gray-300" />
            <div className="absolute top-0 left-0 overflow-hidden" style={{ width: '50%' }}>
              <Star size={iconSize} className="text-primary fill-primary" />
            </div>
          </div>
        )}
        
        {/* Empty stars */}
        {Array.from({ length: emptyStars }, (_, i) => (
          <Star
            key={`empty-${i}`}
            size={iconSize}
            className={`text-gray-300 ${interactive ? 'cursor-pointer hover:text-primary hover:scale-110 transition-all' : ''}`}
            onClick={() => handleClick(fullStars + (hasHalfStar ? 1 : 0) + i)}
          />
        ))}
      </div>
      
      {showValue && (
        <span className={`text-dark-muted ml-1 ${size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base'}`}>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}

// Interactive rating component (1-10 scale)
interface RatingSliderProps {
  value: number;
  onChange: (value: number) => void;
}

export function RatingSlider({ value, onChange }: RatingSliderProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-dark">Rate this photo</span>
        <span className="text-lg font-bold text-primary">{value}/10</span>
      </div>
      <input
        type="range"
        min="1"
        max="10"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
      />
      <div className="flex justify-between text-xs text-dark-muted">
        <span>1</span>
        <span>5</span>
        <span>10</span>
      </div>
      <div className="flex items-center justify-center gap-2 pt-2">
        <span className="text-sm text-dark-muted">Star equivalent:</span>
        <StarRating rating={value / 2} size="md" />
      </div>
    </div>
  );
}
