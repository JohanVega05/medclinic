from rest_framework import generics, filters, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Specialty, Doctor, Schedule
from .serializers import SpecialtySerializer, DoctorSerializer, ScheduleSerializer
from apps.users.models import User


class SpecialtyListCreateView(generics.ListCreateAPIView):
    queryset = Specialty.objects.all()
    serializer_class = SpecialtySerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated()]


class SpecialtyDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Specialty.objects.all()
    serializer_class = SpecialtySerializer
    permission_classes = [IsAuthenticated]


class DoctorListView(generics.ListAPIView):
    serializer_class = DoctorSerializer
    permission_classes = (AllowAny,)
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['user__first_name', 'user__last_name', 'specialty__name']
    ordering_fields = ['consultation_fee', 'years_experience']

    def get_queryset(self):
        queryset = Doctor.objects.filter(is_available=True).select_related('user', 'specialty')
        specialty_id = self.request.query_params.get('specialty')
        if specialty_id:
            queryset = queryset.filter(specialty_id=specialty_id)
        return queryset


class DoctorAdminListView(generics.ListAPIView):
    queryset = Doctor.objects.all().select_related('user', 'specialty')
    serializer_class = DoctorSerializer
    permission_classes = [IsAuthenticated]


class DoctorDetailView(generics.RetrieveUpdateAPIView):
    queryset = Doctor.objects.select_related('user', 'specialty').prefetch_related('schedules')
    serializer_class = DoctorSerializer
    permission_classes = (AllowAny,)


class DoctorCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.role != 'admin':
            return Response({'error': 'Sin permisos'}, status=status.HTTP_403_FORBIDDEN)

        data = request.data
        try:
            user = User.objects.create_user(
                email=data['email'],
                password=data.get('password', 'MedClinic2024!'),
                first_name=data['first_name'],
                last_name=data['last_name'],
                role='doctor',
                phone=data.get('phone', ''),
            )
            doctor = Doctor.objects.create(
                user=user,
                specialty_id=data['specialty_id'],
                license_number=data['license_number'],
                consultation_fee=data['consultation_fee'],
                years_experience=data.get('years_experience', 0),
                bio=data.get('bio', ''),
            )
            return Response(DoctorSerializer(doctor).data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class ScheduleListView(generics.ListCreateAPIView):
    serializer_class = ScheduleSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        return Schedule.objects.filter(doctor__user=self.request.user)

    def perform_create(self, serializer):
        doctor = self.request.user.doctor_profile
        serializer.save(doctor=doctor)