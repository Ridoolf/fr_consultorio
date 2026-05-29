from django.db import models
from pacientes.models import Paciente

class TratamientoTipo(models.Model):
    nombre = models.CharField(max_length=200)
    precio_base = models.DecimalField(max_digits=10, decimal_places=2)
    activo = models.BooleanField(default=True)

    class Meta:
        ordering = ['nombre']
        verbose_name = "Tratamiento"
        verbose_name_plural = "Tratamientos"

    def __str__(self):
        return f"{self.nombre} (${self.precio_base})"


class Pago(models.Model):
    MEDIOS = [
        ('efectivo', 'Efectivo'),
        ('transferencia', 'Transferencia'),
        ('tarjeta', 'Tarjeta'),
    ]

    paciente = models.ForeignKey(Paciente, on_delete=models.CASCADE, related_name='pagos')
    fecha = models.DateField()
    monto_total = models.DecimalField(max_digits=10, decimal_places=2)
    medio = models.CharField(max_length=20, choices=MEDIOS)
    notas = models.TextField(blank=True)

    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-fecha', '-id']
        verbose_name = "Pago"
        verbose_name_plural = "Pagos"

    def __str__(self):
        return f"{self.fecha} - {self.paciente} - ${self.monto_total}"


class PagoItem(models.Model):
    pago = models.ForeignKey(Pago, on_delete=models.CASCADE, related_name='items')
    tratamiento = models.ForeignKey(TratamientoTipo, on_delete=models.PROTECT, related_name='items')
    cantidad = models.PositiveIntegerField(default=1)
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=2)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        verbose_name = "Detalle de pago"
        verbose_name_plural = "Detalles de pago"

    def __str__(self):
        return f"{self.tratamiento} x{self.cantidad} (${self.subtotal})"
