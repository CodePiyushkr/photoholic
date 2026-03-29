import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Calendar, Lock, Settings, Grid, Users } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { StarRating } from '../components/ui/StarRating';
import { ImageGrid } from '../components/features/ImageGrid';
import { useAuth, useImages } from '../context/AppContext';
import { formatRelativeTime, formatNumber, getUserRank, getRankBadgeText, calculateScore } from '../utils/helpers';
import { User } from '../types';

export function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser, isAuthenticated, followUser, unfollowUser, isFollowing, getFollowers, getFollowing, allUsers } = useAuth();
  const { getUserImages, images } = useImages();
  const [activeTab, setActiveTab] = useState<'photos' | 'followers' | 'following'>('photos');

  // Find profile user from allUsers (which has real-time relationship data)
  const profileUser = useMemo(() => {
    return allUsers.find(u => u.username === username) || null;
  }, [allUsers, username]);

  // Calculate real stats for all users from actual images
  const usersWithRealStats = useMemo(() => {
    return allUsers.map(user => {
      const userImgs = images.filter(img => img.userId === user.id && img.isApproved);
      const totalImages = userImgs.length;
      const averageRating = totalImages > 0
        ? Math.round((userImgs.reduce((sum, img) => sum + img.averageRating, 0) / totalImages) * 10) / 10
        : 0;
      return {
        ...user,
        totalImages,
        averageRating,
        score: calculateScore(totalImages, averageRating),
      };
    });
  }, [images, allUsers]);

  if (!profileUser) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-dark mb-4">User not found</h1>
        <Link to="/explore">
          <Button>Back to Explore</Button>
        </Link>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === profileUser.id;
  const userImages = getUserImages(profileUser.id);
  const isUserFollowing = isFollowing(profileUser.id);

  // Calculate real average rating from user's approved images
  const approvedImages = userImages.filter(img => img.isApproved);
  const realAverageRating = approvedImages.length > 0
    ? Math.round((approvedImages.reduce((sum, img) => sum + img.averageRating, 0) / approvedImages.length) * 10) / 10
    : 0;

  // Check if current user can view content (public profile or following)
  const canViewContent = !profileUser.isPrivate || isOwnProfile || isUserFollowing;

  const handleFollowToggle = () => {
    if (isUserFollowing) {
      unfollowUser(profileUser.id);
    } else {
      followUser(profileUser.id);
    }
  };

  // Get followers and following lists with real-time data
  const followerIds = getFollowers(profileUser.id);
  const followingIds = getFollowing(profileUser.id);
  const followers = allUsers.filter(u => followerIds.includes(u.id));
  const following = allUsers.filter(u => followingIds.includes(u.id));

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-8">
        {/* Avatar */}
        <Avatar src={profileUser.avatar} alt={profileUser.name} size="xl" className="w-32 h-32" />

        {/* Info */}
        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
            <h1 className="text-2xl font-bold text-dark">{profileUser.name}</h1>
            <div className="flex items-center gap-2 flex-wrap justify-center md:justify-start">
              {/* Leaderboard Rank Badge */}
              {(() => {
                const rank = getUserRank(profileUser.id, usersWithRealStats);
                const badgeText = getRankBadgeText(rank);
                if (badgeText) {
                  const badgeStyle = rank === 1 
                    ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white' 
                    : rank === 2 
                    ? 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800'
                    : rank === 3
                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white'
                    : rank && rank <= 5
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white'
                    : 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white';
                  return (
                    <Link to="/leaderboard" className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold ${badgeStyle} shadow-sm hover:shadow-md transition-shadow`}>
                      {badgeText}
                    </Link>
                  );
                }
                return null;
              })()}
              {profileUser.isPrivate && (
                <Badge variant="default">
                  <Lock size={12} className="mr-1" /> Private
                </Badge>
              )}
              {profileUser.isAdmin && (
                <Badge variant="primary">Admin</Badge>
              )}
            </div>
          </div>

          <p className="text-dark-muted mb-2">@{profileUser.username}</p>
          
          {profileUser.bio && (
            <p className="text-dark mb-4">{profileUser.bio}</p>
          )}

          <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-dark-muted mb-4">
            <span className="flex items-center gap-1">
              <MapPin size={16} />
              {profileUser.location.city}, {profileUser.location.country}
            </span>
            <span className="flex items-center gap-1">
              <Calendar size={16} />
              Joined {formatRelativeTime(profileUser.createdAt)}
            </span>
          </div>

          {/* Stats */}
          <div className="flex justify-center md:justify-start gap-6 mb-4">
            <button 
              onClick={() => setActiveTab('photos')}
              className="text-center hover:opacity-70"
            >
              <span className="text-xl font-bold text-dark">{userImages.length}</span>
              <span className="block text-sm text-dark-muted">Photos</span>
            </button>
            <button 
              onClick={() => canViewContent && setActiveTab('followers')}
              className="text-center hover:opacity-70"
            >
              <span className="text-xl font-bold text-dark">{formatNumber(followerIds.length)}</span>
              <span className="block text-sm text-dark-muted">Followers</span>
            </button>
            <button 
              onClick={() => canViewContent && setActiveTab('following')}
              className="text-center hover:opacity-70"
            >
              <span className="text-xl font-bold text-dark">{formatNumber(followingIds.length)}</span>
              <span className="block text-sm text-dark-muted">Following</span>
            </button>
          </div>

          {/* Rating Stats */}
          {canViewContent && approvedImages.length > 0 && (
            <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
              <span className="text-dark-muted">Avg Rating:</span>
              <StarRating rating={realAverageRating / 2} size="sm" showValue />
              <span className="text-dark-muted">({realAverageRating}/10)</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-center md:justify-start gap-3">
            {isOwnProfile ? (
              <>
                <Link to="/edit-profile">
                  <Button variant="outline">Edit Profile</Button>
                </Link>
                <Link to="/settings">
                  <Button variant="ghost">
                    <Settings size={18} />
                  </Button>
                </Link>
              </>
            ) : isAuthenticated ? (
              <Button
                variant={isUserFollowing ? 'outline' : 'primary'}
                onClick={handleFollowToggle}
              >
                {isUserFollowing ? 'Following' : 'Follow'}
              </Button>
            ) : (
              <Link to="/login">
                <Button>Follow</Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex gap-8">
          <button
            onClick={() => setActiveTab('photos')}
            className={`flex items-center gap-2 pb-4 border-b-2 transition-colors ${
              activeTab === 'photos'
                ? 'border-dark text-dark font-semibold'
                : 'border-transparent text-dark-muted hover:text-dark'
            }`}
          >
            <Grid size={18} />
            Photos
          </button>
          {canViewContent && (
            <>
              <button
                onClick={() => setActiveTab('followers')}
                className={`flex items-center gap-2 pb-4 border-b-2 transition-colors ${
                  activeTab === 'followers'
                    ? 'border-dark text-dark font-semibold'
                    : 'border-transparent text-dark-muted hover:text-dark'
                }`}
              >
                <Users size={18} />
                Followers
              </button>
              <button
                onClick={() => setActiveTab('following')}
                className={`flex items-center gap-2 pb-4 border-b-2 transition-colors ${
                  activeTab === 'following'
                    ? 'border-dark text-dark font-semibold'
                    : 'border-transparent text-dark-muted hover:text-dark'
                }`}
              >
                <Users size={18} />
                Following
              </button>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      {!canViewContent ? (
        <div className="text-center py-16">
          <Lock size={48} className="mx-auto text-dark-muted mb-4" />
          <h2 className="text-xl font-bold text-dark mb-2">This account is private</h2>
          <p className="text-dark-muted mb-4">Follow this account to see their photos</p>
          {isAuthenticated ? (
            <Button onClick={handleFollowToggle}>
              {isUserFollowing ? 'Following' : 'Follow'}
            </Button>
          ) : (
            <Link to="/login">
              <Button>Sign in to Follow</Button>
            </Link>
          )}
        </div>
      ) : activeTab === 'photos' ? (
        userImages.length > 0 ? (
          <ImageGrid images={userImages} />
        ) : (
          <div className="text-center py-16">
            <p className="text-dark-muted">No photos yet</p>
            {isOwnProfile && (
              <Link to="/upload" className="mt-4 inline-block">
                <Button>Upload Your First Photo</Button>
              </Link>
            )}
          </div>
        )
      ) : activeTab === 'followers' ? (
        <div className="grid gap-4">
          {followers.length > 0 ? (
            followers.map((follower) => (
              <Link
                key={follower.id}
                to={`/profile/${follower.username}`}
                className="flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors"
              >
                <Avatar src={follower.avatar} alt={follower.name} size="md" />
                <div className="flex-1">
                  <p className="font-semibold text-dark">{follower.name}</p>
                  <p className="text-sm text-dark-muted">@{follower.username}</p>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-center text-dark-muted py-8">No followers yet</p>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {following.length > 0 ? (
            following.map((followedUser) => (
              <Link
                key={followedUser.id}
                to={`/profile/${followedUser.username}`}
                className="flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors"
              >
                <Avatar src={followedUser.avatar} alt={followedUser.name} size="md" />
                <div className="flex-1">
                  <p className="font-semibold text-dark">{followedUser.name}</p>
                  <p className="text-sm text-dark-muted">@{followedUser.username}</p>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-center text-dark-muted py-8">Not following anyone yet</p>
          )}
        </div>
      )}
    </div>
  );
}
