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
            'obra_social',
            'numero_afiliado',
            'observaciones',
            'activo',
            'fecha_registro',
            'fecha_actualizacion',
        ]
        read_only_fields = ['id', 'fecha_registro', 'fecha_actualizacion']


class PacienteDocumentoSerializer(serializers.ModelSerializer):
    tipo_display = serializers.CharField(source='get_tipo_display', read_only=True)

    class Meta:
        model = PacienteDocumento
        fields = [
            'id',
            'paciente',
            'tipo',
            'tipo_display',
            'titulo',
            'archivo',
            'fecha',
            'notas',
        ]
        read_only_fields = ['id', 'fecha']
