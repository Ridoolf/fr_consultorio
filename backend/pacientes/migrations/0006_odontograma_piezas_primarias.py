from django.db import migrations

PIEZAS_PRIMARIAS = [
    '55', '54', '53', '52', '51',
    '61', '62', '63', '64', '65',
    '85', '84', '83', '82', '81',
    '71', '72', '73', '74', '75',
]


def pieza_vacia():
    return {
        'estado': 'sano',
        'superficies': {'V': False, 'M': False, 'O': False, 'D': False, 'L': False},
        'nota': '',
    }


def agregar_piezas_primarias(apps, schema_editor):
    Odontograma = apps.get_model('pacientes', 'Odontograma')
    for odontograma in Odontograma.objects.all():
        piezas = dict(odontograma.piezas or {})
        cambio = False
        for num in PIEZAS_PRIMARIAS:
            if num not in piezas:
                piezas[num] = pieza_vacia()
                cambio = True
        if cambio:
            odontograma.piezas = piezas
            odontograma.save(update_fields=['piezas'])


class Migration(migrations.Migration):

    dependencies = [
        ('pacientes', '0005_paciente_datos_particulares_notas_alertas_odontograma'),
    ]

    operations = [
        migrations.RunPython(agregar_piezas_primarias, migrations.RunPython.noop),
    ]
