from django.db import models

class Paciente(models.Model):
    # Datos básicos
    nombre = models.CharField(max_length=100)
    apellido = models.CharField(max_length=100)
    dni = models.CharField(max_length=20, unique=True)
    fecha_nacimiento = models.DateField()
    
    # Contacto
    telefono = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    
    # Observaciones
    observaciones = models.TextField(blank=True)
    
    # Metadata
    fecha_registro = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)
    activo = models.BooleanField(default=True)
    
    class Meta:
        verbose_name = "Paciente"
        verbose_name_plural = "Pacientes"
        ordering = ['apellido', 'nombre']
    
    def __str__(self):
        return f"{self.apellido}, {self.nombre} - DNI: {self.dni}"
    
    @property
    def edad(self):
        from datetime import date
        hoy = date.today()
        return hoy.year - self.fecha_nacimiento.year - (
            (hoy.month, hoy.day) < (self.fecha_nacimiento.month, self.fecha_nacimiento.day)
        )

class PacienteDocumento(models.Model):
    paciente = models.ForeignKey(Paciente, on_delete=models.CASCADE, related_name='documentos')
    titulo = models.CharField(max_length=255)
    archivo = models.FileField(upload_to='pacientes/documentos/')
    fecha = models.DateField(auto_now_add=True)
    notas = models.TextField(blank=True)

    class Meta:
        ordering = ['-fecha', '-id']
        verbose_name = "Documento de paciente"
        verbose_name_plural = "Documentos de paciente"

    def __str__(self):
        return f"{self.paciente} - {self.titulo}"

