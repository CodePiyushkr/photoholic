import { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search as SearchIcon, User, Image } from 'lucide-react';
import { Avatar } from '../components/ui/Avatar';
import { ImageGrid } from '../components/features/ImageGrid';
import { Badge } from '../components/ui/Badge';
import { useImages, useAuth } from '../context/AppContext';

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [activeTab, setActiveTab] = useState<'all' | 'photos' | 'users'>('all');
  const { getPublicImages } = useImages();
  const { user, allUsers } = useAuth();

  const searchResults = useMemo(() => {
    if (!query.trim()) {
      return { users: [], images: [] };
    }

    const q = query.toLowerCase();
    
    const users = allUsers.filter(
      u => !u.isAdmin && (
        u.name.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        u.location.city.toLowerCase().includes(q) ||
        u.location.country.toLowerCase().includes(q)
      )
    );

    // Pass current user to filter private account images properly
    const images = getPublicImages(user).filter(
      img =>
        img.title.toLowerCase().includes(q) ||
        img.username.toLowerCase().includes(q) ||
        img.tags.some(tag => tag.toLowerCase().includes(q))
    );

    return { users, images };
  }, [query, getPublicImages, user, allUsers]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newQuery = formData.get('search') as string;
    setSearchParams({ q: newQuery });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-muted" size={24} />
          <input
            type="text"
            name="search"
            defaultValue={query}
            placeholder="Search photos, users, tags..."
            className="w-full pl-14 pr-4 py-4 text-lg rounded-full bg-gray-100 text-dark placeholder-dark-muted focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
          />
        </div>
      </form>

      {query && (
        <>
          {/* Tabs */}
          <div className="flex gap-4 mb-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('all')}
              className={`pb-4 px-2 font-semibold transition-colors ${
                activeTab === 'all'
                  ? 'text-dark border-b-2 border-dark'
                  : 'text-dark-muted hover:text-dark'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab('photos')}
              className={`pb-4 px-2 font-semibold transition-colors flex items-center gap-2 ${
                activeTab === 'photos'
                  ? 'text-dark border-b-2 border-dark'
                  : 'text-dark-muted hover:text-dark'
              }`}
            >
              <Image size={18} />
              Photos ({searchResults.images.length})
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`pb-4 px-2 font-semibold transition-colors flex items-center gap-2 ${
                activeTab === 'users'
                  ? 'text-dark border-b-2 border-dark'
                  : 'text-dark-muted hover:text-dark'
              }`}
            >
              <User size={18} />
              Users ({searchResults.users.length})
            </button>
          </div>

          {/* Results */}
          {(activeTab === 'all' || activeTab === 'users') && searchResults.users.length > 0 && (
            <div className="mb-8">
              {activeTab === 'all' && (
                <h2 className="text-xl font-bold text-dark mb-4">Users</h2>
              )}
              <div className="grid gap-4">
                {(activeTab === 'all' ? searchResults.users.slice(0, 3) : searchResults.users).map((user) => (
                  <Link
                    key={user.id}
                    to={`/profile/${user.username}`}
                    className="flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors"
                  >
                    <Avatar src={user.avatar} alt={user.name} size="lg" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-dark">{user.name}</p>
                        {user.isPrivate && (
                          <Badge variant="default" size="sm">Private</Badge>
                        )}
                      </div>
                      <p className="text-sm text-dark-muted">@{user.username}</p>
                      <p className="text-sm text-dark-muted">
                        {user.location.city}, {user.location.country} • {user.totalImages} photos
                      </p>
                    </div>
                  </Link>
                ))}
                {activeTab === 'all' && searchResults.users.length > 3 && (
                  <button
                    onClick={() => setActiveTab('users')}
                    className="text-primary font-semibold hover:underline"
                  >
                    View all {searchResults.users.length} users
                  </button>
                )}
              </div>
            </div>
          )}

          {(activeTab === 'all' || activeTab === 'photos') && searchResults.images.length > 0 && (
            <div>
              {activeTab === 'all' && (
                <h2 className="text-xl font-bold text-dark mb-4">Photos</h2>
              )}
              <ImageGrid images={activeTab === 'all' ? searchResults.images.slice(0, 12) : searchResults.images} />
              {activeTab === 'all' && searchResults.images.length > 12 && (
                <button
                  onClick={() => setActiveTab('photos')}
                  className="mt-4 text-primary font-semibold hover:underline"
                >
                  View all {searchResults.images.length} photos
                </button>
              )}
            </div>
          )}

          {/* No Results */}
          {searchResults.users.length === 0 && searchResults.images.length === 0 && (
            <div className="text-center py-16">
              <p className="text-dark-muted text-lg">No results found for "{query}"</p>
              <p className="text-dark-muted mt-2">Try searching for something else</p>
            </div>
          )}
        </>
      )}

      {/* Empty State */}
      {!query && (
        <div className="text-center py-16">
          <SearchIcon size={48} className="mx-auto text-dark-muted mb-4" />
          <p className="text-dark-muted text-lg">Search for photos, users, or tags</p>
        </div>
      )}
    </div>
  );
}
