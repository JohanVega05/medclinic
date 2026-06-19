from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from .models import MedicalRecord
from .serializers import MedicalRecordSerializer, MedicalRecordCreateSerializer


class MedicalRecordListCreateView(generics.ListCreateAPIView):
    permission_classes = (IsAuthenticated,)

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return MedicalRecordCreateSerializer
        return MedicalRecordSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'doctor':
            return MedicalRecord.objects.filter(
                appointment__doctor__user=user
            ).select_related('appointment')
        elif user.role == 'patient':
            return MedicalRecord.objects.filter(
                appointment__patient=user
            ).select_related('appointment')
        return MedicalRecord.objects.all()

    def perform_create(self, serializer):
        if self.request.user.role != 'doctor':
            raise PermissionDenied('Solo los doctores pueden crear historiales médicos')
        serializer.save()


class MedicalRecordDetailView(generics.RetrieveUpdateAPIView):
    permission_classes = (IsAuthenticated,)

    def get_serializer_class(self):
        if self.request.method in ('PUT', 'PATCH'):
            return MedicalRecordCreateSerializer
        return MedicalRecordSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'doctor':
            return MedicalRecord.objects.filter(appointment__doctor__user=user)
        elif user.role == 'patient':
            return MedicalRecord.objects.filter(appointment__patient=user)
        return MedicalRecord.objects.all()