from django.contrib import admin
from .models import Appointment


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ('patient', 'doctor', 'scheduled_at', 'status')
    list_filter = ('status',)
    search_fields = ('patient__email', 'doctor__user__first_name', 'doctor__user__last_name')
    ordering = ('-scheduled_at',)