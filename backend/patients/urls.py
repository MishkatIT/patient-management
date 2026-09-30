from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import PatientListCreateView, PatientRetrieveUpdateDestroyView, PatientVisitCreateView

urlpatterns = [
    path("auth/login/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("patients/", PatientListCreateView.as_view(), name="patient-list-create"),
    path("patients/<int:pk>/", PatientRetrieveUpdateDestroyView.as_view(), name="patient-detail"),
    path("patient-visits/", PatientVisitCreateView.as_view(), name="patient-visit-create"),
]
