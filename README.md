# ChainVerdict - Legal Platform

A comprehensive legal platform connecting citizens with qualified lawyers, built with modern web technologies and blockchain integration for transparent justice.

## 🚀 Features

### For Citizens
- **Find Qualified Lawyers**: Browse and connect with verified legal professionals
- **Case Management**: Track your legal cases and consultations
- **Secure Communication**: Real-time messaging with lawyers
- **Document Management**: Upload and manage legal documents securely
- **Transparent Pricing**: Clear fee structures and payment tracking

### For Lawyers
- **Professional Profile**: Showcase expertise and credentials
- **Client Management**: Manage client relationships and cases
- **Case Tracking**: Monitor case progress and deadlines
- **Secure Consultations**: Conduct video/audio consultations
- **Revenue Analytics**: Track earnings and client statistics

### Platform Features
- **Multi-Step Authentication**: Role-based signup with verification
- **Real-time Notifications**: Stay updated with case developments
- **Responsive Design**: Works seamlessly on all devices
- **Dark Mode UI**: Modern, eye-friendly interface
- **Blockchain Integration**: Transparent and immutable case records

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI library
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **React Router** - Client-side routing
- **React Hook Form** - Form handling and validation
- **Yup** - Schema validation
- **Axios** - HTTP client
- **React Hot Toast** - Beautiful notifications
- **Socket.io Client** - Real-time communication

### Backend (Planned)
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Socket.io** - Real-time communication
- **JWT** - Authentication
- **Multer** - File uploads
- **Bcrypt** - Password hashing

### Blockchain (Future)
- **Ethereum** - Smart contracts
- **Web3.js** - Blockchain interaction
- **IPFS** - Decentralized file storage

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Git

### Clone the Repository
```bash
git clone https://github.com/yourusername/chainverdict.git
cd chainverdict
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`

### Backend Setup (Coming Soon)
```bash
cd backend
npm install
npm run dev
```

## 🚀 Getting Started

1. **Clone the repository**
2. **Install dependencies** for frontend
3. **Start the development server**
4. **Open your browser** and navigate to `http://localhost:5173`
5. **Sign up** as either a Citizen or Lawyer
6. **Explore the platform** features

## 📱 Screenshots

### Landing Page
![Landing Page](screenshots/landing.png)

### Multi-Step Signup
![Signup Process](screenshots/signup.png)

### Dashboard
![Dashboard](screenshots/dashboard.png)

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
```

## 🎨 Design System

### Color Palette
- **Primary**: Blue (#3B82F6) to Cyan (#06B6D4)
- **Secondary**: Purple (#8B5CF6) to Pink (#EC4899)
- **Background**: Dark (#0A0B1C)
- **Surface**: Dark Blue (#1D1F3B)
- **Text**: White (#FFFFFF) and Gray variants

### Typography
- **Font Family**: Inter (system fonts fallback)
- **Headings**: Semibold weights
- **Body**: Regular and medium weights

## 🧪 Testing

```bash
# Run frontend tests
cd frontend
npm run test

# Run with coverage
npm run test:coverage
```

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
npm run build
```

### Backend (Heroku/Railway)
```bash
# Coming soon
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines
- Follow the existing code style
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

## 📋 Project Structure

```
chainverdict/
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # React contexts
│   │   ├── hooks/         # Custom hooks
│   │   ├── utils/         # Utility functions
│   │   └── styles/        # Global styles
│   ├── public/            # Static assets
│   └── package.json
├── backend/               # Backend API (Coming soon)
├── smart-contracts/       # Blockchain contracts (Future)
├── docs/                  # Documentation
└── README.md
```

## 🗺️ Roadmap

### Phase 1 (Current)
- [x] Landing page design
- [x] Multi-step authentication
- [x] Basic UI components
- [ ] Dashboard implementation
- [ ] User profile management

### Phase 2 (Next)
- [ ] Backend API development
- [ ] Real-time messaging
- [ ] Case management system
- [ ] Payment integration

### Phase 3 (Future)
- [ ] Video consultations
- [ ] Blockchain integration
- [ ] Mobile app development
- [ ] AI-powered legal assistance

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Frontend Developer**: [Your Name](https://github.com/yourusername)
- **Backend Developer**: [Team Member](https://github.com/teammember)
- **UI/UX Designer**: [Designer](https://github.com/designer)

## 📞 Support

For support, email support@chainverdict.com or join our [Discord community](https://discord.gg/chainverdict).

## 🙏 Acknowledgments

- [React](https://reactjs.org/) - The amazing UI library
- [Tailwind CSS](https://tailwindcss.com/) - For the utility-first CSS framework
- [Framer Motion](https://www.framer.com/motion/) - For beautiful animations
- [Lucide Icons](https://lucide.dev/) - For the beautiful icon set

---

**Made with ❤️ for transparent justice**
