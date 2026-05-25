from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from datetime import datetime, timedelta
from .models import Turno
from .serializers import TurnoSerializer

class TurnoViewSet(viewsets.ModelViewSet):
    queryset = Turno.objects.select_related('paciente').all()
    serializer_class = TurnoSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['paciente__nombre', 'paciente__apellido', 'paciente__dni', 'motivo']
    ordering_fields = ['fecha', 'hora_inicio', 'creado_en']
    ordering = ['fecha', 'hora_inicio']

    def get_queryset(self):
        qs = super().get_queryset()

        fecha = self.request.query_params.get('fecha')
        if fecha:
            qs = qs.filter(fecha=fecha)

        paciente_id = self.request.query_params.get('paciente')
        if paciente_id:
            qs = qs.filter(paciente_id=paciente_id)

        return qs

    def list(self, request, *args, **kwargs):
        """
        Antes de listar, marcamos como 'realizado' los turnos
        de esa fecha cuyo horario ya terminó y no están cancelados/realizados.
        """
        fecha_str = request.query_params.get('fecha')
        if fecha_str:
            try:
                year, month, day = map(int, fecha_str.split('-'))
                fecha = datetime(year, month, day).date()
                ahora = timezone.localtime()  # fecha y hora actuales

                # Solo si estamos listando el día de hoy o días pasados
                if fecha <= ahora.date():
                    turnos_a_cerrar = Turno.objects.filter(
                        fecha=fecha,
                        estado__in=['pendiente', 'confirmado'],
                    )

                    for turno in turnos_a_cerrar:
                        dt_inicio = datetime.combine(turno.fecha, turno.hora_inicio)
                        dt_inicio = timezone.make_aware(dt_inicio, timezone.get_current_timezone())
                        dt_fin = dt_inicio + timedelta(minutes=turno.duracion_minutos)

                        if dt_fin <= ahora:
                            turno.estado = 'realizado'
                            turno.save()
            except ValueError:
                pass  # si la fecha viene malformada, no hacemos nada extra

        return super().list(request, *args, **kwargs)

    @action(detail=True, methods=['post'])
    def confirmar(self, request, pk=None):
        turno = self.get_object()
        turno.estado = 'confirmado'
        turno.save()
        return Response({'status': 'turno confirmado'})

    @action(detail=True, methods=['post'])
    def marcar_realizado(self, request, pk=None):
        turno = self.get_object()
        turno.estado = 'realizado'
        turno.save()
        return Response({'status': 'turno marcado como realizado'})

    @action(detail=True, methods=['post'])
    def cancelar(self, request, pk=None):
        turno = self.get_object()
        turno.estado = 'cancelado'
        turno.save()
        return Response({'status': 'turno cancelado'})
