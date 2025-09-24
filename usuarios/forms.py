
from django import forms
"""
Este módulo define los formularios personalizados para el manejo de usuarios y perfiles en la aplicación.

Clases:
    FormularioRegistro:
        Formulario de registro de usuario basado en UserCreationForm, extendido para incluir campos adicionales
        como email, nombre y apellido. Sobrescribe el método save para asegurar que el email se guarde correctamente.

    FormularioPerfil:
        Formulario basado en ModelForm para la edición y creación de perfiles de usuario (Perfil). Incluye widgets
        personalizados para la fecha de nacimiento y la dirección.

    FormularioUsuario:
        Formulario basado en ModelForm para la edición de datos básicos del usuario (nombre, apellido y email).

Notas para desarrolladores:
    - Asegúrate de que el modelo Perfil esté correctamente definido en models.py antes de usar FormularioPerfil.
    - Puedes extender estos formularios para agregar validaciones personalizadas según los requisitos del proyecto.
    - Los widgets personalizados mejoran la experiencia de usuario en los campos de fecha y dirección.
"""
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
from .models import Perfil

class FormularioRegistro(UserCreationForm):
    email = forms.EmailField(required=True)
    first_name = forms.CharField(max_length=30, required=True, label='Nombre')
    last_name = forms.CharField(max_length=30, required=True, label='Apellido')

    class Meta:
        model = User
        fields = ['username', 'first_name', 'last_name', 'email', 'password1', 'password2']

    def save(self, commit=True):
        user = super().save(commit=False)
        user.email = self.cleaned_data['email']
        if commit:
            user.save()
        return user

class FormularioPerfil(forms.ModelForm):
    class Meta:
        model = Perfil
        fields = ['telefono', 'direccion', 'ciudad', 'provincia', 'codigo_postal', 'fecha_nacimiento']
        widgets = {
            'fecha_nacimiento': forms.DateInput(attrs={'type': 'date'}),
            'direccion': forms.Textarea(attrs={'rows': 3}),
        }

class FormularioUsuario(forms.ModelForm):
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email']