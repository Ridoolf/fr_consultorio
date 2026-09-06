from django.db.models.deletion import ProtectedError
from rest_framework import viewsets, filters
from rest_framework.exceptions import APIException
from .models import TratamientoTipo, Pago
from .serializers import TratamientoTipoSerializer, PagoSerializer


class TratamientoEnUsoError(APIException):
    status_code = 409
    default_detail = (
        'No se puede eliminar porque tiene cobros registrados. '
        'Desactivá el tratamiento en su lugar.'
    )


class TratamientoTipoViewSet(viewsets.ModelViewSet):
    queryset = TratamientoTipo.objects.all()
    serializer_class = TratamientoTipoSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nombre']
    ordering_fields = ['nombre', 'precio_base']
    ordering = ['nombre']

    def get_queryset(self):
        qs = super().get_queryset()
        if self.action in ('retrieve', 'update', 'partial_update', 'destroy'):
            return qs
        activos = self.request.query_params.get('activos')
        if activos is not None and activos.lower() == 'false':
            return qs
        if activos is None or activos.lower() == 'true':
            qs = qs.filter(activo=True)
        return qs

    def perform_destroy(self, instance):
        try:
            super().perform_destroy(instance)
        except ProtectedError:
            raise TratamientoEnUsoError()


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
