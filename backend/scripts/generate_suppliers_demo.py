import os
import sys
import django
from datetime import datetime

sys.path.append('/app')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'django_project.settings')
django.setup()

from suppliers.models import Supplier, SupplierCategory
from django.contrib.auth.models import User

def generate_demo_suppliers():
    """Создание демо-поставщиков с полными данными для показа"""
    
    # Получаем пользователя
    user, _ = User.objects.get_or_create(username='admin')
    
    # Очищаем старые данные (опционально)
    # Supplier.objects.all().delete()
    # print("Старые данные удалены")
    
    # Создаём категории
    categories = {}
    cat_names = {
        'Мясо и птица': '🥩',
        'Рыба и морепродукты': '🐟',
        'Молочные продукты': '🥛',
        'Хлеб и выпечка': '🍞',
        'Овощи и фрукты': '🥬',
        'Бакалея': '🥫',
        'Напитки': '🥤',
        'Полуфабрикаты': '🍽️',
        'Упаковка': '📦',
    }
    
    for name, icon in cat_names.items():
        cat, _ = SupplierCategory.objects.get_or_create(
            name=name,
            defaults={'icon': icon}
        )
        categories[name] = cat
    
    # Демо-поставщики с полными данными
    demo_suppliers = [
        {
            'name': 'ООО "Мясной Двор"',
            'categories': ['Мясо и птица', 'Полуфабрикаты'],
            'city': 'Москва',
            'region': 'Московская область',
            'address': 'г. Москва, ул. Промышленная, д. 15, стр. 3',
            'phone': '+7 (495) 123-45-67',
            'email': 'sales@myasnoy-dvor.ru',
            'website': 'https://myasnoy-dvor.ru',
            'min_order_amount': 5000,
            'min_order_quantity': 50,
            'price_info': 'Говядина 450-550₽/кг, Свинина 350-450₽/кг, Курица 250-350₽/кг',
            'delivery_terms': 'Доставка по Москве и МО — 1500₽, бесплатно от 15000₽',
            'has_certificates': True,
            'notes': 'Надёжный поставщик, работаем с 2010 года. Есть сертификаты халяль.',
            'rating': 4.8
        },
        {
            'name': 'ИП "Рыбный Мир"',
            'categories': ['Рыба и морепродукты'],
            'city': 'Санкт-Петербург',
            'region': 'Ленинградская область',
            'address': 'г. Санкт-Петербург, ул. Морская, д. 8',
            'phone': '+7 (812) 345-67-89',
            'email': 'info@rybniy-mir.ru',
            'website': 'https://rybniy-mir.ru',
            'min_order_amount': 10000,
            'min_order_quantity': 100,
            'price_info': 'Сёмга 800-1200₽/кг, Форель 700-1000₽/кг, Минтай 200-300₽/кг',
            'delivery_terms': 'Доставка по СПб и области — 2000₽, в регионы — по тарифам ТК',
            'has_certificates': True,
            'notes': 'Свежемороженая рыба из Мурманска. Работаем с ресторанами и магазинами',
            'rating': 4.9
        },
        {
            'name': 'ООО «Молочная Долина»',
            'categories': ['Молочные продукты'],
            'city': 'Воронеж',
            'region': 'Воронежская область',
            'address': 'г. Воронеж, ул. Молочная, д. 12',
            'phone': '+7 (473) 222-33-44',
            'email': 'info@molochnaya-dolina.ru',
            'website': '',
            'min_order_amount': 4000,
            'min_order_quantity': None,
            'price_info': 'Молоко 65-85₽/л, Сметана 150-250₽/кг, Творог 200-350₽/кг, Сыр 500-800₽/кг',
            'delivery_terms': 'Доставка по Воронежу и области — 1000₽, самовывоз',
            'has_certificates': True,
            'notes': 'Экологически чистые продукты. Своя ферма',
            'rating': 4.7
        },
        {
            'name': 'ООО «Хлебный Дом»',
            'categories': ['Хлеб и выпечка'],
            'city': 'Москва',
            'region': 'Московская область',
            'address': 'г. Москва, ул. Хлебозаводская, д. 5',
            'phone': '+7 (495) 777-88-99',
            'email': 'order@hlebny-dom.ru',
            'website': 'https://hlebny-dom.ru',
            'min_order_amount': 3000,
            'min_order_quantity': 30,
            'price_info': 'Хлеб 50-80₽/шт, Батоны 40-60₽/шт, Булочки 25-40₽/шт',
            'delivery_terms': 'Доставка по Москве ежедневно с 6:00 до 12:00. Бесплатно от 5000₽',
            'has_certificates': True,
            'notes': 'Свежая выпечка каждый день. Работаем с 1995 года',
            'rating': 4.6
        },
        {
            'name': 'ИП «Овощной Ряд»',
            'categories': ['Овощи и фрукты'],
            'city': 'Краснодар',
            'region': 'Краснодарский край',
            'address': 'г. Краснодар, ул. Овощная, д. 7',
            'phone': '+7 (861) 444-55-66',
            'email': 'zakaz@ovoschnoy-ryad.ru',
            'website': '',
            'min_order_amount': 5000,
            'min_order_quantity': 100,
            'price_info': 'Картофель 35-50₽/кг, Морковь 25-40₽/кг, Лук 20-35₽/кг, Помидоры 80-150₽/кг',
            'delivery_terms': 'Самовывоз с базы или доставка по городу — 1500₽',
            'has_certificates': False,
            'notes': 'Сезонные овощи. Цена зависит от сезона',
            'rating': 4.3
        },
        {
            'name': 'ООО «Бакалея Плюс»',
            'categories': ['Бакалея'],
            'city': 'Екатеринбург',
            'region': 'Свердловская область',
            'address': 'г. Екатеринбург, ул. Торговая, д. 10',
            'phone': '+7 (343) 555-66-77',
            'email': 'sales@bakaleya-plus.ru',
            'website': 'https://bakaleya-plus.ru',
            'min_order_amount': 3000,
            'min_order_quantity': 20,
            'price_info': 'Крупы 40-150₽/кг, Макароны 50-120₽/кг, Мука 40-80₽/кг, Сахар 60-90₽/кг',
            'delivery_terms': 'Доставка по городу — 700₽, при заказе от 8000₽ — бесплатно',
            'has_certificates': False,
            'notes': 'Оптовые поставки бакалеи. Работаем с 2015 года',
            'rating': 4.2
        },
        {
            'name': 'ООО «Упаковка24»',
            'categories': ['Упаковка'],
            'city': 'Москва',
            'region': 'Московская область',
            'address': 'г. Москва, ул. Логистическая, д. 3',
            'phone': '+7 (495) 111-22-33',
            'email': 'info@upakovka24.ru',
            'website': 'https://upakovka24.ru',
            'min_order_amount': 3000,
            'min_order_quantity': None,
            'price_info': 'Контейнеры 5-25₽/шт, Пакеты 1-10₽/шт, Коробки 15-50₽/шт',
            'delivery_terms': 'Доставка по Москве — 500₽, в регионы — через СДЭК',
            'has_certificates': True,
            'notes': 'Эко-упаковка, биоразлагаемые материалы',
            'rating': 4.4
        },
        {
            'name': 'ООО «Фреш Продукт»',
            'categories': ['Овощи и фрукты', 'Мясо и птица', 'Молочные продукты'],
            'city': 'Москва',
            'region': 'Московская область',
            'address': 'г. Москва, ТК «Фуд Сити», пав. 42',
            'phone': '+7 (926) 987-65-43',
            'email': 'zakaz@fresh-product.ru',
            'website': 'https://fresh-product.ru',
            'min_order_amount': 10000,
            'min_order_quantity': 50,
            'price_info': 'Запрос прайс-листа у менеджера',
            'delivery_terms': 'Доставка по Москве и МО — 2000₽, бесплатно от 25000₽',
            'has_certificates': True,
            'notes': 'Поставка свежих продуктов в рестораны и кафе',
            'rating': 4.9
        }
    ]
    
    saved = 0
    for data in demo_suppliers:
        supplier, created = Supplier.objects.get_or_create(
            name=data['name'],
            defaults={
                'city': data['city'],
                'region': data['region'],
                'address': data['address'],
                'phone': data['phone'],
                'email': data['email'],
                'website': data['website'],
                'min_order_amount': data['min_order_amount'],
                'min_order_quantity': data['min_order_quantity'],
                'price_info': data['price_info'],
                'delivery_terms': data['delivery_terms'],
                'has_certificates': data['has_certificates'],
                'notes': data['notes'],
                'rating': data['rating'],
                'created_by': user
            }
        )
        
        if created:
            # Добавляем категории
            for cat_name in data['categories']:
                if cat_name in categories:
                    supplier.categories.add(categories[cat_name])
            saved += 1
            print(f"  ✅ Добавлен: {supplier.name}")
        else:
            print(f"  ⏭️ Уже существует: {supplier.name}")
    
    print(f"\n✅ Добавлено {saved} демо-поставщиков")
    print(f"📊 Всего поставщиков: {Supplier.objects.count()}")

if __name__ == '__main__':
    print("🚀 Создание демо-поставщиков...")
    generate_demo_suppliers()
    print("\n✨ Готово! Зайдите в список поставщиков: http://localhost:5173/suppliers")