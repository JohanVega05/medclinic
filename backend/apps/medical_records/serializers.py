from rest_framework import serializers
from .models import MedicalRecord, Prescription, RecordAttachment


class PrescriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Prescription
        fields = ('id', 'medication', 'dosage', 'frequency', 'duration', 'instructions')


class RecordAttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecordAttachment
        fields = ('id', 'file', 'name', 'uploaded_at')
        read_only_fields = ('uploaded_at',)


class MedicalRecordSerializer(serializers.ModelSerializer):
    prescriptions = PrescriptionSerializer(many=True, read_only=True)
    attachments = RecordAttachmentSerializer(many=True, read_only=True)

    class Meta:
        model = MedicalRecord
        fields = (
            'id', 'appointment', 'diagnosis', 'treatment',
            'notes', 'prescriptions', 'attachments', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'created_at', 'updated_at')


class MedicalRecordCreateSerializer(serializers.ModelSerializer):
    prescriptions = PrescriptionSerializer(many=True, required=False)

    class Meta:
        model = MedicalRecord
        fields = ('appointment', 'diagnosis', 'treatment', 'notes', 'prescriptions')

    def validate_appointment(self, value):
        if hasattr(value, 'medical_record'):
            raise serializers.ValidationError('Esta cita ya tiene un historial médico')
        if value.status != 'completed':
            raise serializers.ValidationError('Solo podés crear historial de citas completadas')
        return value

    def create(self, validated_data):
        prescriptions_data = validated_data.pop('prescriptions', [])
        record = MedicalRecord.objects.create(**validated_data)
        for prescription in prescriptions_data:
            Prescription.objects.create(record=record, **prescription)
        return record