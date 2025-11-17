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
import json


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
    quarters = Quarter.objects.filter(user=request.user).values('id', 'name', 'semester')
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
