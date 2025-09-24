from django.shortcuts import render, get_object_or_404, redirect
from .models import Producto, Categoria
from django.db.models import Q
from django.contrib.auth.decorators import login_required
from .models import Favorito
from django.contrib import messages


# Create your views here.

def inicio(request):
    productos_destacados = Producto.objects.filter(disponible=True)[:8]
    categorias_destacadas = Categoria.objects.all()[:3]
    
    return render(request, 'productos/inicio.html', {
        'productos_destacados': productos_destacados,
        'categorias_destacadas': categorias_destacadas
    })

def lista_productos(request):
    productos = Producto.objects.filter(disponible=True)
    return render(request, 'productos/lista_productos.html', {
        'productos': productos
    })

def detalle_producto(request, slug):
    producto = get_object_or_404(Producto, slug=slug, disponible=True)
    return render(request, 'productos/detalle_producto.html', {
        'producto': producto
    })

def productos_por_categoria(request, slug):
    categoria = get_object_or_404(Categoria, slug=slug)
    productos = Producto.objects.filter(categoria=categoria, disponible=True)
    return render(request, 'productos/productos_por_categoria.html', {
        'categoria': categoria,
        'productos': productos
    })

def buscar_productos(request):
    query = request.GET.get('q', '')
    tipo_mola = request.GET.get('tipo_mola', '')
    comunidad = request.GET.get('comunidad', '')
    precio_min = request.GET.get('precio_min', '')
    precio_max = request.GET.get('precio_max', '')
    
    productos = Producto.objects.filter(disponible=True)
    
    if query:
        productos = productos.filter(
            Q(nombre__icontains=query) |
            Q(descripcion__icontains=query) |
            Q(artesano__icontains=query) |
            Q(comunidad__icontains=query)
        )
    
    if tipo_mola:
        productos = productos.filter(tipo_mola=tipo_mola)
    
    if comunidad:
        productos = productos.filter(comunidad__icontains=comunidad)
    
    if precio_min:
        productos = productos.filter(precio__gte=precio_min)
    
    if precio_max:
        productos = productos.filter(precio__lte=precio_max)
    
    # Obtener comunidades únicas para el filtro
    comunidades = Producto.objects.values_list('comunidad', flat=True).distinct()
    
    return render(request, 'productos/buscar.html', {
        'productos': productos,
        'query': query,
        'tipo_mola': tipo_mola,
        'comunidad': comunidad,
        'precio_min': precio_min,
        'precio_max': precio_max,
        'comunidades': comunidades,
        'TIPOS_MOLA': Producto.TIPO_MOLA
    })

@login_required
def agregar_favorito(request, producto_id):
    producto = get_object_or_404(Producto, id=producto_id)
    favorito, created = Favorito.objects.get_or_create(
        usuario=request.user, 
        producto=producto
    )
    
    if created:
        messages.success(request, 'Producto agregado a favoritos.')
    else:
        messages.info(request, 'El producto ya está en tus favoritos.')
    
    return redirect('detalle_producto', slug=producto.slug)

@login_required
def eliminar_favorito(request, producto_id):
    producto = get_object_or_404(Producto, id=producto_id)
    Favorito.objects.filter(usuario=request.user, producto=producto).delete()
    messages.success(request, 'Producto eliminado de favoritos.')
    return redirect('detalle_producto', slug=producto.slug)

@login_required
def lista_favoritos(request):
    favoritos = Favorito.objects.filter(usuario=request.user).select_related('producto')
    return render(request, 'productos/favoritos.html', {'favoritos': favoritos})