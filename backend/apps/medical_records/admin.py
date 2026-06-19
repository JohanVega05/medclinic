from django.contrib import admin
from .models import MedicalRecord, Prescription, RecordAttachment


class PrescriptionInline(admin.TabularInline):
    model = Prescription
    extra = 1


class AttachmentInline(admin.TabularInline):
    model = RecordAttachment
    extra = 0


@admin.register(MedicalRecord)
class MedicalRecordAdmin(admin.ModelAdmin):
    list_display = ('appointment', 'created_at')
    search_fields = ('appointment__patient__email',)
    inlines = [PrescriptionInline, AttachmentInline]