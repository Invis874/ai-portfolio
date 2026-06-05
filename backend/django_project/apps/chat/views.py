from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated, AllowAny
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.db.models import Q
from .models import ChatMessage
from .serializers import ChatMessageSerializer, ChatSendSerializer, OperatorReplySerializer
from .ai_bot import restaurant_bot
import uuid

class ChatViewSet(viewsets.ModelViewSet):
    queryset = ChatMessage.objects.all()
    serializer_class = ChatMessageSerializer
    authentication_classes = [JWTAuthentication]
    
    def get_permissions(self):
        if self.action == 'send':
            return [AllowAny()]
        elif self.action == 'operator_reply':
            return [IsAuthenticated()]
        elif self.action == 'all_sessions':
            return [IsAuthenticated()]
        return [IsAuthenticatedOrReadOnly()]
    
    def get_queryset(self):
        user = self.request.user
        session_key = self.request.query_params.get('session_key')
        
        # Обычный авторизованный пользователь видит только свои сообщения
        if user.is_authenticated:
            return self.queryset.filter(user=user)
        
        # Гость видит сообщения по session_key
        if session_key:
            return self.queryset.filter(session_key=session_key, user__isnull=True)
        
        return self.queryset.none()
    
    @action(detail=False, methods=['post'])
    def send(self, request):
        serializer = ChatSendSerializer(data=request.data)
        if serializer.is_valid():
            message = serializer.validated_data['message']
            
            user = request.user if request.user.is_authenticated else None
            
            session_key = None
            if not user:
                session_key = request.headers.get('X-Session-Key')
                if not session_key:
                    session_key = str(uuid.uuid4())
            
            bot_response = restaurant_bot.get_response(message)
            
            chat_message = ChatMessage.objects.create(
                user=user,
                session_key=session_key,
                user_message=message,
                bot_response=bot_response['reply']
            )
            
            response_data = ChatMessageSerializer(chat_message).data
            if session_key:
                response_data['session_key'] = session_key
            
            return Response(response_data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def operator_reply(self, request):
        session_key = request.data.get('session_key')
        user_id = request.data.get('user_id')
        reply = request.data.get('reply')
        
        if not reply:
            return Response({'error': 'reply required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Случай 1: Ответ гостю (по session_key)
        if session_key:
            operator_message = ChatMessage.objects.create(
                user=None,
                session_key=session_key,
                operator_response=reply,
                is_answered_by_operator=True
            )
            # Отмечаем все сообщения этой сессии как отвеченные
            ChatMessage.objects.filter(session_key=session_key).update(is_answered_by_operator=True)
        
        # Случай 2: Ответ авторизованному пользователю (по user_id)
        elif user_id:
            operator_message = ChatMessage.objects.create(
                user_id=user_id,  # Привязываем к пользователю, которому отвечаем
                session_key=None,
                operator_response=reply,
                is_answered_by_operator=True
            )
            # Отмечаем все сообщения этого пользователя как отвеченные
            ChatMessage.objects.filter(user_id=user_id).update(is_answered_by_operator=True)
        
        else:
            return Response({'error': 'session_key or user_id required'}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response(ChatMessageSerializer(operator_message).data)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def all_sessions(self, request):
        """Оператор получает все активные чаты"""
        if not (hasattr(request.user, 'profile') and request.user.profile.role in ['operator', 'admin']):
            return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
        
        sessions_dict = {}
        
        # 1. Чаты гостей (по session_key)
        guest_messages = ChatMessage.objects.filter(
            user__isnull=True, 
            session_key__isnull=False
        ).exclude(session_key='').order_by('created_at')
        
        for msg in guest_messages:
            if msg.session_key not in sessions_dict:
                sessions_dict[msg.session_key] = {
                    'type': 'guest',
                    'session_key': msg.session_key,
                    'name': f'Гость: {msg.session_key[:20]}...',
                    'unread_count': 0,
                    'last_message': msg.created_at,
                    'messages': []
                }
            sessions_dict[msg.session_key]['messages'].append(msg)
            if not msg.is_answered_by_operator and not msg.operator_response:
                sessions_dict[msg.session_key]['unread_count'] += 1
            if msg.created_at > sessions_dict[msg.session_key]['last_message']:
                sessions_dict[msg.session_key]['last_message'] = msg.created_at
        
        # 2. Чаты авторизованных пользователей (не операторов)
        user_messages = ChatMessage.objects.filter(
            user__isnull=False
        ).exclude(user__profile__role='operator').order_by('created_at')
        
        for msg in user_messages:
            user_id = msg.user.id
            if user_id not in sessions_dict:
                sessions_dict[user_id] = {
                    'type': 'user',
                    'user_id': user_id,
                    'name': f'Пользователь: {msg.user.username}',
                    'unread_count': 0,
                    'last_message': msg.created_at,
                    'messages': []
                }
            sessions_dict[user_id]['messages'].append(msg)
            if not msg.is_answered_by_operator and not msg.operator_response:
                sessions_dict[user_id]['unread_count'] += 1
            if msg.created_at > sessions_dict[user_id]['last_message']:
                sessions_dict[user_id]['last_message'] = msg.created_at
        
        # 3. Чат самого оператора
        operator_messages = ChatMessage.objects.filter(user=request.user).order_by('created_at')
        operator_id = request.user.id
        if operator_id not in sessions_dict:
            sessions_dict[operator_id] = {
                'type': 'operator',
                'user_id': operator_id,
                'name': f'Мой чат ({request.user.username})',
                'unread_count': 0,
                'last_message': None,
                'messages': []
            }
        
        for msg in operator_messages:
            sessions_dict[operator_id]['messages'].append(msg)
            if not msg.is_answered_by_operator and not msg.operator_response:
                sessions_dict[operator_id]['unread_count'] += 1
            if sessions_dict[operator_id]['last_message'] is None or msg.created_at > sessions_dict[operator_id]['last_message']:
                sessions_dict[operator_id]['last_message'] = msg.created_at
        
        # Преобразуем в список и сортируем по последнему сообщению
        sessions_list = list(sessions_dict.values())
        sessions_list.sort(key=lambda x: x['last_message'] or x['unread_count'], reverse=True)
        
        # Убираем messages из ответа (они не нужны в списке)
        for session in sessions_list:
            session.pop('messages', None)
        
        return Response(sessions_list)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def session_messages(self, request):
        """Оператор получает сообщения конкретного чата"""
        session_key = request.query_params.get('session_key')
        user_id = request.query_params.get('user_id')
        
        if session_key:
            messages = ChatMessage.objects.filter(session_key=session_key).order_by('created_at')
        elif user_id:
            messages = ChatMessage.objects.filter(user_id=user_id).order_by('created_at')
        else:
            return Response({'error': 'session_key or user_id required'}, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = self.get_serializer(messages, many=True)
        return Response(serializer.data)