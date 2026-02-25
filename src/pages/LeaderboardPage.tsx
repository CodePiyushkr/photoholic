import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Medal, Filter, MapPin, ChevronDown } from 'lucide-react';
import { Avatar } from '../components/ui/Avatar';
import { StarRating } from '../components/ui/StarRating';
import { Badge } from '../components/ui/Badge';
import { mockUsers, getUniqueLocations } from '../data/mockData';
import { calculateScore } from '../utils/helpers';

export function LeaderboardPage() {
  const [filters, setFilters] = useState({
    country: '',
    state: '',
    city: '',
    timeRange: 'all' as 'all' | 'month' | 'week',
  });
  const [showFilters, setShowFilters] = useState(false);

  const { countries, states, cities } = getUniqueLocations();

  const leaderboard = useMemo(() => {
    let users = mockUsers.filter(u => !u.isAdmin && u.totalImages > 0);

    // Apply location filters
    if (filters.country) {
      users = users.filter(u => u.location.country === filters.country);
    }
    if (filters.state) {
      users = users.filter(u => u.location.state === filters.state);
    }
    if (filters.city) {
      users = users.filter(u => u.location.city === filters.city);
    }

    // Calculate score and sort
    return users
      .map(user => ({
        ...user,
        score: calculateScore(user.totalImages, user.averageRating),
      }))
      .sort((a, b) => b.score - a.score)
      .map((user, index) => ({ ...user, rank: index + 1 }));
  }, [filters]);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy size={24} className="text-yellow-500" />;
    if (rank === 2) return <Medal size={24} className="text-gray-400" />;
    if (rank === 3) return <Medal size={24} className="text-amber-600" />;
    return <span className="text-lg font-bold text-dark-muted">#{rank}</span>;
  };

  const getRankStyle = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200';
    if (rank === 2) return 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200';
    if (rank === 3) return 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200';
    return 'bg-white border-gray-100';
  };

  // Filter states based on selected country
  const filteredStates = filters.country
    ? [...new Set(mockUsers.filter(u => u.location.country === filters.country).map(u => u.location.state))]
    : states;

  // Filter cities based on selected state
  const filteredCities = filters.state
    ? [...new Set(mockUsers.filter(u => u.location.state === filters.state).map(u => u.location.city))]
    : cities;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary-light rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Trophy size={32} className="text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-dark mb-2">Leaderboard</h1>
        <p className="text-dark-muted">
          Top photographers ranked by photos uploaded and average ratings
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
            showFilters ? 'bg-dark text-white' : 'bg-gray-100 text-dark hover:bg-gray-200'
          }`}
        >
          <Filter size={18} />
          Filters
          <ChevronDown size={18} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>

        {showFilters && (
          <div className="mt-4 p-6 bg-gray-50 rounded-2xl animate-fadeIn">
            <div className="grid md:grid-cols-3 gap-4">
              {/* Country */}
              <div>
                <label className="block text-sm font-medium text-dark mb-2">Country</label>
                <select
                  value={filters.country}
                  onChange={(e) => setFilters(prev => ({ ...prev, country: e.target.value, state: '', city: '' }))}
                  className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 bg-white focus:outline-none focus:border-primary"
                >
                  <option value="">All Countries</option>
                  {countries.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>

              {/* State */}
              <div>
                <label className="block text-sm font-medium text-dark mb-2">State/Region</label>
                <select
                  value={filters.state}
                  onChange={(e) => setFilters(prev => ({ ...prev, state: e.target.value, city: '' }))}
                  className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 bg-white focus:outline-none focus:border-primary"
                  disabled={!filters.country}
                >
                  <option value="">All States</option>
                  {filteredStates.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-medium text-dark mb-2">City</label>
                <select
                  value={filters.city}
                  onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
                  className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 bg-white focus:outline-none focus:border-primary"
                  disabled={!filters.state}
                >
                  <option value="">All Cities</option>
                  {filteredCities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Clear Filters */}
            {(filters.country || filters.state || filters.city) && (
              <button
                onClick={() => setFilters({ country: '', state: '', city: '', timeRange: 'all' })}
                className="mt-4 text-primary hover:underline text-sm"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Score Formula */}
      <div className="bg-gray-50 rounded-2xl p-4 mb-6">
        <p className="text-sm text-dark-muted text-center">
          <strong>Score Formula:</strong> (Total Images × 0.4) + (Average Rating × 0.6)
        </p>
      </div>

      {/* Leaderboard List */}
      {leaderboard.length > 0 ? (
        <div className="space-y-3">
          {leaderboard.map((user) => (
            <Link
              key={user.id}
              to={`/profile/${user.username}`}
              className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all hover:shadow-md ${getRankStyle(user.rank)}`}
            >
              {/* Rank */}
              <div className="w-10 flex justify-center">
                {getRankIcon(user.rank)}
              </div>

              {/* Avatar */}
              <Avatar src={user.avatar} alt={user.name} size="md" />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-dark truncate">{user.name}</p>
                  {user.isPrivate && (
                    <Badge variant="default" size="sm">Private</Badge>
                  )}
                </div>
                <p className="text-sm text-dark-muted">@{user.username}</p>
                <div className="flex items-center gap-1 text-xs text-dark-muted mt-1">
                  <MapPin size={12} />
                  {user.location.city}, {user.location.country}
                </div>
              </div>

              {/* Stats */}
              <div className="text-right hidden sm:block">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-sm text-dark-muted">Photos</p>
                    <p className="font-bold text-dark">{user.totalImages}</p>
                  </div>
                  <div>
                    <p className="text-sm text-dark-muted">Avg Rating</p>
                    <div className="flex items-center gap-1">
                      <StarRating rating={user.averageRating / 2} size="sm" />
                      <span className="font-bold text-dark">{user.averageRating}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-dark-muted">Score</p>
                    <p className="font-bold text-primary text-lg">{user.score.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {/* Mobile Stats */}
              <div className="sm:hidden">
                <p className="font-bold text-primary text-lg">{user.score.toFixed(2)}</p>
                <p className="text-xs text-dark-muted">points</p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-dark-muted">No users found with the selected filters</p>
        </div>
      )}
    </div>
  );
}
