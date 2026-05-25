from django.contrib import admin
from .models import Paciente, PacienteDocumento

@admin.register(Paciente)
class PacienteAdmin(admin.ModelAdmin):
    list_display = ['apellido', 'nombre', 'dni', 'telefono', 'obra_social', 'activo']
    list_filter = ['activo', 'obra_social']
    search_fields = ['nombre', 'apellido', 'dni', 'telefono']
    readonly_fields = ['fecha_registro', 'fecha_actualizacion']
    
    fieldsets = (
        ('Datos Personales', {
            'fields': ('nombre', 'apellido', 'dni', 'fecha_nacimiento')
        }),
        ('Contacto', {
            'fields': ('telefono', 'email')
        }),
        ('Obra Social', {
            'fields': ('obra_social', 'numero_afiliado')
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
    list_display = ('paciente', 'tipo', 'titulo', 'fecha')
    list_filter = ('tipo', 'fecha')
    search_fields = ('paciente__nombre', 'paciente__apellido', 'paciente__dni', 'titulo')
