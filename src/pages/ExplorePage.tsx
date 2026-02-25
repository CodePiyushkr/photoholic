import { useState, useMemo } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { ImageGrid } from '../components/features/ImageGrid';
import { useImages } from '../context/AppContext';

export function ExplorePage() {
  const { getPublicImages } = useImages();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'rating' | 'popular'>('recent');
  const [showFilters, setShowFilters] = useState(false);

  const images = getPublicImages();

  const filteredImages = useMemo(() => {
    let result = [...images];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        img =>
          img.title.toLowerCase().includes(query) ||
          img.username.toLowerCase().includes(query) ||
          img.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Sort
    switch (sortBy) {
      case 'rating':
        result.sort((a, b) => b.averageRating - a.averageRating);
        break;
      case 'popular':
        result.sort((a, b) => b.totalRatings - a.totalRatings);
        break;
      case 'recent':
      default:
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  }, [images, searchQuery, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-dark">Explore Photos</h1>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted" size={18} />
            <input
              type="text"
              placeholder="Search photos, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-full bg-gray-100 text-dark placeholder-dark-muted focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
              showFilters ? 'bg-dark text-white' : 'bg-gray-100 text-dark hover:bg-gray-200'
            }`}
          >
            <SlidersHorizontal size={18} />
            Filters
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-gray-50 rounded-2xl p-4 mb-6 animate-fadeIn">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-dark mb-2">Sort by</label>
              <div className="flex gap-2">
                {[
                  { value: 'recent', label: 'Recent' },
                  { value: 'rating', label: 'Top Rated' },
                  { value: 'popular', label: 'Most Rated' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSortBy(option.value as any)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      sortBy === option.value
                        ? 'bg-dark text-white'
                        : 'bg-white text-dark hover:bg-gray-100'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results count */}
      <p className="text-dark-muted mb-4">
        {filteredImages.length} photo{filteredImages.length !== 1 ? 's' : ''} found
      </p>

      {/* Image Grid */}
      <ImageGrid images={filteredImages} />
    </div>
  );
}
