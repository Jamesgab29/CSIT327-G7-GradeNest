from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from .models import CustomUser, Profile
import re


# ---------------- REGISTER ----------------
def register(request):
    if request.method == "POST":
        full_name = request.POST.get("full_name", "").strip()
        email = request.POST.get("email", "").strip()
        password = request.POST.get("password1", "")
        confirm_password = request.POST.get("password2", "")

        context = {"full_name": full_name, "email": email}

        try:
            validate_email(email)
        except ValidationError:
            context["email_error"] = "Please enter a valid email address."
            return render(request, "accounts/register.html", context)

        if password != confirm_password:
            context["password_error"] = "Please make sure your passwords match."
            return render(request, "accounts/register.html", context)

        if not re.match(r'^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*_]).{8,}$', password):
            context["password_format_error"] = (
                "Password should have a minimum length of 8 and contain upper and lowercase letters and a special character."
            )
            return render(request, "accounts/register.html", context)

        if CustomUser.objects.filter(email=email).exists():
            messages.error(request, "Email already registered. Please click here to login.")
            return render(request, "accounts/register.html", context)

        user = CustomUser.objects.create_user(
            email=email, full_name=full_name, password=password
        )
        Profile.objects.create(user=user)
        auth_login(request, user, backend="django.contrib.auth.backends.ModelBackend")
        return redirect("accounts:education_level")

    return render(request, "accounts/register.html")


# ---------------- LOGIN ----------------
def user_login(request):
    if request.method == "POST":
        email = request.POST.get("username", "").strip()
        password = request.POST.get("password", "").strip()

        if not email or not password:
            messages.error(request, "Please enter both email and password.")
            return render(request, "accounts/login.html", {"login_input": email})

        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            messages.error(request, "Email not found. Please register first.")
            return render(request, "accounts/login.html", {"login_input": email})

        user_auth = authenticate(request, email=email, password=password)

        if user_auth is not None:
            auth_login(request, user_auth)
            profile, _ = Profile.objects.get_or_create(user=user_auth)

            if not profile.grade_level:
                return redirect("accounts:education_level")

            return redirect("accounts:dashboard")
        else:
            messages.error(request, "Incorrect password. Please try again.")
            return render(request, "accounts/login.html", {"login_input": email})

    return render(request, "accounts/login.html")


# ---------------- EDUCATION LEVEL ----------------
@login_required
def education_level(request):
    profile, _ = Profile.objects.get_or_create(user=request.user)

    if profile.grade_level:
        return redirect("accounts:dashboard")

    if request.method == "POST":
        grade_level = request.POST.get("gradeLevel")
        strand = request.POST.get("strand")
        school_year = request.POST.get("schoolYear")

        if not grade_level or not school_year:
            messages.error(request, "Please complete all required fields.")
            return render(request, "accounts/education-level.html")

        if grade_level in ["Grade 11", "Grade 12"] and not strand:
            messages.error(request, "Please select your strand.")
            return render(request, "accounts/education-level.html")

        profile.grade_level = grade_level
        profile.strand = strand if strand else None
        profile.school_year = school_year
        profile.save()

        return redirect("accounts:dashboard")

    return render(request, "accounts/education-level.html")


# ---------------- DASHBOARD ----------------
@login_required
def dashboard(request):
    profile = Profile.objects.get(user=request.user)
    
    # Determine if JHS or SHS
    isJHS = profile.grade_level in ['Grade 7', 'Grade 8', 'Grade 9', 'Grade 10']
    isSHS = profile.grade_level in ['Grade 11', 'Grade 12']
    
    return render(request, "accounts/dashboard.html", {
        'profile': profile,  # Pass the full profile
        'isJHS': isJHS,      # Pass as a boolean
        'isSHS': isSHS       # Pass as a boolean
    })


# ---------------- LANDING PAGE ----------------
def landing_page(request):
    return render(request, "accounts/landing-page.html")


# ---------------- LOGOUT ----------------
def user_logout(request):
    auth_logout(request)
    return redirect("accounts:landing-page")
