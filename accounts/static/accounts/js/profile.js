// ============================================
// PROFILE PAGE JAVASCRIPT
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Split full name into first and last name
    splitFullName();
    
    initializeProfilePage();

    // Academic Info Edit/Cancel
    document.getElementById('editAcademicInfoBtn').addEventListener('click', function() {
        document.getElementById('academicInfoDisplay').style.display = 'none';
        document.getElementById('academicInfoEdit').style.display = 'block';
    });
    document.getElementById('cancelAcademicEdit').addEventListener('click', function() {
        document.getElementById('academicInfoEdit').style.display = 'none';
        document.getElementById('academicInfoDisplay').style.display = 'block';
    });

});

function splitFullName() {
    const fullNameInput = document.getElementById('firstName');
    const lastNameInput = document.getElementById('lastName');
    
    // If we don't have a last name but we have a full name, split it
    if (!lastNameInput.value && fullNameInput.value && fullNameInput.value.includes(' ')) {
        const nameParts = fullNameInput.value.split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ');
        
        fullNameInput.value = firstName;
        lastNameInput.value = lastName;
    } else if (!lastNameInput.value && fullNameInput.value) {
        // If there's no space, treat the whole thing as first name
        fullNameInput.value = fullNameInput.value;
        lastNameInput.value = '';
    }
}

function initializeProfilePage() {
    // Show/Hide strand field based on grade level
    handleStrandVisibility();
    
    // Form submissions
    setupPersonalInfoForm();
    setupAcademicInfoForm();
    setupSecurityForm();
    
    // Password toggle buttons
    setupPasswordToggles();
    
    // Password strength indicator
    setupPasswordStrengthIndicator();
    
    // Grade level change listener
    document.getElementById('gradeLevel').addEventListener('change', handleStrandVisibility);
}

// ============================================
// STRAND VISIBILITY TOGGLE
// ============================================
function handleStrandVisibility() {
    const gradeLevelSelect = document.getElementById('gradeLevel');
    const strandGroup = document.getElementById('strandGroup');
    const strandSelect = document.getElementById('strand');
    
    const selectedLevel = gradeLevelSelect.value;
    const isSHS = selectedLevel === 'Grade 11' || selectedLevel === 'Grade 12';
    
    if (isSHS) {
        strandGroup.style.display = 'block';
        strandSelect.required = true;
    } else {
        strandGroup.style.display = 'none';
        strandSelect.required = false;
        strandSelect.value = '';
    }
}

// ============================================
// PERSONAL INFORMATION FORM
// ============================================
function setupPersonalInfoForm() {
    const form = document.getElementById('personalInfoForm');
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Clear previous errors
        clearFormErrors(form);
        
        // Get form data
        const firstName = document.getElementById('firstName').value.trim();
        const lastName = document.getElementById('lastName').value.trim();
        const email = document.getElementById('email').value.trim();
        
        // Validate
        let isValid = true;
        
        if (!firstName) {
            showFieldError('firstName', 'First name is required');
            isValid = false;
        }
        
        if (!lastName) {
            showFieldError('lastName', 'Last name is required');
            isValid = false;
        }
        
        if (!email) {
            showFieldError('email', 'Email is required');
            isValid = false;
        } else if (!isValidEmail(email)) {
            showFieldError('email', 'Invalid email format');
            isValid = false;
        }
        
        if (!isValid) return;
        
        // Disable submit button
        const submitBtn = document.getElementById('savePersonalInfo');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Saving...';
        
        try {
            // Get CSRF token
            const csrftoken = getCookie('csrftoken');
            
            // Make API call
            const response = await fetch('/api/profile/update-personal/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrftoken
                },
                body: JSON.stringify({
                    first_name: firstName,
                    last_name: lastName,
                    email: email
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                showSuccessToast('Personal information updated successfully!');
                
                // Update dashboard greeting
                updateDashboardGreeting(firstName);
            } else {
                throw new Error(data.error || 'Failed to update personal information');
            }
        } catch (error) {
            showErrorToast(error.message);
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M13.333 4L6 11.333 2.667 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg> Save Changes';
        }
    });
}

// ============================================
// ACADEMIC INFORMATION FORM
// ============================================
function setupAcademicInfoForm() {
    const form = document.getElementById('academicInfoForm');
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        clearFormErrors(form);

        const gradeLevel = document.getElementById('gradeLevel').value;
        const strand = document.getElementById('strand').value;
        let isValid = true;

        if (!gradeLevel) {
            showFieldError('gradeLevel', 'School level is required');
            isValid = false;
        }
        const isSHS = gradeLevel === 'Grade 11' || gradeLevel === 'Grade 12';
        if (isSHS && !strand) {
            showFieldError('strand', 'Strand is required for Senior High School');
            isValid = false;
        }
        if (!isValid) return;

        const submitBtn = document.getElementById('saveAcademicInfo');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Saving...';

        try {
            const csrftoken = getCookie('csrftoken');
            const response = await fetch('/api/profile/update-academic/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrftoken
                },
                body: JSON.stringify({
                    grade_level: gradeLevel,
                    strand: isSHS ? strand : null
                })
            });
            const data = await response.json();
            if (response.ok) {
                showSuccessToast('Academic information updated successfully!');
                // Update display
                document.getElementById('displayGradeLevel').textContent = gradeLevel;
                if (isSHS) {
                    document.getElementById('displayStrand').textContent = strand;
                    document.getElementById('displayStrandGroup').style.display = '';
                } else {
                    document.getElementById('displayStrand').textContent = '—';
                    document.getElementById('displayStrandGroup').style.display = 'none';
                }
                document.getElementById('academicInfoEdit').style.display = 'none';
                document.getElementById('academicInfoDisplay').style.display = 'block';

                updateSidebarLevel(gradeLevel);

                // Automatic progression modal if needed
                if (data.progression_required) {
                    showProgressionModal(data.completed_year, data.next_level);
                }
            } else {
                throw new Error(data.error || 'Failed to update academic information');
            }
        } catch (error) {
            showErrorToast(error.message);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Save Changes';
        }
    });
}

// ============================================
// SECURITY FORM (PASSWORD UPDATE)
// ============================================
function setupSecurityForm() {
    const form = document.getElementById('securityForm');
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Clear previous errors
        clearFormErrors(form);
        
        // Get form data
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        // Validate
        let isValid = true;
        
        if (!currentPassword) {
            showFieldError('currentPassword', 'Current password is required');
            isValid = false;
        }
        
        if (!newPassword) {
            showFieldError('newPassword', 'New password is required');
            isValid = false;
        } else if (!isPasswordStrong(newPassword)) {
            showFieldError('newPassword', 'Password does not meet requirements');
            isValid = false;
        }
        
        if (!confirmPassword) {
            showFieldError('confirmPassword', 'Please confirm your password');
            isValid = false;
        } else if (newPassword !== confirmPassword) {
            showFieldError('confirmPassword', 'Passwords do not match');
            isValid = false;
        }
        
        if (!isValid) return;
        
        // Disable submit button
        const submitBtn = document.getElementById('updatePassword');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Updating...';
        
        try {
            // Get CSRF token
            const csrftoken = getCookie('csrftoken');
            
            // Make API call
            const response = await fetch('/api/profile/update-password/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrftoken
                },
                body: JSON.stringify({
                    current_password: currentPassword,
                    new_password: newPassword
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                showSuccessToast('Password updated successfully!');
                form.reset();
                resetPasswordRequirements();
            } else {
                throw new Error(data.error || 'Failed to update password');
            }
        } catch (error) {
            showErrorToast(error.message);
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M13.333 4L6 11.333 2.667 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg> Update Password';
        }
    });
}

// ============================================
// PASSWORD TOGGLE BUTTONS
// ============================================
function setupPasswordToggles() {
    const toggleButtons = document.querySelectorAll('.toggle-password');
    
    toggleButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetId = this.dataset.target;
            const input = document.getElementById(targetId);
            
            if (input.type === 'password') {
                input.type = 'text';
                this.innerHTML = '<svg class="eye-icon" width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M2 10s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6z" stroke="currentColor" stroke-width="2"/><line x1="2" y1="2" x2="18" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
            } else {
                input.type = 'password';
                this.innerHTML = '<svg class="eye-icon" width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 4C5 4 1.73 7.11 1 10c.73 2.89 4 6 9 6s8.27-3.11 9-6c-.73-2.89-4-6-9-6z" stroke="currentColor" stroke-width="2"/><circle cx="10" cy="10" r="3" stroke="currentColor" stroke-width="2"/></svg>';
            }
        });
    });
}

// ============================================
// PASSWORD STRENGTH INDICATOR
// ============================================
function setupPasswordStrengthIndicator() {
    const newPasswordInput = document.getElementById('newPassword');
    
    newPasswordInput.addEventListener('input', function() {
        const password = this.value;
        
        // Check length
        const reqLength = document.getElementById('reqLength');
        if (password.length >= 8) {
            reqLength.classList.add('met');
        } else {
            reqLength.classList.remove('met');
        }
        
        // Check uppercase
        const reqUppercase = document.getElementById('reqUppercase');
        if (/[A-Z]/.test(password)) {
            reqUppercase.classList.add('met');
        } else {
            reqUppercase.classList.remove('met');
        }
        
        // Check lowercase
        const reqLowercase = document.getElementById('reqLowercase');
        if (/[a-z]/.test(password)) {
            reqLowercase.classList.add('met');
        } else {
            reqLowercase.classList.remove('met');
        }
        
        // Check number
        const reqNumber = document.getElementById('reqNumber');
        if (/[0-9]/.test(password)) {
            reqNumber.classList.add('met');
        } else {
            reqNumber.classList.remove('met');
        }
    });
}

function resetPasswordRequirements() {
    const requirements = ['reqLength', 'reqUppercase', 'reqLowercase', 'reqNumber'];
    requirements.forEach(id => {
        document.getElementById(id).classList.remove('met');
    });
}

// ============================================
// PROGRESSION MODAL
// ============================================
function showProgressionModal(completedYear, nextLevel) {
    const modal = document.getElementById('progressionModal');
    document.getElementById('completedYear').textContent = completedYear;
    document.getElementById('nextLevel').textContent = nextLevel;
    
    modal.classList.add('show');
    
    // Confirm button
    document.getElementById('btnConfirmProgression').onclick = async function() {
        try {
            const csrftoken = getCookie('csrftoken');
            
            const response = await fetch('/api/profile/confirm-progression/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrftoken
                },
                body: JSON.stringify({
                    next_level: nextLevel
                })
            });
            
            if (response.ok) {
                showSuccessToast(`Level updated to ${nextLevel}!`);
                modal.classList.remove('show');
                
                // Update UI
                document.getElementById('gradeLevel').value = nextLevel;
                updateSidebarLevel(nextLevel);
            } else {
                throw new Error('Failed to confirm progression');
            }
        } catch (error) {
            showErrorToast(error.message);
        }
    };
    
    // Cancel button
    document.getElementById('btnCancelProgression').onclick = function() {
        modal.classList.remove('show');
    };
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isPasswordStrong(password) {
    return password.length >= 8 &&
           /[A-Z]/.test(password) &&
           /[a-z]/.test(password) &&
           /[0-9]/.test(password);
}

function showFieldError(fieldId, message) {
    const input = document.getElementById(fieldId);
    const errorSpan = document.getElementById(`${fieldId}Error`);
    
    input.classList.add('error');
    const group = input.closest('.form-group');
    if (group) group.classList.add('has-error');
    errorSpan.textContent = message;
}

function clearFormErrors(form) {
    const inputs = form.querySelectorAll('.form-input, .form-select');
    inputs.forEach(input => input.classList.remove('error'));
    
    const errors = form.querySelectorAll('.form-error');
    errors.forEach(error => error.textContent = '');

    const groups = form.querySelectorAll('.form-group.has-error');
    groups.forEach(group => group.classList.remove('has-error'));
}

function showSuccessToast(message) {
    const toast = document.getElementById('successToast');
    const messageEl = document.getElementById('successMessage');
    
    messageEl.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 4000);
}

function showErrorToast(message) {
    const toast = document.getElementById('errorToast');
    const messageEl = document.getElementById('errorMessage');
    
    messageEl.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 4000);
}

function updateDashboardGreeting(firstName) {
    // Update topbar
    const topbarName = document.getElementById('topbarProfileName');
    if (topbarName) {
        topbarName.textContent = firstName;
    }
    
    // Update sidebar
    const sidebarName = document.querySelector('.user-name');
    if (sidebarName) {
        sidebarName.textContent = firstName;
    }
    
    // Update dashboard welcome (if on dashboard)
    const welcomeText = document.querySelector('.user-highlight');
    if (welcomeText) {
        welcomeText.textContent = firstName;
    }
}

function updateSidebarLevel(gradeLevel) {
    const levelDisplay = document.querySelector('.user-level');
    if (levelDisplay) {
        levelDisplay.textContent = gradeLevel;
    }
}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}