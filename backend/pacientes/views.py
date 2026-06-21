from rest_framework import filters, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import NotFound
from rest_framework.response import Response

from .models import AlertaMedica, Odontograma, Paciente, PacienteDocumento, PacienteNota, odontograma_vacio
from .serializers import (
    AlertaMedicaSerializer,
    OdontogramaSerializer,
    PacienteDocumentoSerializer,
    PacienteNotaSerializer,
    PacienteSerializer,
)


class PacienteViewSet(viewsets.ModelViewSet):
    queryset = Paciente.objects.all()
    serializer_class = PacienteSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nombre', 'apellido', 'dni', 'telefono']
    ordering_fields = ['apellido', 'nombre', 'fecha_registro']
    ordering = ['apellido', 'nombre']

    def get_queryset(self):
        base_qs = super().get_queryset()

        if getattr(self, 'action', None) in ['activar', 'desactivar']:
            return base_qs

        activos = self.request.query_params.get('activos', None)
        if activos is not None and activos.lower() == 'false':
            return base_qs
        return base_qs.filter(activo=True)

    @action(detail=True, methods=['post'])
    def desactivar(self, request, pk=None):
        paciente = self.get_object()
        paciente.activo = False
        paciente.save()
        return Response({'status': 'paciente desactivado'})

    @action(detail=True, methods=['post'])
    def activar(self, request, pk=None):
        paciente = self.get_object()
        paciente.activo = True
        paciente.save()
        return Response({'status': 'paciente activado'})


class PacienteNotaViewSet(viewsets.ModelViewSet):
    queryset = PacienteNota.objects.select_related('paciente').all()
    serializer_class = PacienteNotaSerializer
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['fecha_creacion', 'id']
    ordering = ['-fecha_creacion', '-id']

    def get_queryset(self):
        qs = super().get_queryset()
        paciente_id = self.request.query_params.get('paciente')
        if paciente_id:
            qs = qs.filter(paciente_id=paciente_id)
        return qs


class AlertaMedicaViewSet(viewsets.ModelViewSet):
    queryset = AlertaMedica.objects.select_related('paciente').all()
    serializer_class = AlertaMedicaSerializer
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['id']
    ordering = ['-id']

    def get_queryset(self):
        qs = super().get_queryset()
        paciente_id = self.request.query_params.get('paciente')
        if paciente_id:
            qs = qs.filter(paciente_id=paciente_id)
        return qs


class OdontogramaViewSet(viewsets.ModelViewSet):
    queryset = Odontograma.objects.select_related('paciente').all()
    serializer_class = OdontogramaSerializer
    http_method_names = ['get', 'put', 'patch', 'head', 'options']

    def get_queryset(self):
        qs = super().get_queryset()
        paciente_id = self.request.query_params.get('paciente')
        if paciente_id:
            qs = qs.filter(paciente_id=paciente_id)
        return qs

    def list(self, request, *args, **kwargs):
        paciente_id = request.query_params.get('paciente')
        if paciente_id:
            if not Paciente.objects.filter(pk=paciente_id).exists():
                raise NotFound('Paciente no encontrado.')
            odontograma, _ = Odontograma.objects.get_or_create(
                paciente_id=paciente_id,
                defaults={'piezas': odontograma_vacio()},
            )
            serializer = self.get_serializer(odontograma)
            return Response(serializer.data)
        return super().list(request, *args, **kwargs)


class PacienteDocumentoViewSet(viewsets.ModelViewSet):
    queryset = PacienteDocumento.objects.select_related('paciente').all()
    serializer_class = PacienteDocumentoSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['paciente__nombre', 'paciente__apellido', 'paciente__dni', 'titulo']
    ordering_fields = ['fecha', 'id']
    ordering = ['-fecha', '-id']

    def get_queryset(self):
        qs = super().get_queryset()
        paciente_id = self.request.query_params.get('paciente')
        if paciente_id:
            qs = qs.filter(paciente_id=paciente_id)
        return qs
