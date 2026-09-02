from django.db import connection
from django.http import JsonResponse


def health_check(request):
    if request.method != 'GET':
        return JsonResponse({'detail': 'Method not allowed'}, status=405)

    db_ok = True
    try:
        with connection.cursor() as cursor:
            cursor.execute('SELECT 1')
    except Exception:
        db_ok = False

    if not db_ok:
        return JsonResponse({'status': 'error', 'database': 'unavailable'}, status=503)

    return JsonResponse({'status': 'ok', 'database': 'ok'})
