from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated, AllowAny
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.db.models import Sum, Count, Q
from datetime import datetime, timedelta, date
from .models import SalesData, Order
from .serializers import SalesDataSerializer, OrderSerializer, ChartConfigSerializer

class SalesDataViewSet(viewsets.ModelViewSet):
    """API для работы с данными продаж"""
    queryset = SalesData.objects.all()
    serializer_class = SalesDataSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def perform_create(self, serializer):
        """При создании записываем кто создал"""
        serializer.save(created_by=self.request.user if self.request.user.is_authenticated else None)
    
    def get_permissions(self):
        """Разные права для разных действий"""
        if self.action in ['update', 'partial_update', 'destroy', 'create']:
            # Только авторизованные могут менять данные
            self.permission_classes = [IsAuthenticated]
        return super().get_permissions()

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def create_with_items(self, request):
        """Создаёт заказ с несколькими позициями (SalesData)"""
        items_data = request.data.get('items', [])
        if not items_data:
            return Response({'error': 'items required'}, status=400)

        session_key = request.data.get('session_key')
        user_id = request.data.get('user_id')

        # Цены
        PRICES = {
            'Пицца Маргарита': {'price': 500, 'category': 'pizza'},
            'Роллы Филадельфия': {'price': 450, 'category': 'rolls'},
            'Цезарь с курицей': {'price': 350, 'category': 'salads'},
            'Лимонад': {'price': 150, 'category': 'drinks'},
        }

        # Создаём заказ
        order = Order.objects.create(
            user_id=user_id if user_id else None,
            session_key=session_key,
            status='pending',
        )

        # Создаём позиции
        for item in items_data:
            product_name = item.get('product_name')
            quantity = item.get('quantity', 1)

            product = PRICES.get(product_name)
            if not product:
                continue

            SalesData.objects.create(
                order=order,
                product_name=product_name,
                category=product['category'],
                quantity=quantity,
                revenue=product['price'] * quantity,
                date=date.today(),
                created_by=request.user if request.user.is_authenticated else None,
            )

        order.recalculate_total()

        return Response(OrderSerializer(order).data, status=201)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def confirm(self, request, pk=None):
        """Подтверждает заказ (только оператор/админ)"""
        try:
            order = Order.objects.get(pk=pk)
        except Order.DoesNotExist:
            return Response({'error': 'Заказ не найден'}, status=404)

        if request.user.profile.role not in ['operator', 'admin']:
            return Response({'error': 'Только оператор может подтвердить'}, status=403)

        order.status = 'confirmed'
        order.save()
        return Response(OrderSerializer(order).data)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Статистика для дашборда (только подтверждённые заказы + старые продажи)"""
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        category = request.query_params.get('category')

        # Только подтверждённые + старые записи без order
        queryset = SalesData.objects.filter(
            Q(order__status='confirmed') | Q(order__isnull=True)
        )

        if start_date:
            queryset = queryset.filter(date__gte=start_date)
        if end_date:
            queryset = queryset.filter(date__lte=end_date)
        if category:
            queryset = queryset.filter(category=category)

        stats_data = {
            'total_revenue': queryset.aggregate(total=Sum('revenue'))['total'] or 0,
            'total_quantity': queryset.aggregate(total=Sum('quantity'))['total'] or 0,
            'total_orders': queryset.count(),
            'by_category': list(queryset.values('category').annotate(
                revenue=Sum('revenue'),
                quantity=Sum('quantity'),
                count=Count('id')
            )),
            'daily_stats': list(queryset.values('date').annotate(
                revenue=Sum('revenue'),
                quantity=Sum('quantity')
            ).order_by('date')),
            'start_date': start_date,
            'end_date': end_date,
        }

        return Response(stats_data)
    
    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def bulk_create(self, request):
        """Массовое создание записей (для демо)"""
        data = request.data
        if isinstance(data, list):
            created = []
            for item in data:
                serializer = self.get_serializer(data=item)
                if serializer.is_valid():
                    serializer.save(created_by=request.user)
                    created.append(serializer.data)
            return Response(created, status=status.HTTP_201_CREATED)
        return Response({'error': 'Expected list of items'}, status=status.HTTP_400_BAD_REQUEST)