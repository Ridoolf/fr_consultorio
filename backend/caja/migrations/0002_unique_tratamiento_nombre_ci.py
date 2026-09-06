from collections import defaultdict
from decimal import Decimal

from django.db import migrations, models
from django.db.models.functions import Lower


def _normalize_nombre(nombre: str) -> str:
    return nombre.strip().lower()


def _pick_winner(tratamientos):
    return max(
        tratamientos,
        key=lambda t: (Decimal(str(t.precio_base)), -t.id),
    )


def merge_tratamientos_duplicados(apps, schema_editor):
    TratamientoTipo = apps.get_model('caja', 'TratamientoTipo')
    PagoItem = apps.get_model('caja', 'PagoItem')

    grupos = defaultdict(list)
    for tratamiento in TratamientoTipo.objects.all().order_by('id'):
        grupos[_normalize_nombre(tratamiento.nombre)].append(tratamiento)

    for tratamientos in grupos.values():
        if len(tratamientos) < 2:
            continue
        ganador = _pick_winner(tratamientos)
        for perdedor in tratamientos:
            if perdedor.id == ganador.id:
                continue
            PagoItem.objects.filter(tratamiento_id=perdedor.id).update(tratamiento_id=ganador.id)
            perdedor.delete()
        if not ganador.activo:
            ganador.activo = True
            ganador.save(update_fields=['activo'])


class Migration(migrations.Migration):

    dependencies = [
        ('caja', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(merge_tratamientos_duplicados, migrations.RunPython.noop),
        migrations.AddConstraint(
            model_name='tratamientotipo',
            constraint=models.UniqueConstraint(
                Lower('nombre'),
                name='unique_tratamiento_nombre_ci',
            ),
        ),
    ]
