from rest_framework import serializers
from .models import Turno

class TurnoSerializer(serializers.ModelSerializer):
    paciente_nombre_completo = serializers.SerializerMethodField()
    hora_fin = serializers.ReadOnlyField()

    class Meta:
        model = Turno
        fields = [
            'id',
            'paciente',
            'paciente_nombre_completo',
            'fecha',
            'hora_inicio',
            'hora_fin',
            'duracion_minutos',
            'estado',
            'motivo',
            'notas_internas',
            'creado_en',
            'actualizado_en',
        ]
        read_only_fields = ['id', 'creado_en', 'actualizado_en', 'hora_fin']

    def get_paciente_nombre_completo(self, obj):
        return f"{obj.paciente.apellido}, {obj.paciente.nombre}"
