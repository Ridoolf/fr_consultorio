import os

from rest_framework import serializers

from .models import AlertaMedica, Odontograma, Paciente, PacienteDocumento, PacienteNota

ALLOWED_DOC_EXTENSIONS = {'.pdf', '.jpg', '.jpeg', '.png', '.webp'}
MAX_DOC_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB


class PacienteSerializer(serializers.ModelSerializer):
    edad = serializers.SerializerMethodField()

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
            'direccion',
            'ocupacion',
            'estado_civil',
            'genero',
            'activo',
            'fecha_registro',
            'fecha_actualizacion',
        ]
        read_only_fields = ['id', 'activo', 'fecha_registro', 'fecha_actualizacion', 'edad']

    def get_edad(self, obj):
        return obj.edad


class PacienteNotaSerializer(serializers.ModelSerializer):
    class Meta:
        model = PacienteNota
        fields = ['id', 'paciente', 'texto', 'fecha_creacion', 'fecha_actualizacion']
        read_only_fields = ['id', 'fecha_creacion', 'fecha_actualizacion']


class AlertaMedicaSerializer(serializers.ModelSerializer):
    tipo_display = serializers.CharField(source='get_tipo_display', read_only=True)

    class Meta:
        model = AlertaMedica
        fields = [
            'id',
            'paciente',
            'tipo',
            'tipo_display',
            'descripcion',
            'detalle',
            'activa',
        ]
        read_only_fields = ['id', 'tipo_display']


class OdontogramaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Odontograma
        fields = ['id', 'paciente', 'piezas', 'fecha_actualizacion']
        read_only_fields = ['id', 'fecha_actualizacion']


class PacienteDocumentoSerializer(serializers.ModelSerializer):
    archivo_disponible = serializers.SerializerMethodField()

    class Meta:
        model = PacienteDocumento
        fields = [
            'id',
            'paciente',
            'titulo',
            'archivo',
            'archivo_disponible',
            'fecha',
            'notas',
        ]
        read_only_fields = ['id', 'fecha', 'archivo_disponible']

    def get_archivo_disponible(self, obj):
        if not obj.archivo:
            return False
        url = str(obj.archivo)
        if url.startswith('/media/'):
            return False
        return url.startswith('http')

    def validate_archivo(self, value):
        if value.size > MAX_DOC_SIZE_BYTES:
            raise serializers.ValidationError('El archivo no puede superar 10 MB.')
        ext = os.path.splitext(value.name)[1].lower()
        if ext not in ALLOWED_DOC_EXTENSIONS:
            raise serializers.ValidationError(
                f'Formato no permitido. Usá: {", ".join(sorted(ALLOWED_DOC_EXTENSIONS))}'
            )
        return value
