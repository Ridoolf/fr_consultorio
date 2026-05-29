from rest_framework import serializers
from .models import TratamientoTipo, Pago, PagoItem

class TratamientoTipoSerializer(serializers.ModelSerializer):
    class Meta:
        model = TratamientoTipo
        fields = ['id', 'nombre', 'precio_base', 'activo']


class PagoItemSerializer(serializers.ModelSerializer):
    tratamiento_nombre = serializers.CharField(source='tratamiento.nombre', read_only=True)

    class Meta:
        model = PagoItem
        fields = [
            'id',
            'tratamiento',
            'tratamiento_nombre',
            'cantidad',
            'precio_unitario',
            'subtotal',
        ]


class PagoSerializer(serializers.ModelSerializer):
    paciente_nombre_completo = serializers.SerializerMethodField()
    items = PagoItemSerializer(many=True)

    class Meta:
        model = Pago
        fields = [
            'id',
            'paciente',
            'paciente_nombre_completo',
            'fecha',
            'monto_total',
            'medio',
            'notas',
            'items',
            'creado_en',
            'actualizado_en',
        ]
        read_only_fields = ['id', 'creado_en', 'actualizado_en']

    def get_paciente_nombre_completo(self, obj):
        return f"{obj.paciente.apellido}, {obj.paciente.nombre}"

    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        pago = Pago.objects.create(**validated_data)
        for item_data in items_data:
            PagoItem.objects.create(pago=pago, **item_data)
        return pago
