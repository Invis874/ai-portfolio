# 🤖 AI Automation Portfolio

[![Docker](https://img.shields.io/badge/Docker-✓-blue)](https://www.docker.com/)
[![Django](https://img.shields.io/badge/Django-5.0-green)](https://www.djangoproject.com/)
[![React](https://img.shields.io/badge/React-18.2-blue)](https://reactjs.org/)
[![Tailwind](https://img.shields.io/badge/Tailwind-3.4-cyan)](https://tailwindcss.com/)
[![2GIS](https://img.shields.io/badge/2GIS-API-orange)](https://dev.2gis.ru/)
[![GigaChat](https://img.shields.io/badge/GigaChat-AI-purple)](https://developers.sber.ru/)

> Портфолио-проект. Демонстрация навыков автоматизации бизнес-процессов с помощью ИИ.

## 📋 О проекте

Проект представляет собой полноценную платформу с ролевой моделью, демонстрирующую:

### 🤖 Умный чат-бот
- AI бот с распознаванием намерений (меню, скидки, доставка)
- Интеграция с GigaChat (Сбер) для естественных ответов
- Ручной режим оператора с группировкой по сессиям
- Гибкая архитектура с fallback на rule-based логику

### 📦 Поиск поставщиков HoReCa
- Интеграция с 2GIS API (поиск по категориям)
- AI фильтрация поставщиков через GigaChat
- Автоматическое определение категорий товаров
- Сравнение поставщиков
- Отзывы и рейтинг

### 📊 Управление данными
- CRUD таблица с ролевым доступом (гость/оператор)
- Фильтрация по датам и категориям
- Экспорт статистики

### 📈 Дашборд аналитики
- Графики продаж с выбором периода
- Статистика по категориям
- Детальная аналитика

### 🌓 Тёмная тема
- Плавное переключение
- Сохранение выбора в localStorage

### 🐳 Docker
- Полная контейнеризация
- PostgreSQL, Redis, Celery
- Автоматические миграции

## 🏗️ Технологии

### Backend
- Django 5.0 + Django REST Framework
- JWT аутентификация
- Celery + Redis (периодические задачи)
- PostgreSQL
- GigaChat API (Сбер)
- 2GIS API (каталог организаций)

### Frontend
- React 18 + Vite
- Tailwind CSS + React Router
- Recharts (графики)
- React Date Range Picker

### DevOps
- Docker + Docker Compose

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

# Демо-поставщики (для показа функционала)
docker-compose exec backend python scripts/generate_suppliers_demo.py
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

### Поставщики

| Метод | Эндпоинт | Описание | Доступ |
|-------|----------|----------|--------|
| GET | /api/suppliers/ | Список поставщиков | Все |
| GET | /api/suppliers/{id}/ | Детали поставщика | Все |
| POST | /api/suppliers/ | Добавить поставщика | Оператор |
| PUT | /api/suppliers/{id}/ | Редактировать | Оператор |
| DELETE | /api/suppliers/{id}/ | Удалить | Оператор |
| GET | /api/suppliers/compare/?ids=1,2,3 | Сравнение | Все |
| POST | /api/suppliers/auto_collect/ | Автосбор из 2GIS | Оператор |
| GET | /api/suppliers/filters_info/ | Информация для фильтров | Все |

### Отзывы

| Метод | Эндпоинт | Описание | Доступ |
|-------|----------|----------|--------|
| GET | /api/reviews/?supplier_id=1 | Отзывы поставщика | Все |
| POST | /api/reviews/ | Оставить отзыв | Авторизованные |

### Чат

| Метод | Эндпоинт | Описание | Доступ |
|-------|----------|----------|--------|
| POST | /api/chat/send/ | Отправить сообщение | Все |
| POST | /api/chat/operator_reply/ | Ответ оператора | Оператор |
| GET | /api/chat/unread/ | Непрочитанные сообщения | Оператор |
| GET | /api/chat/all_sessions/ | Список чатов | Оператор |
| GET | /api/chat/session_messages/ | Сообщения сессии | Оператор |

### Пользователи

| Метод | Эндпоинт | Описание | Доступ |
|-------|----------|----------|--------|
| POST | /api/users/register/ | Регистрация | Все |
| POST | /api/users/login/ | Вход | Все |
| GET | /api/users/me/ | Текущий пользователь | Авторизованные |
| GET | /api/users/profile/ | Профиль с ролью | Авторизованные |

### Категории

| Метод | Эндпоинт | Описание | Доступ |
|-------|----------|----------|--------|
| GET | /api/categories/ | Список категорий поставщиков | Все |

### Продажи (дашборд)

| Метод | Эндпоинт | Описание | Доступ |
|-------|----------|----------|--------|
| GET | /api/sales/ | Список продаж | Все |
| POST | /api/sales/ | Добавить продажу | Оператор |
| PUT | /api/sales/{id}/ | Редактировать продажу | Оператор |
| DELETE | /api/sales/{id}/ | Удалить продажу | Оператор |
| GET | /api/sales/stats/ | Статистика для дашборда | Все |

## 🧪 Тестирование

```bash
# Проверка API
curl http://localhost:8000/api/sales/

# Отправка сообщения боту
curl -X POST http://localhost:8000/api/chat/send/ \
  -H "Content-Type: application/json" \
  -d '{"message":"Покажи меню"}'
```

## 🤖 AI возможности

Проект поддерживает два режима работы бота:

### 1. Rule-based (по умолчанию)
- Работает без API-ключей
- Распознаёт ключевые слова

### 2. AI-режим (опционально)
Подключите GigaChat от Сбера:
```bash
# Добавьте ключ в .env
GIGACHAT_API_KEY=ваш_ключ
```

## 2GIS API не возвращает результаты

Проверьте ключ в `.env`:
```bash
docker-compose exec backend env | grep DGIS
```