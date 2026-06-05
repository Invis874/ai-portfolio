from django.db import models
from django.contrib.auth.models import User

class SalesData(models.Model):
    """Данные о продажах для таблицы и дашборда"""
    CATEGORY_CHOICES = [
        ('pizza', '🍕 Пицца'),
        ('rolls', '🍣 Роллы'),
        ('salads', '🥗 Салаты'),
        ('drinks', '🥤 Напитки'),
    ]
    
    product_name = models.CharField(max_length=200, verbose_name="Название продукта")
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, verbose_name="Категория")
    quantity = models.IntegerField(verbose_name="Количество продаж")
    revenue = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Выручка")
    date = models.DateField(verbose_name="Дата")
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, verbose_name="Кто создал")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Создано")
    
    class Meta:
        verbose_name = "Продажа"
        verbose_name_plural = "Продажи"
        ordering = ['-date', '-created_at']
    
    def __str__(self):
        return f"{self.product_name} - {self.quantity} шт. - {self.revenue} руб."