from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from .models import CustomUser, Profile, Quarter, Subject, Component, Goal
from django.core.mail import send_mail
from django.http import HttpResponse, JsonResponse
from django.db.models import F
from django.utils import timezone
import re
import json

# SHS Subjects by Strand, Grade, Semester, and Quarter
SHS_SUBJECTS = {
        'STEM': {
            'Grade 11': {
                'First Semester': {
                    'First Quarter': [
                        'Oral Communication in Context',
                        'Komunikasyon at Pananaliksik sa Wika at Kulturang Pilipino',
                        'General Mathematics',
                        'Earth and Life Science',
                        'Introduction to Philosophy of the Human Person',
                        'Physical Education & Health 1',
                        'Pre-Calculus',
                        'General Biology 1'
                    ],
                    'Second Quarter': [
                        'Reading and Writing Skills',
                        'Pagbasa at Pagsusuri ng Iba\'t Ibang Teksto Tungo sa Pananaliksik',
                        'Statistics and Probability',
                        'Physical Science',
                        'Personal Development',
                        'Physical Education & Health 2',
                        'English for Academic and Professional Purposes',
                        'General Chemistry 1'
                    ]
                },
                'Second Semester': {
                    'First Quarter': [
                        '21st Century Literature from the Philippines and the World',
                        'Understanding Culture, Society, and Politics',
                        'Practical Research 1 (Qualitative)',
                        'Practical Research 2 (Quantitative)',
                        'Empowerment Technologies',
                        'Basic Calculus',
                        'General Biology 2',
                        'General Physics 1'
                    ],
                    'Second Quarter': [
                        'Contemporary Philippine Arts from the Regions',
                        'Media and Information Literacy',
                        'Filipino sa Piling Larangan',
                        'Buffer Subject / Elective',
                        'General Chemistry 2'
                    ]
                }
            },
            'Grade 12': {
                'First Semester': {
                    'First Quarter': [
                        'Entrepreneurship',
                        'Physical Education & Health 3',
                        'General Physics 2',
                        'Disaster Readiness and Risk Reduction'
                    ],
                    'Second Quarter': [
                        'Inquiries, Investigations, and Immersion',
                        'Physical Education & Health 3 (Cont.)'
                    ]
                },
                'Second Semester': {
                    'First Quarter': [
                        'Physical Education & Health 4',
                        'Work Immersion / Research Project (Part 1)'
                    ],
                    'Second Quarter': [
                        'Work Immersion / Research Project (Part 2)'
                    ]
                }
            }
        },
        'ABM': {
            'Grade 11': {
                'First Semester': {
                    'First Quarter': [
                        'Oral Communication in Context',
                        'Komunikasyon at Pananaliksik sa Wika at Kulturang Pilipino',
                        'General Mathematics',
                        'Earth and Life Science',
                        'Introduction to Philosophy of the Human Person',
                        'Physical Education & Health 1',
                        'English for Academic and Professional Purposes',
                        'Fundamentals of Accountancy, Business & Mgt 1'
                    ],
                    'Second Quarter': [
                        'Reading and Writing Skills',
                        'Pagbasa at Pagsusuri ng Iba\'t Ibang Teksto Tungo sa Pananaliksik',
                        'Statistics and Probability',
                        'Physical Science',
                        'Personal Development',
                        'Physical Education & Health 2',
                        'Practical Research 1 (Qualitative)',
                        'Business Mathematics'
                    ]
                },
                'Second Semester': {
                    'First Quarter': [
                        '21st Century Literature from the Philippines and the World',
                        'Understanding Culture, Society, and Politics',
                        'Media and Information Literacy',
                        'Practical Research 2 (Quantitative)',
                        'Empowerment Technologies',
                        'Organization and Management',
                        'Principles of Marketing',
                        'Applied Economics'
                    ],
                    'Second Quarter': [
                        'Contemporary Philippine Arts from the Regions',
                        'Filipino sa Piling Larangan',
                        'Buffer Subject / Elective',
                        'Buffer Subject / Elective',
                        'Fundamentals of Accountancy, Business & Mgt 1 (Cont.)'
                    ]
                }
            },
            'Grade 12': {
                'First Semester': {
                    'First Quarter': [
                        'Entrepreneurship',
                        'Physical Education & Health 3',
                        'Fundamentals of Accountancy, Business & Mgt 2',
                        'Business Finance'
                    ],
                    'Second Quarter': [
                        'Inquiries, Investigations, and Immersion',
                        'Physical Education & Health 3 (Cont.)',
                        'Business Finance (Cont.)',
                        'Business Ethics and Social Responsibility'
                    ]
                },
                'Second Semester': {
                    'First Quarter': [
                        'Physical Education & Health 4',
                        'Work Immersion / Business Enterprise Simulation (Part 1)'
                    ],
                    'Second Quarter': [
                        'Physical Education & Health 4 (Cont.)',
                        'Work Immersion / Business Enterprise Simulation (Part 2)'
                    ]
                }
            }
        },
        'HUMSS': {
            'Grade 11': {
                'First Semester': {
                    'First Quarter': [
                        'Oral Communication in Context',
                        'Komunikasyon at Pananaliksik sa Wika at Kulturang Pilipino',
                        'General Mathematics',
                        'Earth and Life Science',
                        'Introduction to Philosophy of the Human Person',
                        'Physical Education & Health 1',
                        'English for Academic and Professional Purposes',
                        'Philippine Politics and Governance'
                    ],
                    'Second Quarter': [
                        'Reading and Writing Skills',
                        'Pagbasa at Pagsusuri ng Iba\'t Ibang Teksto Tungo sa Pananaliksik',
                        'Statistics and Probability',
                        'Physical Science',
                        'Personal Development',
                        'Physical Education & Health 2',
                        'Practical Research 1 (Qualitative)',
                        'Disciplines and Ideas in the Social Sciences'
                    ]
                },
                'Second Semester': {
                    'First Quarter': [
                        '21st Century Literature from the Philippines and the World',
                        'Understanding Culture, Society, and Politics',
                        'Media and Information Literacy',
                        'Practical Research 2 (Quantitative)',
                        'Empowerment Technologies',
                        'Disciplines and Ideas in the Applied Social Sciences',
                        'Introduction to World Religions and Belief Systems',
                        'Creative Writing'
                    ],
                    'Second Quarter': [
                        'Contemporary Philippine Arts from the Regions',
                        'Filipino sa Piling Larangan',
                        'Buffer Subject / Elective',
                        'Buffer Subject / Elective',
                        'Introduction to World Religions and Belief Systems (Cont.)'
                    ]
                }
            },
            'Grade 12': {
                'First Semester': {
                    'First Quarter': [
                        'Entrepreneurship',
                        'Physical Education & Health 3',
                        'Community Engagement, Solidarity, and Citizenship',
                        'Creative Non-Fiction'
                    ],
                    'Second Quarter': [
                        'Inquiries, Investigations, and Immersion',
                        'Physical Education & Health 3 (Cont.)',
                        'Community Engagement, Solidarity, and Citizenship (Cont.)',
                        'Trends, Networks, and Critical Thinking in the 21st Century Culture'
                    ]
                },
                'Second Semester': {
                    'First Quarter': [
                        'Physical Education & Health 4',
                        'Work Immersion / Research (Part 1)'
                    ],
                    'Second Quarter': [
                        'Physical Education & Health 4 (Cont.)',
                        'Work Immersion / Research (Part 2)'
                    ]
                }
            }
        },
        'GAS': {
            'Grade 11': {
                'First Semester': {
                    'First Quarter': [
                        'Oral Communication in Context',
                        'Komunikasyon at Pananaliksik sa Wika at Kulturang Pilipino',
                        'General Mathematics',
                        'Earth and Life Science',
                        'Introduction to Philosophy of the Human Person',
                        'Physical Education & Health 1',
                        'English for Academic and Professional Purposes',
                        'Humanities 1'
                    ],
                    'Second Quarter': [
                        'Reading and Writing Skills',
                        'Pagbasa at Pagsusuri ng Iba\'t Ibang Teksto Tungo sa Pananaliksik',
                        'Statistics and Probability',
                        'Physical Science',
                        'Personal Development',
                        'Physical Education & Health 2',
                        'Practical Research 1 (Qualitative)',
                        'Social Science 1'
                    ]
                },
                'Second Semester': {
                    'First Quarter': [
                        '21st Century Literature from the Philippines and the World',
                        'Understanding Culture, Society, and Politics',
                        'Media and Information Literacy',
                        'Practical Research 2 (Quantitative)',
                        'Empowerment Technologies',
                        'Organization and Management',
                        'Disaster Readiness and Risk Reduction',
                        'Elective 1'
                    ],
                    'Second Quarter': [
                        'Contemporary Philippine Arts from the Regions',
                        'Filipino sa Piling Larangan',
                        'Buffer Subject / Elective',
                        'Buffer Subject / Elective',
                        'Elective 1 (Cont.)'
                    ]
                }
            },
            'Grade 12': {
                'First Semester': {
                    'First Quarter': [
                        'Entrepreneurship',
                        'Physical Education & Health 3',
                        'Humanities 2',
                        'Applied Economics'
                    ],
                    'Second Quarter': [
                        'Inquiries, Investigations, and Immersion',
                        'Physical Education & Health 3 (Cont.)',
                        'Humanities 2 (Cont.)',
                        'Applied Economics (Cont.)'
                    ]
                },
                'Second Semester': {
                    'First Quarter': [
                        'Physical Education & Health 4',
                        'Elective 2 (Part 1)',
                        'Work Immersion / Research / Career Advocacy (Part 1)'
                    ],
                    'Second Quarter': [
                        'Physical Education & Health 4 (Cont.)',
                        'Elective 2 (Part 2)',
                        'Work Immersion / Research / Career Advocacy (Part 2)'
                    ]
                }
            }
        }
    }


# ---------------- TRANSFORMATION DATA ----------------
# DepEd Grade Transmutation Table (Initial Grade to Transmuted Grade)
# Based on DepEd Order No. 8, s. 2015
TRANSMUTATION_TABLE = {
    100: 100, 99: 99, 98: 98, 97: 97, 96: 96,
    95: 95, 94: 94, 93: 93, 92: 92, 91: 91,
    90: 90, 89: 89, 88: 88, 87: 87, 86: 86,
    85: 85, 84: 84, 83: 83, 82: 82, 81: 81,
    80: 80, 79: 79, 78: 78, 77: 77, 76: 76,
    75: 75, 74: 74, 73: 73, 72: 72, 71: 71,
    70: 70, 69: 69, 68: 68, 67: 67, 66: 66,
    65: 65, 64: 64, 63: 63, 62: 62, 61: 61,
    60: 60, 59: 59, 58: 58, 57: 57, 56: 56,
    55: 55, 54: 54, 53: 53, 52: 52, 51: 51,
    50: 50, 49: 49, 48: 48, 47: 47, 46: 46,
    45: 45, 44: 44, 43: 43, 42: 42, 41: 41,
    40: 40, 39: 39, 38: 38, 37: 37, 36: 36,
    35: 35, 34: 34, 33: 33, 32: 32, 31: 31,
    30: 30, 29: 29, 28: 28, 27: 27, 26: 26,
    25: 25, 24: 24, 23: 23, 22: 22, 21: 21,
    20: 20, 19: 19, 18: 18, 17: 17, 16: 16,
    15: 15, 14: 14, 13: 13, 12: 12, 11: 11,
    10: 10, 9: 9, 8: 8, 7: 7, 6: 6,
    5: 5, 4: 4, 3: 3, 2: 2, 1: 1, 0: 0
}


# DepEd Grade Components by Subject Type (Grades 1-10)
COMPONENT_WEIGHTS = {
    'Filipino': {'WW': 30, 'PT': 50, 'QA': 20},
    'English': {'WW': 30, 'PT': 50, 'QA': 20},
    'Mathematics': {'WW': 40, 'PT': 40, 'QA': 20},
    'Science': {'WW': 40, 'PT': 40, 'QA': 20},
    'Araling Panlipunan': {'WW': 30, 'PT': 50, 'QA': 20},
    'Edukasyon sa Pagpapakatao': {'WW': 30, 'PT': 50, 'QA': 20},
    'MAPEH': {'WW': 20, 'PT': 60, 'QA': 20},
    'Technology and Livelihood Education': {'WW': 20, 'PT': 60, 'QA': 20}
}

# SHS Component Weights
SHS_COMPONENT_WEIGHTS = {
    'default': {'WW': 25, 'PT': 50, 'QA': 25},
    'immersion': {'WW': 20, 'PT': 60, 'QA': 20}
}




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

        # Auto-provision quarters and subjects based on education level
        provision_academic_structure(request.user, grade_level, strand)

        return redirect("accounts:dashboard")

    return render(request, "accounts/education-level.html")

# ---------------- DASHBOARD ----------------
def provision_academic_structure(user, grade_level, strand):
    """
    Automatically create quarters and subjects for a user based on their education level.
    JHS: 4 quarters with 8 standard subjects each
    SHS: 4 quarters (2 per semester) with strand-specific subjects
    """
    # Prevent duplicate provisioning
    if Quarter.objects.filter(user=user).exists():
        print(f"Academic structure already exists for user {user.email}")
        return
    
    # JHS Subjects (Grades 7-10)
    JHS_SUBJECTS = [
        'Filipino',
        'English',
        'Mathematics',
        'Science',
        'Araling Panlipunan',
        'Edukasyon sa Pagpapakatao',
        'MAPEH',
        'Technology and Livelihood Education'
    ]
    
    
    
    # Check if user is JHS
    is_jhs = grade_level in ['Grade 7', 'Grade 8', 'Grade 9', 'Grade 10']
    
    if is_jhs:
        # Create 4 quarters for JHS
        quarter_names = ['First Quarter', 'Second Quarter', 'Third Quarter', 'Fourth Quarter']
        
        for quarter_name in quarter_names:
            quarter = Quarter.objects.create(name=quarter_name, user=user)
            
            # Add 8 standard JHS subjects to each quarter
            for subject_name in JHS_SUBJECTS:
                Subject.objects.create(name=subject_name, quarter=quarter)
    
    else:  # SHS (Grade 11 or 12)
        # For SHS, create 4 quarters organized by semester
        # First Semester: Quarter 1 & 2
        # Second Semester: Quarter 3 & 4
        
        semesters = ['First Semester', 'Second Semester']
        quarter_names_per_semester = ['First Quarter', 'Second Quarter']
        
        # Get strand-specific subjects
        strand_subjects = SHS_SUBJECTS.get(strand, SHS_SUBJECTS['STEM'])  # Default to STEM if strand not found
        grade_subjects = strand_subjects.get(grade_level, {})
        
        for semester_name in semesters:
            semester_subjects = grade_subjects.get(semester_name, {})
            
            for quarter_name in quarter_names_per_semester:
                # Create quarter with semester reference
                quarter = Quarter.objects.create(
                    name=quarter_name,
                    semester=semester_name,
                    user=user
                )
                
                # Add subjects for this specific quarter
                quarter_subjects = semester_subjects.get(quarter_name, [])
                for subject_name in quarter_subjects:
                    Subject.objects.create(name=subject_name, quarter=quarter)
        
        print(f"Provisioned {Quarter.objects.filter(user=user).count()} quarters with subjects for SHS user {user.email}")


# ---------------- DASHBOARD ----------------
@login_required
def dashboard(request):
    profile = Profile.objects.get(user=request.user)
    
    isJHS = profile.grade_level in ['Grade 7', 'Grade 8', 'Grade 9', 'Grade 10']
    isSHS = profile.grade_level in ['Grade 11', 'Grade 12']

    return render(request, "accounts/dashboard.html", {
        'profile': profile,
        'isJHS': isJHS,
        'isSHS': isSHS,
    })


# ---------------- LANDING PAGE ----------------
def landing_page(request):
    return render(request, "accounts/landing-page.html")

# ---------------- GOAL PAGE ----------------
def goal(request):
    profile = Profile.objects.get(user=request.user)
    
    isJHS = profile.grade_level in ['Grade 7', 'Grade 8', 'Grade 9', 'Grade 10']
    isSHS = profile.grade_level in ['Grade 11', 'Grade 12']

    return render(request, "accounts/goal.html", {
        'profile': profile,
        'isJHS': isJHS,
        'isSHS': isSHS,
    })

# ---------------- SETTINGS PAGE ----------------
@login_required
def settings(request):
    profile = Profile.objects.get(user=request.user)
    
    isJHS = profile.grade_level in ['Grade 7', 'Grade 8', 'Grade 9', 'Grade 10']
    isSHS = profile.grade_level in ['Grade 11', 'Grade 12']

    return render(request, "accounts/settings.html", {
        'profile': profile,
        'isJHS': isJHS,
        'isSHS': isSHS,
    })

# ---------------- PROFILE PAGE ----------------
@login_required
def profile(request):
    profile = Profile.objects.get(user=request.user)
    
    isJHS = profile.grade_level in ['Grade 7', 'Grade 8', 'Grade 9', 'Grade 10']
    isSHS = profile.grade_level in ['Grade 11', 'Grade 12']

    return render(request, "accounts/profile.html", {
        'profile': profile,
        'isJHS': isJHS,
        'isSHS': isSHS,
    })

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
    quarters = Quarter.objects.filter(user=request.user).order_by('id')
    data = []
    for q in quarters:
        subjects = Subject.objects.filter(quarter=q).values_list('id', flat=True)
        is_completed = True
        for sid in subjects:
            has_ww = Component.objects.filter(
                quarter=q, subject_id=sid, component_type='WW', score__gte=0, highest_score__gt=0
            ).filter(score__lte=F('highest_score')).exists()
            has_pt = Component.objects.filter(
                quarter=q, subject_id=sid, component_type='PT', score__gte=0, highest_score__gt=0
            ).filter(score__lte=F('highest_score')).exists()
            has_qa = Component.objects.filter(
                quarter=q, subject_id=sid, component_type='QA', score__gte=0, highest_score__gt=0
            ).filter(score__lte=F('highest_score')).exists()
            if not (has_ww and has_pt and has_qa):
                is_completed = False
                break
        data.append({
            'id': q.id,
            'name': q.name,
            'semester': q.semester,
            'is_completed': is_completed
        })
    return JsonResponse({'quarters': data})

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
        name = (request.POST.get('name') or '').strip()
        component_type = (request.POST.get('component_type') or 'WW').strip()

        # Validate numeric inputs safely
        try:
            score = float(request.POST.get('score', '0'))
            highest_score = float(request.POST.get('highest_score', '100'))
        except (TypeError, ValueError):
            return JsonResponse({'error': 'Score and Highest Score must be numeric values.'}, status=400)

        # Validate required fields
        if not name:
            return JsonResponse({'error': 'Component name is required.'}, status=400)
        if not quarter_id:
            return JsonResponse({'error': 'Quarter is required.'}, status=400)
        if not subject_id:
            return JsonResponse({'error': 'Subject is required.'}, status=400)
        if score < 0:
            return JsonResponse({'error': 'Score cannot be negative.'}, status=400)
        if highest_score <= 0:
            return JsonResponse({'error': 'Highest score must be positive.'}, status=400)
        if score > highest_score:
            return JsonResponse({'error': 'Score cannot exceed highest score.'}, status=400)
        if component_type not in ['WW', 'PT', 'QA']:
            return JsonResponse({'error': 'Invalid component type.'}, status=400)

        # Create component
        quarter = get_object_or_404(Quarter, id=quarter_id, user=request.user)
        subject = get_object_or_404(Subject, id=subject_id, quarter=quarter)
        
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
            'quarter_id': component.quarter.id,
            'subject_id': component.subject.id,
            'score': component.score,
            'highest_score': component.highest_score,
            'component_type': component.component_type
        })

    return JsonResponse({'error': 'Invalid method'}, status=400)


@login_required
def update_component(request, component_id):
    if request.method == 'POST':
        component = get_object_or_404(Component, id=component_id)
        name = (request.POST.get('name') or '').strip()
        component_type = (request.POST.get('component_type') or 'WW').strip()

        # Validate numeric inputs safely
        try:
            score = float(request.POST.get('score', '0'))
            highest_score = float(request.POST.get('highest_score', '100'))
        except (TypeError, ValueError):
            return JsonResponse({'error': 'Score and Highest Score must be numeric values.'}, status=400)

        # Validate required fields
        if not name:
            return JsonResponse({'error': 'Component name is required.'}, status=400)
        if score < 0:
            return JsonResponse({'error': 'Score cannot be negative.'}, status=400)
        if highest_score <= 0:
            return JsonResponse({'error': 'Highest score must be positive.'}, status=400)
        if score > highest_score:
            return JsonResponse({'error': 'Score cannot exceed highest score.'}, status=400)
        if component_type not in ['WW', 'PT', 'QA']:
            return JsonResponse({'error': 'Invalid component type.'}, status=400)

        # Update component
        component.name = name
        component.score = score
        component.highest_score = highest_score
        component.component_type = component_type
        component.save()

        return JsonResponse({
            'id': component.id,
            'name': component.name,
            'quarter_id': component.quarter.id,
            'subject_id': component.subject.id,
            'score': component.score,
            'highest_score': component.highest_score,
            'component_type': component.component_type
        })

    return JsonResponse({'error': 'Invalid method'}, status=400)


@login_required
def delete_component(request, component_id):
    if request.method == 'POST':
        component = get_object_or_404(Component, id=component_id)
        component.delete()
        return JsonResponse({'success': True})

    return JsonResponse({'error': 'Invalid method'}, status=400)


@login_required
def update_subject(request, subject_id):
    if request.method == 'POST':
        subject = get_object_or_404(Subject, id=subject_id)
        name = (request.POST.get('name') or '').strip()

        # Validate required fields
        if not name:
            return JsonResponse({'error': 'Subject name is required.'}, status=400)

        # Update subject
        subject.name = name
        subject.save()

        return JsonResponse({
            'id': subject.id,
            'name': subject.name,
            'quarter_id': subject.quarter.id
        })

    return JsonResponse({'error': 'Invalid method'}, status=400)


@login_required
def delete_subject(request, subject_id):
    if request.method == 'POST':
        subject = get_object_or_404(Subject, id=subject_id)
        subject.delete()
        return JsonResponse({'success': True})

    return JsonResponse({'error': 'Invalid method'}, status=400)


# ------------------- GOAL CRUD -------------------

@login_required
def goals_list(request):
    goals = Goal.objects.filter(user=request.user).order_by('-created_at')
    data = [{
        'id': goal.id,
        'title': goal.title,
        'description': goal.description,
        'category': goal.category,
        'target_date': goal.target_date.strftime('%Y-%m-%d'),
        'status': goal.status,
        'created_at': goal.created_at.strftime('%Y-%m-%d %H:%M:%S'),
        'updated_at': goal.updated_at.strftime('%Y-%m-%d %H:%M:%S'),
    } for goal in goals]
    
    return JsonResponse({'goals': data})


@login_required
def add_goal(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            title = data.get('title', '').strip()
            description = data.get('description', '').strip()
            category = data.get('category', '').strip()
            target_date_str = data.get('target_date', '').strip()
            
            # Validate required fields
            if not title:
                return JsonResponse({'error': 'Title is required.'}, status=400)
            if not category:
                return JsonResponse({'error': 'Category is required.'}, status=400)
            if not target_date_str:
                return JsonResponse({'error': 'Target date is required.'}, status=400)
            
            # Validate date format
            try:
                target_date = timezone.datetime.strptime(target_date_str, '%Y-%m-%d').date()
            except ValueError:
                return JsonResponse({'error': 'Invalid date format. Use YYYY-MM-DD.'}, status=400)
            
            # Create goal
            goal = Goal.objects.create(
                user=request.user,
                title=title,
                description=description if description else None,
                category=category,
                target_date=target_date
            )
            
            return JsonResponse({
                'id': goal.id,
                'title': goal.title,
                'description': goal.description,
                'category': goal.category,
                'target_date': goal.target_date.strftime('%Y-%m-%d'),
                'status': goal.status,
                'created_at': goal.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                'updated_at': goal.updated_at.strftime('%Y-%m-%d %H:%M:%S'),
            })
            
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON data.'}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    
    return JsonResponse({'error': 'Invalid method'}, status=400)


@login_required
def update_goal(request, goal_id):
    if request.method == 'PUT':
        try:
            goal = get_object_or_404(Goal, id=goal_id, user=request.user)
            data = json.loads(request.body)
            
            # Update fields if provided
            if 'title' in data:
                title = data['title'].strip()
                if not title:
                    return JsonResponse({'error': 'Title cannot be empty.'}, status=400)
                goal.title = title
                
            if 'description' in data:
                goal.description = data['description'].strip() if data['description'].strip() else None
                
            if 'category' in data:
                category = data['category'].strip()
                if category:
                    goal.category = category
                    
            if 'target_date' in data:
                try:
                    target_date = timezone.datetime.strptime(data['target_date'], '%Y-%m-%d').date()
                    goal.target_date = target_date
                except ValueError:
                    return JsonResponse({'error': 'Invalid date format. Use YYYY-MM-DD.'}, status=400)
                    
            if 'status' in data:
                status = data['status'].strip()
                if status in ['active', 'completed', 'overdue']:
                    goal.status = status
            
            goal.save()
            
            return JsonResponse({
                'id': goal.id,
                'title': goal.title,
                'description': goal.description,
                'category': goal.category,
                'target_date': goal.target_date.strftime('%Y-%m-%d'),
                'status': goal.status,
                'created_at': goal.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                'updated_at': goal.updated_at.strftime('%Y-%m-%d %H:%M:%S'),
            })
            
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON data.'}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    
    return JsonResponse({'error': 'Invalid method'}, status=400)


@login_required
def delete_goal(request, goal_id):
    if request.method == 'DELETE':
        goal = get_object_or_404(Goal, id=goal_id, user=request.user)
        goal.delete()
        return JsonResponse({'success': True})
    
    return JsonResponse({'error': 'Invalid method'}, status=400)


# ------------------- PROFILE API ENDPOINTS -------------------

@login_required
def update_personal_info(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            first_name = data.get('first_name', '').strip()
            last_name = data.get('last_name', '').strip()
            email = data.get('email', '').strip()
            
            # Validation
            if not first_name or not last_name or not email:
                return JsonResponse({'error': 'All fields are required.'}, status=400)
            
            try:
                validate_email(email)
            except ValidationError:
                return JsonResponse({'error': 'Invalid email format.'}, status=400)
            
            # Check if email is already taken by another user
            if CustomUser.objects.filter(email=email).exclude(id=request.user.id).exists():
                return JsonResponse({'error': 'Email is already taken.'}, status=400)
            
            # Update user info
            user = request.user
            user.email = email
            user.full_name = f"{first_name} {last_name}"
            user.save()
            
            return JsonResponse({'success': True, 'message': 'Personal information updated successfully!'})
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON data.'}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    
    return JsonResponse({'error': 'Invalid method.'}, status=405)


@login_required
def update_academic_info(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            grade_level = data.get('grade_level', '').strip()
            strand = data.get('strand', None)
            
            # Validation
            if not grade_level:
                return JsonResponse({'error': 'School level is required.'}, status=400)
            
            # Get or create profile
            profile, created = Profile.objects.get_or_create(user=request.user)
            
            # Store the previous grade level for progression check
            previous_grade_level = profile.grade_level
            
            # Update profile
            profile.grade_level = grade_level
            profile.strand = strand
            profile.save()
            
            # Check if progression is needed
            progression_required = False
            completed_year = ""
            next_level = ""
            
            # Define grade progression logic
            grade_progression = {
                'Grade 7': 'Grade 8',
                'Grade 8': 'Grade 9',
                'Grade 9': 'Grade 10',
                'Grade 10': 'Grade 11',
                'Grade 11': 'Grade 12'
                # Note: Grade 12 is the final level, no progression after that
            }
            
            # Check if the user has progressed to a new grade level
            if previous_grade_level and previous_grade_level != grade_level:
                # If the user has manually changed to a higher grade level,
                # we don't need to show the progression modal
                pass
            elif previous_grade_level and previous_grade_level in grade_progression:
                # Check if user has completed a school year and should progress
                expected_next_level = grade_progression.get(previous_grade_level)
                if expected_next_level and grade_level == expected_next_level:
                    # User has progressed to the next level
                    completed_year = previous_grade_level
                    next_level = expected_next_level
                    progression_required = True
            
            return JsonResponse({
                'success': True, 
                'message': 'Academic information updated successfully!',
                'progression_required': progression_required,
                'completed_year': completed_year,
                'next_level': next_level
            })
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON data.'}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    
    return JsonResponse({'error': 'Invalid method.'}, status=405)


@login_required
def update_password(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            current_password = data.get('current_password', '')
            new_password = data.get('new_password', '')
            
            # Validation
            if not current_password or not new_password:
                return JsonResponse({'error': 'Both current and new passwords are required.'}, status=400)
            
            # Check current password
            user = request.user
            if not user.check_password(current_password):
                return JsonResponse({'error': 'Current password is incorrect.'}, status=400)
            
            # Validate new password strength
            if not re.match(r'^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}$', new_password):
                return JsonResponse({'error': 'Password must be at least 8 characters long and contain uppercase, lowercase, and numeric characters.'}, status=400)
            
            # Update password
            user.set_password(new_password)
            user.save()
            
            return JsonResponse({'success': True, 'message': 'Password updated successfully!'})
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON data.'}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    
    return JsonResponse({'error': 'Invalid method.'}, status=405)


@login_required
def confirm_progression(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            next_level = data.get('next_level', '').strip()
            
            # Validation
            if not next_level:
                return JsonResponse({'error': 'Next level is required.'}, status=400)
            
            # Get or create profile
            profile, created = Profile.objects.get_or_create(user=request.user)
            
            # Update profile
            profile.grade_level = next_level
            profile.save()
            
            return JsonResponse({
                'success': True, 
                'message': f'Level updated to {next_level} successfully!'
            })
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON data.'}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    
    return JsonResponse({'error': 'Invalid method.'}, status=405)



# ---------------- SUBJECT DATA API ----------------
@login_required
def get_jhs_subjects_api(request):
    """
    API endpoint to get JHS subjects data
    """
    jhs_subjects = [
        'Filipino',
        'English',
        'Mathematics',
        'Science',
        'Araling Panlipunan',
        'Edukasyon sa Pagpapakatao',
        'MAPEH',
        'Technology and Livelihood Education'
    ]
    return JsonResponse({'subjects': jhs_subjects})


@login_required
def get_shs_subjects_api(request):
    """
    API endpoint to get SHS subjects data
    """
    # Now SHS_SUBJECTS is accessible here because it's a global variable
    return JsonResponse({'shs_subjects': SHS_SUBJECTS})




# ------------------- FOR COMPONENTS WEIGHT -------------------
@login_required
def get_component_weights_api(request):
    """
    API endpoint to get component weights data
    """
    return JsonResponse({
        'component_weights': COMPONENT_WEIGHTS,
        'shs_component_weights': SHS_COMPONENT_WEIGHTS
    })

# ------------------- TRANSMUTATION TABLE -------------------
@login_required
def get_transmutation_table_api(request):
    """
    API endpoint to get transmutation table data
    """
    return JsonResponse({'transmutation_table': TRANSMUTATION_TABLE})


# ------------------- GRADE CALCULATION FUNCTIONS -------------------

def calculate_subject_grade(subject_name, components, is_shs=False):
    """
    Calculate subject grade based on DepEd methodology
    """
    # Get component weights for this subject
    if is_shs:
        weights = get_shs_component_weights(subject_name)
    else:
        weights = COMPONENT_WEIGHTS.get(subject_name, {'WW': 30, 'PT': 50, 'QA': 20})
    
    # Separate components by type
    ww_components = [c for c in components if c.get('component_type') == 'WW']
    pt_components = [c for c in components if c.get('component_type') == 'PT']
    qa_components = [c for c in components if c.get('component_type') == 'QA']
    
    # Calculate average percentage for each component type
    def calculate_average(components_list):
        if not components_list:
            return None
        
        total = sum(comp.get('score', 0) / comp.get('highest_score', 1) * 100 for comp in components_list)
        return total / len(components_list)
    
    ww_average = calculate_average(ww_components)
    pt_average = calculate_average(pt_components)
    qa_average = calculate_average(qa_components)
    
    # Calculate weighted grade (Initial Grade)
    initial_grade = None
    weighted_sum = 0
    total_weight = 0
    
    if ww_average is not None:
        weighted_sum += ww_average * (weights['WW'] / 100)
        total_weight += weights['WW']
    
    if pt_average is not None:
        weighted_sum += pt_average * (weights['PT'] / 100)
        total_weight += weights['PT']
    
    if qa_average is not None:
        weighted_sum += qa_average * (weights['QA'] / 100)
        total_weight += weights['QA']
    
    # Only calculate initial grade if we have at least one component
    if total_weight > 0:
        initial_grade = weighted_sum
    
    # Calculate transmuted grade using DepEd transmutation table
    transmuted_grade = transmute_grade(initial_grade) if initial_grade is not None else None
    
    return {
        'wwAverage': ww_average,
        'ptAverage': pt_average,
        'qaAverage': qa_average,
        'initialGrade': initial_grade,
        'transmutedGrade': transmuted_grade,
        'weights': weights
    }


def get_shs_component_weights(subject):
    """
    Helper to get weights by subject for SHS
    """
    immersion_keywords = [
        "Work Immersion", "Research", "Business Enterprise", "Simulation", 
        "Exhibit", "Performance", "Immersion", "Research Project"
    ]
    
    if any(keyword.lower() in subject.lower() for keyword in immersion_keywords):
        return SHS_COMPONENT_WEIGHTS['immersion']
    return SHS_COMPONENT_WEIGHTS['default']


def transmute_grade(initial_grade):
    """
    Transmute initial grade to DepEd transmuted grade
    Based on DepEd Order No. 8, s. 2015
    """
    if initial_grade is None:
        return None
    
    # Round to nearest whole number
    rounded = round(initial_grade)
    # Return transmuted grade from table
    return TRANSMUTATION_TABLE.get(rounded, rounded)


