from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name="index"),
    path('charge/', views.charge, name="charge"),
    path('success/<str:args>/', views.successMsg, name="success"),
    # from stripe docs 
    path("create-payment-intent/", views.create_payment, name="create-payment-intent")
]
