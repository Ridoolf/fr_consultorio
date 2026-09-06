import os

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = 'Crea el usuario del consultorio desde variables de entorno.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--reset-password',
            action='store_true',
            help='Sobrescribe la contraseña si el usuario ya existe.',
        )

    def handle(self, *args, **options):
        User = get_user_model()
        username = os.environ.get('CONSULTORIO_USER', 'consultorio')
        password = os.environ.get('CONSULTORIO_PASSWORD')
        reset_password = options['reset_password']

        if not password:
            self.stderr.write(self.style.ERROR(
                'Definí CONSULTORIO_PASSWORD en las variables de entorno.'
            ))
            return

        user, created = User.objects.get_or_create(username=username, defaults={
            'email': os.environ.get('CONSULTORIO_EMAIL', ''),
            'is_staff': True,
        })

        if created:
            user.set_password(password)
            user.is_staff = True
            user.save()
            self.stdout.write(self.style.SUCCESS(f'Usuario "{username}" creado.'))
            return

        if reset_password:
            user.set_password(password)
            user.is_staff = True
            user.save()
            self.stdout.write(self.style.SUCCESS(
                f'Usuario "{username}" existente: contraseña actualizada (--reset-password).'
            ))
            return

        self.stdout.write(self.style.WARNING(
            f'Usuario "{username}" ya existe. No se modificó la contraseña. '
            'Usá --reset-password para cambiarla.'
        ))
