// Goal Page JavaScript
let allGoals = [];

function initializeGoalsPage() {
    console.log('Initializing Goals Page');
    
    // Load goals when page loads
    loadGoals();
    
    // Bind event listeners
    bindEventListeners();
}

function bindEventListeners() {
    console.log('Binding event listeners');
    
    // Add New Goal button
    const btnAddGoal = document.getElementById('btnAddGoal');
    console.log('btnAddGoal element:', btnAddGoal);
    if (btnAddGoal) {
        btnAddGoal.addEventListener('click', showAddGoalModal);
        console.log('Event listener added to btnAddGoal');
    }

    const goalTargetDate = document.getElementById('goalTargetDate');
    if (goalTargetDate) {
        goalTargetDate.addEventListener('change', () => {
            // Re-validate date on change and show a toast if invalid
            const title = document.getElementById('goalTitle')?.value?.trim() || '';
            const category = document.getElementById('goalCategory')?.value || '';
            const targetDate = goalTargetDate.value;
            const valid = validateGoalForm(title, category, targetDate);
            if (!valid) {
                showErrorToast('Future dates only. Past dates are not permitted. Please re-enter the date.');
            }
        });
    }
    
    // Close modal button
    const btnCloseModal = document.getElementById('btnCloseModal');
    if (btnCloseModal) {
        btnCloseModal.addEventListener('click', closeGoalModal);
    }
    
    // Cancel button in modal
    const btnCancelGoal = document.getElementById('btnCancelGoal');
    if (btnCancelGoal) {
        btnCancelGoal.addEventListener('click', closeGoalModal);
    }
    
    // Save goal button
    const btnSaveGoal = document.getElementById('btnSaveGoal');
    if (btnSaveGoal) {
        btnSaveGoal.addEventListener('click', saveGoal);
    }
    
    // Goal form submission
    const goalForm = document.getElementById('goalForm');
    if (goalForm) {
        goalForm.addEventListener('submit', function(e) {
            e.preventDefault();
            // Don't call saveGoal here since we're already handling it with the button click
        });
    }
    
    // Delete modal buttons
    const btnCancelDelete = document.getElementById('btnCancelDelete');
    if (btnCancelDelete) {
        btnCancelDelete.addEventListener('click', closeDeleteModal);
    }
    
    // Filter and sort controls
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterAndSortGoals);
    }
    
    const sortOrder = document.getElementById('sortOrder');
    if (sortOrder) {
        sortOrder.addEventListener('change', filterAndSortGoals);
    }
}

// Load goals from API
async function loadGoals() {
    try {
        const response = await fetch('/api/goals/list/', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken()
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            // Store all goals
            allGoals = Array.isArray(data.goals) ? data.goals : [];
            // Update stats for the full set
            updateStats(allGoals);
            // Render using current filter selection
            filterAndSortGoals();
        } else {
            console.error('Failed to load goals');
        }
    } catch (error) {
        console.error('Error loading goals:', error);
    }
}

// Display goals in the UI
function displayGoals(goals) {
    const activeGoalsList = document.getElementById('activeGoalsList');
    const completedGoalsList = document.getElementById('completedGoalsList');
    
    if (!activeGoalsList || !completedGoalsList) return;
    
    // Clear existing content
    activeGoalsList.innerHTML = '';
    completedGoalsList.innerHTML = '';
    
    // Separate active and completed goals
    const activeGoals = goals.filter(goal => goal.status === 'active');
    const completedGoals = goals.filter(goal => goal.status === 'completed');
    
    // Display active goals
    if (activeGoals.length > 0) {
        activeGoals.forEach(goal => {
            const goalElement = createGoalElement(goal);
            activeGoalsList.appendChild(goalElement);
        });
    } else {
        activeGoalsList.innerHTML = '<p class="no-goals-message">No active goals yet. Add your first goal!</p>';
    }
    
    // Display completed goals
    if (completedGoals.length > 0) {
        completedGoals.forEach(goal => {
            const goalElement = createGoalElement(goal);
            completedGoalsList.appendChild(goalElement);
        });
    } else {
        completedGoalsList.innerHTML = '<p class="no-goals-message">No completed goals yet.</p>';
    }
    
    // Update filtered count
    updateFilteredCount(goals.length);
}

// Create goal element for display
function createGoalElement(goal) {
    const goalElement = document.createElement('div');
    goalElement.className = 'goal-card';
    goalElement.dataset.goalId = goal.id;
    
    // Format date
    const targetDate = new Date(goal.target_date);
    const formattedDate = targetDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
    
    // Determine status class
    let statusClass = '';
    let statusText = '';
    if (goal.status === 'active') {
        statusClass = 'status-active';
        statusText = 'Active';
    } else if (goal.status === 'completed') {
        statusClass = 'status-completed';
        statusText = 'Completed';
    } else if (goal.status === 'overdue') {
        statusClass = 'status-overdue';
        statusText = 'Overdue';
    }
    
    goalElement.innerHTML = `
        <div class="goal-card-header">
            <div class="goal-category ${goal.category.toLowerCase()}">
                ${goal.category}
            </div>
            <div class="goal-status ${statusClass}">
                ${statusText}
            </div>
        </div>
        <h3 class="goal-title">${goal.title}</h3>
        ${goal.description ? `<p class="goal-description">${goal.description}</p>` : ''}
        <div class="goal-meta">
            <div class="goal-date">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M5 12h6M5 8h6M5 4h6M3 2h10a2 2 0 012 2v8a2 2 0 01-2 2H3a2 2 0 01-2-2V4a2 2 0 012-2z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                ${formattedDate}
            </div>
        </div>
        <div class="goal-actions">
            ${goal.status === 'active' ? `
                <button class="btn-edit-goal" data-goal-id="${goal.id}">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M11.333 2.667l2 2L7.333 10.667l-2 .666.666-2L11.333 2.667zM12 1.333l2 2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Edit
                </button>
                <button class="btn-complete-goal" data-goal-id="${goal.id}">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M13.333 4L6 11.333 2.667 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Complete
                </button>
            ` : `
                <button class="btn-reopen-goal" data-goal-id="${goal.id}">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M2.667 8h10.666M8 12.667L12.667 8 8 3.333" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Reopen
                </button>
            `}
            <button class="btn-delete-goal" data-goal-id="${goal.id}">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M2 4h12M5.333 4V2.667a1.333 1.333 0 011.334-1.334h2.666a1.333 1.333 0 011.334 1.334V4m2 0v9.333a1.333 1.333 0 01-1.334 1.334H4.667a1.333 1.333 0 01-1.334-1.334V4h9.334z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Delete
            </button>
        </div>
    `;
    
    // Add event listeners to the action buttons
    const editBtn = goalElement.querySelector('.btn-edit-goal');
    if (editBtn) {
        editBtn.addEventListener('click', () => editGoal(goal));
    }
    
    const completeBtn = goalElement.querySelector('.btn-complete-goal');
    if (completeBtn) {
        completeBtn.addEventListener('click', () => completeGoal(goal.id));
    }
    
    const reopenBtn = goalElement.querySelector('.btn-reopen-goal');
    if (reopenBtn) {
        reopenBtn.addEventListener('click', () => reopenGoal(goal.id));
    }
    
    const deleteBtn = goalElement.querySelector('.btn-delete-goal');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', () => showDeleteConfirmation(goal));
    }
    
    return goalElement;
}

async function syncSidebarStats() {
  try {
    // Uses functions from dashboard.js, which is loaded globally via base.html
    if (typeof refreshYearProgress === 'function') {
      await refreshYearProgress(); // updates appState quarter completion and sidebar progress
    }
    if (typeof updateSidebarStats === 'function') {
      const profile = window.userProfile || (typeof fetchUserProfile === 'function' ? await fetchUserProfile() : {});
      updateSidebarStats(profile); // updates GWA and progress text in the sidebar
    }
  } catch (e) {
    console.warn('Sidebar sync skipped:', e);
  }
}

function initializeGoalsPage() {
    console.log('Initializing Goals Page');
    loadGoals()
      .finally(syncSidebarStats); // refresh sidebar once goals are loaded
    bindEventListeners();
}

// Show Add Goal Modal
function showAddGoalModal() {
    console.log('showAddGoalModal function called');
    const modal = document.getElementById('goalModal');
    const modalTitle = document.getElementById('modalTitle');
    const goalForm = document.getElementById('goalForm');
    
    console.log('modal element:', modal);
    console.log('modalTitle element:', modalTitle);
    console.log('goalForm element:', goalForm);
    
    if (modal && modalTitle && goalForm) {
        // Reset form
        goalForm.reset();
        
        // Set modal title
        modalTitle.textContent = 'Add New Goal';
        
        // Clear any existing goal ID
        document.getElementById('goalId').value = '';
        
        // Clear errors
        clearFormErrors();
        
        // Show modal by adding the 'show' class
        modal.classList.add('show');
        console.log('Modal should be displayed now');
    } else {
        console.log('One or more required elements not found');
    }
}

// Close Goal Modal
function closeGoalModal() {
    console.log('closeGoalModal function called');
    const modal = document.getElementById('goalModal');
    if (modal) {
        modal.classList.remove('show');
        console.log('Modal should be hidden now');
    }
}

// Save Goal (Add or Update)
async function saveGoal() {
    const goalForm = document.getElementById('goalForm');
    if (!goalForm) return;
    
    // Get form data
    const goalId = document.getElementById('goalId').value;
    const title = document.getElementById('goalTitle').value.trim();
    const description = document.getElementById('goalDescription').value.trim();
    const category = document.getElementById('goalCategory').value;
    const targetDate = document.getElementById('goalTargetDate').value;
    
    // Validate form
    if (!validateGoalForm(title, category, targetDate)) {
        return;
    }
    
    // Prepare data
    const goalData = {
        title: title,
        category: category,
        target_date: targetDate
    };
    
    if (description) {
        goalData.description = description;
    }
    
    try {
        let response;
        if (goalId) {
            // Update existing goal
            response = await fetch(`/api/goals/update/${goalId}/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCSRFToken()
                },
                body: JSON.stringify(goalData)
            });
        } else {
            // Add new goal
            response = await fetch('/api/goals/add/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCSRFToken()
                },
                body: JSON.stringify(goalData)
            });
        }
        
        if (response.ok) {
            const data = await response.json();
            console.log('Goal saved:', data);
            
            // Close modal
            closeGoalModal();
            
            // Reload goals
            await loadGoals();
            await syncSidebarStats(); // keep sidebar updated
            
            // Show success message
            showSuccessToast(goalId ? 'Goal updated successfully!' : 'Goal added successfully!');
        } else {
            const errorData = await response.json();
            console.error('Error saving goal:', errorData);
            showErrorToast(errorData.error || 'Failed to save goal');
        }
    } catch (error) {
        console.error('Error saving goal:', error);
        showErrorToast('Failed to save goal');
    }
}

function validateGoalForm(title, category, targetDate) {
    let isValid = true;
    clearFormErrors();

    if (!title) {
        showFieldError('goalTitle', 'Title is required');
        isValid = false;
    }

    if (!category) {
        showFieldError('goalCategory', 'Category is required');
        isValid = false;
    }

    if (!targetDate) {
        showFieldError('goalTargetDate', 'Target date is required');
        isValid = false;
    } else {
        const now = new Date();
        const date = new Date(targetDate);

        if (isNaN(date.getTime())) {
            showFieldError('goalTargetDate', 'Please enter a valid date');
            isValid = false;
        } else {
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const picked = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            if (picked < today) {
                showFieldError('goalTargetDate', 'Target date cannot be in the past');
                isValid = false;
            }
            const twoYearsAhead = new Date(today);
            twoYearsAhead.setFullYear(twoYearsAhead.getFullYear() + 2);
            if (picked > twoYearsAhead) {
                showFieldError('goalTargetDate', 'Completion date is too far in the future. Please input a valid date.');
                isValid = false;
            }
        }
    }

    // If invalid, also show a warning toast
    if (!isValid) {
        showErrorToast('Invalid input. Please check the form and enter a valid date.');
    }

    return isValid;
}

// Clear form errors
function clearFormErrors() {
    const errorElements = document.querySelectorAll('.form-error');
    errorElements.forEach(element => {
        element.textContent = '';
    });
    
    const inputElements = document.querySelectorAll('.form-input, .form-select, .form-textarea');
    inputElements.forEach(element => {
        element.classList.remove('error');
    });
}

// Show field error
function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const errorElement = document.getElementById(`${fieldId}Error`);
    
    if (field && errorElement) {
        field.classList.add('error');
        errorElement.textContent = message;
    }
}

// Edit Goal
function editGoal(goal) {
    const modal = document.getElementById('goalModal');
    const modalTitle = document.getElementById('modalTitle');
    const goalForm = document.getElementById('goalForm');
    
    if (modal && modalTitle && goalForm) {
        // Fill form with goal data
        document.getElementById('goalId').value = goal.id;
        document.getElementById('goalTitle').value = goal.title;
        document.getElementById('goalDescription').value = goal.description || '';
        document.getElementById('goalCategory').value = goal.category;
        document.getElementById('goalTargetDate').value = goal.target_date;
        
        // Set modal title
        modalTitle.textContent = 'Edit Goal';
        
        // Clear errors
        clearFormErrors();
        
        // Show modal by adding the 'show' class
        modal.classList.add('show');
    }
}

// Complete Goal
async function completeGoal(goalId) {
    try {
        const response = await fetch(`/api/goals/update/${goalId}/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken()
            },
            body: JSON.stringify({
                status: 'completed'
            })
        });
        
        if (response.ok) {
            // Reload goals
            await loadGoals();
            await syncSidebarStats(); // keep sidebar updated
            
            // Show success message
            showSuccessToast('Goal marked as completed!');
        } else {
            const errorData = await response.json();
            showErrorToast(errorData.error || 'Failed to complete goal');
        }
    } catch (error) {
        console.error('Error completing goal:', error);
        showErrorToast('Failed to complete goal');
    }
}

// Reopen Goal
async function reopenGoal(goalId) {
    try {
        const response = await fetch(`/api/goals/update/${goalId}/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken()
            },
            body: JSON.stringify({
                status: 'active'
            })
        });
        
        if (response.ok) {
            // Reload goals
            await loadGoals();
            await syncSidebarStats(); // keep sidebar updated
            showSuccessToast('Goal reopened!');
        } else {
            const errorData = await response.json();
            showErrorToast(errorData.error || 'Failed to reopen goal');
        }
    } catch (error) {
        console.error('Error reopening goal:', error);
        showErrorToast('Failed to reopen goal');
    }
}

// Show Delete Confirmation
function showDeleteConfirmation(goal) {
    const deleteModal = document.getElementById('deleteModal');
    if (deleteModal) {
        // Store goal ID for deletion
        deleteModal.dataset.goalId = goal.id;
        
        // Show modal by adding the 'show' class
        deleteModal.classList.add('show');
        
        // Add event listener to confirm button
        const btnConfirmDelete = document.getElementById('btnConfirmDelete');
        if (btnConfirmDelete) {
            // Remove any existing event listeners
            btnConfirmDelete.replaceWith(btnConfirmDelete.cloneNode(true));
            const newBtnConfirmDelete = document.getElementById('btnConfirmDelete');
            newBtnConfirmDelete.addEventListener('click', () => confirmDeleteGoal(goal.id));
        }
    }
}

// Close Delete Modal
function closeDeleteModal() {
    const deleteModal = document.getElementById('deleteModal');
    if (deleteModal) {
        deleteModal.classList.remove('show');
    }
}

// Confirm Delete Goal
async function confirmDeleteGoal(goalId) {
    try {
        const response = await fetch(`/api/goals/delete/${goalId}/`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken()
            }
        });
        
        if (response.ok) {
            // Close delete modal
            closeDeleteModal();
            
            await loadGoals();
            await syncSidebarStats(); // keep sidebar updated
            
            // Show success message
            showSuccessToast('Goal deleted successfully!');
        } else {
            const errorData = await response.json();
            showErrorToast(errorData.error || 'Failed to delete goal');
        }
    } catch (error) {
        console.error('Error deleting goal:', error);
        showErrorToast('Failed to delete goal');
    }
}

// Update statistics
function updateStats(goals) {
    const activeGoalsCount = document.getElementById('activeGoalsCount');
    const completedGoalsCount = document.getElementById('completedGoalsCount');
    const overdueGoalsCount = document.getElementById('overdueGoalsCount');
    
    if (activeGoalsCount && completedGoalsCount && overdueGoalsCount) {
        const activeCount = goals.filter(goal => goal.status === 'active').length;
        const completedCount = goals.filter(goal => goal.status === 'completed').length;
        const overdueCount = goals.filter(goal => goal.status === 'overdue').length;
        
        activeGoalsCount.textContent = activeCount;
        completedGoalsCount.textContent = completedCount;
        overdueGoalsCount.textContent = overdueCount;
    }
}

// Filter and sort goals
function filterAndSortGoals() {
    const categoryFilter = document.getElementById('categoryFilter');
    const sortOrder = document.getElementById('sortOrder');

    const selected = (categoryFilter?.value || 'all').trim().toLowerCase();

    let filtered = allGoals;

    // Simple if/else filtering by category
    if (selected === 'all') {
        filtered = allGoals;
    } else if (selected === 'academic') {
        filtered = allGoals.filter(g => (g.category || '').toLowerCase() === 'academic');
    } else if (selected === 'personal') {
        filtered = allGoals.filter(g => (g.category || '').toLowerCase() === 'personal');
    } else if (selected === 'health') {
        filtered = allGoals.filter(g => (g.category || '').toLowerCase() === 'health');
    } else if (selected === 'career') {
        filtered = allGoals.filter(g => (g.category || '').toLowerCase() === 'career');
    } else {
        // Fallback: match whatever value is selected
        filtered = allGoals.filter(g => (g.category || '').toLowerCase() === selected);
    }

    // Optional sort by date
    if (sortOrder && sortOrder.value) {
        const order = sortOrder.value.toLowerCase();
        if (order === 'date-asc') {
            filtered.sort((a, b) => new Date(a.target_date) - new Date(b.target_date));
        } else if (order === 'date-desc') {
            filtered.sort((a, b) => new Date(b.target_date) - new Date(a.target_date));
        }
    }

    // Render filtered results
    displayGoals(filtered);
}

// Update filtered count display
function updateFilteredCount(count) {
    const filteredCount = document.getElementById('filteredCount');
    if (filteredCount) {
        filteredCount.textContent = count;
    }
}

// Show success toast
function showSuccessToast(message) {
    const toast = document.getElementById('successToast');
    const successMessage = document.getElementById('successMessage');
    
    if (toast && successMessage) {
        successMessage.textContent = message;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

// Show error toast
function showErrorToast(message) {
    const toast = document.getElementById('errorToast');
    const errorMessage = document.getElementById('errorMessage');
    
    if (toast && errorMessage) {
        errorMessage.textContent = message;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

// Get CSRF token
function getCSRFToken() {
    return document.querySelector('[name=csrfmiddlewaretoken]')?.value || 
           document.cookie.split('; ').find(row => row.startsWith('csrftoken='))?.split('=')[1];
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeGoalsPage);