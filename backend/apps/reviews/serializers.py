from rest_framework import serializers
from .models import Review
from apps.users.serializers import UserSerializer
from apps.doctors.serializers import DoctorSerializer


class ReviewSerializer(serializers.ModelSerializer):
    patient_detail = UserSerializer(source='patient', read_only=True)
    doctor_detail = DoctorSerializer(source='doctor', read_only=True)

    class Meta:
        model = Review
        fields = (
            'id', 'doctor', 'doctor_detail', 'patient', 'patient_detail',
            'appointment', 'rating', 'comment', 'created_at'
        )
        read_only_fields = ('id', 'patient', 'created_at')

    def validate_appointment(self, value):
        if value.status != 'completed':
            raise serializers.ValidationError('Solo podés reseñar citas completadas')
        if hasattr(value, 'review'):
            raise serializers.ValidationError('Ya existe una reseña para esta cita')
        return value

    def validate(self, attrs):
        request = self.context['request']
        appointment = attrs.get('appointment')
        if appointment.patient != request.user:
            raise serializers.ValidationError('Solo podés reseñar tus propias citas')
        attrs['doctor'] = appointment.doctor
        return attrs

    def create(self, validated_data):
        validated_data['patient'] = self.context['request'].user
        return super().create(validated_data)