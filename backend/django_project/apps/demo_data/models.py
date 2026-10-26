from django.db import models
from django.contrib.auth.models import User

class Order(models.Model):
    """Заказ — объединяет несколько позиций"""
    STATUS_CHOICES = [
        ('pending', '⏳ Ожидает подтверждения'),
        ('confirmed', '✅ Подтверждён'),
        ('cancelled', '❌ Отменён'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='orders', verbose_name="Клиент")
    session_key = models.CharField(max_length=100, blank=True, null=True, verbose_name="Сессия гостя")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', verbose_name="Статус")
    total_price = models.DecimalField(max_digits=10, decimal_places=2, default=0, verbose_name="Итого")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Создан")
    
    class Meta:
        verbose_name = "Заказ"
        verbose_name_plural = "Заказы"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Заказ #{self.id} — {self.get_status_display()} — {self.total_price}₽"
    
    def recalculate_total(self):
        total = sum(item.revenue for item in self.items.all())
        self.total_price = total
        self.save(update_fields=['total_price'])


class SalesData(models.Model):
    """Позиция заказа (или просто продажа)"""
    CATEGORY_CHOICES = [
        ('pizza', '🍕 Пицца'),
        ('rolls', '🍣 Роллы'),
        ('salads', '🥗 Салаты'),
        ('drinks', '🥤 Напитки'),
    ]
    
    order = models.ForeignKey(
        Order, 
        on_delete=models.CASCADE, 
        null=True, blank=True, 
        related_name='items', 
        verbose_name="Заказ"
    )
    
    product_name = models.CharField(max_length=200, verbose_name="Название продукта")
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, verbose_name="Категория")
    quantity = models.IntegerField(verbose_name="Количество")
    revenue = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Выручка")
    date = models.DateField(verbose_name="Дата")
    
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_sales', verbose_name="Кто создал")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Создано")
    
    class Meta:
        verbose_name = "Позиция заказа / Продажа"
        verbose_name_plural = "Позиции заказов / Продажи"
        ordering = ['-date', '-created_at']
    
    def __str__(self):
        return f"{self.product_name} x{self.quantity} = {self.revenue}₽"