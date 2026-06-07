import requests
import os
import time
from typing import Dict, List, Optional

from django.contrib.auth.models import User
from ..models import Supplier, SupplierCategory


class SupplierCollector:
    """Автоматический сбор данных о поставщиках из различных источников"""
    
    def __init__(self):
        self.dgis_api_key = os.environ.get('DGIS_API_KEY')
        self.yandex_api_key = os.environ.get('YANDEX_API_KEY')
        self.ai_available = False  # Добавь эту строку
        
        # Проверка AI
        try:
            from chat.ai_bot import restaurant_bot
            self.ai_available = restaurant_bot.ai_available
        except:
            pass

        # Словарь ID регионов 2GIS
        self.region_ids = {
            'Москва': 32,
            'Санкт-Петербург': 43,
            'Екатеринбург': 61,
            'Новосибирск': 69,
            'Казань': 99,
        }
    
    def get_region_id(self, city: str) -> Optional[int]:
        """Получение ID региона по названию города"""
        return self.region_ids.get(city, 32)  # По умолчанию Москва
    
    def get_city_coords(self, city: str) -> Optional[str]:
        """Получение координат города для location параметра"""
        coords = {
            'Москва': "37.6173,55.7558",
            'Санкт-Петербург': "30.3351,59.9343",
            'Екатеринбург': "60.6122,56.8519",
            'Новосибирск': "82.8964,55.0415",
            'Казань': "49.1229,55.7961",
        }
        return coords.get(city)
    
    def find_category_id(self, category_name: str, city: str) -> Optional[str]:
        """Поиск ID категории по названию через Categories API"""
        if not self.dgis_api_key:
            return None
        
        region_id = self.get_region_id(city)
        url = "https://catalog.api.2gis.com/2.0/catalog/rubric/search"
        params = {
            'q': category_name,
            'region_id': region_id,
            'key': self.dgis_api_key
        }
        
        try:
            response = requests.get(url, params=params, timeout=10)
            data = response.json()
            
            if data.get('meta', {}).get('code') == 200:
                items = data.get('result', {}).get('items', [])
                if items:
                    return items[0].get('id')
            
            return None
        except Exception as e:
            print(f"  ❌ Ошибка поиска категории '{category_name}': {e}")
            return None
    
    def search_by_rubric_ids(self, rubric_ids: List[str], city: str, limit: int = 10) -> List[Dict]:
        """Поиск компаний по ID категорий через Places API"""
        if not self.dgis_api_key or not rubric_ids:
            return []
        
        location = self.get_city_coords(city)
        if not location:
            return []
        
        url = "https://catalog.api.2gis.com/3.0/items"
        params = {
            'rubric_id': ','.join(rubric_ids),
            'location': location,
            'key': self.dgis_api_key,
            'page_size': limit,
            'sort': 'relevance',
            'fields': 'items.name,items.address_name,items.phones,items.rubrics,items.rating'
        }
        
        try:
            response = requests.get(url, params=params, timeout=10)
            data = response.json()
            
            suppliers = []
            for item in data.get('result', {}).get('items', []):
                rubrics = item.get('rubrics', [])
                supplier = {
                    'name': item.get('name'),
                    'address': item.get('address_name'),
                    'phone': item.get('phones', [{}])[0].get('number', ''),
                    'city': city,
                    'source': '2GIS',
                    'source_id': item.get('id'),
                    'categories': [r.get('name') for r in rubrics],
                    'rating': item.get('rating', {}).get('avg', 0)
                }
                suppliers.append(supplier)
            
            print(f"  ✅ Найдено {len(suppliers)} компаний по категориям")
            return suppliers
        except Exception as e:
            print(f"  ❌ Ошибка поиска компаний: {e}")
            return []
    
    def get_horeca_categories(self, city: str) -> Dict[str, str]:
        """Получение ID категорий для HoReCa поставщиков"""
        # Список категорий для поиска B2B поставщиков
        target_categories = [
            'рыбный магазин',      # ищем ID
            'мясной магазин',
            'овощной магазин',
            'молочная продукция',
            'полуфабрикаты',
            'ресторанные поставки',
            'HoReCa',
            'оптовая продажа продуктов',
        ]
        
        categories_map = {}
        for cat_name in target_categories:
            rubric_id = self.find_category_id(cat_name, city)
            if rubric_id:
                categories_map[cat_name] = rubric_id
                print(f"  ✅ '{cat_name}' → ID: {rubric_id}")
            else:
                print(f"  ❌ '{cat_name}' не найдена")
        
        return categories_map
    
    def auto_collect_by_filters(self, city: str, category: str = None) -> List[Dict]:
        """Сбор поставщиков на основе фильтров с AI фильтрацией"""
        print(f"🔍 Поиск поставщиков в городе: {city}")
        
        # Получаем все категории HoReCa
        categories_map = self.get_horeca_categories(city)
        
        if not categories_map:
            print("  ❌ Не найдено ни одной категории")
            return []
        
        # Фильтруем по конкретной категории, если указана
        if category and category in categories_map:
            rubric_ids = [categories_map[category]]
            print(f"  📂 Поиск по категории: {category}")
        else:
            rubric_ids = list(categories_map.values())
            print(f"  📂 Поиск по всем категориям ({len(rubric_ids)})")
        
        # Ищем компании
        suppliers = self.search_by_rubric_ids(rubric_ids, city)
        
        # AI фильтрация (отсеиваем нерелевантных поставщиков)
        if self.ai_available and suppliers:
            print(f"  🤖 AI фильтрация {len(suppliers)} компаний...")
            filtered_suppliers = self.filter_by_ai(suppliers)
            print(f"  ✅ После AI фильтрации: {len(filtered_suppliers)} компаний")
            return filtered_suppliers
        
        return suppliers

    def filter_by_ai(self, suppliers: List[Dict]) -> List[Dict]:
        """AI фильтрация поставщиков — оставляем только релевантных HoReCa"""
        from chat.ai_bot import restaurant_bot
        
        filtered = []
        
        for supplier in suppliers:
            name = supplier.get('name', '')
            categories = ', '.join(supplier.get('categories', []))
            
            prompt = f"""
            Определи, является ли компания "{name}" (категории: {categories}) релевантным поставщиком для ресторанов и HoReCa.
            
            Критерии:
            - Поставщик продуктов питания (мясо, рыба, овощи, молочка, полуфабрикаты) → релевантно
            - Упаковка и расходники для ресторанов → релевантно
            - Логистика и складские услуги → не релевантно (если не про еду)
            - Пивоварни и алкоголь → частично релевантно (только если рестораны закупают)
            - Офисные помещения, хранение багажа, ЖКХ → не релевантно
            
            Ответь ТОЛЬКО JSON: {{"relevant": true/false, "reason": "краткое объяснение"}}
            """
            
            try:
                response = restaurant_bot.giga.chat(prompt)
                import json
                # Извлекаем JSON из ответа
                text = response.choices[0].message.content
                # Ищем JSON в строке
                start = text.find('{')
                end = text.rfind('}') + 1
                if start != -1 and end != 0:
                    result = json.loads(text[start:end])
                    if result.get('relevant', False):
                        supplier['ai_reason'] = result.get('reason', '')
                        filtered.append(supplier)
                        print(f"    ✅ {name} — релевантно ({result.get('reason', '')})")
                    else:
                        print(f"    ❌ {name} — не релевантно ({result.get('reason', '')})")
                else:
                    # Если не удалось распарсить, добавляем по умолчанию
                    filtered.append(supplier)
            except Exception as e:
                print(f"    ⚠️ Ошибка AI для {name}: {e}")
                # В случае ошибки добавляем для ручной проверки
                filtered.append(supplier)
        
        return filtered
    
    def auto_collect(self, query: str, city: str) -> List[Dict]:
        """Автоматический сбор данных (старый метод для совместимости)"""
        return self.auto_collect_by_filters(city, query if query in ['мясо', 'рыба', 'овощи', 'молоко'] else None)
    
    def save_to_database(self, suppliers_data: List[Dict], user) -> int:
        """Сохранение собранных данных в БД"""
        
        saved = 0
        for data in suppliers_data:
            if not data.get('name'):
                continue
            
            # Определяем список категорий для поставщика
            category_names = self._determine_categories(data)
            
            supplier, created = Supplier.objects.get_or_create(
                name=data['name'],
                defaults={
                    'city': data.get('city', ''),
                    'region': data.get('region', ''),
                    'address': data.get('address', ''),
                    'phone': data.get('phone', ''),
                    'email': data.get('email', ''),
                    'website': data.get('website', ''),
                    'notes': f"Автоматически добавлен из {data.get('source', '2GIS')}. Категории: {', '.join(data.get('categories', []))}. AI оценка: {data.get('ai_reason', '')}",
                    'created_by': user,
                    'rating': data.get('rating', 0)
                }
            )
            
            if created:
                # Добавляем все подходящие категории
                for cat_name in category_names:
                    category, _ = SupplierCategory.objects.get_or_create(
                        name=cat_name,
                        defaults={'icon': self._get_category_icon(cat_name)}
                    )
                    supplier.categories.add(category)
                
                saved += 1
                print(f"  ➕ Добавлен: {supplier.name} (категории: {', '.join(category_names)})")
            else:
                print(f"  ⏭️ Уже существует: {supplier.name}")
        
        return saved

    def _determine_categories(self, data: Dict) -> str:
        """Определение категории поставщика на основе AI или ключевых слов"""
        name = data.get('name', '').lower()
        categories_str = ' '.join(data.get('categories', [])).lower()
        ai_reason = data.get('ai_reason', '').lower()
        
        keywords = {
            'Мясо и птица': ['мясо', 'мясн', 'птиц', 'говяд', 'свин', 'телят', 'колбас', 'полуфабрикат', 'хамон', 'мясная лавка'],
            'Рыба и морепродукты': ['рыб', 'икр', 'морепродукт', 'креветк', 'лосос', 'семг', 'раков', 'рыбная лавка'],
            'Молочные продукты': ['молок', 'сыр', 'творог', 'кефир', 'йогурт', 'сметан', 'молочное место'],
            'Хлеб и выпечка': ['хлеб', 'пекарн', 'булочк', 'выпечк', 'торт', 'пирож', 'хлебничная'],
            'Овощи и фрукты': ['овощ', 'фрукт', 'зелен', 'орех', 'ягод', 'фруктов'],
            'Бакалея': ['бакале', 'круп', 'макарон', 'мук', 'сахар', 'масл'],
        }
        
        text = f"{name} {categories_str} {ai_reason}"
        matched_categories = []
        
        for category, words in keywords.items():
            if any(word in text for word in words):
                matched_categories.append(category)
        
        # Если ничего не подошло, добавляем общую категорию
        if not matched_categories:
            matched_categories = ['Продукты питания']
        
        return matched_categories

    def _get_category_icon(self, category: str) -> str:
        """Иконка для категории"""
        icons = {
            'Мясо и птица': '🥩',
            'Рыба и морепродукты': '🐟',
            'Молочные продукты': '🥛',
            'Хлеб и выпечка': '🍞',
            'Овощи и фрукты': '🥬',
            'Бакалея': '🥫',
            'Продукты питания': '🍽️',
        }
        return icons.get(category, '📦')