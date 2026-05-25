from rest_framework import serializers
from .models import Paciente

class PacienteSerializer(serializers.ModelSerializer):
    edad = serializers.ReadOnlyField()  # Campo calculado
    
    class Meta:
        model = Paciente
        fields = [
            'id',
            'nombre',
            'apellido',
            'dni',
            'fecha_nacimiento',
            'edad',
            'telefono',
            'email',
            'obra_social',
            'numero_afiliado',
            'observaciones',
            'activo',
            'fecha_registro',
            'fecha_actualizacion'
        ]
        read_only_fields = ['id', 'fecha_registro', 'fecha_actualizacion']
