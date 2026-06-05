from rest_framework import serializers
from .models import SalesData

class SalesDataSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    
    class Meta:
        model = SalesData
        fields = ['id', 'product_name', 'category', 'quantity', 'revenue', 
                  'date', 'created_by', 'created_by_name', 'created_at']
        read_only_fields = ['id', 'date', 'created_at', 'created_by']

class ChartConfigSerializer(serializers.Serializer):
    """Для сохранения настроек графиков (будем хранить в сессии/кеше)"""
    chart_type = serializers.ChoiceField(choices=['bar', 'line', 'pie'], default='bar')
    color = serializers.CharField(default='#8884d8')
    show_legend = serializers.BooleanField(default=True)