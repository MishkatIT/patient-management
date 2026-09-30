from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.core.validators import MaxValueValidator, MinValueValidator, RegexValidator
from django.db import models

from .managers import PatientManager


class Patient(AbstractBaseUser, PermissionsMixin):
    GENDER_CHOICES = [("MALE", "Male"), ("FEMALE", "Female"), ("OTHER", "Other")]
    BLOOD_GROUP_CHOICES = [(group, group) for group in ("A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-")]

    mobile = models.CharField(
        max_length=15,
        unique=True,
        validators=[RegexValidator(r"^\+?\d{10,15}$", "Enter a valid mobile number.")],
    )
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100, blank=True)
    age = models.PositiveSmallIntegerField(validators=[MinValueValidator(0), MaxValueValidator(130)])
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES)
    address = models.TextField(blank=True)
    blood_group = models.CharField(max_length=3, choices=BLOOD_GROUP_CHOICES)
    total_visits = models.PositiveIntegerField(default=0)
    last_visit_date = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = PatientManager()
    USERNAME_FIELD = "mobile"
    REQUIRED_FIELDS = ["first_name", "age", "gender", "blood_group"]

    class Meta:
        ordering = ["-id"]

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()

    def __str__(self):
        return f"{self.full_name} ({self.mobile})"


class PatientVisit(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name="visits")
    doctor_name = models.CharField(max_length=150)
    visit_date = models.DateField()
    clinical_note = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-visit_date", "-id"]
        indexes = [models.Index(fields=["patient", "visit_date"])]
