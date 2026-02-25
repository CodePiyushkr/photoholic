# RateGallery 📸

A Pinterest-style photo sharing social media platform where users upload images and get rated on a 1-10 scale (displayed as 5 stars).

![RateGallery](https://via.placeholder.com/1200x600/E60023/FFFFFF?text=RateGallery)

## ✨ Features

### User Features
- **Account Creation**: Register with name, username, email, phone, and auto-detected location
- **Public/Private Accounts**: Like Instagram, choose who can see your photos
- **Follow System**: Follow users to see their private content
- **Photo Upload**: Share your original photography
- **Rating System**: Rate photos 1-10 (converted to 5-star display)
- **Share**: Share photos via Twitter, Facebook, or copy link
- **Report**: Report inappropriate content with various reasons including copyright

### Rating System
- Users rate photos from 1-10
- Rating is converted to 5-star display: `stars = rating / 2`
- Example: Rating 7 = 3.5 stars

### Leaderboard
- Global rankings based on: `Score = (Total Images × 0.4) + (Average Rating × 0.6)`
- Filter by Country, State, City
- Compete with photographers worldwide

### Admin Panel
- View all users and manage accounts
- AI-flagged image review queue
- User report management
- Ban users or remove content
- Send warnings for copyright violations

### Copyright Protection
- Simulated AI detection for potential internet images
- Flagged images go to admin review queue
- Warning system for users violating copyright

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS 4
- **Routing**: React Router DOM 7
- **Icons**: Lucide React
- **Build Tool**: Vite
- **State Management**: React Context API
- **Storage**: LocalStorage (demo mode)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/rategallery-app.git

# Navigate to project directory
cd rategallery-app

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## 📱 Pages

| Page | Route | Description |
|------|-------|-------------|
| Landing | `/` | Welcome page for visitors |
| Login | `/login` | User authentication |
| Signup | `/signup` | New user registration |
| Explore | `/explore` | Pinterest-style photo feed |
| Photo Detail | `/photo/:id` | View, rate, share photos |
| Upload | `/upload` | Upload new photos |
| Profile | `/profile/:username` | User profile & gallery |
| Edit Profile | `/edit-profile` | Update profile info |
| Settings | `/settings` | Account settings |
| Leaderboard | `/leaderboard` | Global rankings |
| Search | `/search` | Search photos & users |
| Admin | `/admin` | Admin dashboard |

## 🔐 Demo Credentials

### Regular User
- **Email**: `emma_wilson@email.com`
- **Password**: `demo`

### Admin User
- **Email**: `admin@rategallery.com`
- **Password**: `demo`

## 📁 Project Structure

```
rategallery-app/
├── src/
│   ├── components/
│   │   ├── features/      # ImageCard, ImageGrid
│   │   ├── layout/        # Header, Footer
│   │   └── ui/            # Button, Input, Modal, etc.
│   ├── context/           # Auth & Image contexts
│   ├── data/              # Mock data
│   ├── pages/             # All page components
│   ├── types/             # TypeScript types
│   └── utils/             # Helper functions
├── public/                # Static assets
└── index.html             # Entry point
```

## 🎨 Color Scheme

| Color | Hex | Usage |
|-------|-----|-------|
| Primary (Red) | `#E60023` | Buttons, accents |
| Primary Hover | `#AD081B` | Hover states |
| Primary Light | `#FFE0E0` | Backgrounds |
| Dark | `#111111` | Text, headers |
| Dark Muted | `#767676` | Secondary text |

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect repository to Vercel
3. Deploy automatically

### Manual Deploy

```bash
npm run build
# Upload 'dist' folder to your hosting
```

## 📝 Future Enhancements

- [ ] Real backend with Supabase
- [ ] Image storage with Cloudinary/S3
- [ ] Real AI image detection API
- [ ] Push notifications
- [ ] Email verification
- [ ] Password reset
- [ ] Two-factor authentication

## 📄 License

MIT License - feel free to use this project for learning or your own projects.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

Made with ❤️ by RateGallery Team
