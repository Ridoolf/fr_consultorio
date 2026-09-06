from collections import defaultdict
from decimal import Decimal

from django.db import migrations, models
from django.db.models.functions import Lower


def _normalize_nombre(nombre: str) -> str:
    return (nombre or '').strip().lower()


def _pick_winner(tratamientos):
    return max(
        tratamientos,
        key=lambda t: (Decimal(str(t.precio_base)), -t.id),
    )


def _merge_grupo(TratamientoTipo, PagoItem, tratamientos):
    if len(tratamientos) < 2:
        return
    ganador = _pick_winner(tratamientos)
    nombre_limpio = (ganador.nombre or '').strip()
    if nombre_limpio != ganador.nombre:
        ganador.nombre = nombre_limpio
        ganador.save(update_fields=['nombre'])
    for perdedor in tratamientos:
        if perdedor.id == ganador.id:
            continue
        PagoItem.objects.filter(tratamiento_id=perdedor.id).update(tratamiento_id=ganador.id)
        perdedor.delete()
    if not ganador.activo:
        ganador.activo = True
        ganador.save(update_fields=['activo'])


def merge_tratamientos_duplicados(apps, schema_editor):
    TratamientoTipo = apps.get_model('caja', 'TratamientoTipo')
    PagoItem = apps.get_model('caja', 'PagoItem')
    connection = schema_editor.connection

    for tratamiento in TratamientoTipo.objects.all().order_by('id'):
        nombre_limpio = (tratamiento.nombre or '').strip()
        if nombre_limpio != tratamiento.nombre:
            tratamiento.nombre = nombre_limpio
            tratamiento.save(update_fields=['nombre'])

    grupos = defaultdict(list)
    for tratamiento in TratamientoTipo.objects.all().order_by('id'):
        grupos[_normalize_nombre(tratamiento.nombre)].append(tratamiento)

    for tratamientos in grupos.values():
        _merge_grupo(TratamientoTipo, PagoItem, tratamientos)

    if connection.vendor == 'postgresql':
        table = TratamientoTipo._meta.db_table
        with connection.cursor() as cursor:
            cursor.execute(
                f"""
                SELECT lower(nombre), array_agg(id ORDER BY id)
                FROM {table}
                GROUP BY lower(nombre)
                HAVING count(*) > 1
                """
            )
            for _, ids in cursor.fetchall():
                ids = list(ids)
                tratamientos = list(TratamientoTipo.objects.filter(id__in=ids).order_by('id'))
                _merge_grupo(TratamientoTipo, PagoItem, tratamientos)


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
