from django.db import models

ESTADO_CIVIL_CHOICES = [
    ('soltero', 'Soltero/a'),
    ('casado', 'Casado/a'),
    ('divorciado', 'Divorciado/a'),
    ('viudo', 'Viudo/a'),
    ('union_convivencial', 'Unión convivencial'),
    ('otro', 'Otro'),
]

GENERO_CHOICES = [
    ('masculino', 'Masculino'),
    ('femenino', 'Femenino'),
    ('otro', 'Otro'),
    ('prefiero_no_decir', 'Prefiero no decir'),
]

PIEZAS_FDI = [
    '18', '17', '16', '15', '14', '13', '12', '11',
    '21', '22', '23', '24', '25', '26', '27', '28',
    '48', '47', '46', '45', '44', '43', '42', '41',
    '31', '32', '33', '34', '35', '36', '37', '38',
]

PIEZAS_PRIMARIAS = [
    '55', '54', '53', '52', '51',
    '61', '62', '63', '64', '65',
    '85', '84', '83', '82', '81',
    '71', '72', '73', '74', '75',
]

TODAS_LAS_PIEZAS = PIEZAS_FDI + PIEZAS_PRIMARIAS


def pieza_vacia():
    return {
        'estado': 'sano',
        'superficies': {'V': False, 'M': False, 'O': False, 'D': False, 'L': False},
        'nota': '',
    }


def odontograma_vacio():
    return {num: pieza_vacia() for num in TODAS_LAS_PIEZAS}


class Paciente(models.Model):
    nombre = models.CharField(max_length=100)
    apellido = models.CharField(max_length=100)
    dni = models.CharField(max_length=20, unique=True)
    fecha_nacimiento = models.DateField()

    telefono = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)

    direccion = models.TextField(blank=True)
    ocupacion = models.CharField(max_length=100, blank=True)
    estado_civil = models.CharField(max_length=30, choices=ESTADO_CIVIL_CHOICES, blank=True)
    genero = models.CharField(max_length=30, choices=GENERO_CHOICES, blank=True)

    fecha_registro = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)
    activo = models.BooleanField(default=True)

    class Meta:
        verbose_name = 'Paciente'
        verbose_name_plural = 'Pacientes'
        ordering = ['apellido', 'nombre']

    def __str__(self):
        return f'{self.apellido}, {self.nombre} - DNI: {self.dni}'

    @property
    def edad(self):
        from datetime import date
        hoy = date.today()
        return hoy.year - self.fecha_nacimiento.year - (
            (hoy.month, hoy.day) < (self.fecha_nacimiento.month, self.fecha_nacimiento.day)
        )


class PacienteNota(models.Model):
    paciente = models.ForeignKey(Paciente, on_delete=models.CASCADE, related_name='notas')
    texto = models.TextField()
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-fecha_creacion', '-id']
        verbose_name = 'Nota de paciente'
        verbose_name_plural = 'Notas de paciente'

    def __str__(self):
        return f'{self.paciente} - {self.texto[:50]}'


class AlertaMedica(models.Model):
    TIPOS = [
        ('alergia', 'Alergia'),
        ('enfermedad', 'Enfermedad'),
        ('medicacion', 'Medicación'),
        ('otro', 'Otro'),
    ]

    paciente = models.ForeignKey(Paciente, on_delete=models.CASCADE, related_name='alertas_medicas')
    tipo = models.CharField(max_length=20, choices=TIPOS)
    descripcion = models.CharField(max_length=255)
    detalle = models.TextField(blank=True)
    activa = models.BooleanField(default=True)

    class Meta:
        ordering = ['-id']
        verbose_name = 'Alerta médica'
        verbose_name_plural = 'Alertas médicas'

    def __str__(self):
        return f'{self.paciente} - {self.get_tipo_display()}: {self.descripcion}'


class Odontograma(models.Model):
    paciente = models.OneToOneField(Paciente, on_delete=models.CASCADE, related_name='odontograma')
    piezas = models.JSONField(default=dict)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Odontograma'
        verbose_name_plural = 'Odontogramas'

    def __str__(self):
        return f'Odontograma de {self.paciente}'


class PacienteDocumento(models.Model):
    paciente = models.ForeignKey(Paciente, on_delete=models.CASCADE, related_name='documentos')
    titulo = models.CharField(max_length=255)
    archivo = models.FileField(upload_to='pacientes/documentos/')
    fecha = models.DateField(auto_now_add=True)
    notas = models.TextField(blank=True)

    class Meta:
        ordering = ['-fecha', '-id']
        verbose_name = 'Documento de paciente'
        verbose_name_plural = 'Documentos de paciente'

    def __str__(self):
        return f'{self.paciente} - {self.titulo}'
