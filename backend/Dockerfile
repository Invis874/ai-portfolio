FROM python:3.11-slim

WORKDIR /app

# Установка зависимостей системы
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Установка Python зависимостей
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Делаем manage.py исполняемым
RUN chmod +x manage.py

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]