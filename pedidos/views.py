from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .models import Pedido, PedidoItem
from productos.models import Producto

# Create your views here.

@login_required
def checkout(request):
    carrito = request.session.get('carrito', {})
    
    if not carrito:
        messages.error(request, 'Tu carrito está vacío.')
        return redirect('carrito_detalle')
    
    # Calcular total
    total = 0
    items = []
    for producto_id, item_data in carrito.items():
        producto = get_object_or_404(Producto, id=producto_id)
        subtotal = producto.precio * item_data['cantidad']
        total += subtotal
        items.append({
            'producto': producto,
            'cantidad': item_data['cantidad'],
            'subtotal': subtotal
        })
    
    # Agregar ITBMS (7% Panamá)
    itbms = total * 0.07
    total_con_impuestos = total + itbms
    
    if request.method == 'POST':
        # Crear pedido
        pedido = Pedido.objects.create(
            usuario=request.user,
            total=total_con_impuestos,
            nombre_completo=request.POST.get('nombre_completo'),
            email=request.POST.get('email'),
            telefono=request.POST.get('telefono'),
            direccion=request.POST.get('direccion'),
            ciudad=request.POST.get('ciudad'),
            provincia=request.POST.get('provincia'),
            codigo_postal=request.POST.get('codigo_postal'),
            metodo_pago=request.POST.get('metodo_pago'),
            pagado=False
        )
        
        # Crear items del pedido
        for producto_id, item_data in carrito.items():
            producto = get_object_or_404(Producto, id=producto_id)
            PedidoItem.objects.create(
                pedido=pedido,
                producto=producto,
                precio=producto.precio,
                cantidad=item_data['cantidad']
            )
        
        # Limpiar carrito
        request.session['carrito'] = {}
        request.session.modified = True
        
        messages.success(request, f'¡Pedido #{pedido.id} realizado con éxito!')
        return redirect('confirmacion_pedido', pedido_id=pedido.id)
    
    # Prellenar datos del usuario
    datos_usuario = {
        'nombre_completo': f"{request.user.first_name} {request.user.last_name}",
        'email': request.user.email,
    }
    if hasattr(request.user, 'perfil'):
        datos_usuario.update({
            'telefono': request.user.perfil.telefono,
            'direccion': request.user.perfil.direccion,
            'ciudad': request.user.perfil.ciudad,
            'provincia': request.user.perfil.provincia,
            'codigo_postal': request.user.perfil.codigo_postal,
        })
    
    return render(request, 'pedidos/checkout.html', {
        'items': items,
        'total': total,
        'itbms': itbms,
        'total_con_impuestos': total_con_impuestos,
        'datos_usuario': datos_usuario
    })

@login_required
def confirmacion_pedido(request, pedido_id):
    pedido = get_object_or_404(Pedido, id=pedido_id, usuario=request.user)
    return render(request, 'pedidos/confirmacion.html', {'pedido': pedido})