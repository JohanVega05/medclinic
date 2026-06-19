from rest_framework import generics
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.exceptions import PermissionDenied
from .models import Review
from .serializers import ReviewSerializer


class ReviewListCreateView(generics.ListCreateAPIView):
    serializer_class = ReviewSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        user = self.request.user
        doctor_id = self.request.query_params.get('doctor')
        if doctor_id:
            return Review.objects.filter(doctor_id=doctor_id)
        if user.role == 'patient':
            return Review.objects.filter(patient=user)
        elif user.role == 'doctor':
            return Review.objects.filter(doctor__user=user)
        return Review.objects.all()

    def perform_create(self, serializer):
        if self.request.user.role != 'patient':
            raise PermissionDenied('Solo los pacientes pueden escribir reseñas')
        serializer.save()


class DoctorReviewsView(generics.ListAPIView):
    serializer_class = ReviewSerializer
    permission_classes = (AllowAny,)

    def get_queryset(self):
        doctor_id = self.kwargs['doctor_id']
        return Review.objects.filter(doctor_id=doctor_id).select_related('patient')