# 🤖 AI Automation Portfolio

[![Docker](https://img.shields.io/badge/Docker-✓-blue)](https://www.docker.com/)
[![Django](https://img.shields.io/badge/Django-5.0-green)](https://www.djangoproject.com/)
[![React](https://img.shields.io/badge/React-18.2-blue)](https://reactjs.org/)
[![Tailwind](https://img.shields.io/badge/Tailwind-3.4-cyan)](https://tailwindcss.com/)

> Портфолио-проект. Демонстрация навыков автоматизации бизнес-процессов с помощью ИИ.

## 📋 О проекте

Проект представляет собой полноценную платформу с ролевой моделью, демонстрирующую:

- 🤖 **Умный чат-бот** — AI бот с распознаванием намерений (меню, скидки, доставка)
- 👨‍💼 **Чат оператора** — ручной режим ответов с группировкой по сессиям
- 📊 **CRUD таблица** — управление данными с ролевым доступом (гость/оператор)
- 📈 **Дашборд аналитики** — графики продаж с фильтрацией по периодам
- 🌓 **Тёмная тема** — плавное переключение с сохранением в localStorage
- 🐳 **Docker** — полная контейнеризация с PostgreSQL, Redis, Celery

## 🏗️ Технологии

### Backend
- Django 5.0 + Django REST Framework
- JWT аутентификация
- Celery + Redis (периодические задачи)
- PostgreSQL
- AI бот на регулярных выражениях

### Frontend
- React 18 + Vite
- Tailwind CSS + React Router
- Recharts (графики)
- React Date Range Picker

### DevOps
- Docker + Docker Compose
- GitHub Actions (готово для CI/CD)

## 🚀 Быстрый старт

### Требования
- Docker Desktop 4.20+
- 4GB RAM

### Запуск

```bash
# Клонирование
git clone https://github.com/Invis874/ai-portfolio.git
cd ai-portfolio

# Запуск всех сервисов
docker-compose up --build
```

### Создание оператора
```bash
# Создание суперпользователя
docker-compose exec backend python manage.py createsuperuser

# Изменение роли на operator в админке
# http://localhost:8000/admin → User Profiles
```

### Создание тестовых данных
```bash
# Генерация данных для дашборда (30 дней)
docker-compose exec backend python scripts/generate_data.py
```

## 🔗 Доступ к сервисам

| Сервис | URL | Описание |
|--------|-----|----------|
| Frontend | http://localhost:5173 | React приложение |
| Backend API | http://localhost:8000/api/ | Django REST API |
| Admin панель | http://localhost:8000/admin | Django админка |
| PostgreSQL | localhost:5432 | База данных |
| Redis | localhost:6379 | Брокер задач |

## 👥 Ролевая модель

| Роль | Возможности |
|------|-------------|
| Гость | Чат с ботом, просмотр таблицы и дашборда |
| Авторизованный | Своя история чата |
| Оператор | Ответы в чаты, CRUD в таблице |

## 📁 Структура API

| Метод | Эндпоинт | Описание | Доступ |
|-------|----------|----------|--------|
| POST | /api/users/register/ | Регистрация | Все |
| POST | /api/users/login/ | Вход | Все |
| GET | /api/users/me/ | Текущий пользователь | Авторизованные |
| POST | /api/chat/send/ | Отправить сообщение | Все |
| POST | /api/chat/operator_reply/ | Ответ оператора | Оператор |
| GET | /api/chat/all_sessions/ | Список чатов | Оператор |
| GET | /api/sales/ | Список продаж | Все |
| POST/PUT/DELETE | /api/sales/ | CRUD продаж | Оператор |
| GET | /api/sales/stats/ | Статистика | Все |

## 🧪 Тестирование

```bash
# Проверка API
curl http://localhost:8000/api/sales/

# Отправка сообщения боту
curl -X POST http://localhost:8000/api/chat/send/ \
  -H "Content-Type: application/json" \
  -d '{"message":"Покажи меню"}'
```