from django.contrib import admin

from .models import Patient, PatientVisit

admin.site.register(Patient)
admin.site.register(PatientVisit)
