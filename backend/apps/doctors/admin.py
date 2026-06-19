from django.contrib import admin
from .models import Specialty, Doctor, Schedule


@admin.register(Specialty)
class SpecialtyAdmin(admin.ModelAdmin):
    list_display = ('name', 'is_active')
    search_fields = ('name',)


@admin.register(Doctor)
class DoctorAdmin(admin.ModelAdmin):
    list_display = ('__str__', 'specialty', 'license_number', 'consultation_fee', 'is_available')
    list_filter = ('specialty', 'is_available')
    search_fields = ('user__first_name', 'user__last_name', 'license_number')


@admin.register(Schedule)
class ScheduleAdmin(admin.ModelAdmin):
    list_display = ('doctor', 'get_weekday_display', 'start_time', 'end_time', 'slot_minutes', 'is_active')
    list_filter = ('weekday', 'is_active')