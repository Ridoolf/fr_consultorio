from decimal import Decimal

from django.db import transaction
from rest_framework import serializers
from rest_framework.exceptions import APIException
from .models import TratamientoTipo, Pago, PagoItem

PAGO_ITEM_FIELDS = {'tratamiento', 'cantidad', 'precio_unitario', 'subtotal'}


def _money(value) -> Decimal:
    return Decimal(str(value)).quantize(Decimal('0.01'))


def _normalize_pago_items(items):
    normalized = []
    total = Decimal('0')
    for item in items:
        cantidad = int(_money(item['cantidad']))
        precio = _money(item['precio_unitario'])
        subtotal = _money(Decimal(cantidad) * precio)
        normalized.append({
            'tratamiento': item['tratamiento'],
            'cantidad': cantidad,
            'precio_unitario': precio,
            'subtotal': subtotal,
        })
        total += subtotal
    return normalized, total


class DuplicateTratamientoError(APIException):
    status_code = 400

    def __init__(self, existing):
        super().__init__({
            'code': 'duplicate_name',
            'detail': 'Ya existe un tratamiento con ese nombre.',
            'existing': {
                'id': existing.id,
                'nombre': existing.nombre,
                'precio_base': str(existing.precio_base),
                'activo': existing.activo,
            },
        })


class DuplicateTratamientoError(APIException):
    status_code = 400

    def __init__(self, existing):
        super().__init__({
            'code': 'duplicate_name',
            'detail': 'Ya existe un tratamiento con ese nombre.',
            'existing': {
                'id': existing.id,
                'nombre': existing.nombre,
                'precio_base': str(existing.precio_base),
                'activo': existing.activo,
            },
        })


class TratamientoTipoSerializer(serializers.ModelSerializer):
    en_uso = serializers.SerializerMethodField()

    class Meta:
        model = TratamientoTipo
        fields = ['id', 'nombre', 'precio_base', 'activo', 'en_uso']

    def get_en_uso(self, obj):
        return obj.items.exists()

    def validate_nombre(self, value):
        nombre = value.strip()
        if not nombre:
            raise serializers.ValidationError('El nombre no puede estar vacío.')
        return nombre

    def validate(self, attrs):
        attrs = super().validate(attrs)
        nombre = attrs.get('nombre')
        if nombre is None and self.instance:
            nombre = self.instance.nombre
        if nombre is not None:
            nombre = nombre.strip()
            attrs['nombre'] = nombre
            qs = TratamientoTipo.objects.filter(nombre__iexact=nombre)
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)
            existing = qs.first()
            if existing:
                raise DuplicateTratamientoError(existing)
        return attrs


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
        items = attrs.get('items')
        if items is None and self.instance:
            items = [
                {
<<<<<<< Updated upstream
=======
                    'tratamiento': item.tratamiento_id,
>>>>>>> Stashed changes
                    'cantidad': item.cantidad,
                    'precio_unitario': item.precio_unitario,
                    'subtotal': item.subtotal,
                }
                for item in self.instance.items.all()
            ]

<<<<<<< Updated upstream
        monto_total = attrs.get('monto_total')
        if monto_total is None and self.instance:
            monto_total = self.instance.monto_total
=======
        if items is not None:
            normalized, total = _normalize_pago_items(items)
            attrs['items'] = normalized
            attrs['monto_total'] = total
        elif attrs.get('monto_total') is not None and self.instance:
            attrs['monto_total'] = _money(attrs['monto_total'])
>>>>>>> Stashed changes

        return attrs

    @transaction.atomic
    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        pago = Pago.objects.create(**validated_data)
        for item_data in items_data:
            clean = {key: item_data[key] for key in PAGO_ITEM_FIELDS}
            PagoItem.objects.create(pago=pago, **clean)
        return pago

    @transaction.atomic
    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if items_data is not None:
            instance.items.all().delete()
            for item_data in items_data:
<<<<<<< Updated upstream
                PagoItem.objects.create(pago=instance, **item_data)
=======
                clean = {key: item_data[key] for key in PAGO_ITEM_FIELDS}
                PagoItem.objects.create(pago=instance, **clean)
>>>>>>> Stashed changes

        return instance
