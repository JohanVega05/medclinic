from django.urls import path
from .views import AppointmentListCreateView, AppointmentDetailView, CancelAppointmentView

urlpatterns = [
    path('', AppointmentListCreateView.as_view(), name='appointment_list'),
    path('<uuid:pk>/', AppointmentDetailView.as_view(), name='appointment_detail'),
    path('<uuid:pk>/cancel/', CancelAppointmentView.as_view(), name='appointment_cancel'),
]