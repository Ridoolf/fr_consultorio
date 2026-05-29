from django.contrib import admin
from .models import TratamientoTipo, Pago, PagoItem

@admin.register(TratamientoTipo)
class TratamientoTipoAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'precio_base', 'activo')
    list_filter = ('activo',)
    search_fields = ('nombre',)


class PagoItemInline(admin.TabularInline):
    model = PagoItem
    extra = 1


@admin.register(Pago)
class PagoAdmin(admin.ModelAdmin):
    list_display = ('fecha', 'paciente', 'monto_total', 'medio')
    list_filter = ('medio', 'fecha')
    search_fields = ('paciente__nombre', 'paciente__apellido', 'paciente__dni')
    inlines = [PagoItemInline]
