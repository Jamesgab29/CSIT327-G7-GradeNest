document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registerForm");

  const name = document.getElementById("name");
  const email = document.getElementById("email");
  const password = document.getElementById("password");
  const confirmPassword = document.getElementById("confirmPassword");
  const terms = document.getElementById("terms");

  const nameError = document.getElementById("nameError");
  const emailError = document.getElementById("emailError");
  const passwordError = document.getElementById("passwordError");
  const confirmPasswordError = document.getElementById("confirmPasswordError");
  const termsError = document.getElementById("termsError");

  const togglePassword = document.getElementById("togglePassword");

  // demo registered emails
  const registeredEmails = ["test@example.com"];

  // toggle show/hide password
  togglePassword.addEventListener("click", () => {
    password.type = password.type === "password" ? "text" : "password";
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    let valid = true;

    // reset error states
    [nameError, emailError, passwordError, confirmPasswordError, termsError].forEach(err => {
      err.style.display = "none";
    });
    [name, email, password, confirmPassword].forEach(input => input.classList.remove("input-error"));

    // name validation (letters and spaces only)
    const namePattern = /^[A-Za-z\s]+$/;
    if (name.value.trim() === "") {
      nameError.innerText = "Name is required";
      nameError.style.display = "block";
      name.classList.add("input-error");
      valid = false;
    } else if (!namePattern.test(name.value.trim())) {
      nameError.innerText = "Please enter a valid name";
      nameError.style.display = "block";
      name.classList.add("input-error");
      valid = false;
    }

    // email validation
    const emailPattern = /^[^ ]+@[^ ]+\.[a-z]{2,}$/;
    if (email.value.trim() === "") {
      emailError.innerText = "Email is required";
      emailError.style.display = "block";
      email.classList.add("input-error");
      valid = false;
    } else if (!email.value.match(emailPattern)) {
      emailError.innerText = "Please enter a valid email address";
      emailError.style.display = "block";
      email.classList.add("input-error");
      valid = false;
    } else if (registeredEmails.includes(email.value.trim())) {
      emailError.innerText = "Email already registered. Please click here to login.";
      emailError.style.display = "block";
      email.classList.add("input-error");
      valid = false;
    }

    // password validation
    const passwordPattern = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
    if (password.value.trim() === "") {
      passwordError.innerText = "Password is required";
      passwordError.style.display = "block";
      password.classList.add("input-error");
      valid = false;
    } else if (!password.value.match(passwordPattern)) {
      passwordError.innerText = "Password should have 8+ chars, 1 uppercase, 1 number, 1 special char";
      passwordError.style.display = "block";
      password.classList.add("input-error");
      valid = false;
    }

    // confirm password
    if (confirmPassword.value.trim() === "") {
      confirmPasswordError.innerText = "Confirm Password is required";
      confirmPasswordError.style.display = "block";
      confirmPassword.classList.add("input-error");
      valid = false;
    } else if (password.value !== confirmPassword.value) {
      confirmPasswordError.innerText = "Passwords don't match";
      confirmPasswordError.style.display = "block";
      confirmPassword.classList.add("input-error");
      valid = false;
    }

    // terms
    if (!terms.checked) {
      termsError.innerText = "You must accept the terms and conditions to register an account.";
      termsError.style.display = "block";
      valid = false;
    }

    if (!valid) return;

    // hash password (simple simulation for now)
    const hashedPassword = btoa(password.value);

    showSuccessToast('Registration successful! Redirecting to Education Level Page...');
    console.log({
      name: name.value,
      email: email.value,
      password: hashedPassword
    });

    // redirect simulation for now
window.location.href = "/accounts/education-level/";
  });
});