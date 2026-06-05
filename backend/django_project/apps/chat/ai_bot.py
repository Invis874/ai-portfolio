import re
import random
from datetime import datetime

class SimpleRestaurantBot:
    """Простой AI бот для ресторана (без внешних API)"""
    
    def __init__(self):
        self.menu = {
            'pizza': {'name': 'Пицца Маргарита', 'price': 500, 'category': 'pizza'},
            'rolls': {'name': 'Роллы Филадельфия', 'price': 450, 'category': 'rolls'},
            'salads': {'name': 'Цезарь с курицей', 'price': 350, 'category': 'salads'},
            'drinks': {'name': 'Лимонад', 'price': 150, 'category': 'drinks'},
        }
        
        self.promotions = [
            "🎉 Скидка 10% на первый заказ!",
            "🍕 Пицца в подарок при заказе от 1500₽",
            "🚚 Бесплатная доставка при заказе от 1000₽",
            "⭐ Накопительная скидка до 20% для постоянных клиентов"
        ]
    
    def get_response(self, message: str) -> dict:
        """Анализирует сообщение и возвращает ответ"""
        message_lower = message.lower()
        
        # Распознавание намерений
        if any(word in message_lower for word in ['меню', 'блюда', 'что есть', 'еда']):
            return self._handle_menu()
        
        if any(word in message_lower for word in ['скидк', 'акци', 'спецпредлож']):
            return self._handle_promotions()
        
        if any(word in message_lower for word in ['доставк', 'привезут', 'когда']):
            return self._handle_delivery()
        
        if any(word in message_lower for word in ['контакт', 'телефон', 'адрес']):
            return self._handle_contacts()
        
        if any(word in message_lower for word in ['заказ', 'купить', 'заказать']):
            return self._handle_order(message)
        
        # Извлечение структурированных данных (демо AI)
        extracted_data = self._extract_structured_data(message)
        if extracted_data:
            return {
                'reply': f"🔍 Я распознал в вашем сообщении:\n"
                         f"• Товар: {extracted_data.get('product', 'не указан')}\n"
                         f"• Количество: {extracted_data.get('quantity', 'не указано')}\n"
                         f"Хотите оформить заказ? Напишите 'да'",
                'structured_data': extracted_data
            }
        
        return {
            'reply': "Спасибо за вопрос! Оператор скоро ответит вам.\n\n"
                     "А пока я могу:\n"
                     "📋 Показать меню\n"
                     "🎯 Рассказать об акциях\n"
                     "🚚 Уточнить доставку\n"
                     "📞 Дать контакты",
            'structured_data': None
        }
    
    def _handle_menu(self) -> dict:
        menu_text = "🍽️ **Наше меню:**\n\n"
        for key, item in self.menu.items():
            menu_text += f"• {item['name']} — {item['price']}₽\n"
        menu_text += "\nНапишите название блюда, чтобы заказать!"
        return {'reply': menu_text, 'structured_data': None}
    
    def _handle_promotions(self) -> dict:
        promo = random.choice(self.promotions)
        return {'reply': f"🎁 **Акции:**\n{promo}", 'structured_data': None}
    
    def _handle_delivery(self) -> dict:
        return {'reply': "🚚 **Доставка:**\n• Время: 30-60 минут\n• Бесплатно от 1000₽\n• Работаем ежедневно 10:00-23:00", 'structured_data': None}
    
    def _handle_contacts(self) -> dict:
        return {'reply': "📞 **Контакты:**\n• Телефон: +7 (999) 123-45-67\n• Email: info@restaurant.ru\n• Адрес: ул. Примерная, д. 123", 'structured_data': None}
    
    def _handle_order(self, message: str) -> dict:
        return {'reply': "✅ Для оформления заказа свяжитесь с оператором. Он скоро ответит!", 'structured_data': None}
    
    def _extract_structured_data(self, message: str) -> dict:
        """Демо AI: извлекает структурированные данные из текста"""
        extracted = {}
        
        # Поиск продукта
        for key, item in self.menu.items():
            if item['name'].lower() in message.lower():
                extracted['product'] = item['name']
                break
        
        # Поиск количества (цифры)
        numbers = re.findall(r'\d+', message)
        if numbers:
            extracted['quantity'] = int(numbers[0])
        
        return extracted if extracted else None

# Создаем глобальный экземпляр бота
restaurant_bot = SimpleRestaurantBot()