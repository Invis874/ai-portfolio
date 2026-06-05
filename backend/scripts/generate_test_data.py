import os
import sys
import django
import random
from datetime import datetime, timedelta

sys.path.append('/app')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'django_project.settings')
django.setup()

from demo_data.models import SalesData
from django.contrib.auth.models import User

# Очищаем старые данные
SalesData.objects.all().delete()
print("Старые данные удалены")

# Получаем пользователя
user, _ = User.objects.get_or_create(username='admin')

products = ['Пицца Маргарита', 'Пицца Пепперони', 'Роллы Филадельфия', 'Роллы Калифорния', 'Цезарь', 'Лимонад']
categories = ['pizza', 'pizza', 'rolls', 'rolls', 'salads', 'drinks']

# Генерируем данные за последние 30 дней
today = datetime.now().date()
total = 0

for day in range(30):
    date = today - timedelta(days=day)
    for i, product in enumerate(products):
        quantity = random.randint(1, 20)
        revenue = quantity * random.randint(300, 1000)
        
        SalesData.objects.create(
            product_name=product,
            category=categories[i],
            quantity=quantity,
            revenue=revenue,
            date=date,
            created_by=user
        )
        total += 1
    
    print(f"Создано {len(products)} записей для {date}")

print(f"\n✅ Всего создано {total} записей за 30 дней")