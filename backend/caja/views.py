from rest_framework import viewsets, filters
from .models import TratamientoTipo, Pago
from .serializers import TratamientoTipoSerializer, PagoSerializer

class TratamientoTipoViewSet(viewsets.ModelViewSet):
    queryset = TratamientoTipo.objects.all()
    serializer_class = TratamientoTipoSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nombre']
    ordering_fields = ['nombre', 'precio_base']
    ordering = ['nombre']

    def get_queryset(self):
        qs = super().get_queryset()
        activos = self.request.query_params.get('activos')
        if activos and activos.lower() == 'true':
            qs = qs.filter(activo=True)
        return qs


class PagoViewSet(viewsets.ModelViewSet):
    queryset = Pago.objects.select_related('paciente').prefetch_related('items__tratamiento').all()
    serializer_class = PagoSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['paciente__nombre', 'paciente__apellido', 'paciente__dni']
    ordering_fields = ['fecha', 'monto_total', 'creado_en']
    ordering = ['-fecha', '-id']

    def get_queryset(self):
        qs = super().get_queryset()
        fecha = self.request.query_params.get('fecha')
        paciente_id = self.request.query_params.get('paciente')
        if fecha:
            qs = qs.filter(fecha=fecha)
        if paciente_id:
            qs = qs.filter(paciente_id=paciente_id)
        return qs
