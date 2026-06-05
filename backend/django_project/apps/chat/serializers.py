from rest_framework import serializers
from .models import ChatMessage

class ChatMessageSerializer(serializers.ModelSerializer):
    username = serializers.SerializerMethodField()
    
    class Meta:
        model = ChatMessage
        fields = ['id', 'user', 'username', 'session_key', 'user_message', 
                  'bot_response', 'is_answered_by_operator', 'operator_response', 'created_at']
        read_only_fields = ['id', 'created_at', 'bot_response', 'is_answered_by_operator', 'user']
    
    def get_username(self, obj):
        if obj.user:
            return obj.user.username
        return None

class ChatSendSerializer(serializers.Serializer):
    message = serializers.CharField(max_length=1000)

class OperatorReplySerializer(serializers.Serializer):
    session_key = serializers.CharField(max_length=100)
    reply = serializers.CharField(max_length=1000)