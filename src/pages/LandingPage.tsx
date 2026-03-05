import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { ImageGrid } from '../components/features/ImageGrid';
import { useAuth, useImages } from '../context/AppContext';

export function LandingPage() {
  const { isAuthenticated } = useAuth();
  const { getPublicImages } = useImages();
  
  const images = getPublicImages();

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12 md:py-16">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-dark mb-4">
              Share. Rate. <span className="text-primary">Compete.</span>
            </h1>
            <p className="text-lg text-dark-muted mb-8">
              The photo sharing platform where your work gets rated, not just liked.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <Link to="/upload">
                  <Button size="lg">
                    Upload Photo <ArrowRight className="ml-2" size={20} />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/signup">
                    <Button size="lg">
                      Get Started <ArrowRight className="ml-2" size={20} />
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button variant="outline" size="lg">
                      Log In
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Photo Feed */}
      <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-dark">Discover Photos</h2>
          <Link to="/leaderboard" className="text-primary hover:underline text-sm font-medium">
            View Leaderboard →
          </Link>
        </div>
        
        {images.length > 0 ? (
          <ImageGrid images={images} />
        ) : (
          <div className="text-center py-16">
            <p className="text-dark-muted">No photos yet. Be the first to upload!</p>
          </div>
        )}
      </section>
    </div>
  );
}
