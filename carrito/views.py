from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse
from productos.models import Producto

# Create your views here.

def carrito_detalle(request):
    carrito = request.session.get('carrito', {})
    items = []
    total = 0
    for producto_id, item in carrito.items():
        producto = get_object_or_404(Producto, id=producto_id)
        subtotal = producto.precio * item['cantidad']
        total += subtotal
        items.append({
            'producto': producto,
            'cantidad': item['cantidad'],
            'subtotal': subtotal,
        })
    
    return render(request, 'carrito/detalle.html', {
        'items': items,
        'total': total,
    })

def agregar_al_carrito(request, producto_id):
    if request.method == 'POST':
        producto = get_object_or_404(Producto, id=producto_id)
        carrito = request.session.get('carrito', {})
        
        cantidad = int(request.POST.get('cantidad', 1))
        
        if str(producto_id) in carrito:
            carrito[str(producto_id)]['cantidad'] += cantidad
        else:
            carrito[str(producto_id)] = {
                'cantidad': cantidad,
                'nombre': producto.nombre,
                'precio': str(producto.precio),
                'imagen': producto.imagen_principal.url,
            }
        
        request.session['carrito'] = carrito
        request.session.modified = True
        
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse({
                'success': True,
                'carrito_count': sum(item['cantidad'] for item in carrito.values())
            })
        
        return redirect('carrito_detalle')
    
    return redirect('detalle_producto', producto_id=producto_id)

def eliminar_del_carrito(request, producto_id):
    carrito = request.session.get('carrito', {})
    
    if str(producto_id) in carrito:
        del carrito[str(producto_id)]
        request.session['carrito'] = carrito
        request.session.modified = True
    
    return redirect('carrito_detalle')

def actualizar_carrito(request, producto_id):
    if request.method == 'POST':
        carrito = request.session.get('carrito', {})
        cantidad = int(request.POST.get('cantidad', 1))
        
        if cantidad <= 0:
            return eliminar_del_carrito(request, producto_id)
        
        if str(producto_id) in carrito:
            carrito[str(producto_id)]['cantidad'] = cantidad
            request.session['carrito'] = carrito
            request.session.modified = True
        
        return redirect('carrito_detalle')