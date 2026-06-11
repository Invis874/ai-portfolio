import os
from django.core.wsgi import get_wsgi_application

# Определяем окружение
env = os.environ.get('DJANGO_ENV', 'development')

if env == 'production':
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'django_project.settings_prod')
else:
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'django_project.settings')

application = get_wsgi_application()