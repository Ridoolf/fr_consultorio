from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    AlertaMedicaViewSet,
    OdontogramaViewSet,
    PacienteDocumentoViewSet,
    PacienteNotaViewSet,
    PacienteViewSet,
)

router = DefaultRouter()
router.register(r'pacientes', PacienteViewSet)
router.register(r'pacientes-documentos', PacienteDocumentoViewSet)
router.register(r'pacientes-notas', PacienteNotaViewSet)
router.register(r'alertas-medicas', AlertaMedicaViewSet)
router.register(r'odontogramas', OdontogramaViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
