import re
import random
import os
from datetime import datetime
from typing import Dict, Any, Optional

# Пытаемся импортировать GigaChat
try:
    from gigachat import GigaChat
    GIGACHAT_AVAILABLE = True
except ImportError:
    GIGACHAT_AVAILABLE = False
    print("GigaChat not installed. Using rule-based bot only.")

class SimpleRestaurantBot:
    """Гибридный бот для ресторана: rule-based + AI (GigaChat)"""
    
    def __init__(self):
        # Меню для rule-based и fallback
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
        
        # Инициализация GigaChat
        self.giga = None
        self.ai_available = False
        self._init_gigachat()
    
    def _init_gigachat(self):
        """Инициализация GigaChat AI"""
        api_key = os.environ.get('GIGACHAT_API_KEY') or os.environ.get('GIGACHAT_CREDENTIALS')
        
        if not GIGACHAT_AVAILABLE:
            print("AI disabled: GigaChat library not installed")
            return
        
        if not api_key:
            print("AI disabled: GIGACHAT_API_KEY not set in environment")
            return
        
        try:
            self.giga = GigaChat(
                credentials=api_key,
                verify_ssl_certs=False,
                timeout=30
            )
            self.ai_available = True
            print("✅ GigaChat AI initialized successfully")
        except Exception as e:
            print(f"AI initialization failed: {e}")
            self.ai_available = False
    
    def get_response(self, message: str) -> Dict[str, Any]:
        """Основной метод получения ответа (AI или rule-based)"""
        
        # Если AI доступен — используем его
        if self.ai_available:
            try:
                return self._ai_response(message)
            except Exception as e:
                print(f"AI error, falling back to rule-based: {e}")
                return self._rule_based_response(message)
        
        # Fallback на rule-based
        return self._rule_based_response(message)
    
    def _ai_response(self, message: str) -> Dict[str, Any]:
        """Ответ от GigaChat AI"""
        
        prompt = f"""
        Ты — бот ресторана быстрого питания. Отвечай дружелюбно, кратко, используй смайлики.
        
        Вопрос пользователя: {message}
        
        Информация о ресторане:
        - Меню: Пицца Маргарита 500₽, Роллы Филадельфия 450₽, Цезарь 350₽, Лимонад 150₽
        - Доставка: 30-60 минут, бесплатно от 1000₽
        - Акция: Скидка 10% на первый заказ
        
        Правила:
        1. Если спрашивают про меню — перечисли позиции
        2. Если про доставку — назови время и условия
        3. Если про акции — расскажи про скидку
        4. Будь вежливым, не более 2-3 предложений
        """
        
        response = self.giga.chat(prompt)
        ai_reply = response.choices[0].message.content
        
        return {
            'reply': ai_reply,
            'structured_data': None
        }
    
    def _rule_based_response(self, message: str) -> Dict[str, Any]:
        """Rule-based fallback при недоступности AI"""
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
        """Извлекает структурированные данные из текста"""
        extracted = {}
        
        for key, item in self.menu.items():
            if item['name'].lower() in message.lower():
                extracted['product'] = item['name']
                break
        
        numbers = re.findall(r'\d+', message)
        if numbers:
            extracted['quantity'] = int(numbers[0])
        
        return extracted if extracted else None

# Создаем глобальный экземпляр бота
restaurant_bot = SimpleRestaurantBot()