import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Search, 
  Bell, 
  User, 
  LogOut, 
  Settings, 
  Upload, 
  Trophy,
  Menu,
  X,
  Shield
} from 'lucide-react';
import { useAuth } from '../../context/AppContext';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const navLinks = [
    { href: '/explore', label: 'Explore' },
    { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-16 sm:h-18 gap-4 sm:gap-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">RG</span>
            </div>
            <span className="text-xl font-bold text-dark hidden sm:block">RateGallery</span>
          </Link>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`px-4 py-2 rounded-full font-semibold transition-colors ${
                  location.pathname === link.href
                    ? 'bg-dark text-white'
                    : 'text-dark hover:bg-gray-100'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl hidden sm:block">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-muted" size={20} />
              <input
                type="text"
                placeholder="Search photos, users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-full bg-gray-100 text-dark placeholder-dark-muted focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
              />
            </div>
          </form>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                {/* Upload Button */}
                <Link to="/upload">
                  <Button variant="ghost" size="sm" className="hidden sm:flex">
                    <Upload size={20} className="mr-2" />
                    Upload
                  </Button>
                </Link>

                {/* Notifications */}
                <Link 
                  to="/notifications"
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors relative"
                >
                  <Bell size={22} className="text-dark" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
                </Link>

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <Avatar src={user?.avatar || ''} alt={user?.name || ''} size="sm" />
                  </button>

                  {showUserMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowUserMenu(false)}
                      />
                      <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-20">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="font-semibold text-dark">{user?.name}</p>
                          <p className="text-sm text-dark-muted">@{user?.username}</p>
                        </div>
                        
                        <Link
                          to={`/profile/${user?.username}`}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <User size={20} className="text-dark-muted" />
                          <span className="text-dark">Your Profile</span>
                        </Link>
                        
                        <Link
                          to="/settings"
                          className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Settings size={20} className="text-dark-muted" />
                          <span className="text-dark">Settings</span>
                        </Link>

                        {user?.isAdmin && (
                          <Link
                            to="/admin"
                            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <Shield size={20} className="text-primary" />
                            <span className="text-primary font-medium">Admin Panel</span>
                          </Link>
                        )}
                        
                        <hr className="my-2" />
                        
                        <button
                          onClick={() => {
                            logout();
                            setShowUserMenu(false);
                            navigate('/');
                          }}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors w-full"
                        >
                          <LogOut size={20} className="text-dark-muted" />
                          <span className="text-dark">Log out</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">Log in</Button>
                </Link>
                <Link to="/signup">
                  <Button variant="primary" size="sm">Sign up</Button>
                </Link>
              </>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors md:hidden"
            >
              {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-muted" size={20} />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-full bg-gray-100 text-dark placeholder-dark-muted focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </form>
            
            <nav className="space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setShowMobileMenu(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                    location.pathname === link.href
                      ? 'bg-dark text-white'
                      : 'text-dark hover:bg-gray-100'
                  }`}
                >
                  {link.icon && <link.icon size={20} />}
                  {link.label}
                </Link>
              ))}
              
              {isAuthenticated && (
                <Link
                  to="/upload"
                  onClick={() => setShowMobileMenu(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-dark hover:bg-gray-100 transition-colors"
                >
                  <Upload size={20} />
                  Upload
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
