from django.urls import path
from .views import ReviewListCreateView, DoctorReviewsView

urlpatterns = [
    path('', ReviewListCreateView.as_view(), name='review_list'),
    path('doctor/<uuid:doctor_id>/', DoctorReviewsView.as_view(), name='doctor_reviews'),
]