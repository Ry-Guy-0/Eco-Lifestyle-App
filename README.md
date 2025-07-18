# 🌱 GreenHabit - Your Complete Eco-Companion

A comprehensive Progressive Web Application for tracking and improving your sustainability journey. GreenHabit helps you reduce your environmental impact through smart meal planning, carbon footprint tracking, inventory management, and community engagement.

## ✨ Features

### 🍽️ **Eco-Friendly Meal Planner**
- Weekly meal calendar with sustainability scoring
- Recipe suggestions with eco-friendly filters (vegan, local, seasonal)
- Smart shopping list generation
- Carbon footprint tracking for meals
- Integration with local farmers markets and stores

### 🌍 **Carbon Footprint Calculator**
- Real-time carbon emission tracking across categories:
  - 🚗 Transportation (walking, cycling, public transport, car, flight)
  - 🍽️ Food & Diet
  - 💡 Home Energy
  - 🛍️ Shopping & Consumption
- Goal setting and progress tracking
- Carbon offset purchasing options
- Comparison with national and community averages
- Interactive charts and visualizations

### 📦 **Smart Inventory Tracker**
- Multi-category inventory management (pantry, cleaning, clothing, personal care)
- Barcode scanning simulation
- Low stock and expiration alerts
- Eco-friendly product recommendations
- Waste reduction tracking
- Usage analytics and insights

### 🏆 **Enhanced Challenge System**
- Active challenge tracking with progress visualization
- Social challenges with friends
- Difficulty levels (Beginner, Intermediate, Advanced)
- Achievement badges and rewards
- Community leaderboards
- Custom challenge creation

### 💰 **Sustainability Budget Tracker**
- Money saved through sustainable choices
- Investment tracking for eco-friendly purchases
- Savings goals management
- Category breakdown of eco-savings

### 🗺️ **Local Sustainability Map**
- Interactive map with nearby eco-friendly stores
- Zero-waste shops, recycling centers, community gardens
- Store ratings and reviews
- Distance tracking and route planning

### 🔄 **Community Swap & Gift Platform**
- Item sharing and gifting system
- Location-based matching
- User ratings and reviews
- Item condition tracking
- Request system for needed items

### 📱 **Progressive Web App Features**
- Offline functionality with service worker
- Push notifications for reminders and tips
- Installable on mobile and desktop
- Background sync for data
- Fast loading with caching

## 🚀 Quick Start

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Web server (for local development)

### Installation & Setup

1. **Clone or download the project:**
   ```bash
   git clone https://github.com/your-username/greenhabit-app.git
   cd greenhabit-app
   ```

2. **Start a local web server:**
   
   **Option A: Using Python (recommended)**
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Python 2
   python -m SimpleHTTPServer 8000
   ```
   
   **Option B: Using Node.js**
   ```bash
   npx http-server . -p 8000
   ```
   
   **Option C: Using PHP**
   ```bash
   php -S localhost:8000
   ```

3. **Open in browser:**
   Navigate to `http://localhost:8000/index-new.html`

4. **Install as PWA (optional):**
   - Chrome: Click the install icon in the address bar
   - Mobile: Add to Home Screen option in browser menu

## 📁 Project Structure

```
greenhabit-app/
├── index.html              # Original single-file version
├── index-new.html          # New organized version (recommended)
├── manifest.json           # PWA manifest
├── sw.js                   # Service worker
├── css/                    # Stylesheets
│   ├── main.css            # Base styles and variables
│   ├── header.css          # Navigation and header
│   ├── dashboard.css       # Dashboard components
│   ├── components.css      # UI components (notifications, tabs, etc.)
│   ├── meal-planner.css    # Meal planner specific styles
│   └── carbon-calculator.css # Carbon calculator styles
├── js/                     # JavaScript modules
│   ├── app.js              # Main application logic
│   ├── meal-planner.js     # Meal planning functionality
│   └── carbon-calculator.js # Carbon tracking functionality
├── components/             # HTML component templates
│   ├── meal-planner.html   # Meal planner component
│   └── carbon-calculator.html # Carbon calculator component
├── assets/                 # Static assets
├── images/                 # Image assets
└── icons/                  # PWA icons
```

## 🎯 Key Features Demo

### Meal Planning
1. Navigate to the meal planner section
2. Click "Add Meal" on any empty slot
3. Choose from quick options or search recipes
4. View sustainability scoring and shopping list generation

### Carbon Tracking
1. Go to the Carbon Calculator section
2. Click "Add Trip" in transportation
3. Select transport type and distance
4. View real-time emissions calculation and progress toward goals

### Inventory Management
1. Browse different inventory categories (Pantry, Cleaning, etc.)
2. View low stock alerts and eco-friendly alternatives
3. Use search and filtering options
4. Track waste reduction achievements

### Challenge Participation
1. Browse available challenges in different categories
2. Join active challenges and track progress
3. View achievements and badges earned
4. Invite friends to participate in social challenges

## 🔧 Technical Features

### Performance Optimizations
- **Modular CSS**: Organized stylesheets for faster loading
- **Component-based Architecture**: Reusable HTML components
- **Lazy Loading**: Components loaded on demand
- **Caching Strategy**: Intelligent service worker caching
- **Responsive Design**: Mobile-first approach

### Accessibility Features
- **Screen Reader Support**: ARIA labels and announcements
- **Keyboard Navigation**: Full keyboard accessibility
- **Focus Management**: Proper focus indicators
- **High Contrast Support**: Automatic contrast adjustments
- **Reduced Motion**: Respects user motion preferences

### PWA Capabilities
- **Offline Mode**: Full functionality without internet
- **Background Sync**: Data synchronization when online
- **Push Notifications**: Reminders and eco-tips
- **App Shortcuts**: Quick access to key features
- **Share Target**: Accept shared content from other apps

## 📱 Mobile Experience

The app is optimized for mobile devices with:
- Touch-friendly interface design
- Swipe gestures for navigation
- Native-like app behavior when installed
- Responsive layouts for all screen sizes
- Fast loading and smooth animations

## 🌐 Browser Support

- **Chrome/Chromium**: Full support including all PWA features
- **Firefox**: Full support with limited PWA features
- **Safari**: Good support with some PWA limitations
- **Edge**: Full support including all PWA features

## 🔮 Future Enhancements

### Planned Features (API Integration Required)
- **Real Barcode Scanning**: Camera-based product scanning
- **Live Maps Integration**: Google Maps or OpenStreetMap
- **Weather Integration**: Seasonal recipe suggestions
- **Social Features**: User profiles and community forums
- **Machine Learning**: Personalized recommendations
- **Smart Home Integration**: IoT device connectivity

### Data Persistence
- **Local Storage**: Basic data persistence implemented
- **IndexedDB**: Advanced offline data storage
- **Cloud Sync**: User account and cross-device sync (future)

## 🛠️ Development

### Adding New Features
1. Create component HTML in `components/`
2. Add styles in appropriate CSS file
3. Implement JavaScript in `js/` directory
4. Update main HTML to include new component
5. Update service worker cache list if needed

### Customization
- **Colors**: Modify CSS variables in `css/main.css`
- **Layout**: Adjust grid layouts in `css/dashboard.css`
- **Features**: Enable/disable features in `js/app.js`

### Testing
- Test offline functionality by disabling network
- Verify PWA installation on different devices
- Check accessibility with screen readers
- Test responsive design on various screen sizes

## 📊 Analytics & Tracking

The app includes built-in analytics for:
- Feature usage patterns
- Performance metrics
- Error tracking
- User engagement insights

## 🔒 Privacy & Security

- **Local Data Storage**: All data stored locally by default
- **No Tracking**: No external analytics or tracking
- **Secure PWA**: HTTPS required for full PWA features
- **Data Control**: Users have full control over their data

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Code Style
- Use consistent indentation (2 spaces)
- Follow semantic HTML practices
- Write descriptive CSS class names
- Comment complex JavaScript functions
- Maintain accessibility standards

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Icons and emojis used throughout the interface
- Inspiration from leading sustainability apps
- Community feedback and feature requests
- Open source libraries and frameworks used

## 📞 Support

For support, bug reports, or feature requests:
- Open an issue on GitHub
- Contact: support@greenhabit.app
- Community Forum: [community.greenhabit.app]

---

**Made with 🌱 for a sustainable future**

*Version 2.0.0 - Enhanced with comprehensive features and PWA capabilities* 