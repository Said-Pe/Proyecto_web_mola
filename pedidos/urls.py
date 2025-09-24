from django.urls import path
from . import views

urlpatterns = [
    path('checkout/', views.checkout, name='checkout'),
    path('confirmacion/<int:pedido_id>/', views.confirmacion_pedido, name='confirmacion_pedido'),
]