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