from django.contrib import admin
from .models import Paciente, PacienteDocumento

@admin.register(Paciente)
class PacienteAdmin(admin.ModelAdmin):
    list_display = ['apellido', 'nombre', 'dni', 'telefono', 'activo']
    list_filter = ['activo']
    search_fields = ['nombre', 'apellido', 'dni', 'telefono']
    readonly_fields = ['fecha_registro', 'fecha_actualizacion']
    
    fieldsets = (
        ('Datos Personales', {
            'fields': ('nombre', 'apellido', 'dni', 'fecha_nacimiento')
        }),
        ('Contacto', {
            'fields': ('telefono', 'email')
        }),
        ('Información Adicional', {
            'fields': ('observaciones', 'activo')
        }),
        ('Metadata', {
            'fields': ('fecha_registro', 'fecha_actualizacion'),
            'classes': ('collapse',)
        }),
    )
    
@admin.register(PacienteDocumento)
class PacienteDocumentoAdmin(admin.ModelAdmin):
    list_display = ('paciente', 'titulo', 'fecha')
    list_filter = ('fecha',)
    search_fields = ('paciente__nombre', 'paciente__apellido', 'paciente__dni', 'titulo')
