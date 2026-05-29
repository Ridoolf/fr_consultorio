from rest_framework import serializers
from .models import Paciente, PacienteDocumento

class PacienteSerializer(serializers.ModelSerializer):
    edad = serializers.ReadOnlyField()

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
            'observaciones',
            'activo',
            'fecha_registro',
            'fecha_actualizacion',
        ]
        read_only_fields = ['id', 'fecha_registro', 'fecha_actualizacion']


class PacienteDocumentoSerializer(serializers.ModelSerializer):
    class Meta:
        model = PacienteDocumento
        fields = [
            'id',
            'paciente',
            'titulo',
            'archivo',
            'fecha',
            'notas',
        ]
        read_only_fields = ['id', 'fecha']
