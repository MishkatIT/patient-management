from rest_framework.generics import CreateAPIView, ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.permissions import AllowAny

from .models import Patient
from .serializers import PatientSerializer, PatientVisitSerializer


class PatientListCreateView(ListCreateAPIView):
    queryset = Patient.objects.filter(is_staff=False).order_by("-id")
    serializer_class = PatientSerializer
    permission_classes = [AllowAny]


class PatientRetrieveUpdateDestroyView(RetrieveUpdateDestroyAPIView):
    queryset = Patient.objects.filter(is_staff=False).order_by("-id")
    serializer_class = PatientSerializer
    permission_classes = [AllowAny]


class PatientVisitCreateView(CreateAPIView):
    serializer_class = PatientVisitSerializer
    permission_classes = [AllowAny]
