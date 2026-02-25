import { Link } from 'react-router-dom';
import { ArrowRight, Star, Shield, Trophy, Camera } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AppContext';

export function LandingPage() {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: Camera,
      title: 'Share Your Photos',
      description: 'Upload your original photos and share them with a community of photography enthusiasts.',
    },
    {
      icon: Star,
      title: 'Get Real Ratings',
      description: 'Receive honest 1-10 ratings from the community, converted to a 5-star display.',
    },
    {
      icon: Trophy,
      title: 'Climb the Leaderboard',
      description: 'Compete with photographers worldwide and see where you rank in your city, country, or globally.',
    },
    {
      icon: Shield,
      title: 'Original Content Only',
      description: 'Our AI detection system helps ensure all photos are original, keeping the platform authentic.',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16 md:py-24">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-dark mb-6">
              Share. Rate. <span className="text-primary">Compete.</span>
            </h1>
            <p className="text-lg sm:text-xl text-dark-muted mb-10 px-4">
              The photo sharing platform where your work gets rated, not just liked. 
              Upload your original photos and discover where you stand among photographers worldwide.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              {isAuthenticated ? (
                <Link to="/explore">
                  <Button size="lg">
                    Explore Photos <ArrowRight className="ml-2" size={20} />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/signup">
                    <Button size="lg">
                      Get Started <ArrowRight className="ml-2" size={20} />
                    </Button>
                  </Link>
                  <Link to="/explore">
                    <Button variant="outline" size="lg">
                      Browse Photos
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Decorative Images */}
        <div className="absolute -bottom-20 left-0 right-0 h-40 bg-gradient-to-t from-white to-transparent z-10" />
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 sm:gap-4 px-6 sm:px-8 lg:px-12 mt-8 opacity-80">
          {Array.from({ length: 12 }, (_, i) => (
            <div
              key={i}
              className="aspect-[4/5] rounded-xl sm:rounded-2xl bg-gray-100 overflow-hidden shadow-sm"
            >
              <img
                src={`https://picsum.photos/seed/${i + 100}/400/500`}
                alt=""
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-20 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-dark text-center mb-10 sm:mb-14">
            Why RateGallery?
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100"
              >
                <div className="w-14 h-14 bg-primary-light rounded-xl flex items-center justify-center mb-5">
                  <feature.icon className="text-primary" size={28} />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-dark mb-3">{feature.title}</h3>
                <p className="text-dark-muted text-sm sm:text-base leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-dark text-center mb-10 sm:mb-14">
            How It Works
          </h2>
          <div className="grid sm:grid-cols-3 gap-8 sm:gap-10 lg:gap-12">
            {[
              {
                step: '01',
                title: 'Create Your Account',
                description: 'Sign up with your details and set your account to public or private.',
              },
              {
                step: '02',
                title: 'Upload Your Photos',
                description: 'Share your original photography with the community.',
              },
              {
                step: '03',
                title: 'Get Rated & Compete',
                description: 'Receive ratings from 1-10 and climb the leaderboard.',
              },
            ].map((item, index) => (
              <div key={index} className="text-center px-4">
                <div className="text-7xl sm:text-8xl font-bold text-primary/20 mb-4">{item.step}</div>
                <h3 className="text-lg sm:text-xl font-bold text-dark mb-3">{item.title}</h3>
                <p className="text-dark-muted text-sm sm:text-base leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 lg:py-24 bg-dark">
        <div className="max-w-3xl mx-auto px-6 sm:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to share your vision?
          </h2>
          <p className="text-gray-400 mb-10 text-base sm:text-lg">
            Join thousands of photographers sharing their work and getting genuine feedback.
          </p>
          {!isAuthenticated && (
            <Link to="/signup">
              <Button size="lg">
                Join RateGallery Today
              </Button>
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}
