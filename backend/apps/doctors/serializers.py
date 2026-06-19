from rest_framework import serializers
from .models import Specialty, Doctor, Schedule
from apps.users.serializers import UserSerializer


class SpecialtySerializer(serializers.ModelSerializer):
    class Meta:
        model = Specialty
        fields = ('id', 'name', 'description', 'icon', 'is_active')


class ScheduleSerializer(serializers.ModelSerializer):
    weekday_display = serializers.CharField(source='get_weekday_display', read_only=True)

    class Meta:
        model = Schedule
        fields = ('id', 'weekday', 'weekday_display', 'start_time', 'end_time', 'slot_minutes', 'is_active')


class DoctorSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    specialty = SpecialtySerializer(read_only=True)
    specialty_id = serializers.PrimaryKeyRelatedField(
        queryset=Specialty.objects.all(), source='specialty', write_only=True
    )
    schedules = ScheduleSerializer(many=True, read_only=True)
    average_rating = serializers.ReadOnlyField()

    class Meta:
        model = Doctor
        fields = (
            'id', 'user', 'specialty', 'specialty_id', 'license_number',
            'bio', 'consultation_fee', 'years_experience', 'is_available',
            'schedules', 'average_rating', 'created_at'
        )
        read_only_fields = ('id', 'created_at')