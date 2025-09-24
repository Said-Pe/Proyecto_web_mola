from django.db import models
from django.contrib.auth.models import User

# Create your models here.


class Categoria(models.Model):
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField(blank=True)
    imagen = models.ImageField(upload_to='categorias/', blank=True, null=True)
    slug = models.SlugField(unique=True)


class Producto(models.Model):
    TIPO_MOLA = [
        ('tradicional', 'Tradicional'),
        ('moderna', 'Moderna'),
        ('personalizada', 'Personalizada'),
    ]
    
    nombre = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    descripcion = models.TextField()
    precio = models.DecimalField(max_digits=10, decimal_places=2)
    precio_original = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    categoria = models.ForeignKey(Categoria, on_delete=models.CASCADE)
    tipo_mola = models.CharField(max_length=20, choices=TIPO_MOLA)
    artesano = models.CharField(max_length=100)
    comunidad = models.CharField(max_length=100)
    stock = models.IntegerField(default=0)
    imagen_principal = models.ImageField(upload_to='productos/')
    disponible = models.BooleanField(default=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-fecha_creacion']
    
    def __str__(self):
        return self.nombre
    
    def tiene_descuento(self):
        return self.precio_original and self.precio_original > self.precio
    
    def porcentaje_descuento(self):
        if self.tiene_descuento():
            return int(((self.precio_original - self.precio) / self.precio_original) * 100)
        return 0

class ProductoImagen(models.Model):
    producto = models.ForeignKey(Producto, related_name='imagenes', on_delete=models.CASCADE)
    imagen = models.ImageField(upload_to='productos/galeria/')
    orden = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['orden']
    
    def __str__(self):
        return f"Imagen de {self.producto.nombre}"
    
class Favorito(models.Model):
    usuario = models.ForeignKey(User, on_delete=models.CASCADE)
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE)
    fecha_agregado = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['usuario', 'producto']
        verbose_name = 'Favorito'
        verbose_name_plural = 'Favoritos'

    def __str__(self):
        return f"{self.usuario.username} - {self.producto.nombre}"