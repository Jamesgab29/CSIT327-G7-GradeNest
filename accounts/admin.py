from django.contrib import admin
from .models import CustomUser, Profile, Quarter, Subject, Component

# Register your models here.

@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = ['email', 'full_name', 'is_active', 'is_staff', 'date_joined']
    search_fields = ['email', 'full_name']
    list_filter = ['is_active', 'is_staff']

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'grade_level', 'strand', 'school_year']
    search_fields = ['user__email', 'user__full_name']
    list_filter = ['grade_level', 'strand']

@admin.register(Quarter)
class QuarterAdmin(admin.ModelAdmin):
    list_display = ['id', 'name']
    search_fields = ['name']

@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ['id', 'name']
    search_fields = ['name']

@admin.register(Component)
class ComponentAdmin(admin.ModelAdmin):
    list_display = ['name', 'subject', 'quarter', 'component_type', 'score', 'highest_score']
    search_fields = ['name', 'subject__name', 'quarter__name']
    list_filter = ['component_type', 'quarter', 'subject']
