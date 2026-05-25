from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PacienteViewSet, PacienteDocumentoViewSet

router = DefaultRouter()
router.register(r'pacientes', PacienteViewSet)
router.register(r'pacientes-documentos', PacienteDocumentoViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
