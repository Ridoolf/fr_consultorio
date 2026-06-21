from django.contrib import admin
from .models import AlertaMedica, Odontograma, Paciente, PacienteDocumento, PacienteNota


@admin.register(Paciente)
class PacienteAdmin(admin.ModelAdmin):
    list_display = ['apellido', 'nombre', 'dni', 'telefono', 'activo']
    list_filter = ['activo']
    search_fields = ['nombre', 'apellido', 'dni', 'telefono']
    readonly_fields = ['fecha_registro', 'fecha_actualizacion']

    fieldsets = (
        ('Datos Personales', {
            'fields': ('nombre', 'apellido', 'dni', 'fecha_nacimiento', 'genero', 'estado_civil'),
        }),
        ('Contacto', {
            'fields': ('telefono', 'email', 'direccion'),
        }),
        ('Información Adicional', {
            'fields': ('ocupacion', 'activo'),
        }),
        ('Metadata', {
            'fields': ('fecha_registro', 'fecha_actualizacion'),
            'classes': ('collapse',),
        }),
    )


@admin.register(PacienteNota)
class PacienteNotaAdmin(admin.ModelAdmin):
    list_display = ('paciente', 'texto', 'fecha_creacion')
    search_fields = ('paciente__nombre', 'paciente__apellido', 'texto')


@admin.register(AlertaMedica)
class AlertaMedicaAdmin(admin.ModelAdmin):
    list_display = ('paciente', 'tipo', 'descripcion', 'activa')
    list_filter = ('tipo', 'activa')
    search_fields = ('paciente__nombre', 'paciente__apellido', 'descripcion')


@admin.register(Odontograma)
class OdontogramaAdmin(admin.ModelAdmin):
    list_display = ('paciente', 'fecha_actualizacion')


@admin.register(PacienteDocumento)
class PacienteDocumentoAdmin(admin.ModelAdmin):
    list_display = ('paciente', 'titulo', 'fecha')
    list_filter = ('fecha',)
    search_fields = ('paciente__nombre', 'paciente__apellido', 'paciente__dni', 'titulo')
