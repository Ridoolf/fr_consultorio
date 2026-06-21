from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import Odontograma, Paciente, odontograma_vacio


@receiver(post_save, sender=Paciente)
def crear_odontograma_paciente(sender, instance, created, **kwargs):
    if created:
        Odontograma.objects.create(paciente=instance, piezas=odontograma_vacio())
