// GreenHabit - Main Application
class GreenHabitApp {
    constructor() {
        this.currentUser = {
            name: 'Alex Johnson',
            ecoScore: 78,
            level: 'Eco Warrior',
            joinDate: '2024-01-15'
        };

        this.stats = {
            itemsTracked: 143,
            ecoSwaps: 67,
            challengesCompleted: 23,
            moneySaved: 89
        };

        this.init();
    }

    init() {
        this.initializeEventListeners();
        this.startRealTimeUpdates();
        this.loadUserData();
        this.initializeAnimations();
        this.checkNotifications();
    }

    initializeEventListeners() {
        // Mobile menu toggle
        const mobileToggle = document.querySelector('.mobile-menu-toggle');
        const navLinks = document.querySelector('.nav-links');
        
        if (mobileToggle) {
            mobileToggle.addEventListener('click', () => {
                navLinks.classList.toggle('active');
            });
        }

        // Tab switching
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('tab-button')) {
                this.switchTab(e.target);
            }
        });

        // Button interactions
        this.initializeButtons();

        // Search functionality
        this.initializeSearch();

        // Keyboard navigation
        this.initializeKeyboardNavigation();
    }

    initializeButtons() {
        document.querySelectorAll('.btn').forEach(button => {
            button.addEventListener('click', (e) => {
                if (!button.onclick && !button.href && !button.type === 'submit') {
                    e.preventDefault();
                    this.simulateAction(button);
                }
            });
        });

        // Map pin interactions
        document.querySelectorAll('.map-pin').forEach(pin => {
            pin.addEventListener('click', () => {
                this.showLocationDetails(pin.title);
            });
        });

        // Notification interactions
        document.querySelectorAll('.notification-item').forEach(notification => {
            notification.addEventListener('click', () => {
                this.handleNotificationClick(notification);
            });
        });
    }

    initializeSearch() {
        // Add search functionality for inventory and challenges
        const searchInputs = document.querySelectorAll('input[type="search"]');
        searchInputs.forEach(input => {
            input.addEventListener('input', (e) => {
                this.performSearch(e.target.value, e.target.dataset.searchType);
            });
        });
    }

    initializeKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // Keyboard shortcuts
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 'k':
                        e.preventDefault();
                        this.focusSearch();
                        break;
                    case 's':
                        e.preventDefault();
                        this.openScanner();
                        break;
                }
            }

            // Tab navigation
            if (e.key === 'Tab') {
                this.handleTabNavigation(e);
            }
        });
    }

    switchTab(tabButton) {
        const tabContainer = tabButton.closest('.tab-container');
        const tabName = tabButton.textContent.toLowerCase().replace(/\s+/g, '-');

        // Remove active class from all tab buttons in this container
        tabContainer.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active');
        });

        // Remove active class from all tab contents in this container
        tabContainer.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });

        // Add active class to clicked button
        tabButton.classList.add('active');

        // Find and show the corresponding tab content
        const targetTab = tabContainer.querySelector(`#${tabName}-tab`) || 
                         tabContainer.querySelector(`#${tabName}-swap`);
        
        if (targetTab) {
            targetTab.classList.add('active');
        }

        // Announce to screen readers
        this.announceTabChange(tabButton.textContent);
    }

    simulateAction(buttonElement, customText) {
        const originalText = buttonElement.textContent;
        const loadingHTML = '<div class="loading"></div>';
        
        buttonElement.innerHTML = loadingHTML;
        buttonElement.disabled = true;
        buttonElement.style.minWidth = buttonElement.offsetWidth + 'px';

        // Simulate API call delay
        setTimeout(() => {
            buttonElement.textContent = customText || 'Done!';
            buttonElement.style.backgroundColor = '#4caf50';
            
            setTimeout(() => {
                buttonElement.textContent = originalText;
                buttonElement.disabled = false;
                buttonElement.style.backgroundColor = '';
                buttonElement.style.minWidth = '';
            }, 1500);
        }, Math.random() * 2000 + 1000);
    }

    startRealTimeUpdates() {
        // Update eco score periodically
        setInterval(() => {
            this.updateEcoScore();
        }, 30000); // Every 30 seconds

        // Update stats
        setInterval(() => {
            this.updateStats();
        }, 60000); // Every minute

        // Check for new notifications
        setInterval(() => {
            this.checkNotifications();
        }, 300000); // Every 5 minutes
    }

    updateEcoScore() {
        const scoreElement = document.querySelector('.score-text');
        const currentScore = parseInt(scoreElement.textContent);
        
        if (Math.random() > 0.7) { // 30% chance to update
            const change = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
            const newScore = Math.max(0, Math.min(100, currentScore + change));
            
            this.animateScoreChange(scoreElement, currentScore, newScore);
            this.updateScoreCircle(newScore);
        }
    }

    animateScoreChange(element, from, to) {
        const duration = 1000;
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const current = Math.round(from + (to - from) * progress);
            element.textContent = current;

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }

    updateScoreCircle(score) {
        const circle = document.querySelector('.score-circle');
        const degrees = (score / 100) * 360;
        circle.style.background = `conic-gradient(var(--accent-green) 0deg ${degrees}deg, #e0e0e0 ${degrees}deg 360deg)`;
    }

    updateStats() {
        // Randomly update some stats
        Object.keys(this.stats).forEach(key => {
            if (Math.random() > 0.8) { // 20% chance
                const statElement = document.querySelector(`[data-stat="${key}"]`);
                if (statElement) {
                    const currentValue = parseInt(statElement.textContent);
                    const newValue = currentValue + Math.floor(Math.random() * 3);
                    this.animateScoreChange(statElement, currentValue, newValue);
                    this.stats[key] = newValue;
                }
            }
        });
    }

    loadUserData() {
        // Load user preferences from localStorage
        const savedData = localStorage.getItem('greenhabit-user-data');
        if (savedData) {
            const userData = JSON.parse(savedData);
            Object.assign(this.currentUser, userData);
            this.updateUserDisplay();
        }
    }

    saveUserData() {
        localStorage.setItem('greenhabit-user-data', JSON.stringify(this.currentUser));
    }

    updateUserDisplay() {
        const nameElement = document.querySelector('.user-name');
        const profileImg = document.querySelector('.profile-img');
        
        if (nameElement) nameElement.textContent = this.currentUser.name;
        if (profileImg) {
            const initials = this.currentUser.name.split(' ').map(n => n[0]).join('');
            profileImg.textContent = initials;
        }
    }

    initializeAnimations() {
        // Animate progress bars on load
        const progressBars = document.querySelectorAll('.progress-fill');
        progressBars.forEach((bar, index) => {
            const width = bar.style.width;
            bar.style.width = '0';
            
            setTimeout(() => {
                bar.style.width = width;
            }, 500 + (index * 200));
        });

        // Animate stat cards
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
                }
            });
        });

        document.querySelectorAll('.stat-card, .feature-card').forEach(card => {
            observer.observe(card);
        });
    }

    checkNotifications() {
        // Simulate checking for new notifications
        if (Math.random() > 0.8) {
            this.addNotification(this.generateRandomNotification());
        }
    }

    generateRandomNotification() {
        const notifications = [
            {
                type: 'success',
                icon: '🎉',
                title: 'Goal Achieved!',
                message: 'You\'ve completed your weekly recycling goal!',
                time: 'Just now'
            },
            {
                type: 'info',
                icon: '💡',
                title: 'Eco Tip',
                message: 'Did you know? Using a bamboo toothbrush can save 4.7 billion plastic toothbrushes from landfills yearly.',
                time: '5 minutes ago'
            },
            {
                type: 'warning',
                icon: '⚠️',
                title: 'Low Stock Alert',
                message: 'Your eco-friendly detergent is running low. Time to restock!',
                time: '10 minutes ago'
            }
        ];

        return notifications[Math.floor(Math.random() * notifications.length)];
    }

    addNotification(notification) {
        const panel = document.querySelector('.notifications-panel');
        if (!panel) return;

        const notificationElement = document.createElement('div');
        notificationElement.className = `notification-item notification-${notification.type}`;
        notificationElement.innerHTML = `
            <div class="notification-icon">${notification.icon}</div>
            <div class="notification-content">
                <strong>${notification.title}</strong>
                <p>${notification.message}</p>
                <div class="notification-time">${notification.time}</div>
            </div>
        `;

        // Add click handler
        notificationElement.addEventListener('click', () => {
            this.handleNotificationClick(notificationElement);
        });

        // Insert at the beginning
        const firstNotification = panel.querySelector('.notification-item');
        if (firstNotification) {
            panel.insertBefore(notificationElement, firstNotification);
        } else {
            panel.appendChild(notificationElement);
        }

        // Animate in
        notificationElement.style.opacity = '0';
        notificationElement.style.transform = 'translateX(-20px)';
        
        setTimeout(() => {
            notificationElement.style.opacity = '1';
            notificationElement.style.transform = 'translateX(0)';
        }, 100);

        // Auto-remove after 10 seconds
        setTimeout(() => {
            this.removeNotification(notificationElement);
        }, 10000);
    }

    removeNotification(element) {
        element.style.opacity = '0';
        element.style.transform = 'translateX(-20px)';
        
        setTimeout(() => {
            element.remove();
        }, 300);
    }

    handleNotificationClick(notification) {
        notification.style.opacity = '0.6';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.opacity = '1';
            }
        }, 200);

        // You can add specific actions based on notification type here
        console.log('Notification clicked:', notification.querySelector('strong').textContent);
    }

    showLocationDetails(locationName) {
        // Create a modal or popup with location details
        alert(`📍 ${locationName}\n\nThis would open detailed information about this location in the full app!\n\nFeatures:\n• Opening hours\n• Reviews and ratings\n• Directions\n• Special offers\n• Sustainability score`);
    }

    performSearch(query, searchType) {
        // Implement search functionality
        console.log(`Searching for "${query}" in ${searchType}`);
        
        // This would filter items in the inventory, challenges, etc.
        const items = document.querySelectorAll(`[data-searchable="${searchType}"]`);
        items.forEach(item => {
            const text = item.textContent.toLowerCase();
            const matches = text.includes(query.toLowerCase());
            item.style.display = matches ? 'block' : 'none';
        });
    }

    focusSearch() {
        const searchInput = document.querySelector('input[type="search"]');
        if (searchInput) {
            searchInput.focus();
        }
    }

    openScanner() {
        // Simulate opening barcode scanner
        console.log('Opening barcode scanner...');
        // This would integrate with camera API in a real app
    }

    handleTabNavigation(event) {
        // Enhance tab navigation for better accessibility
        const focusableElements = document.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey && document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
        } else if (!event.shiftKey && document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
        }
    }

    announceTabChange(tabName) {
        // Create announcement for screen readers
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = `Switched to ${tabName} tab`;
        
        document.body.appendChild(announcement);
        
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }

    // Public API methods
    updateUserProfile(userData) {
        Object.assign(this.currentUser, userData);
        this.updateUserDisplay();
        this.saveUserData();
    }

    addToInventory(item) {
        console.log('Adding item to inventory:', item);
        // This would interact with the inventory system
    }

    joinChallenge(challengeId) {
        console.log('Joining challenge:', challengeId);
        // This would interact with the challenge system
    }

    getEcoScore() {
        return this.currentUser.ecoScore;
    }

    getStats() {
        return { ...this.stats };
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if we're in a modern browser with required features
    if ('serviceWorker' in navigator && 'localStorage' in window) {
        window.greenHabitApp = new GreenHabitApp();
        console.log('🌱 GreenHabit App initialized successfully!');
    } else {
        console.warn('⚠️ Some features may not work in this browser');
        window.greenHabitApp = new GreenHabitApp();
    }
});

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GreenHabitApp;
} 