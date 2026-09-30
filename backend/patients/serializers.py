from django.db import transaction
from django.db.models import F
from django.utils import timezone
from rest_framework import serializers

from .models import Patient, PatientVisit


class PatientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = [
            "id", "first_name", "last_name", "mobile", "age", "gender", "address",
            "blood_group", "total_visits", "last_visit_date", "password",
        ]
        extra_kwargs = {
            "password": {"write_only": True, "min_length": 6, "required": False},
            "total_visits": {"read_only": True},
            "last_visit_date": {"read_only": True},
        }

    def validate_mobile(self, value):
        return value.strip()

    def validate(self, attrs):
        if self.instance is None and not attrs.get("password"):
            raise serializers.ValidationError({"password": "This field is required."})
        return attrs

    def create(self, validated_data):
        return Patient.objects.create_user(**validated_data)

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        for field, value in validated_data.items():
            setattr(instance, field, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance


class PatientVisitSerializer(serializers.ModelSerializer):
    total_visits = serializers.IntegerField(source="patient.total_visits", read_only=True)
    last_visit_date = serializers.DateField(source="patient.last_visit_date", read_only=True)

    class Meta:
        model = PatientVisit
        fields = ["id", "patient", "doctor_name", "visit_date", "clinical_note", "created_at", "total_visits", "last_visit_date"]
        read_only_fields = ["id", "created_at", "total_visits", "last_visit_date"]

    def validate_visit_date(self, value):
        if value > timezone.localdate():
            raise serializers.ValidationError("Visit date cannot be in the future.")
        return value

    @transaction.atomic
    def create(self, validated_data):
        patient = Patient.objects.select_for_update().get(pk=validated_data["patient"].pk)
        visit = PatientVisit.objects.create(patient=patient, **{key: value for key, value in validated_data.items() if key != "patient"})
        patient.total_visits = F("total_visits") + 1
        new_last_visit = max(patient.last_visit_date, visit.visit_date) if patient.last_visit_date else visit.visit_date
        patient.last_visit_date = new_last_visit
        patient.save(update_fields=["total_visits", "last_visit_date"])
        patient.refresh_from_db(fields=["total_visits", "last_visit_date"])
        return visit
