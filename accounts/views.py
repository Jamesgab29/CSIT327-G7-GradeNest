from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from .models import CustomUser, Profile, Quarter, Subject, Component
from django.core.mail import send_mail
from django.http import HttpResponse, JsonResponse
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


# ---------------- test-email ----------------
def test_email(request):
    send_mail(
        subject="GradeNest Email Test",
        message="This is a test email from your Django project!",
        from_email=None,  # uses DEFAULT_FROM_EMAIL in settings.py
        recipient_list=["jamesgabrielflorescotiangco@gmail.com"],  # 👈 your email here
        fail_silently=False,
    )
    return HttpResponse("✅ Test email sent successfully! Check your Gmail inbox.")


# ------------------- QUARTER CRUD -------------------

@login_required
def quarters_list(request):
    quarters = Quarter.objects.filter(user=request.user).values('id', 'name')
    return JsonResponse({'quarters': list(quarters)})

@login_required
def add_quarter(request):
    if request.method == 'POST':
        name = request.POST.get('name')
        if name:
            quarter = Quarter.objects.create(name=name, user=request.user)
            return JsonResponse({'id': quarter.id, 'name': quarter.name})
    return JsonResponse({'error': 'Invalid data'}, status=400)

@login_required
def update_quarter(request, quarter_id):
    if request.method == 'POST':
        quarter = get_object_or_404(Quarter, id=quarter_id, user=request.user)
        name = request.POST.get('name')
        if name:
            quarter.name = name
            quarter.save()
            return JsonResponse({'id': quarter.id, 'name': quarter.name})
    return JsonResponse({'error': 'Invalid data'}, status=400)

@login_required
def delete_quarter(request, quarter_id):
    if request.method == 'POST':
        quarter = get_object_or_404(Quarter, id=quarter_id, user=request.user)
        quarter.delete()
        return JsonResponse({'success': True})
    return JsonResponse({'error': 'Invalid method'}, status=400)


# ------------------- SUBJECT CRUD -------------------

@login_required
def subjects_list(request):
    quarter_id = request.GET.get('quarter_id')
    if quarter_id:
        subjects = Subject.objects.filter(quarter_id=quarter_id).values('id', 'name', 'quarter_id')
    else:
        subjects = Subject.objects.all().values('id', 'name', 'quarter_id')
    return JsonResponse({'subjects': list(subjects)})

@login_required
def add_subject(request):
    if request.method == 'POST':
        name = request.POST.get('name')
        quarter_id = request.POST.get('quarter_id')
        if name and quarter_id:
            quarter = get_object_or_404(Quarter, id=quarter_id)
            subject = Subject.objects.create(name=name, quarter=quarter)
            return JsonResponse({'id': subject.id, 'name': subject.name, 'quarter_id': subject.quarter.id})
    return JsonResponse({'error': 'Invalid data'}, status=400)

@login_required
def update_subject(request, subject_id):
    if request.method == 'POST':
        subject = get_object_or_404(Subject, id=subject_id)
        name = request.POST.get('name')
        if name:
            subject.name = name
            subject.save()
            return JsonResponse({'id': subject.id, 'name': subject.name})
    return JsonResponse({'error': 'Invalid data'}, status=400)

@login_required
def delete_subject(request, subject_id):
    if request.method == 'POST':
        subject = get_object_or_404(Subject, id=subject_id)
        subject.delete()
        return JsonResponse({'success': True})
    return JsonResponse({'error': 'Invalid method'}, status=400)


# ------------------- COMPONENT CRUD -------------------

@login_required
def components_list(request):
    quarter_id = request.GET.get('quarter_id')
    subject_id = request.GET.get('subject_id')
    
    components = Component.objects.select_related('quarter', 'subject').all()
    
    if quarter_id:
        components = components.filter(quarter_id=quarter_id)
    if subject_id:
        components = components.filter(subject_id=subject_id)
    
    data = [{
        'id': c.id,
        'name': c.name,
        'quarter': c.quarter.name,
        'quarter_id': c.quarter.id,
        'subject': c.subject.name,
        'subject_id': c.subject.id,
        'score': c.score,
        'highest_score': c.highest_score,
        'component_type': c.component_type
    } for c in components]
    return JsonResponse({'components': data})

@login_required
def add_component(request):
    if request.method == 'POST':
        quarter_id = request.POST.get('quarter_id')
        subject_id = request.POST.get('subject_id')
        name = request.POST.get('name')
        score = float(request.POST.get('score', 0))
        highest_score = float(request.POST.get('highest_score', 100))
        component_type = request.POST.get('component_type', 'WW')

        if quarter_id and subject_id and name:
            quarter = get_object_or_404(Quarter, id=quarter_id)
            subject = get_object_or_404(Subject, id=subject_id)
            component = Component.objects.create(
                quarter=quarter,
                subject=subject,
                name=name,
                score=score,
                highest_score=highest_score,
                component_type=component_type
            )
            return JsonResponse({
                'id': component.id,
                'name': component.name,
                'quarter': component.quarter.name,
                'subject': component.subject.name,
                'score': component.score,
                'highest_score': component.highest_score,
                'component_type': component.component_type
            })
    return JsonResponse({'error': 'Invalid data'}, status=400)

@login_required
def update_component(request, component_id):
    if request.method == 'POST':
        component = get_object_or_404(Component, id=component_id)
        
        name = request.POST.get('name')
        score = request.POST.get('score')
        highest_score = request.POST.get('highest_score')
        component_type = request.POST.get('component_type')
        
        if name:
            component.name = name
        if score is not None:
            component.score = float(score)
        if highest_score is not None:
            component.highest_score = float(highest_score)
        if component_type:
            component.component_type = component_type
            
        component.save()
        return JsonResponse({
            'id': component.id,
            'name': component.name,
            'quarter': component.quarter.name,
            'subject': component.subject.name,
            'score': component.score,
            'highest_score': component.highest_score,
            'component_type': component.component_type
        })
    return JsonResponse({'error': 'Invalid data'}, status=400)

@login_required
def delete_component(request, component_id):
    if request.method == 'POST':
        component = get_object_or_404(Component, id=component_id)
        component.delete()
        return JsonResponse({'success': True})
    return JsonResponse({'error': 'Invalid method'}, status=400)