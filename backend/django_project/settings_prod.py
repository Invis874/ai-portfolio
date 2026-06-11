"""
Production settings for Railway + Supabase
"""
import os
import dj_database_url
from .settings import *

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = False

# Разрешаем домены
ALLOWED_HOSTS = [
    'localhost',
    '127.0.0.1',
    '.railway.app',  # любые поддомены railway
    '.vercel.app',   # любые поддомены vercel
    'ai-portfolio.onrender.com',  # если используешь render
]

# Database - используем Supabase через DATABASE_URL
DATABASES = {
    'default': dj_database_url.config(
        default=os.environ.get('DATABASE_URL'),
        conn_max_age=600,
        ssl_require=True  # Supabase требует SSL
    )
}

# Static files (если нужно)
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# Security
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True