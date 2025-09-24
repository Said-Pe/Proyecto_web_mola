#creamos este archivo para que en el proyecto principal sepa donde estan nuestra urls de productos.
from django.urls import path
from . import views

urlpatterns = [
    path('', views.inicio, name='inicio'),
    path('productos/', views.lista_productos, name='lista_productos'),
    path('producto/<slug:slug>/', views.detalle_producto, name='detalle_producto'),
    path('categoria/<slug:slug>/', views.productos_por_categoria, name='productos_por_categoria'),
    path('buscar/', views.buscar_productos, name='buscar_productos'),
     path('favoritos/', views.lista_favoritos, name='lista_favoritos'),
    path('favoritos/agregar/<int:producto_id>/', views.agregar_favorito, name='agregar_favorito'),
    path('favoritos/eliminar/<int:producto_id>/', views.eliminar_favorito, name='eliminar_favorito'),
]