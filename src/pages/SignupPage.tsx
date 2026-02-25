import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User, Phone, MapPin } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../context/AppContext';
import { getUserLocation, isValidEmail, isValidPhone, isValidUsername } from '../utils/helpers';

export function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [location, setLocation] = useState({ country: '', state: '', city: '' });
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchLocation = async () => {
      const loc = await getUserLocation();
      if (loc) {
        setLocation(loc);
      } else {
        setLocation({ country: 'Unknown', state: 'Unknown', city: 'Unknown' });
      }
      setLoadingLocation(false);
    };
    fetchLocation();
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!isValidUsername(formData.username)) {
      newErrors.username = 'Username must be 3-20 characters (letters, numbers, underscore only)';
    }

    if (!isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!isValidPhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    const result = await signup({
      name: formData.name,
      username: formData.username,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      location,
    });

    if (result.success) {
      navigate('/explore');
    } else {
      setErrors({ submit: result.error || 'Signup failed' });
    }
    
    setIsLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">RG</span>
          </div>
          <h1 className="text-3xl font-bold text-dark mb-2">Create Account</h1>
          <p className="text-dark-muted">Join the RateGallery community</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.submit && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm">
              {errors.submit}
            </div>
          )}

          <Input
            type="text"
            name="name"
            label="Full Name"
            placeholder="Enter your full name"
            value={formData.name}
            onChange={handleChange}
            icon={<User size={20} />}
            error={errors.name}
            required
          />

          <Input
            type="text"
            name="username"
            label="Username"
            placeholder="Choose a username"
            value={formData.username}
            onChange={handleChange}
            icon={<span className="text-dark-muted">@</span>}
            error={errors.username}
            required
          />

          <Input
            type="email"
            name="email"
            label="Email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            icon={<Mail size={20} />}
            error={errors.email}
            required
          />

          <Input
            type="tel"
            name="phone"
            label="Phone Number"
            placeholder="+1 234 567 8900"
            value={formData.phone}
            onChange={handleChange}
            icon={<Phone size={20} />}
            error={errors.phone}
            required
          />

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-dark mb-1">Location</label>
            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl border-2 border-gray-200 bg-gray-50">
              <MapPin size={20} className="text-dark-muted" />
              {loadingLocation ? (
                <span className="text-dark-muted">Detecting location...</span>
              ) : (
                <span className="text-dark">
                  {location.city}, {location.state}, {location.country}
                </span>
              )}
            </div>
            <p className="text-xs text-dark-muted mt-1">Auto-detected from your browser</p>
          </div>

          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              name="password"
              label="Password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              icon={<Lock size={20} />}
              error={errors.password}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-9 text-dark-muted hover:text-dark"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <Input
            type={showPassword ? 'text' : 'password'}
            name="confirmPassword"
            label="Confirm Password"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={handleChange}
            icon={<Lock size={20} />}
            error={errors.confirmPassword}
            required
          />

          <Button type="submit" className="w-full" isLoading={isLoading}>
            Create Account
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-dark-muted">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
