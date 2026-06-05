from django.db import models
from django.contrib.auth.models import User

class ChatMessage(models.Model):
    """Сообщения в чате от гостей и ответы бота/оператора"""
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Пользователь")
    session_key = models.CharField(max_length=100, db_index=True, blank=True, null=True, verbose_name="Ключ сессии")
    user_message = models.TextField(verbose_name="Сообщение пользователя")
    bot_response = models.TextField(blank=True, verbose_name="Ответ бота")
    is_answered_by_operator = models.BooleanField(default=False, verbose_name="Ответил оператор")
    operator_response = models.TextField(blank=True, verbose_name="Ответ оператора")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Создано")
    
    class Meta:
        ordering = ['created_at']
        verbose_name = "Сообщение чата"
        verbose_name_plural = "Сообщения чата"
    
    def __str__(self):
        return f"{self.session_key}: {self.user_message[:50]}"