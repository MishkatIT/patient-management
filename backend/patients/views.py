from django.db.models import Q
from rest_framework.generics import CreateAPIView, ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.permissions import AllowAny

from .models import Patient
from .serializers import PatientSerializer, PatientVisitSerializer


class PatientListCreateView(ListCreateAPIView):
    serializer_class = PatientSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = Patient.objects.filter(is_staff=False).order_by("-id")
        search = self.request.query_params.get("search", "").strip()
        if search:
            queryset = queryset.filter(
                Q(first_name__icontains=search)
                | Q(last_name__icontains=search)
                | Q(mobile__icontains=search)
                | Q(address__icontains=search)
            )
        return queryset


class PatientRetrieveUpdateDestroyView(RetrieveUpdateDestroyAPIView):
    queryset = Patient.objects.filter(is_staff=False).order_by("-id")
    serializer_class = PatientSerializer
    permission_classes = [AllowAny]


class PatientVisitCreateView(CreateAPIView):
    serializer_class = PatientVisitSerializer
    permission_classes = [AllowAny]
