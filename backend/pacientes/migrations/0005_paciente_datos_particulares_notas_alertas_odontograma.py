from django.db import migrations, models
import django.db.models.deletion


PIEZAS_FDI = [
    '18', '17', '16', '15', '14', '13', '12', '11',
    '21', '22', '23', '24', '25', '26', '27', '28',
    '48', '47', '46', '45', '44', '43', '42', '41',
    '31', '32', '33', '34', '35', '36', '37', '38',
]


def pieza_vacia():
    return {
        'estado': 'sano',
        'superficies': {'V': False, 'D': False, 'M': False, 'L': False, 'O': False},
        'nota': '',
    }


def odontograma_vacio():
    return {num: pieza_vacia() for num in PIEZAS_FDI}


def migrar_observaciones_a_notas(apps, schema_editor):
    Paciente = apps.get_model('pacientes', 'Paciente')
    PacienteNota = apps.get_model('pacientes', 'PacienteNota')
    for paciente in Paciente.objects.exclude(observaciones='').exclude(observaciones__isnull=True):
        texto = (paciente.observaciones or '').strip()
        if texto:
            PacienteNota.objects.create(paciente=paciente, texto=texto)


def crear_odontogramas_existentes(apps, schema_editor):
    Paciente = apps.get_model('pacientes', 'Paciente')
    Odontograma = apps.get_model('pacientes', 'Odontograma')
    for paciente in Paciente.objects.all():
        Odontograma.objects.get_or_create(
            paciente=paciente,
            defaults={'piezas': odontograma_vacio()},
        )


class Migration(migrations.Migration):

    dependencies = [
        ('pacientes', '0004_remove_paciente_numero_afiliado_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='paciente',
            name='direccion',
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name='paciente',
            name='estado_civil',
            field=models.CharField(
                blank=True,
                choices=[
                    ('soltero', 'Soltero/a'),
                    ('casado', 'Casado/a'),
                    ('divorciado', 'Divorciado/a'),
                    ('viudo', 'Viudo/a'),
                    ('union_convivencial', 'Unión convivencial'),
                    ('otro', 'Otro'),
                ],
                max_length=30,
            ),
        ),
        migrations.AddField(
            model_name='paciente',
            name='genero',
            field=models.CharField(
                blank=True,
                choices=[
                    ('masculino', 'Masculino'),
                    ('femenino', 'Femenino'),
                    ('otro', 'Otro'),
                    ('prefiero_no_decir', 'Prefiero no decir'),
                ],
                max_length=30,
            ),
        ),
        migrations.AddField(
            model_name='paciente',
            name='ocupacion',
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.CreateModel(
            name='PacienteNota',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('texto', models.TextField()),
                ('fecha_creacion', models.DateTimeField(auto_now_add=True)),
                ('fecha_actualizacion', models.DateTimeField(auto_now=True)),
                ('paciente', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='notas', to='pacientes.paciente')),
            ],
            options={
                'verbose_name': 'Nota de paciente',
                'verbose_name_plural': 'Notas de paciente',
                'ordering': ['-fecha_creacion', '-id'],
            },
        ),
        migrations.CreateModel(
            name='AlertaMedica',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('tipo', models.CharField(choices=[('alergia', 'Alergia'), ('enfermedad', 'Enfermedad'), ('medicacion', 'Medicación'), ('otro', 'Otro')], max_length=20)),
                ('descripcion', models.CharField(max_length=255)),
                ('detalle', models.TextField(blank=True)),
                ('activa', models.BooleanField(default=True)),
                ('paciente', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='alertas_medicas', to='pacientes.paciente')),
            ],
            options={
                'verbose_name': 'Alerta médica',
                'verbose_name_plural': 'Alertas médicas',
                'ordering': ['-id'],
            },
        ),
        migrations.CreateModel(
            name='Odontograma',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('piezas', models.JSONField(default=dict)),
                ('fecha_actualizacion', models.DateTimeField(auto_now=True)),
                ('paciente', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='odontograma', to='pacientes.paciente')),
            ],
            options={
                'verbose_name': 'Odontograma',
                'verbose_name_plural': 'Odontogramas',
            },
        ),
        migrations.RunPython(migrar_observaciones_a_notas, migrations.RunPython.noop),
        migrations.RunPython(crear_odontogramas_existentes, migrations.RunPython.noop),
        migrations.RemoveField(
            model_name='paciente',
            name='observaciones',
        ),
    ]
