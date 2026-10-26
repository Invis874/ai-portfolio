from rest_framework import serializers
from django.utils import timezone
from .models import SalesData, Order

class SalesDataSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    
    class Meta:
        model = SalesData
        fields = ['id', 'product_name', 'category', 'quantity', 'revenue', 
                  'date', 'created_by', 'created_by_name', 'created_at']
        read_only_fields = ['id', 'created_at', 'created_by']

    def validate_date(self, value):
        if value > timezone.localdate():
            raise serializers.ValidationError("Дата продажи не может быть в будущем.")
        return value

    def validate_revenue(self, value):
        if value < 0:
            raise serializers.ValidationError("Выручка не может быть отрицательной.")
        return value

    def validate_quantity(self, value):
        if value < 0:
            raise serializers.ValidationError("Количество не может быть отрицательным.")
        return value

class OrderSerializer(serializers.ModelSerializer):
    items = SalesDataSerializer(many=True, read_only=True)
    
    class Meta:
        model = Order
        fields = ['id', 'status', 'total_price', 'created_at', 'items', 'session_key', 'user']

class ChartConfigSerializer(serializers.Serializer):
    """Для сохранения настроек графиков (будем хранить в сессии/кеше)"""
    chart_type = serializers.ChoiceField(choices=['bar', 'line', 'pie'], default='bar')
    color = serializers.CharField(default='#8884d8')
    show_legend = serializers.BooleanField(default=True)