from django.urls import path
from . import views

urlpatterns = [
    path('', views.carrito_detalle, name='carrito_detalle'),
    path('agregar/<int:producto_id>/', views.agregar_al_carrito, name='agregar_al_carrito'),
    path('eliminar/<int:producto_id>/', views.eliminar_del_carrito, name='eliminar_del_carrito'),
    path('actualizar/<int:producto_id>/', views.actualizar_carrito, name='actualizar_carrito'),
]