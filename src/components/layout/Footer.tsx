import { Link } from 'react-router-dom';
import { Github, Twitter, Instagram } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 mt-auto">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12 sm:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10 lg:gap-12">
          {/* About */}
          <div>
            <h3 className="font-bold text-dark mb-4 text-sm uppercase tracking-wider">About</h3>
            <ul className="space-y-3">
              <li><Link to="/about" className="text-dark-muted hover:text-dark transition-colors">About Us</Link></li>
              <li><Link to="/careers" className="text-dark-muted hover:text-dark transition-colors">Careers</Link></li>
              <li><Link to="/blog" className="text-dark-muted hover:text-dark transition-colors">Blog</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-bold text-dark mb-4 text-sm uppercase tracking-wider">Support</h3>
            <ul className="space-y-3">
              <li><Link to="/help" className="text-dark-muted hover:text-dark transition-colors">Help Center</Link></li>
              <li><Link to="/safety" className="text-dark-muted hover:text-dark transition-colors">Safety</Link></li>
              <li><Link to="/contact" className="text-dark-muted hover:text-dark transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-bold text-dark mb-4 text-sm uppercase tracking-wider">Legal</h3>
            <ul className="space-y-3">
              <li><Link to="/privacy" className="text-dark-muted hover:text-dark transition-colors">Privacy</Link></li>
              <li><Link to="/terms" className="text-dark-muted hover:text-dark transition-colors">Terms</Link></li>
              <li><Link to="/copyright" className="text-dark-muted hover:text-dark transition-colors">Copyright</Link></li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="font-bold text-dark mb-4 text-sm uppercase tracking-wider">Follow Us</h3>
            <div className="flex gap-3">
              <a href="#" className="p-2.5 rounded-full bg-gray-100 hover:bg-primary hover:text-white transition-colors">
                <Twitter size={20} className="text-dark" />
              </a>
              <a href="#" className="p-2.5 rounded-full bg-gray-100 hover:bg-primary hover:text-white transition-colors">
                <Instagram size={20} className="text-dark" />
              </a>
              <a href="#" className="p-2.5 rounded-full bg-gray-100 hover:bg-primary hover:text-white transition-colors">
                <Github size={20} className="text-dark" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 sm:mt-12 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">RG</span>
            </div>
            <span className="text-xl font-bold text-dark">RateGallery</span>
          </div>
          <p className="text-dark-muted text-sm">
            © {new Date().getFullYear()} RateGallery. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
