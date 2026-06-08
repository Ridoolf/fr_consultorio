import os

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = 'Crea o actualiza el usuario del consultorio desde variables de entorno.'

    def handle(self, *args, **options):
        User = get_user_model()
        username = os.environ.get('CONSULTORIO_USER', 'consultorio')
        password = os.environ.get('CONSULTORIO_PASSWORD')

        if not password:
            self.stderr.write(self.style.ERROR(
                'Definí CONSULTORIO_PASSWORD en las variables de entorno.'
            ))
            return

        user, created = User.objects.get_or_create(username=username, defaults={
            'email': os.environ.get('CONSULTORIO_EMAIL', ''),
            'is_staff': True,
        })
        user.set_password(password)
        user.is_staff = True
        user.save()

        if created:
            self.stdout.write(self.style.SUCCESS(f'Usuario "{username}" creado.'))
        else:
            self.stdout.write(self.style.SUCCESS(f'Usuario "{username}" actualizado.'))
