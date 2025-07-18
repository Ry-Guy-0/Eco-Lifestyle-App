// Carbon Calculator Module
class CarbonCalculator {
    constructor() {
        this.emissions = {
            transportation: {},
            food: {},
            energy: {},
            shopping: {}
        };

        this.emissionFactors = {
            transportation: {
                'walking': 0,
                'cycling': 0,
                'public': 0.089, // kg CO2 per km
                'car-solo': 0.271,
                'car-shared': 0.136,
                'train': 0.041,
                'flight': 0.255
            },
            food: {
                'beef': 27.0, // kg CO2 per kg
                'lamb': 25.0,
                'cheese': 13.5,
                'pork': 12.1,
                'chicken': 6.9,
                'fish': 4.6,
                'eggs': 4.2,
                'dairy': 3.2,
                'plant': 0.8,
                'vegan': 0.5
            },
            energy: {
                'electricity': 0.233, // kg CO2 per kWh
                'gas': 0.185,
                'solar': -0.041 // negative = carbon savings
            }
        };

        this.monthlyData = this.loadMonthlyData();
        this.goals = this.loadGoals();
        this.init();
    }

    init() {
        this.renderOverview();
        this.renderCategoryBreakdowns();
        this.renderGoalsSection();
        this.renderOffsetOptions();
        this.renderComparisons();
        this.setupEventListeners();
        this.initializeChart();
    }

    setupEventListeners() {
        // Add transportation modal
        document.querySelector('.add-transport')?.addEventListener('click', () => {
            this.openTransportModal();
        });

        // Add other category modals
        document.querySelector('.add-meal-calc')?.addEventListener('click', () => {
            this.openFoodModal();
        });

        document.querySelector('.add-energy')?.addEventListener('click', () => {
            this.openEnergyModal();
        });

        document.querySelector('.add-purchase')?.addEventListener('click', () => {
            this.openShoppingModal();
        });

        // Modal event listeners
        this.setupModalListeners();

        // Goal quick wins
        document.querySelectorAll('.quick-win').forEach(win => {
            win.addEventListener('click', (e) => {
                this.completeQuickWin(e.currentTarget);
            });
        });

        // Offset buttons
        document.querySelectorAll('.offset-option button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.purchaseOffset(e.currentTarget);
            });
        });
    }

    setupModalListeners() {
        const transportModal = document.getElementById('transport-modal');
        
        // Transport modal
        transportModal?.querySelector('.modal-close').addEventListener('click', () => {
            this.closeModal('transport-modal');
        });

        transportModal?.querySelector('#cancel-transport').addEventListener('click', () => {
            this.closeModal('transport-modal');
        });

        transportModal?.querySelector('#save-transport').addEventListener('click', () => {
            this.saveTransportation();
        });

        // Live calculation in transport modal
        const transportType = document.getElementById('transport-type');
        const transportDistance = document.getElementById('transport-distance');
        
        [transportType, transportDistance].forEach(input => {
            input?.addEventListener('input', () => {
                this.updateTransportCalculation();
            });
        });

        // Close on backdrop click
        transportModal?.addEventListener('click', (e) => {
            if (e.target === transportModal) {
                this.closeModal('transport-modal');
            }
        });
    }

    openTransportModal() {
        const modal = document.getElementById('transport-modal');
        modal.classList.remove('hidden');
        document.getElementById('transport-distance').focus();
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.add('hidden');
        this.resetModalForm(modalId);
    }

    resetModalForm(modalId) {
        const modal = document.getElementById(modalId);
        const inputs = modal.querySelectorAll('input, select');
        inputs.forEach(input => {
            if (input.type === 'number') {
                input.value = '';
            } else {
                input.selectedIndex = 0;
            }
        });
        
        const preview = modal.querySelector('.emissions-preview span');
        if (preview) {
            preview.textContent = 'Estimated: 0.0 kg CO₂';
        }
    }

    updateTransportCalculation() {
        const type = document.getElementById('transport-type').value;
        const distance = parseFloat(document.getElementById('transport-distance').value) || 0;
        
        const emissions = this.calculateTransportEmissions(type, distance);
        
        const preview = document.getElementById('calculated-emissions');
        if (preview) {
            if (emissions === 0) {
                preview.textContent = `Estimated: 0.0 kg CO₂ (Carbon neutral! 🌱)`;
                preview.style.color = '#4caf50';
            } else {
                preview.textContent = `Estimated: ${emissions.toFixed(2)} kg CO₂`;
                preview.style.color = emissions > 2 ? '#f44336' : '#ff9800';
            }
        }
    }

    calculateTransportEmissions(type, distance) {
        const factor = this.emissionFactors.transportation[type] || 0;
        return factor * distance;
    }

    saveTransportation() {
        const type = document.getElementById('transport-type').value;
        const distance = parseFloat(document.getElementById('transport-distance').value) || 0;
        
        if (distance <= 0) {
            this.showNotification('Please enter a valid distance', 'warning');
            return;
        }

        const emissions = this.calculateTransportEmissions(type, distance);
        const today = new Date().toISOString().split('T')[0];
        
        // Add to daily data
        if (!this.emissions.transportation[today]) {
            this.emissions.transportation[today] = [];
        }
        
        this.emissions.transportation[today].push({
            type,
            distance,
            emissions,
            timestamp: new Date().toISOString()
        });

        // Save and update UI
        this.saveEmissionData();
        this.refreshUI();
        this.closeModal('transport-modal');

        // Show success notification
        const message = emissions === 0 ? 
            `Great! ${distance}km of carbon-neutral transport added! 🌱` :
            `Added ${distance}km ${type} trip (${emissions.toFixed(2)} kg CO₂)`;
        this.showNotification(message, emissions === 0 ? 'success' : 'info');
    }

    renderOverview() {
        const totalEmissions = this.calculateTotalEmissions();
        const avoidedEmissions = this.calculateAvoidedEmissions();
        const treesEquivalent = (totalEmissions / 6).toFixed(1); // rough estimate
        
        // Update overview stats
        const overviewStats = document.querySelectorAll('.carbon-stat .stat-number');
        if (overviewStats.length >= 3) {
            overviewStats[0].textContent = `${totalEmissions.toFixed(1)} kg`;
            overviewStats[1].textContent = `${avoidedEmissions.toFixed(1)} kg`;
            overviewStats[2].textContent = `${treesEquivalent} trees`;
        }

        // Update trend
        const trendElement = document.querySelector('.stat-trend');
        if (trendElement) {
            const lastMonthEmissions = this.getLastMonthEmissions();
            const change = lastMonthEmissions > 0 ? 
                ((lastMonthEmissions - totalEmissions) / lastMonthEmissions * 100) : 0;
            
            if (change > 0) {
                trendElement.textContent = `-${change.toFixed(0)}% vs last month`;
                trendElement.className = 'stat-trend positive';
            } else {
                trendElement.textContent = `+${Math.abs(change).toFixed(0)}% vs last month`;
                trendElement.className = 'stat-trend negative';
            }
        }
    }

    renderCategoryBreakdowns() {
        const categories = ['transportation', 'food', 'energy', 'shopping'];
        
        categories.forEach(category => {
            const categoryCard = document.querySelector(`[data-category="${category}"]`);
            if (categoryCard) {
                const emissions = this.calculateCategoryEmissions(category);
                const emissionsElement = categoryCard.querySelector('.category-emissions');
                if (emissionsElement) {
                    emissionsElement.textContent = `${emissions.toFixed(1)} kg CO₂`;
                }
                
                // Update breakdown items with real data
                this.updateCategoryBreakdown(categoryCard, category);
            }
        });
    }

    updateCategoryBreakdown(categoryCard, category) {
        const breakdownItems = categoryCard.querySelectorAll('.breakdown-item');
        const categoryData = this.getCategoryBreakdown(category);
        
        breakdownItems.forEach((item, index) => {
            if (categoryData[index]) {
                const amountElement = item.querySelector('.item-amount');
                if (amountElement) {
                    const { amount, isSaving } = categoryData[index];
                    amountElement.textContent = isSaving ? 
                        `-${amount.toFixed(1)} kg saved` : 
                        `${amount.toFixed(1)} kg`;
                    amountElement.className = isSaving ? 'item-amount eco-positive' : 'item-amount';
                }
            }
        });
    }

    getCategoryBreakdown(category) {
        // Return breakdown data for each category
        switch (category) {
            case 'transportation':
                return [
                    { amount: this.getTransportTypeEmissions('public'), isSaving: false },
                    { amount: this.getTransportTypeEmissions('car-shared'), isSaving: false },
                    { amount: this.getTransportTypeEmissions('cycling') * -1, isSaving: true }
                ];
            case 'food':
                return [
                    { amount: this.getFoodTypeEmissions('plant'), isSaving: false },
                    { amount: this.getFoodTypeEmissions('dairy'), isSaving: false },
                    { amount: this.getFoodTypeEmissions('fish'), isSaving: false }
                ];
            case 'energy':
                return [
                    { amount: this.getEnergyTypeEmissions('electricity'), isSaving: false },
                    { amount: this.getEnergyTypeEmissions('gas'), isSaving: false },
                    { amount: Math.abs(this.getEnergyTypeEmissions('solar')), isSaving: true }
                ];
            case 'shopping':
                return [
                    { amount: 0.1, isSaving: false },
                    { amount: 0.4, isSaving: false },
                    { amount: 0.2, isSaving: true }
                ];
            default:
                return [];
        }
    }

    renderGoalsSection() {
        const currentProgress = this.calculateGoalProgress();
        const progressBar = document.querySelector('.goal-progress .progress-fill');
        const progressText = document.querySelector('.progress-text');
        
        if (progressBar) {
            progressBar.style.width = `${currentProgress}%`;
        }
        
        if (progressText) {
            const daysRemaining = this.getDaysRemainingInMonth();
            progressText.textContent = `${currentProgress}% achieved • ${daysRemaining} days remaining`;
        }

        // Update goal status
        const goalStatus = document.querySelector('.goal-status');
        if (goalStatus) {
            if (currentProgress >= 70) {
                goalStatus.textContent = 'On Track';
                goalStatus.className = 'goal-status on-track';
            } else if (currentProgress >= 40) {
                goalStatus.textContent = 'Behind';
                goalStatus.className = 'goal-status behind';
            } else {
                goalStatus.textContent = 'At Risk';
                goalStatus.className = 'goal-status at-risk';
            }
        }
    }

    renderOffsetOptions() {
        const totalEmissions = this.calculateTotalEmissions();
        const offsetCost = (totalEmissions * 0.20).toFixed(2); // €0.20 per kg CO₂

        // Update offset summary
        const offsetStats = document.querySelectorAll('.offset-stat .offset-value');
        if (offsetStats.length >= 2) {
            offsetStats[0].textContent = `${totalEmissions.toFixed(1)} kg CO₂`;
            offsetStats[1].textContent = `€${offsetCost}`;
        }

        // Update offset option buttons
        const offsetButtons = document.querySelectorAll('.offset-option button');
        offsetButtons.forEach((btn, index) => {
            const prices = [offsetCost, (totalEmissions * 0.16).toFixed(2), (totalEmissions * 0.22).toFixed(2)];
            if (prices[index]) {
                btn.textContent = `€${prices[index]} - Offset`;
            }
        });
    }

    renderComparisons() {
        const userEmissions = this.calculateTotalEmissions();
        const nationalAverage = 9.6; // kg CO₂ per month
        const communityAverage = 3.6;

        // National comparison
        const nationalComparison = document.querySelector('.comparison-item:first-child');
        if (nationalComparison) {
            this.updateComparisonBar(nationalComparison, userEmissions, nationalAverage, 'national');
        }

        // Community comparison
        const communityComparison = document.querySelector('.comparison-item:last-child');
        if (communityComparison) {
            this.updateComparisonBar(communityComparison, userEmissions, communityAverage, 'community');
        }
    }

    updateComparisonBar(comparisonElement, userEmissions, averageEmissions, type) {
        const userBar = comparisonElement.querySelector('.your-emissions');
        const averageBar = comparisonElement.querySelector(`.${type === 'national' ? 'average' : 'community'}-emissions`);
        const result = comparisonElement.querySelector('.comparison-result');

        const maxEmissions = Math.max(userEmissions, averageEmissions);
        const userPercentage = (userEmissions / maxEmissions) * 100;
        const averagePercentage = (averageEmissions / maxEmissions) * 100;

        if (userBar) {
            userBar.style.width = `${userPercentage}%`;
            userBar.querySelector('span').textContent = `You: ${userEmissions.toFixed(1)}kg`;
        }

        if (averageBar) {
            averageBar.style.width = `${averagePercentage}%`;
            averageBar.querySelector('span').textContent = `${type === 'national' ? 'Average' : 'Community'}: ${averageEmissions.toFixed(1)}kg`;
        }

        if (result) {
            const difference = ((averageEmissions - userEmissions) / averageEmissions * 100);
            if (difference > 0) {
                result.textContent = `${difference.toFixed(0)}% below ${type} average! 🌟`;
                result.className = 'comparison-result positive';
            } else {
                result.textContent = `${Math.abs(difference).toFixed(0)}% above ${type} average`;
                result.className = 'comparison-result negative';
            }
        }
    }

    initializeChart() {
        const canvas = document.getElementById('carbon-trend-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const monthlyTrend = this.getMonthlyTrend();

        // Simple line chart implementation
        this.drawChart(ctx, monthlyTrend);
    }

    drawChart(ctx, data) {
        const width = ctx.canvas.width;
        const height = ctx.canvas.height;
        const padding = 40;
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        // Set up chart
        const chartWidth = width - 2 * padding;
        const chartHeight = height - 2 * padding;
        
        const maxValue = Math.max(...data) * 1.2;
        const stepX = chartWidth / (data.length - 1);
        
        // Draw grid
        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 1;
        
        // Horizontal grid lines
        for (let i = 0; i <= 5; i++) {
            const y = padding + (chartHeight * i / 5);
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(width - padding, y);
            ctx.stroke();
        }
        
        // Draw line
        ctx.strokeStyle = '#4caf50';
        ctx.lineWidth = 3;
        ctx.beginPath();
        
        data.forEach((value, index) => {
            const x = padding + (index * stepX);
            const y = padding + chartHeight - (value / maxValue * chartHeight);
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.stroke();
        
        // Draw points
        ctx.fillStyle = '#4caf50';
        data.forEach((value, index) => {
            const x = padding + (index * stepX);
            const y = padding + chartHeight - (value / maxValue * chartHeight);
            
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, 2 * Math.PI);
            ctx.fill();
        });
    }

    // Calculation methods
    calculateTotalEmissions() {
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        const currentDay = today.getDate();
        
        let total = 0;
        
        for (let day = 1; day <= currentDay; day++) {
            const date = new Date(today.getFullYear(), today.getMonth(), day).toISOString().split('T')[0];
            total += this.getDayEmissions(date);
        }
        
        return total;
    }

    calculateAvoidedEmissions() {
        // Calculate emissions that were avoided through sustainable choices
        return this.calculateTotalEmissions() * 2.5; // Simplified calculation
    }

    calculateCategoryEmissions(category) {
        const today = new Date();
        const currentDay = today.getDate();
        
        let total = 0;
        
        for (let day = 1; day <= currentDay; day++) {
            const date = new Date(today.getFullYear(), today.getMonth(), day).toISOString().split('T')[0];
            total += this.getDayCategoryEmissions(date, category);
        }
        
        return total;
    }

    getDayEmissions(date) {
        let total = 0;
        
        Object.keys(this.emissions).forEach(category => {
            if (this.emissions[category][date]) {
                this.emissions[category][date].forEach(entry => {
                    total += entry.emissions || 0;
                });
            }
        });
        
        return total;
    }

    getDayCategoryEmissions(date, category) {
        if (!this.emissions[category][date]) return 0;
        
        return this.emissions[category][date].reduce((total, entry) => {
            return total + (entry.emissions || 0);
        }, 0);
    }

    getTransportTypeEmissions(type) {
        const today = new Date();
        const currentDay = today.getDate();
        let total = 0;

        for (let day = 1; day <= currentDay; day++) {
            const date = new Date(today.getFullYear(), today.getMonth(), day).toISOString().split('T')[0];
            if (this.emissions.transportation[date]) {
                this.emissions.transportation[date].forEach(entry => {
                    if (entry.type === type) {
                        total += entry.emissions || 0;
                    }
                });
            }
        }

        return total;
    }

    getFoodTypeEmissions(type) {
        // Simplified - would be more complex in real implementation
        return Math.random() * 0.5 + 0.1;
    }

    getEnergyTypeEmissions(type) {
        // Simplified - would connect to smart home data
        const baseUsage = { electricity: 0.2, gas: 0.1, solar: -0.3 };
        return baseUsage[type] || 0;
    }

    calculateGoalProgress() {
        const currentEmissions = this.calculateTotalEmissions();
        const targetReduction = 25; // 25% reduction goal
        const baselineEmissions = currentEmissions / (1 - targetReduction / 100);
        const actualReduction = (baselineEmissions - currentEmissions) / baselineEmissions * 100;
        
        return Math.min(100, Math.max(0, (actualReduction / targetReduction) * 100));
    }

    getDaysRemainingInMonth() {
        const today = new Date();
        const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        return lastDay.getDate() - today.getDate();
    }

    getLastMonthEmissions() {
        // Simplified - would fetch actual historical data
        return this.calculateTotalEmissions() * 1.2;
    }

    getMonthlyTrend() {
        // Return last 6 months of data for chart
        return [3.2, 2.8, 2.9, 2.6, 2.3, 2.4]; // Simplified data
    }

    completeQuickWin(winElement) {
        const action = winElement.querySelector('.win-action').textContent;
        const impact = winElement.querySelector('.win-impact').textContent;
        
        winElement.style.opacity = '0.6';
        winElement.style.pointerEvents = 'none';
        
        // Add checkmark
        const checkmark = document.createElement('span');
        checkmark.textContent = ' ✅';
        winElement.appendChild(checkmark);
        
        this.showNotification(`Great! You completed: ${action}`, 'success');
        
        // Update emissions (simulate the positive impact)
        const impactValue = parseFloat(impact.match(/[\d.]+/)[0]);
        this.addEmissionReduction('quickwin', impactValue);
    }

    purchaseOffset(button) {
        const cost = button.textContent.match(/€([\d.]+)/)[0];
        
        button.textContent = 'Processing...';
        button.disabled = true;
        
        setTimeout(() => {
            button.textContent = 'Offset Complete! ✅';
            button.style.backgroundColor = '#4caf50';
            
            this.showNotification(`Carbon offset purchased for ${cost}! 🌳`, 'success');
            
            // Reset after a few seconds
            setTimeout(() => {
                button.textContent = button.textContent.replace(' ✅', '');
                button.disabled = false;
                button.style.backgroundColor = '';
            }, 3000);
        }, 2000);
    }

    addEmissionReduction(source, amount) {
        const today = new Date().toISOString().split('T')[0];
        
        if (!this.emissions.energy[today]) {
            this.emissions.energy[today] = [];
        }
        
        this.emissions.energy[today].push({
            type: 'reduction',
            source,
            emissions: -amount,
            timestamp: new Date().toISOString()
        });
        
        this.saveEmissionData();
        this.refreshUI();
    }

    refreshUI() {
        this.renderOverview();
        this.renderCategoryBreakdowns();
        this.renderGoalsSection();
        this.renderOffsetOptions();
        this.renderComparisons();
    }

    showNotification(message, type = 'info') {
        if (window.greenHabitApp) {
            window.greenHabitApp.addNotification({
                type,
                icon: type === 'success' ? '🎉' : type === 'warning' ? '⚠️' : '🌍',
                title: 'Carbon Calculator',
                message,
                time: 'Just now'
            });
        }
    }

    saveEmissionData() {
        localStorage.setItem('greenhabit-emissions', JSON.stringify(this.emissions));
    }

    loadEmissionData() {
        const saved = localStorage.getItem('greenhabit-emissions');
        if (saved) {
            this.emissions = { ...this.emissions, ...JSON.parse(saved) };
        }
    }

    loadMonthlyData() {
        // Load or initialize monthly tracking data
        return JSON.parse(localStorage.getItem('greenhabit-carbon-monthly') || '{}');
    }

    loadGoals() {
        // Load user's carbon reduction goals
        return JSON.parse(localStorage.getItem('greenhabit-carbon-goals') || '{"monthly": 25}');
    }

    openFoodModal() {
        this.showNotification('Food tracking modal would open here', 'info');
    }

    openEnergyModal() {
        this.showNotification('Energy usage modal would open here', 'info');
    }

    openShoppingModal() {
        this.showNotification('Shopping tracker modal would open here', 'info');
    }
}

// Initialize carbon calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('carbon-calculator')) {
        window.carbonCalculator = new CarbonCalculator();
    }
}); 