from django.urls import path
from .views import (
    SpecialtyListCreateView, SpecialtyDetailView,
    DoctorListView, DoctorDetailView,
    DoctorAdminListView, DoctorCreateView,
    ScheduleListView
)

urlpatterns = [
    path('specialties/', SpecialtyListCreateView.as_view(), name='specialty_list'),
    path('specialties/<int:pk>/', SpecialtyDetailView.as_view(), name='specialty_detail'),
    path('', DoctorListView.as_view(), name='doctor_list'),
    path('admin-list/', DoctorAdminListView.as_view(), name='doctor_admin_list'),
    path('create/', DoctorCreateView.as_view(), name='doctor_create'),
    path('<uuid:pk>/', DoctorDetailView.as_view(), name='doctor_detail'),
    path('schedules/', ScheduleListView.as_view(), name='schedule_list'),
]