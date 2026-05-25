from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Paciente, PacienteDocumento
from .serializers import PacienteSerializer, PacienteDocumentoSerializer

class PacienteViewSet(viewsets.ModelViewSet):
    queryset = Paciente.objects.all()
    serializer_class = PacienteSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nombre', 'apellido', 'dni', 'telefono']
    ordering_fields = ['apellido', 'nombre', 'fecha_registro']
    ordering = ['apellido', 'nombre']
    
    def get_queryset(self):
        base_qs = super().get_queryset()

        # Para estas acciones, no filtramos por activo
        if getattr(self, 'action', None) in ['activar', 'desactivar']:
            return base_qs

        # Filtrar solo activos por defecto, salvo ?activos=false
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