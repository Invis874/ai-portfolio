from celery import shared_task
from django.utils import timezone
from datetime import timedelta
from .models import ChatMessage

@shared_task
def cleanup_inactive_guest_sessions():
    """Удаление целых сессий неактивных гостей (не писали 7 дней)"""
    threshold = timezone.now() - timedelta(days=7)
    
    # Находим сессии, где последнее сообщение старше 7 дней
    from django.db.models import Max
    
    inactive_sessions = ChatMessage.objects.values('session_key').annotate(
        last_activity=Max('created_at')
    ).filter(last_activity__lt=threshold)
    
    deleted_sessions = 0
    deleted_messages = 0
    
    for session in inactive_sessions:
        session_key = session['session_key']
        # Удаляем ВСЕ сообщения этой сессии (гость больше не вернётся)
        count, _ = ChatMessage.objects.filter(session_key=session_key).delete()
        deleted_messages += count
        deleted_sessions += 1
    
    return f"🧹 Удалено {deleted_sessions} неактивных сессий и {deleted_messages} сообщений"
    
@shared_task
def cleanup_old_messages():
    """Удаление сообщений старше 30 дней"""
    threshold = timezone.now() - timedelta(days=30)
    deleted_count = ChatMessage.objects.filter(created_at__lt=threshold).count()
    ChatMessage.objects.filter(created_at__lt=threshold).delete()
    return f"🗑️ Deleted {deleted_count} old messages"

@shared_task
def send_daily_chat_digest():
    """Отправка дайджеста новых сообщений"""
    yesterday = timezone.now() - timedelta(days=1)
    new_messages = ChatMessage.objects.filter(created_at__gte=yesterday).count()
    unread_operator = ChatMessage.objects.filter(
        created_at__gte=yesterday,
        is_answered_by_operator=False
    ).count()
    
    print(f"📊 Daily Digest:")
    print(f"   New messages: {new_messages}")
    print(f"   Need operator reply: {unread_operator}")
    
    # Здесь можно добавить отправку email или Telegram уведомления
    return f"Digest sent: {new_messages} messages, {unread_operator} need reply"