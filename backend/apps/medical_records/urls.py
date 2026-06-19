from django.urls import path
from .views import MedicalRecordListCreateView, MedicalRecordDetailView

urlpatterns = [
    path('', MedicalRecordListCreateView.as_view(), name='medical_record_list'),
    path('<uuid:pk>/', MedicalRecordDetailView.as_view(), name='medical_record_detail'),
]