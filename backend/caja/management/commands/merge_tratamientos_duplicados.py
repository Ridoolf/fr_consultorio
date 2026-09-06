from collections import defaultdict
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.db import transaction

from caja.models import PagoItem, TratamientoTipo


def _normalize_nombre(nombre: str) -> str:
    return nombre.strip().lower()


def _pick_winner(tratamientos: list[TratamientoTipo]) -> TratamientoTipo:
    return max(
        tratamientos,
        key=lambda t: (Decimal(str(t.precio_base)), -t.id),
    )


class Command(BaseCommand):
    help = 'Fusiona tratamientos con el mismo nombre (case-insensitive).'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Muestra qué fusionaría sin modificar la base de datos.',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        grupos: dict[str, list[TratamientoTipo]] = defaultdict(list)

        for tratamiento in TratamientoTipo.objects.all().order_by('id'):
            grupos[_normalize_nombre(tratamiento.nombre)].append(tratamiento)

        duplicados = {k: v for k, v in grupos.items() if len(v) > 1}
        if not duplicados:
            self.stdout.write(self.style.SUCCESS('No hay tratamientos duplicados.'))
            return

        total_fusionados = 0
        total_items_reasignados = 0

        for nombre_norm, tratamientos in sorted(duplicados.items()):
            ganador = _pick_winner(tratamientos)
            perdedores = [t for t in tratamientos if t.id != ganador.id]

            self.stdout.write(
                f'\nGrupo "{nombre_norm}": conservar id={ganador.id} '
                f'({ganador.nombre}, ${ganador.precio_base})'
            )

            for perdedor in perdedores:
                items_count = PagoItem.objects.filter(tratamiento=perdedor).count()
                self.stdout.write(
                    f'  - Fusionar id={perdedor.id} ({perdedor.nombre}, '
                    f'${perdedor.precio_base}) → {items_count} ítem(s) de pago'
                )
                total_fusionados += 1
                total_items_reasignados += items_count

                if dry_run:
                    continue

                with transaction.atomic():
                    PagoItem.objects.filter(tratamiento=perdedor).update(tratamiento=ganador)
                    perdedor.delete()

            if not dry_run and not ganador.activo:
                ganador.activo = True
                ganador.save(update_fields=['activo'])

        if dry_run:
            self.stdout.write(
                self.style.WARNING(
                    f'\n[dry-run] Se fusionarían {total_fusionados} tratamiento(s) '
                    f'y se reasignarían {total_items_reasignados} ítem(s) de pago.'
                )
            )
            return

        self.stdout.write(
            self.style.SUCCESS(
                f'\nFusión completada: {total_fusionados} tratamiento(s) eliminados, '
                f'{total_items_reasignados} ítem(s) de pago reasignados.'
            )
        )
