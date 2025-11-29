document.addEventListener('DOMContentLoaded', function () {
	initTabs();
	setupPersonalInfoForm();
	setupSecurityForm();
	setupPasswordToggles();
	setupPasswordStrengthIndicator();
});

function initTabs() {
	const buttons = document.querySelectorAll('.tab-btn');
	const panels = document.querySelectorAll('.tab-panel');
	buttons.forEach(btn => {
		btn.addEventListener('click', () => {
			const target = btn.dataset.tab;
			buttons.forEach(b => b.classList.remove('active'));
			panels.forEach(p => p.classList.remove('active'));
			btn.classList.add('active');
			const panel = document.getElementById(`tab-${target}`);
			if (panel) panel.classList.add('active');
		});
	});
}

function setupPersonalInfoForm() {
	const form = document.getElementById('personalInfoForm');
	if (!form) return;
	form.addEventListener('submit', async function (e) {
		e.preventDefault();
		clearFormErrors(form);
		const firstName = document.getElementById('firstName').value.trim();
		const lastName = document.getElementById('lastName').value.trim();
		const email = document.getElementById('email').value.trim();

		let isValid = true;
		if (!firstName) { showFieldError('firstName', 'First name is required'); isValid = false; }
		if (!lastName) { showFieldError('lastName', 'Last name is required'); isValid = false; }
		if (!email) { showFieldError('email', 'Email is required'); isValid = false; }
		else if (!isValidEmail(email)) { showFieldError('email', 'Invalid email format'); isValid = false; }
		if (!isValid) return;

		const submitBtn = document.getElementById('savePersonalInfo');
		submitBtn.disabled = true;
		submitBtn.textContent = 'Saving...';
		try {
			const csrftoken = getCookie('csrftoken');
			const response = await fetch('/api/profile/update-personal/', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrftoken },
				body: JSON.stringify({ first_name: firstName, last_name: lastName, email })
			});
			const data = await response.json();
			if (response.ok) {
				showSuccessToast('Personal information updated successfully!');
				updateDashboardGreeting(firstName);
			} else { throw new Error(data.error || 'Failed to update personal information'); }
		} catch (err) {
			showErrorToast(err.message);
		} finally {
			submitBtn.disabled = false;
			submitBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M13.333 4L6 11.333 2.667 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg> Save Changes';
		}
	});
}

function setupSecurityForm() {
	const form = document.getElementById('securityForm');
	if (!form) return;
	form.addEventListener('submit', async function (e) {
		e.preventDefault();
		clearFormErrors(form);
		const currentPassword = document.getElementById('currentPassword').value;
		const newPassword = document.getElementById('newPassword').value;
		const confirmPassword = document.getElementById('confirmPassword').value;

		let isValid = true;
		if (!currentPassword) { showFieldError('currentPassword', 'Current password is required'); isValid = false; }
		if (!newPassword) { showFieldError('newPassword', 'New password is required'); isValid = false; }
		else if (!isPasswordStrong(newPassword)) { showFieldError('newPassword', 'Password does not meet requirements'); isValid = false; }
		if (!confirmPassword) { showFieldError('confirmPassword', 'Please confirm your password'); isValid = false; }
		else if (newPassword !== confirmPassword) { showFieldError('confirmPassword', 'Passwords do not match'); isValid = false; }
		if (!isValid) return;

		const submitBtn = document.getElementById('updatePassword');
		submitBtn.disabled = true;
		submitBtn.textContent = 'Updating...';
		try {
			const csrftoken = getCookie('csrftoken');
			const response = await fetch('/api/profile/update-password/', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrftoken },
				body: JSON.stringify({ current_password: currentPassword, new_password: newPassword })
			});
			const data = await response.json();
			if (response.ok) {
				showSuccessToast('Password updated successfully!');
				form.reset();
				resetPasswordRequirements();
			} else { throw new Error(data.error || 'Failed to update password'); }
		} catch (err) {
			showErrorToast(err.message);
		} finally {
			submitBtn.disabled = false;
			submitBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M13.333 4L6 11.333 2.667 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg> Update Password';
		}
	});
}

function setupPasswordToggles() {
	document.querySelectorAll('.toggle-password').forEach(button => {
		button.addEventListener('click', function () {
			const targetId = this.dataset.target;
			const input = document.getElementById(targetId);
			if (!input) return;
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

function setupPasswordStrengthIndicator() {
	const newPasswordInput = document.getElementById('newPassword');
	if (!newPasswordInput) return;
	newPasswordInput.addEventListener('input', function () {
		const password = this.value;
		toggleRequirement('reqLength', password.length >= 8);
		toggleRequirement('reqUppercase', /[A-Z]/.test(password));
		toggleRequirement('reqLowercase', /[a-z]/.test(password));
		toggleRequirement('reqNumber', /[0-9]/.test(password));
	});
}

function toggleRequirement(id, met) {
	const el = document.getElementById(id);
	if (!el) return;
	if (met) el.classList.add('met');
	else el.classList.remove('met');
}

// Helpers (mirroring profile.js)
function isValidEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }
function isPasswordStrong(password) { return password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password); }
function showFieldError(fieldId, message) {
	const input = document.getElementById(fieldId);
	const errorSpan = document.getElementById(`${fieldId}Error`);
	if (input) {
		input.classList.add('error');
		const group = input.closest('.form-group');
		if (group) group.classList.add('has-error');
	}
	if (errorSpan) errorSpan.textContent = message;
}
function clearFormErrors(form) {
	const inputs = form.querySelectorAll('.form-input, .form-select');
	inputs.forEach(input => input.classList.remove('error'));
	const errors = form.querySelectorAll('.form-error');
	errors.forEach(error => error.textContent = '');
	const groups = form.querySelectorAll('.form-group.has-error');
	groups.forEach(group => group.classList.remove('has-error'));
}
function showSuccessToast(message) { showToast('successToast', 'successMessage', message); }
function showErrorToast(message) { showToast('errorToast', 'errorMessage', message); }
function showToast(toastId, messageId, message) {
	const toast = document.getElementById(toastId);
	const messageEl = document.getElementById(messageId);
	if (!toast || !messageEl) return;
	messageEl.textContent = message;
	toast.classList.add('show');
	setTimeout(() => toast.classList.remove('show'), 4000);
}
function updateDashboardGreeting(firstName) {
	const topbarName = document.getElementById('topbarProfileName');
	if (topbarName) topbarName.textContent = firstName;
	const sidebarName = document.querySelector('.user-name');
	if (sidebarName) sidebarName.textContent = firstName;
	const welcomeText = document.querySelector('.user-highlight');
	if (welcomeText) welcomeText.textContent = firstName;
}
function resetPasswordRequirements() {
	['reqLength','reqUppercase','reqLowercase','reqNumber'].forEach(id => {
		const el = document.getElementById(id);
		if (el) el.classList.remove('met');
	});
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

