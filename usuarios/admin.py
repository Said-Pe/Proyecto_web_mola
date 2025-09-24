from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User
from .models import Perfil

# Register your models here.

class PerfilInline(admin.StackedInline):
    model = Perfil
    can_delete = False
    verbose_name_plural = 'Perfil'

class CustomUserAdmin(UserAdmin):
    inlines = [PerfilInline]
    list_display = ['username', 'email', 'first_name', 'last_name', 'date_joined', 'is_staff']
    list_filter = ['is_staff', 'is_active', 'date_joined']

# Re-register UserAdmin
admin.site.unregister(User)
admin.site.register(User, CustomUserAdmin)