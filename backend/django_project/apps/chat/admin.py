from django.contrib import admin
from .models import ChatMessage

@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ['session_key', 'user_message', 'is_answered_by_operator', 'created_at']
    list_filter = ['is_answered_by_operator', 'created_at']
    search_fields = ['session_key', 'user_message']
    readonly_fields = ['created_at']