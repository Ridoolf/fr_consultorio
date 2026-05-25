from django.db import models
from pacientes.models import Paciente

class Turno(models.Model):
    ESTADOS = [
        ('pendiente', 'Pendiente'),
        ('confirmado', 'Confirmado'),
        ('realizado', 'Realizado'),
        ('cancelado', 'Cancelado'),
    ]

    paciente = models.ForeignKey(Paciente, on_delete=models.CASCADE, related_name='turnos')

    fecha = models.DateField()
    hora_inicio = models.TimeField()
    duracion_minutos = models.PositiveIntegerField(default=30)

    estado = models.CharField(max_length=20, choices=ESTADOS, default='pendiente')

    motivo = models.CharField(max_length=255, blank=True)
    notas_internas = models.TextField(blank=True)

    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['fecha', 'hora_inicio']
        verbose_name = "Turno"
        verbose_name_plural = "Turnos"

    def __str__(self):
        return f"{self.fecha} {self.hora_inicio} - {self.paciente}"

    @property
    def hora_fin(self):
        from datetime import datetime, timedelta
        dt_inicio = datetime.combine(self.fecha, self.hora_inicio)
        dt_fin = dt_inicio + timedelta(minutes=self.duracion_minutos)
        return dt_fin.time()
