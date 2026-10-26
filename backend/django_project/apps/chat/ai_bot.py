import re
import random
import os
import time
import json
import requests
from datetime import datetime, date, timedelta
from typing import Dict, Any, Optional

# Пытаемся импортировать GigaChat
try:
    from gigachat import GigaChat
    from gigachat.models import Chat, Messages, MessagesRole, Function, FunctionParameters
    GIGACHAT_AVAILABLE = True
except ImportError:
    GIGACHAT_AVAILABLE = False
    print("GigaChat not installed. Using rule-based bot only.")


# ============================================================
# ИНСТРУМЕНТ 1: Создание заказа (несколько позиций)
# ============================================================
def create_order(items: list, session_key: str = None, user_id: int = None):
    """
    Создаёт заказ с несколькими позициями.
    items = [{"product_name": "Пицца Маргарита", "quantity": 2}, ...]
    """
    print(f"🔍 create_order: items={items}, session_key={session_key}, user_id={user_id}")

    if not items:
        return {
            "status": "error", 
            "message": "Не переданы позиции заказа. Уточните, что хотите заказать."
        }

    try:
        api_url = os.environ.get('VITE_API_URL')
        
        response = requests.post(
            f"{api_url}/sales/create_with_items/",
            json={
                'session_key': session_key,
                'user_id': user_id,
                'items': items,
            },
            timeout=10
        )
        
        if response.status_code == 201:
            order = response.json()
            items_text = ", ".join([
                f"{i['product_name']} x{i['quantity']}" 
                for i in order.get('items', [])
            ])
            return {
                "status": "ok",
                "order_id": order['id'],
                "message": f"Заказ #{order['id']} создан: {items_text}. Итого: {order['total_price']}₽. Оператор скоро подтвердит."
            }
        return {"status": "error", "message": f"Не удалось создать заказ: {response.text}"}
    except Exception as e:
        return {"status": "error", "message": f"Ошибка: {e}"}


# ============================================================
# ИНСТРУМЕНТ 2: Статистика (только оператор/админ)
# ============================================================
def get_statistics(period_days: int = 7, user_role: str = "guest"):
    """Возвращает статистику продаж (только для оператора/админа)."""
    if user_role not in ['operator', 'admin']:
        return {"status": "forbidden", "message": "Статистика доступна только операторам."}
    
    try:
        api_url = os.environ.get('VITE_API_URL')
        end = date.today()
        start = end - timedelta(days=period_days)
        
        response = requests.get(
            f"{api_url}/sales/stats/?start_date={start}&end_date={end}",
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            return {
                "status": "ok",
                "total_revenue": data.get('total_revenue', 0),
                "total_quantity": data.get('total_quantity', 0),
                "total_orders": data.get('total_orders', 0),
                "message": f"За {period_days} дней: выручка {data.get('total_revenue', 0):,.0f}₽, продано {data.get('total_quantity', 0)} шт., заказов {data.get('total_orders', 0)}."
            }
        return {"status": "error", "message": "Не удалось получить статистику."}
    except Exception as e:
        return {"status": "error", "message": f"Ошибка: {e}"}


class SimpleRestaurantBot:
    """Гибридный бот для ресторана: rule-based + AI (GigaChat)"""

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
                model="GigaChat-2",
                verify_ssl_certs=False,
                ca_bundle_file="/app/russian_trusted_root_ca_pem.crt",
                timeout=60
            )
            self.ai_available = True
            print("✅ GigaChat AI initialized successfully")
        except Exception as e:
            print(f"AI initialization failed: {e}")
            self.ai_available = False

    def _safe_chat(self, payload):
        """Обёртка над giga.chat с повторными попытками при SSL-ошибках"""
        last_error = None
        for attempt in range(3):
            try:
                return self.giga.chat(payload)
            except Exception as e:
                last_error = e
                print(f"GigaChat attempt {attempt + 1} failed: {e}")
                time.sleep(2)
        raise last_error

    def get_response(self, message: str, session_key: str = None, user_role: str = "guest", user_id: int = None) -> Dict[str, Any]:
        """Основной метод получения ответа (AI или rule-based)"""

        if self.ai_available:
            try:
                return self._ai_response(message, session_key=session_key, user_role=user_role, user_id=user_id)
            except Exception as e:
                print(f"AI error, falling back to rule-based: {e}")
                return self._rule_based_response(message)

        return self._rule_based_response(message)

    def _ai_response(self, message: str, session_key: str = None, user_role: str = "guest", user_id: int = None) -> Dict[str, Any]:
        """Ответ от GigaChat AI с поддержкой вызова функций"""

        # Инструмент 1: создание заказа
        create_order_tool = Function(
            name="create_order",
            description=(
                "Создаёт заказ с одной или несколькими позициями. "
                "Используй, когда пользователь хочет заказать еду. "
                "ВАЖНО: если пользователь перечисляет несколько блюд — передай ВСЕ позиции в массиве items. "
                "Не пропускай ни одну позицию. Не объединяй позиции. "
                "Названия продуктов должны точно совпадать с меню: "
                "Пицца Маргарита, Роллы Филадельфия, Цезарь с курицей, Лимонад."
            ),
            parameters=FunctionParameters(
                type="object",
                properties={
                    "items": {
                        "type": "array",
                        "description": "Список ВСЕХ позиций заказа. Если пользователь заказал 2 пиццы и 1 лимонад — здесь должно быть 2 элемента.",
                        "items": {
                            "type": "object",
                            "properties": {
                                "product_name": {
                                    "type": "string", 
                                    "enum": ["Пицца Маргарита", "Роллы Филадельфия", "Цезарь с курицей", "Лимонад"],
                                    "description": "Точное название продукта из меню"
                                },
                                "quantity": {"type": "integer", "description": "Количество"}
                            },
                            "required": ["product_name", "quantity"]
                        }
                    }
                },
                required=["items"]
            )
        )

        # Инструмент 2: статистика (только для оператора/админа)
        stats_tool = Function(
            name="get_statistics",
            description="Возвращает статистику продаж за последние N дней. Используй, если оператор или админ просит статистику.",
            parameters=FunctionParameters(
                type="object",
                properties={
                    "period_days": {"type": "integer", "description": "Количество дней (по умолчанию 7)"}
                },
                required=["period_days"]
            )
        )

        tools = [create_order_tool]
        if user_role in ['operator', 'admin']:
            tools.append(stats_tool)

        payload = Chat(
            messages=[
                Messages(
                    role=MessagesRole.SYSTEM,
                    content=(
                        f"Ты — умный помощник ресторана. Роль пользователя: {user_role}. "
                        "Отвечай дружелюбно, кратко, со смайликами. "
                        "\n\nПРАВИЛА ВЫБОРА ИНСТРУМЕНТА:\n"
                        "1. Если пользователь хочет ЗАКАЗАТЬ еду (пиццу, роллы, салаты, напитки) — используй create_order.\n"
                        "2. Если пользователь просит СТАТИСТИКУ (продажи, выручку, количество заказов) — используй get_statistics.\n"
                        "3. НЕ используй create_order, если пользователь не хочет заказывать еду.\n"
                        "4. НЕ используй get_statistics, если роль пользователя не operator и не admin.\n"
                        "5. Если не уверен — просто ответь текстом, не вызывай функцию.\n"
                        "Не выдумывай данные."
                    )
                ),
                Messages(role=MessagesRole.USER, content=message)
            ],
            functions=tools,
            function_call="auto"
        )

        response = self._safe_chat(payload)
        choice = response.choices[0].message

        if choice.function_call:
            func_name = choice.function_call.name
            args = choice.function_call.arguments

            print(f"🔍 GigaChat вызвал {func_name} с аргументами: {args}")  # ← добавь

            if func_name == "create_order":
                result = create_order(
                    args.get("items", []),
                    session_key=session_key,
                    user_id=user_id
                )
            elif func_name == "get_statistics":
                result = get_statistics(args.get("period_days", 7), user_role)
            else:
                result = {"status": "error", "message": "Неизвестная функция"}

            # ✅ Если функция вернула ошибку — отдаём её напрямую, без второго запроса
            if result.get('status') in ['error', 'forbidden']:
                return {'reply': result['message'], 'structured_data': result}

            # ✅ Если функция вернула готовое message (ok) — тоже отдаём напрямую
            if result.get('status') == 'ok' and result.get('message'):
                return {'reply': result['message'], 'structured_data': result}

            # Отправляем результат обратно в модель
            payload.messages.append(
                Messages(role=MessagesRole.ASSISTANT, content="", function_call=choice.function_call)
            )
            payload.messages.append(
                Messages(role=MessagesRole.FUNCTION, name=func_name, content=json.dumps(result, ensure_ascii=False))
            )

            final_response = self._safe_chat(payload)
            return {'reply': final_response.choices[0].message.content, 'structured_data': result}

        return {'reply': choice.content, 'structured_data': None}

    def _rule_based_response(self, message: str) -> Dict[str, Any]:
        """Rule-based fallback при недоступности AI"""
        message_lower = message.lower()

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