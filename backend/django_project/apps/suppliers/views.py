from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated, AllowAny
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.db.models import Q, Avg, Count
from .models import Supplier, SupplierCategory, SupplierReview
from .serializers import (
    SupplierListSerializer, SupplierDetailSerializer, 
    SupplierCompareSerializer, SupplierCategorySerializer,
    SupplierReviewSerializer, SupplierReviewCreateSerializer
)

class SupplierCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """Просмотр категорий поставщиков"""
    queryset = SupplierCategory.objects.all()
    serializer_class = SupplierCategorySerializer
    permission_classes = [AllowAny]

class SupplierViewSet(viewsets.ModelViewSet):
    """API для работы с поставщиками"""
    queryset = Supplier.objects.all()
    serializer_class = SupplierListSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return SupplierDetailSerializer
        if self.action == 'compare':
            return SupplierCompareSerializer
        return SupplierListSerializer
    
    def get_queryset(self):
        queryset = Supplier.objects.all()
        
        # Фильтрация по категориям
        categories = self.request.query_params.getlist('categories')
        if categories:
            # Преобразуем строки в числа
            cat_ids = [int(c) for c in categories if c.isdigit()]
            if cat_ids:
                queryset = queryset.filter(categories__id__in=cat_ids).distinct()
        
        # Фильтрация по городу
        city = self.request.query_params.get('city')
        if city:
            queryset = queryset.filter(city__icontains=city)
        
        # Фильтрация по региону
        region = self.request.query_params.get('region')
        if region:
            queryset = queryset.filter(region__icontains=region)
        
        # Фильтрация по минимальной сумме заказа
        min_amount = self.request.query_params.get('min_amount')
        if min_amount:
            queryset = queryset.filter(
                Q(min_order_amount__lte=min_amount) | Q(min_order_amount__isnull=True)
            )
        
        # Фильтрация по наличию сертификатов
        has_certificates = self.request.query_params.get('has_certificates')
        if has_certificates == 'true':
            queryset = queryset.filter(has_certificates=True)
        
        # Фильтрация по минимальному рейтингу
        min_rating = self.request.query_params.get('min_rating')
        if min_rating:
            queryset = queryset.filter(rating__gte=float(min_rating))
        
        # Поиск по названию
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(name__icontains=search)
        
        # Сортировка
        ordering = self.request.query_params.get('ordering', '-rating')
        if ordering in ['name', 'rating', '-name', '-rating', 'city', '-city']:
            queryset = queryset.order_by(ordering)
        
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    def perform_update(self, serializer):
        serializer.save()
    
    @action(detail=False, methods=['get'])
    def compare(self, request):
        """Сравнение нескольких поставщиков"""
        supplier_ids = request.query_params.getlist('ids')
        if not supplier_ids:
            return Response({'error': 'Не указаны ID поставщиков'}, status=status.HTTP_400_BAD_REQUEST)
        
        suppliers = Supplier.objects.filter(id__in=supplier_ids)
        if len(suppliers) != len(supplier_ids):
            return Response({'error': 'Некоторые поставщики не найдены'}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = self.get_serializer(suppliers, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def filters_info(self, request):
        """Информация для фильтров (города, регионы)"""
        cities = Supplier.objects.exclude(city='').values_list('city', flat=True).distinct()
        regions = Supplier.objects.exclude(region='').values_list('region', flat=True).distinct()
        
        return Response({
            'cities': sorted(list(cities)),
            'regions': sorted(list(regions))
        })

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def auto_collect(self, request):
        import traceback
        """Автоматический сбор данных о поставщиках из внешних API"""
        if not (request.user.is_authenticated and hasattr(request.user, 'profile') and 
                request.user.profile.role in ['operator', 'admin']):
            return Response({'error': 'Доступ только для операторов'}, status=status.HTTP_403_FORBIDDEN)

        print("=== AUTO_COLLECT START ===")
        print("User:", request.user)
        print("Data:", request.data)
        
        query = request.data.get('query')
        city = request.data.get('city')
        
        if not query or not city:
            return Response({'error': 'Укажите query (что ищем) и city (город)'}, 
                           status=status.HTTP_400_BAD_REQUEST)
        
        try:
            from .services.collector import SupplierCollector
            collector = SupplierCollector()
            
            print("Calling auto_collect...")
            # Сбор данных
            suppliers_data = collector.auto_collect(query, city)
            print(f"Found: {len(suppliers_data)}")
        
            print("Calling save_to_database...")
            # Сохранение в БД
            saved = collector.save_to_database(suppliers_data, request.user)
            print(f"Saved: {saved}")
            return Response({
                'found': len(suppliers_data),
                'saved': saved,
                'suppliers': suppliers_data[:10]  # Показываем первые 10
            })
        except ImportError as e:
            return Response({'error': f'Модуль сбора данных не найден: {str(e)}'}, 
                           status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            traceback.print_exc()
            return Response({'error': f'Ошибка при сборе данных: {str(e)}'}, 
                           status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def collect_by_filters(self, request):
        """Сбор поставщиков на основе фильтров"""
        if not (request.user.is_authenticated and request.user.profile.role in ['operator', 'admin']):
            return Response({'error': 'Доступ только для операторов'}, status=403)
        
        city = request.data.get('city')
        category = request.data.get('category')
        
        if not city:
            return Response({'error': 'Укажите город'}, status=400)
        
        collector = SupplierCollector()
        suppliers = collector.auto_collect_by_filters(city, category)
        
        saved = collector.save_to_database(suppliers, request.user)
        
        return Response({
            'found': len(suppliers),
            'saved': saved,
            'suppliers': suppliers[:10]
        })

class SupplierReviewViewSet(viewsets.ModelViewSet):
    """API для отзывов"""
    serializer_class = SupplierReviewSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        supplier_id = self.request.query_params.get('supplier_id')
        if supplier_id:
            return SupplierReview.objects.filter(supplier_id=supplier_id)
        return SupplierReview.objects.all()
    
    def create(self, request, *args, **kwargs):
        serializer = SupplierReviewCreateSerializer(data=request.data)
        if serializer.is_valid():
            supplier_id = request.data.get('supplier_id')
            if not supplier_id:
                return Response({'error': 'supplier_id required'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Проверяем, не оставлял ли пользователь уже отзыв
            existing_review = SupplierReview.objects.filter(
                supplier_id=supplier_id, 
                user=request.user
            ).first()
            
            if existing_review:
                # Обновляем существующий отзыв
                existing_review.rating = serializer.validated_data['rating']
                existing_review.comment = serializer.validated_data['comment']
                existing_review.save()
                return Response(SupplierReviewSerializer(existing_review).data)
            
            # Создаём новый отзыв
            review = SupplierReview.objects.create(
                supplier_id=supplier_id,
                user=request.user,
                rating=serializer.validated_data['rating'],
                comment=serializer.validated_data['comment']
            )
            return Response(SupplierReviewSerializer(review).data, status=status.HTTP_201_CREATED)
        
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)