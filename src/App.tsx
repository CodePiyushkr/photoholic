import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, ImageProvider } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { PhotoDetailPage } from './pages/PhotoDetailPage';
import { UploadPage } from './pages/UploadPage';
import { ProfilePage } from './pages/ProfilePage';
import { EditProfilePage } from './pages/EditProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { SearchPage } from './pages/SearchPage';
import { AdminPage } from './pages/AdminPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { NotFoundPage } from './pages/NotFoundPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ImageProvider>
          <div className="min-h-screen flex flex-col bg-white">
            <Header />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/explore" element={<Navigate to="/" replace />} />
                <Route path="/photo/:id" element={<PhotoDetailPage />} />
                <Route path="/upload" element={<UploadPage />} />
                <Route path="/profile/:username" element={<ProfilePage />} />
                <Route path="/edit-profile" element={<EditProfilePage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/leaderboard" element={<LeaderboardPage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </ImageProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
