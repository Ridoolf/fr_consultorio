from django.contrib import admin
from .models import Turno

@admin.register(Turno)
class TurnoAdmin(admin.ModelAdmin):
    list_display = ('fecha', 'hora_inicio', 'paciente', 'estado', 'motivo')
    list_filter = ('estado', 'fecha')
    search_fields = ('paciente__nombre', 'paciente__apellido', 'paciente__dni', 'motivo')
    autocomplete_fields = ('paciente',)
