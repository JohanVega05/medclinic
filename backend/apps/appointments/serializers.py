from rest_framework import serializers
from .models import Appointment
from apps.doctors.serializers import DoctorSerializer
from apps.users.serializers import UserSerializer
from datetime import datetime
import pytz


class AppointmentSerializer(serializers.ModelSerializer):
    doctor_detail = DoctorSerializer(source='doctor', read_only=True)
    patient_detail = UserSerializer(source='patient', read_only=True)

    class Meta:
        model = Appointment
        fields = (
            'id', 'doctor', 'doctor_detail', 'patient', 'patient_detail',
            'scheduled_at', 'end_at', 'status', 'reason', 'notes',
            'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'patient', 'end_at', 'created_at', 'updated_at')

    def validate(self, attrs):
        doctor = attrs.get('doctor')
        scheduled_at = attrs.get('scheduled_at')

        if scheduled_at < datetime.now(pytz.UTC):
            raise serializers.ValidationError({'scheduled_at': 'No podés reservar citas en el pasado'})

        conflict = Appointment.objects.filter(
            doctor=doctor,
            scheduled_at=scheduled_at,
            status__in=['pending', 'confirmed']
        ).exists()

        if conflict:
            raise serializers.ValidationError({'scheduled_at': 'El doctor ya tiene una cita en ese horario'})

        return attrs

    def create(self, validated_data):
        doctor = validated_data['doctor']
        slot_minutes = 30
        if hasattr(doctor, 'schedules'):
            schedule = doctor.schedules.filter(
                weekday=validated_data['scheduled_at'].weekday(),
                is_active=True
            ).first()
            if schedule:
                slot_minutes = schedule.slot_minutes

        from datetime import timedelta
        validated_data['end_at'] = validated_data['scheduled_at'] + timedelta(minutes=slot_minutes)
        validated_data['patient'] = self.context['request'].user
        return super().create(validated_data)


class AppointmentUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = ('status', 'notes')