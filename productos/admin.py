from django.contrib import admin
from .models import Categoria, Producto, ProductoImagen

class ProductoImagenInline(admin.TabularInline):
    model = ProductoImagen
    extra = 1
    readonly_fields = ['preview_imagen']

    def preview_imagen(self, obj):
        if obj.imagen:
            return f'<img src="{obj.imagen.url}" style="max-height: 50px;" />'
        return "Sin imagen"
    preview_imagen.allow_tags = True

@admin.register(Producto)
class ProductoAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'precio', 'categoria', 'tipo_mola', 'stock', 'disponible', 'fecha_creacion']
    list_filter = ['categoria', 'tipo_mola', 'disponible', 'fecha_creacion']
    search_fields = ['nombre', 'descripcion', 'artesano', 'comunidad']
    list_editable = ['precio', 'stock', 'disponible']
    prepopulated_fields = {'slug': ('nombre',)}
    inlines = [ProductoImagenInline]
    readonly_fields = ['fecha_creacion', 'fecha_actualizacion']
    
    fieldsets = (
        ('Información Básica', {
            'fields': ('nombre', 'slug', 'descripcion', 'categoria', 'tipo_mola')
        }),
        ('Precios y Stock', {
            'fields': ('precio', 'precio_original', 'stock', 'disponible')
        }),
        ('Información Cultural', {
            'fields': ('artesano', 'comunidad')
        }),
        ('Imágenes', {
            'fields': ('imagen_principal',)
        }),
        ('Fechas', {
            'fields': ('fecha_creacion', 'fecha_actualizacion'),
            'classes': ('collapse',)
        })
    )

@admin.register(Categoria)
class CategoriaAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'slug']
    prepopulated_fields = {'slug': ('nombre',)}
    search_fields = ['nombre']

admin.site.register(ProductoImagen)