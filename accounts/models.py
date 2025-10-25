from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.utils import timezone


# ---------------- CUSTOM USER MANAGER ----------------
class CustomUserManager(BaseUserManager):
    def create_user(self, email, full_name=None, password=None, **extra_fields):
        if not email:
            raise ValueError("The Email field must be set.")
        email = self.normalize_email(email)
        full_name = full_name or "Google User"  # ✅ prevent errors if Google doesn’t return name
        user = self.model(email=email, full_name=full_name, **extra_fields)

        # ✅ Allow empty password for Google login
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()

        user.save(using=self._db)
        return user

    def create_superuser(self, email, full_name=None, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(email, full_name, password, **extra_fields)


# ---------------- CUSTOM USER MODEL ----------------
class CustomUser(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=150, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)

    objects = CustomUserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["full_name"]

    def __str__(self):
        return self.full_name or self.email


# ---------------- PROFILE MODEL ----------------
class Profile(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)
    grade_level = models.CharField(max_length=50, blank=True, null=True)
    strand = models.CharField(max_length=100, blank=True, null=True)
    school_year = models.CharField(max_length=20, blank=True, null=True)

    def __str__(self):
        return f"{self.user.full_name or self.user.email} - {self.grade_level or 'No Level'}"