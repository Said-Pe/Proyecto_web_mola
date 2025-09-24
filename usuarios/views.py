
from django.shortcuts import render, redirect
from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .forms import FormularioRegistro, FormularioPerfil, FormularioUsuario

# Create your views here.
def registro(request):
    if request.method == 'POST':
        form = FormularioRegistro(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            messages.success(request, '¡Registro exitoso! Bienvenido a Molas Guna.')
            return redirect('inicio')
    else:
        form = FormularioRegistro()
    return render(request, 'usuarios/registro.html', {'form': form})

def iniciar_sesion(request):
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            messages.success(request, f'¡Bienvenido de nuevo, {user.first_name}!')
            return redirect('inicio')
        else:
            messages.error(request, 'Usuario o contraseña incorrectos.')
    return render(request, 'usuarios/iniciar_sesion.html')

@login_required
def cerrar_sesion(request):
    logout(request)
    messages.success(request, 'Has cerrado sesión correctamente.')
    return redirect('inicio')

@login_required
def perfil(request):
    if request.method == 'POST':
        user_form = FormularioUsuario(request.POST, instance=request.user)
        profile_form = FormularioPerfil(request.POST, instance=request.user.perfil)
        if user_form.is_valid() and profile_form.is_valid():
            user_form.save()
            profile_form.save()
            messages.success(request, 'Perfil actualizado correctamente.')
            return redirect('perfil')
    else:
        user_form = FormularioUsuario(instance=request.user)
        profile_form = FormularioPerfil(instance=request.user.perfil)
    
    return render(request, 'usuarios/perfil.html', {
        'user_form': user_form,
        'profile_form': profile_form
    })