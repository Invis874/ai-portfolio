from rest_framework import serializers
from .models import Supplier, SupplierCategory, SupplierReview

class SupplierCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = SupplierCategory
        fields = ['id', 'name', 'icon']

class SupplierReviewSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = SupplierReview
        fields = ['id', 'supplier', 'user', 'username', 'rating', 'comment', 'created_at']
        read_only_fields = ['id', 'user', 'username', 'created_at']

class SupplierListSerializer(serializers.ModelSerializer):
    """Для списка поставщиков (краткая информация)"""
    categories = SupplierCategorySerializer(many=True, read_only=True)
    category_ids = serializers.PrimaryKeyRelatedField(
        queryset=SupplierCategory.objects.all(),
        many=True,
        write_only=True,
        source='categories'
    )
    rating_stars = serializers.SerializerMethodField()
    reviews_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Supplier
        fields = [
            'id', 'name', 'categories', 'category_ids', 'city', 'region',
            'phone', 'email', 'website', 'min_order_amount', 'min_order_quantity',
            'rating', 'rating_stars', 'reviews_count', 'has_certificates',
            'created_at'
        ]
        read_only_fields = ['id', 'rating', 'created_at']
    
    def get_rating_stars(self, obj):
        """Возвращает звёзды для отображения"""
        full_stars = int(obj.rating)
        half_star = obj.rating - full_stars >= 0.5
        empty_stars = 5 - full_stars - (1 if half_star else 0)
        return {
            'full': full_stars,
            'half': half_star,
            'empty': empty_stars,
            'text': f"{obj.rating:.1f}" if obj.rating > 0 else "Нет оценок"
        }
    
    def get_reviews_count(self, obj):
        return obj.reviews.count()

class SupplierDetailSerializer(serializers.ModelSerializer):
    """Для детальной страницы поставщика (полная информация)"""
    categories = SupplierCategorySerializer(many=True, read_only=True)
    category_ids = serializers.PrimaryKeyRelatedField(
        queryset=SupplierCategory.objects.all(),
        many=True,
        write_only=True,
        source='categories'
    )
    reviews = SupplierReviewSerializer(many=True, read_only=True)
    rating_stars = serializers.SerializerMethodField()
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    
    class Meta:
        model = Supplier
        fields = '__all__'
        read_only_fields = ['id', 'rating', 'created_at', 'created_by', 'reviews_count']
    
    def get_rating_stars(self, obj):
        full_stars = int(obj.rating)
        half_star = obj.rating - full_stars >= 0.5
        empty_stars = 5 - full_stars - (1 if half_star else 0)
        return {
            'full': full_stars,
            'half': half_star,
            'empty': empty_stars,
            'text': f"{obj.rating:.1f}" if obj.rating > 0 else "Нет оценок"
        }
    
    def get_reviews_count(self, obj):
        return obj.reviews.count()

class SupplierCompareSerializer(serializers.ModelSerializer):
    """Для сравнения поставщиков"""
    categories = serializers.StringRelatedField(many=True)
    rating_stars = serializers.SerializerMethodField()
    
    class Meta:
        model = Supplier
        fields = [
            'id', 'name', 'categories', 'city', 'region',
            'min_order_amount', 'min_order_quantity', 'delivery_terms',
            'has_certificates', 'rating', 'rating_stars', 'phone', 'email', 'website'
        ]
    
    def get_rating_stars(self, obj):
        return f"{obj.rating:.1f} ★" if obj.rating > 0 else "Нет оценок"

class SupplierReviewCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = SupplierReview
        fields = ['rating', 'comment']
    
    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError("Оценка должна быть от 1 до 5")
        return value