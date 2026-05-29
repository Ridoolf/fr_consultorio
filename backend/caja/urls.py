from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TratamientoTipoViewSet, PagoViewSet

router = DefaultRouter()
router.register(r'tratamientos', TratamientoTipoViewSet)
router.register(r'pagos', PagoViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
