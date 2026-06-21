"""
Smoke test integral — escribe resultados en debug-0ba2bd.log (NDJSON).
Ejecutar: python manage.py shell < scripts/health_check_smoke.py
o: python scripts/health_check_smoke.py (desde backend/ con DJANGO_SETTINGS_MODULE)
"""
import json
import os
import sys
from datetime import date
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

import django  # noqa: E402

django.setup()

from django.contrib.auth import get_user_model  # noqa: E402
from django.test import Client  # noqa: E402
from pacientes.models import (  # noqa: E402
    AlertaMedica,
    Odontograma,
    Paciente,
    PacienteNota,
    TODAS_LAS_PIEZAS,
    odontograma_vacio,
)

LOG_PATH = BACKEND_DIR.parent / 'debug-0ba2bd.log'
SESSION_ID = '0ba2bd'


def log(hypothesis_id, message, data=None, run_id='health-check'):
    entry = {
        'sessionId': SESSION_ID,
        'runId': run_id,
        'hypothesisId': hypothesis_id,
        'location': 'health_check_smoke.py',
        'message': message,
        'data': data or {},
        'timestamp': __import__('time').time_ns() // 1_000_000,
    }
    with open(LOG_PATH, 'a', encoding='utf-8') as f:
        f.write(json.dumps(entry, ensure_ascii=False) + '\n')


def run():
    results = {'passed': [], 'failed': []}

    def ok(name, detail=None):
        results['passed'].append(name)
        log('OK', f'PASS: {name}', {'detail': detail})

    def fail(name, detail=None):
        results['failed'].append(name)
        log('FAIL', f'FAIL: {name}', {'detail': detail})

    # H1: piezas backend = 52
    piezas_count = len(TODAS_LAS_PIEZAS)
    if piezas_count == 52:
        ok('piezas_count', piezas_count)
    else:
        fail('piezas_count', piezas_count)

    # H2: odontograma_vacio tiene todas las piezas
    vacio = odontograma_vacio()
    if set(vacio.keys()) == set(TODAS_LAS_PIEZAS):
        ok('odontograma_vacio_keys')
    else:
        missing = set(TODAS_LAS_PIEZAS) - set(vacio.keys())
        extra = set(vacio.keys()) - set(TODAS_LAS_PIEZAS)
        fail('odontograma_vacio_keys', {'missing': list(missing), 'extra': list(extra)})

    # H3: signal crea odontograma al crear paciente
    dni = f'SMOKE{date.today().strftime("%Y%m%d%H%M%S")}'
    paciente = Paciente.objects.create(
        nombre='Smoke',
        apellido='Test',
        dni=dni,
        fecha_nacimiento=date(1990, 1, 1),
    )
    try:
        if hasattr(paciente, 'odontograma'):
            piezas_od = paciente.odontograma.piezas
            if len(piezas_od) == 52:
                ok('signal_odontograma')
            else:
                fail('signal_odontograma', len(piezas_od))
        else:
            fail('signal_odontograma', 'no related odontograma')
    finally:
        paciente.delete()

    # H4: API auth + CRUD notas/alertas/odontograma
    User = get_user_model()
    user, _ = User.objects.get_or_create(username='smoke_test', defaults={'is_staff': True})
    user.set_password('smokepass123')
    user.save()

    client = Client()
    login_res = client.post(
        '/api/auth/login/',
        data=json.dumps({'username': 'smoke_test', 'password': 'smokepass123'}),
        content_type='application/json',
    )
    if login_res.status_code != 200:
        fail('api_login', login_res.status_code)
        log('SUMMARY', 'health check aborted', results)
        return results

    ok('api_login')
    token = login_res.json().get('access')
    auth = {'HTTP_AUTHORIZATION': f'Bearer {token}'}

    ts = date.today().strftime('%H%M%S%f')[:12]
    dni2 = f'S{ts}'
    create_p = client.post(
        '/api/pacientes/',
        data=json.dumps({
            'nombre': 'Api',
            'apellido': 'Smoke',
            'dni': dni2,
            'fecha_nacimiento': '1985-06-15',
            'direccion': 'Calle 1',
            'genero': 'masculino',
        }),
        content_type='application/json',
        **auth,
    )
    if create_p.status_code not in (200, 201):
        fail('api_create_paciente', {'status': create_p.status_code, 'body': create_p.content.decode()[:300]})
    else:
        ok('api_create_paciente')
        pid = create_p.json()['id']

        nota_res = client.post(
            '/api/pacientes-notas/',
            data=json.dumps({'paciente': pid, 'texto': 'Nota smoke'}),
            content_type='application/json',
            **auth,
        )
        if nota_res.status_code in (200, 201):
            ok('api_create_nota')
        else:
            fail('api_create_nota', nota_res.status_code)

        alerta_res = client.post(
            '/api/alertas-medicas/',
            data=json.dumps({
                'paciente': pid,
                'tipo': 'alergia',
                'descripcion': 'Penicilina',
                'detalle': '',
                'activa': True,
            }),
            content_type='application/json',
            **auth,
        )
        if alerta_res.status_code in (200, 201):
            ok('api_create_alerta')
        else:
            fail('api_create_alerta', alerta_res.status_code)

        odo_get = client.get(f'/api/odontogramas/?paciente={pid}', **auth)
        if odo_get.status_code == 200:
            odo_data = odo_get.json()
            is_object = isinstance(odo_data, dict) and 'piezas' in odo_data
            if is_object and len(odo_data['piezas']) == 52:
                ok('api_get_odontograma')
                oid = odo_data['id']
                sample = dict(odo_data['piezas'])
                sample['11'] = {
                    'estado': 'caries',
                    'superficies': {'V': True, 'M': False, 'O': False, 'D': False, 'L': False},
                    'nota': 'smoke',
                }
                patch_res = client.patch(
                    f'/api/odontogramas/{oid}/',
                    data=json.dumps({'piezas': sample}),
                    content_type='application/json',
                    **auth,
                )
                if patch_res.status_code == 200:
                    ok('api_patch_odontograma')
                else:
                    fail('api_patch_odontograma', patch_res.status_code)
            else:
                fail('api_get_odontograma', {'type': type(odo_data).__name__, 'keys': list(odo_data.keys()) if isinstance(odo_data, dict) else None})
        else:
            fail('api_get_odontograma', odo_get.status_code)

        list_notas = client.get(f'/api/pacientes-notas/?paciente={pid}', **auth)
        if list_notas.status_code == 200 and isinstance(list_notas.json(), list):
            ok('api_list_notas')
        else:
            fail('api_list_notas', list_notas.status_code)

        list_alertas = client.get(f'/api/alertas-medicas/?paciente={pid}', **auth)
        if list_alertas.status_code == 200 and isinstance(list_alertas.json(), list):
            ok('api_list_alertas')
        else:
            fail('api_list_alertas', list_alertas.status_code)

        client.delete(f'/api/pacientes/{pid}/', **auth)

    log('SUMMARY', 'health check complete', {
        'passed': len(results['passed']),
        'failed': len(results['failed']),
        'failures': results['failed'],
    })
    return results


if __name__ == '__main__':
    run()
