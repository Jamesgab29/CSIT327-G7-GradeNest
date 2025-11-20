from django.urls import path, reverse_lazy
from django.contrib.auth import views as auth_views
from . import views

app_name = "accounts"

urlpatterns = [
    # Landing + Auth
    path("", views.landing_page, name="landing-page"),
    path("register/", views.register, name="register"),
    path("login/", views.user_login, name="login"),
    path("logout/", views.user_logout, name="logout"),

    # Core flow
    path("education-level/", views.education_level, name="education_level"),
    path("dashboard/", views.dashboard, name="dashboard"),
    path("goal/", views.goal, name="goal"),

    # Settings & Profile
    path("settings/", views.settings, name="settings"),
    path("settings/profile/", views.profile, name="profile"),

    # ✅ Forgot Password Flow (Gmail)
    path(
        "password_reset/",
        auth_views.PasswordResetView.as_view(
            template_name="accounts/password_reset.html",
            email_template_name="accounts/password_reset_email.html",
            subject_template_name="accounts/password_reset_subject.txt",
            success_url=reverse_lazy("accounts:password_reset_done"),
        ),
        name="password_reset",
    ),
    path(
        "password_reset/done/",
        auth_views.PasswordResetDoneView.as_view(
            template_name="accounts/password_reset_done.html"
        ),
        name="password_reset_done",
    ),
    path(
        "reset/<uidb64>/<token>/",
        auth_views.PasswordResetConfirmView.as_view(
            template_name="accounts/password_reset_confirm.html",
            success_url=reverse_lazy("accounts:password_reset_complete"),
        ),
        name="password_reset_confirm",
    ),
    path(
        "reset/done/",
        auth_views.PasswordResetCompleteView.as_view(
            template_name="accounts/password_reset_complete.html"
        ),
        name="password_reset_complete",
    ),

    # Quarter Management
    path("quarters/list/", views.quarters_list, name="quarters_list"),
    path("quarters/add/", views.add_quarter, name="add_quarter"),
    path("quarters/update/<int:quarter_id>/", views.update_quarter, name="update_quarter"),
    path("quarters/delete/<int:quarter_id>/", views.delete_quarter, name="delete_quarter"),

    # Subject Management
    path("subjects/list/", views.subjects_list, name="subjects_list"),
    path("subjects/add/", views.add_subject, name="add_subject"),
    path("subjects/update/<int:subject_id>/", views.update_subject, name="update_subject"),
    path("subjects/delete/<int:subject_id>/", views.delete_subject, name="delete_subject"),

    # Component Management
    path("components/list/", views.components_list, name="components_list"),
    path("components/add/", views.add_component, name="add_component"),
    path("components/update/<int:component_id>/", views.update_component, name="update_component"),
    path("components/delete/<int:component_id>/", views.delete_component, name="delete_component"),
    
    # Profile API endpoints
    path("api/profile/update-personal/", views.update_personal_info, name="update_personal_info"),
    path("api/profile/update-academic/", views.update_academic_info, name="update_academic_info"),
    path("api/profile/update-password/", views.update_password, name="update_password"),
    path("api/profile/confirm-progression/", views.confirm_progression, name="confirm_progression"),

    # Subject Data API endpoints
    path("api/subjects/jhs/", views.get_jhs_subjects_api, name="get_jhs_subjects"),
    path("api/subjects/shs/", views.get_shs_subjects_api, name="get_shs_subjects"),

    # Transmutation Table API endpoint
    path("api/transmutation/", views.get_transmutation_table_api, name="get_transmutation_table"),


    # Component Weights API endpoint
    path("api/component-weights/", views.get_component_weights_api, name="get_component_weights"),

    
]