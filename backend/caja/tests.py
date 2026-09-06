from datetime import date

from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from caja.models import Pago, PagoItem, TratamientoTipo
from pacientes.models import Paciente


def crear_paciente(**kwargs):
    defaults = {
        'nombre': 'Ana',
        'apellido': 'Test',
        'dni': '12345678',
        'fecha_nacimiento': date(1990, 1, 1),
    }
    defaults.update(kwargs)
    return Paciente.objects.create(**defaults)


class TratamientoDuplicateTests(TestCase):
    def setUp(self):
        User = get_user_model()
        self.user = User.objects.create_user(username='test', password='test1234')
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
        self.existing = TratamientoTipo.objects.create(nombre='Consulta', precio_base=25000)

    def test_create_duplicate_name_returns_structured_error(self):
        response = self.client.post('/api/tratamientos/', {
            'nombre': 'consulta',
            'precio_base': '35000.00',
            'activo': True,
        }, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertEqual(str(response.data['code']), 'duplicate_name')
        self.assertEqual(int(response.data['existing']['id']), self.existing.id)

    def test_en_uso_field(self):
        paciente = crear_paciente()
        pago = Pago.objects.create(
            paciente=paciente,
            fecha='2026-01-01',
            monto_total=25000,
            medio='efectivo',
        )
        PagoItem.objects.create(
            pago=pago,
            tratamiento=self.existing,
            cantidad=1,
            precio_unitario=25000,
            subtotal=25000,
        )
        response = self.client.get(f'/api/tratamientos/{self.existing.id}/')
        self.assertTrue(response.data['en_uso'])


class MergeTratamientosLogicTests(TestCase):
    def test_pick_winner_prefers_higher_price(self):
        from caja.management.commands.merge_tratamientos_duplicados import _pick_winner

        t1 = TratamientoTipo.objects.create(nombre='Limpieza', precio_base=25000)
        t2 = TratamientoTipo.objects.create(nombre='Blanqueamiento', precio_base=35000)
        t1.precio_base = 25000
        t2.precio_base = 35000
        winner = _pick_winner([t1, t2])
        self.assertEqual(winner.id, t2.id)

    def test_pick_winner_prefers_lower_id_on_price_tie(self):
        from caja.management.commands.merge_tratamientos_duplicados import _pick_winner

        t1 = TratamientoTipo.objects.create(nombre='A', precio_base=10000)
        t2 = TratamientoTipo.objects.create(nombre='B', precio_base=10000)
        winner = _pick_winner([t1, t2])
        self.assertEqual(winner.id, t1.id)


class PagoUpdateTests(TestCase):
    def setUp(self):
        User = get_user_model()
        self.user = User.objects.create_user(username='test', password='test1234')
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
        self.paciente = crear_paciente()
        self.tratamiento = TratamientoTipo.objects.create(nombre='Consulta', precio_base=25000)
        self.pago = Pago.objects.create(
            paciente=self.paciente,
            fecha='2026-03-01',
            monto_total=25000,
            medio='efectivo',
        )
        PagoItem.objects.create(
            pago=self.pago,
            tratamiento=self.tratamiento,
            cantidad=1,
            precio_unitario=25000,
            subtotal=25000,
        )

    def test_update_pago_recalculates_totals(self):
        response = self.client.put(f'/api/pagos/{self.pago.id}/', {
            'paciente': self.paciente.id,
            'fecha': '2026-03-01',
            'monto_total': 99999,
            'medio': 'transferencia',
            'notas': 'Corregido',
            'items': [{
                'tratamiento': self.tratamiento.id,
                'cantidad': 2,
                'precio_unitario': '25000',
                'subtotal': 12345,
            }],
        }, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['medio'], 'transferencia')
        self.assertEqual(response.data['notas'], 'Corregido')
        self.assertEqual(str(response.data['monto_total']), '50000.00')
        self.assertEqual(response.data['items'][0]['cantidad'], 2)
        self.assertEqual(str(response.data['items'][0]['subtotal']), '50000.00')
