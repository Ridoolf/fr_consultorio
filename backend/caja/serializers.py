from decimal import Decimal

from django.db import transaction
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

    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError('Debe incluir al menos un ítem.')
        return value

    def validate(self, attrs):
        items = attrs.get('items', [])
        monto_total = attrs.get('monto_total')

        if items and monto_total is not None:
            suma = Decimal('0')
            for item in items:
                cantidad = Decimal(str(item['cantidad']))
                precio = Decimal(str(item['precio_unitario']))
                subtotal = Decimal(str(item['subtotal']))
                esperado = cantidad * precio
                if subtotal != esperado:
                    raise serializers.ValidationError({
                        'items': f'El subtotal ({subtotal}) no coincide con cantidad × precio ({esperado}).',
                    })
                suma += subtotal
            if Decimal(str(monto_total)) != suma:
                raise serializers.ValidationError({
                    'monto_total': f'El monto total ({monto_total}) no coincide con la suma de ítems ({suma}).',
                })
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        pago = Pago.objects.create(**validated_data)
        for item_data in items_data:
            PagoItem.objects.create(pago=pago, **item_data)
        return pago
