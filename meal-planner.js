// Meal Planner Module
class MealPlanner {
    constructor() {
        this.currentWeek = new Date();
        this.meals = {
            // Sample data structure
            '2024-01-15': {
                breakfast: { name: 'Overnight Oats with Berries', ecoScore: 85, ingredients: ['oats', 'berries', 'almond milk'] },
                lunch: { name: 'Quinoa Buddha Bowl', ecoScore: 90, ingredients: ['quinoa', 'kale', 'chickpeas', 'tahini'] },
                dinner: null
            },
            '2024-01-16': {
                breakfast: null,
                lunch: null,
                dinner: { name: 'Lentil Curry with Brown Rice', ecoScore: 88, ingredients: ['lentils', 'rice', 'curry spices'] }
            }
        };
        
        this.recipes = [
            {
                id: 'rainbow-bowl',
                name: 'Rainbow Buddha Bowl',
                category: ['vegan', 'seasonal'],
                prepTime: 20,
                ecoScore: 92,
                image: '🥗',
                description: 'Colorful mix of seasonal vegetables, quinoa, and tahini dressing',
                sustainability: ['Low water usage', 'Local ingredients', 'Zero waste'],
                ingredients: ['quinoa', 'rainbow carrots', 'kale', 'chickpeas', 'tahini'],
                carbonFootprint: 0.8
            },
            {
                id: 'veggie-pasta',
                name: 'Local Veggie Pasta',
                category: ['vegetarian', 'local'],
                prepTime: 15,
                ecoScore: 75,
                image: '🍝',
                description: 'Whole wheat pasta with farmer\'s market vegetables',
                sustainability: ['<2km transport', 'Organic ingredients'],
                ingredients: ['whole wheat pasta', 'zucchini', 'tomatoes', 'basil'],
                carbonFootprint: 1.2
            },
            {
                id: 'lentil-stew',
                name: 'Hearty Lentil Stew',
                category: ['vegan', 'local'],
                prepTime: 35,
                ecoScore: 90,
                image: '🍲',
                description: 'Protein-rich lentils with local root vegetables',
                sustainability: ['Plant protein', 'Drought-resistant crops', 'Local farmers'],
                ingredients: ['lentils', 'carrots', 'onions', 'celery', 'herbs'],
                carbonFootprint: 0.6
            }
        ];

        this.sustainabilityData = {
            plantBasedPercentage: 85,
            averageFoodMiles: 12,
            waterSaved: 840,
            zeroWastePercentage: 95
        };

        this.init();
    }

    init() {
        this.renderWeekView();
        this.setupEventListeners();
        this.renderRecipeSuggestions();
        this.updateInsights();
        this.calculateShoppingSummary();
    }

    setupEventListeners() {
        // Week navigation
        document.getElementById('prev-week')?.addEventListener('click', () => {
            this.navigateWeek(-1);
        });

        document.getElementById('next-week')?.addEventListener('click', () => {
            this.navigateWeek(1);
        });

        // Add meal buttons
        document.querySelectorAll('.add-meal-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const slot = e.target.closest('.meal-slot');
                const day = slot.closest('.day-column').dataset.day;
                const meal = slot.dataset.meal;
                this.openMealModal(day, meal);
            });
        });

        // Recipe filters
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.filterRecipes(e.target.dataset.filter);
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });

        // Add to plan buttons
        document.querySelectorAll('.add-to-plan').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const recipeCard = e.target.closest('.recipe-card');
                const recipeName = recipeCard.querySelector('h5').textContent;
                this.quickAddRecipe(recipeName);
            });
        });

        // Shopping list generation
        document.getElementById('generate-shopping-list')?.addEventListener('click', () => {
            this.generateShoppingList();
        });

        document.getElementById('find-local-stores')?.addEventListener('click', () => {
            this.findLocalStores();
        });

        // Modal handling
        this.setupModalListeners();
    }

    setupModalListeners() {
        const modal = document.getElementById('meal-modal');
        const closeBtn = modal?.querySelector('.modal-close');
        const cancelBtn = document.getElementById('cancel-meal');
        const saveBtn = document.getElementById('save-meal');

        closeBtn?.addEventListener('click', () => this.closeMealModal());
        cancelBtn?.addEventListener('click', () => this.closeMealModal());
        saveBtn?.addEventListener('click', () => this.saveMeal());

        // Quick options
        document.querySelectorAll('.quick-option').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const mealName = e.target.dataset.meal;
                document.getElementById('meal-name').value = mealName;
            });
        });

        // Close modal on backdrop click
        modal?.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeMealModal();
            }
        });
    }

    navigateWeek(direction) {
        const oneWeek = 7 * 24 * 60 * 60 * 1000; // milliseconds
        this.currentWeek = new Date(this.currentWeek.getTime() + (direction * oneWeek));
        this.renderWeekView();
    }

    renderWeekView() {
        // Update week header
        const weekHeader = document.getElementById('current-week');
        if (weekHeader) {
            const startDate = this.getWeekStart(this.currentWeek);
            const endDate = new Date(startDate.getTime() + 6 * 24 * 60 * 60 * 1000);
            weekHeader.textContent = `Week of ${this.formatDate(startDate)} - ${this.formatDate(endDate)}`;
        }

        // Generate week grid dynamically
        this.generateWeekGrid();
    }

    generateWeekGrid() {
        const weekGrid = document.querySelector('.week-grid');
        if (!weekGrid) return;

        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        const startDate = this.getWeekStart(this.currentWeek);

        weekGrid.innerHTML = days.map((day, index) => {
            const date = new Date(startDate.getTime() + index * 24 * 60 * 60 * 1000);
            const dateKey = this.formatDateKey(date);
            const dayData = this.meals[dateKey] || {};
            const ecoScore = this.calculateDayEcoScore(dayData);

            return `
                <div class="day-column" data-day="${day}" data-date="${dateKey}">
                    <div class="day-header">
                        <h4>${this.capitalizeFirst(day)}</h4>
                        <span class="eco-score-day">🌱 ${ecoScore}</span>
                    </div>
                    <div class="meal-slots">
                        ${this.renderMealSlot('breakfast', dayData.breakfast)}
                        ${this.renderMealSlot('lunch', dayData.lunch)}
                        ${this.renderMealSlot('dinner', dayData.dinner)}
                    </div>
                </div>
            `;
        }).join('');

        // Re-attach event listeners for new elements
        this.reattachMealSlotListeners();
    }

    renderMealSlot(mealType, mealData) {
        if (mealData) {
            return `
                <div class="meal-slot" data-meal="${mealType}">
                    <div class="meal-label">${this.capitalizeFirst(mealType)}</div>
                    <div class="meal-content" data-planned="true">
                        <div class="meal-item">
                            <span class="meal-name">${mealData.name}</span>
                            <span class="eco-badge eco-${this.getEcoBadgeClass(mealData.ecoScore)}">🌱 ${this.getEcoLabel(mealData.ecoScore)}</span>
                        </div>
                        <button class="btn btn-small edit-meal">Edit</button>
                    </div>
                </div>
            `;
        } else {
            return `
                <div class="meal-slot" data-meal="${mealType}">
                    <div class="meal-label">${this.capitalizeFirst(mealType)}</div>
                    <div class="meal-content empty">
                        <button class="add-meal-btn">+ Add Meal</button>
                    </div>
                </div>
            `;
        }
    }

    reattachMealSlotListeners() {
        document.querySelectorAll('.add-meal-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const slot = e.target.closest('.meal-slot');
                const day = slot.closest('.day-column').dataset.date;
                const meal = slot.dataset.meal;
                this.openMealModal(day, meal);
            });
        });

        document.querySelectorAll('.edit-meal').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const slot = e.target.closest('.meal-slot');
                const day = slot.closest('.day-column').dataset.date;
                const meal = slot.dataset.meal;
                this.editMeal(day, meal);
            });
        });
    }

    openMealModal(day, mealType) {
        this.currentMealContext = { day, mealType };
        const modal = document.getElementById('meal-modal');
        modal.classList.remove('hidden');
        document.getElementById('meal-name').focus();
    }

    closeMealModal() {
        const modal = document.getElementById('meal-modal');
        modal.classList.add('hidden');
        document.getElementById('meal-name').value = '';
        this.currentMealContext = null;
    }

    saveMeal() {
        const mealName = document.getElementById('meal-name').value.trim();
        if (!mealName || !this.currentMealContext) return;

        const { day, mealType } = this.currentMealContext;
        
        // Initialize day if it doesn't exist
        if (!this.meals[day]) {
            this.meals[day] = {};
        }

        // Create meal object
        this.meals[day][mealType] = {
            name: mealName,
            ecoScore: this.calculateMealEcoScore(mealName),
            ingredients: this.extractIngredients(mealName),
            carbonFootprint: this.calculateCarbonFootprint(mealName)
        };

        // Save to localStorage
        this.saveMealData();

        // Update UI
        this.renderWeekView();
        this.updateInsights();
        this.calculateShoppingSummary();

        // Close modal
        this.closeMealModal();

        // Show success notification
        this.showNotification(`Added ${mealName} to ${mealType}!`, 'success');
    }

    editMeal(day, mealType) {
        const mealData = this.meals[day]?.[mealType];
        if (!mealData) return;

        this.currentMealContext = { day, mealType };
        document.getElementById('meal-name').value = mealData.name;
        this.openMealModal(day, mealType);
    }

    filterRecipes(filter) {
        const recipeCards = document.querySelectorAll('.recipe-card');
        
        recipeCards.forEach(card => {
            if (filter === 'all') {
                card.style.display = 'block';
            } else {
                const categories = card.dataset.category.split(' ');
                card.style.display = categories.includes(filter) ? 'block' : 'none';
            }
        });
    }

    quickAddRecipe(recipeName) {
        // Find available meal slot (next empty slot)
        const emptySlot = this.findNextEmptySlot();
        if (emptySlot) {
            const { day, mealType } = emptySlot;
            
            if (!this.meals[day]) {
                this.meals[day] = {};
            }

            this.meals[day][mealType] = {
                name: recipeName,
                ecoScore: this.calculateMealEcoScore(recipeName),
                ingredients: this.extractIngredients(recipeName),
                carbonFootprint: this.calculateCarbonFootprint(recipeName)
            };

            this.saveMealData();
            this.renderWeekView();
            this.updateInsights();
            this.calculateShoppingSummary();

            this.showNotification(`Added ${recipeName} to your meal plan!`, 'success');
        } else {
            this.showNotification('No empty meal slots available this week', 'warning');
        }
    }

    findNextEmptySlot() {
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        const startDate = this.getWeekStart(this.currentWeek);
        const meals = ['breakfast', 'lunch', 'dinner'];

        for (let dayIndex = 0; dayIndex < days.length; dayIndex++) {
            const date = new Date(startDate.getTime() + dayIndex * 24 * 60 * 60 * 1000);
            const dateKey = this.formatDateKey(date);
            
            for (const mealType of meals) {
                if (!this.meals[dateKey]?.[mealType]) {
                    return { day: dateKey, mealType };
                }
            }
        }
        return null;
    }

    renderRecipeSuggestions() {
        // Recipe suggestions are already in HTML, but we can add dynamic content here
        this.recipes.forEach(recipe => {
            // Add any dynamic content or event listeners if needed
        });
    }

    updateInsights() {
        // Calculate and update weekly insights
        const weekData = this.getWeekMealData();
        const insights = this.calculateWeeklyInsights(weekData);

        // Update insight cards
        const insightCards = document.querySelectorAll('.insight-card');
        if (insightCards.length >= 4) {
            insightCards[0].querySelector('.insight-value').textContent = `${insights.plantBasedPercentage}%`;
            insightCards[1].querySelector('.insight-value').textContent = `${insights.avgFoodMiles} km`;
            insightCards[2].querySelector('.insight-value').textContent = `-${insights.waterSaved}L`;
            insightCards[3].querySelector('.insight-value').textContent = `${insights.zeroWastePercentage}%`;
        }
    }

    calculateShoppingSummary() {
        const weekData = this.getWeekMealData();
        const summary = this.generateShoppingSummary(weekData);

        // Update shopping summary
        const summaryItems = document.querySelectorAll('.summary-item .summary-value');
        if (summaryItems.length >= 3) {
            summaryItems[0].textContent = `${summary.itemCount} items`;
            summaryItems[1].textContent = `€${summary.estimatedCost}`;
            summaryItems[2].textContent = `${summary.carbonFootprint} kg CO₂`;
        }
    }

    generateShoppingList() {
        const weekData = this.getWeekMealData();
        const ingredients = this.consolidateIngredients(weekData);
        
        // Create shopping list modal or navigate to shopping list view
        this.showShoppingListModal(ingredients);
    }

    findLocalStores() {
        // Integrate with maps API or show local stores
        window.greenHabitApp?.showLocationDetails('Local Organic Stores');
    }

    // Utility methods
    getWeekStart(date) {
        const start = new Date(date);
        const day = start.getDay();
        const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
        return new Date(start.setDate(diff));
    }

    formatDate(date) {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    formatDateKey(date) {
        return date.toISOString().split('T')[0];
    }

    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    calculateDayEcoScore(dayData) {
        const meals = Object.values(dayData).filter(meal => meal !== null);
        if (meals.length === 0) return 0;
        
        const totalScore = meals.reduce((sum, meal) => sum + (meal.ecoScore || 50), 0);
        return Math.round(totalScore / meals.length);
    }

    calculateMealEcoScore(mealName) {
        // Simple heuristic based on meal name keywords
        const veganKeywords = ['quinoa', 'lentil', 'chickpea', 'tofu', 'vegetables', 'salad'];
        const localKeywords = ['local', 'seasonal', 'fresh', 'organic'];
        
        let score = 50; // base score
        
        const mealLower = mealName.toLowerCase();
        veganKeywords.forEach(keyword => {
            if (mealLower.includes(keyword)) score += 15;
        });
        
        localKeywords.forEach(keyword => {
            if (mealLower.includes(keyword)) score += 10;
        });
        
        return Math.min(100, score);
    }

    getEcoBadgeClass(score) {
        if (score >= 80) return 'high';
        if (score >= 60) return 'medium';
        return 'low';
    }

    getEcoLabel(score) {
        if (score >= 80) return 'High';
        if (score >= 60) return 'Medium';
        return 'Low';
    }

    extractIngredients(mealName) {
        // Simple ingredient extraction based on meal name
        const ingredientMap = {
            'oats': ['oats', 'oatmeal'],
            'quinoa': ['quinoa', 'buddha bowl'],
            'lentil': ['lentil', 'dal', 'curry'],
            'pasta': ['pasta', 'spaghetti', 'noodles'],
            'rice': ['rice', 'curry'],
            'avocado': ['avocado', 'toast'],
            'smoothie': ['smoothie', 'banana', 'berries']
        };

        const ingredients = [];
        const mealLower = mealName.toLowerCase();
        
        Object.entries(ingredientMap).forEach(([ingredient, keywords]) => {
            if (keywords.some(keyword => mealLower.includes(keyword))) {
                ingredients.push(ingredient);
            }
        });

        return ingredients.length > 0 ? ingredients : ['mixed ingredients'];
    }

    calculateCarbonFootprint(mealName) {
        // Simplified carbon footprint calculation
        const baseCO2 = 0.5; // kg CO₂ for base meal
        const mealLower = mealName.toLowerCase();
        
        let co2 = baseCO2;
        
        if (mealLower.includes('meat') || mealLower.includes('beef')) co2 += 2.0;
        if (mealLower.includes('chicken') || mealLower.includes('pork')) co2 += 1.0;
        if (mealLower.includes('fish')) co2 += 0.5;
        if (mealLower.includes('vegan') || mealLower.includes('plant')) co2 -= 0.3;
        if (mealLower.includes('local') || mealLower.includes('seasonal')) co2 -= 0.2;
        
        return Math.max(0.1, co2);
    }

    getWeekMealData() {
        const startDate = this.getWeekStart(this.currentWeek);
        const weekData = [];

        for (let i = 0; i < 7; i++) {
            const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
            const dateKey = this.formatDateKey(date);
            weekData.push(this.meals[dateKey] || {});
        }

        return weekData;
    }

    calculateWeeklyInsights(weekData) {
        const allMeals = weekData.flatMap(day => Object.values(day)).filter(meal => meal !== null);
        
        return {
            plantBasedPercentage: Math.round((allMeals.filter(meal => 
                meal.ecoScore > 70).length / Math.max(1, allMeals.length)) * 100),
            avgFoodMiles: Math.round(Math.random() * 20 + 5), // Simplified
            waterSaved: Math.round(allMeals.length * 40 + Math.random() * 200),
            zeroWastePercentage: Math.round(Math.random() * 20 + 80)
        };
    }

    generateShoppingSummary(weekData) {
        const allMeals = weekData.flatMap(day => Object.values(day)).filter(meal => meal !== null);
        const allIngredients = allMeals.flatMap(meal => meal.ingredients || []);
        
        return {
            itemCount: new Set(allIngredients).size,
            estimatedCost: (allMeals.length * 6.5 + Math.random() * 10).toFixed(2),
            carbonFootprint: allMeals.reduce((total, meal) => total + (meal.carbonFootprint || 0.5), 0).toFixed(1)
        };
    }

    consolidateIngredients(weekData) {
        const ingredientCount = {};
        weekData.forEach(day => {
            Object.values(day).forEach(meal => {
                if (meal && meal.ingredients) {
                    meal.ingredients.forEach(ingredient => {
                        ingredientCount[ingredient] = (ingredientCount[ingredient] || 0) + 1;
                    });
                }
            });
        });
        return ingredientCount;
    }

    showShoppingListModal(ingredients) {
        const ingredientList = Object.entries(ingredients)
            .map(([ingredient, count]) => `${ingredient} (${count}x)`)
            .join('\n');
        
        alert(`🛒 Shopping List:\n\n${ingredientList}\n\nThis would open a detailed shopping list in the full app!`);
    }

    showNotification(message, type = 'info') {
        if (window.greenHabitApp) {
            window.greenHabitApp.addNotification({
                type,
                icon: type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️',
                title: 'Meal Planner',
                message,
                time: 'Just now'
            });
        }
    }

    saveMealData() {
        localStorage.setItem('greenhabit-meals', JSON.stringify(this.meals));
    }

    loadMealData() {
        const saved = localStorage.getItem('greenhabit-meals');
        if (saved) {
            this.meals = { ...this.meals, ...JSON.parse(saved) };
        }
    }
}

// Initialize meal planner when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('meal-planner')) {
        window.mealPlanner = new MealPlanner();
    }
}); 