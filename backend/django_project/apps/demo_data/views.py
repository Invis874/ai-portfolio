from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.db.models import Sum, Count, Q
from datetime import datetime, timedelta
from .models import SalesData
from .serializers import SalesDataSerializer, ChartConfigSerializer

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
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Статистика для дашборда"""
        # Параметры фильтрации
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        category = request.query_params.get('category')
        
       
        queryset = self.queryset
        # Фильтр по датам
        if start_date:
            queryset = queryset.filter(date__gte=start_date)
        if end_date:
            queryset = queryset.filter(date__lte=end_date)
        if category:
            queryset = queryset.filter(category=category)
        
        # Агрегации
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
            'end_date': end_date
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