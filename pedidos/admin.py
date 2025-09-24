from django.contrib import admin
from .models import Pedido, PedidoItem

# Register your models here.

class PedidoItemInline(admin.TabularInline):
    model = PedidoItem
    readonly_fields = ['producto', 'precio', 'cantidad']
    extra = 0
    can_delete = False

    def has_add_permission(self, request, obj=None):
        return False

@admin.register(Pedido)
class PedidoAdmin(admin.ModelAdmin):
    list_display = ['id', 'usuario', 'nombre_completo', 'total', 'estado', 'pagado', 'fecha_pedido']
    list_filter = ['estado', 'pagado', 'fecha_pedido', 'ciudad']
    search_fields = ['id', 'usuario__username', 'nombre_completo', 'email']
    readonly_fields = ['fecha_pedido', 'total']
    inlines = [PedidoItemInline]
    
    fieldsets = (
        ('Información del Pedido', {
            'fields': ('usuario', 'fecha_pedido', 'estado', 'total', 'pagado')
        }),
        ('Información de Envío', {
            'fields': ('nombre_completo', 'email', 'telefono', 'direccion', 'ciudad', 'provincia', 'codigo_postal')
        }),
        ('Información de Pago', {
            'fields': ('metodo_pago',)
        })
    )
    
    actions = ['marcar_como_pagado', 'marcar_como_enviado', 'marcar_como_entregado']

    def marcar_como_pagado(self, request, queryset):
        updated = queryset.update(pagado=True)
        self.message_user(request, f'{updated} pedidos marcados como pagados.')
    marcar_como_pagado.short_description = "Marcar como pagado"

    def marcar_como_enviado(self, request, queryset):
        updated = queryset.update(estado='enviado')
        self.message_user(request, f'{updated} pedidos marcados como enviados.')
    marcar_como_enviado.short_description = "Marcar como enviado"

    def marcar_como_entregado(self, request, queryset):
        updated = queryset.update(estado='entregado')
        self.message_user(request, f'{updated} pedidos marcados como entregados.')
    marcar_como_entregado.short_description = "Marcar como entregado"
