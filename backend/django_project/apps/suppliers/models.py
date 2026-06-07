from django.db import models
from django.contrib.auth.models import User

class SupplierCategory(models.Model):
    """Категория товаров поставщика"""
    name = models.CharField(max_length=100, verbose_name="Название")
    icon = models.CharField(max_length=50, blank=True, verbose_name="Иконка")
    
    class Meta:
        verbose_name = "Категория"
        verbose_name_plural = "Категории"
        ordering = ['name']
    
    def __str__(self):
        return self.name

class Supplier(models.Model):
    """Модель поставщика"""
    
    # Основная информация
    name = models.CharField(max_length=200, verbose_name="Название компании")
    categories = models.ManyToManyField(SupplierCategory, verbose_name="Категории товаров")
    
    # Контакты и локация
    city = models.CharField(max_length=100, verbose_name="Город")
    region = models.CharField(max_length=100, verbose_name="Регион")
    address = models.TextField(blank=True, null=True, verbose_name="Адрес")
    phone = models.CharField(max_length=50, blank=True, null=True, verbose_name="Телефон")
    email = models.EmailField(verbose_name="Email")
    website = models.URLField(blank=True, verbose_name="Сайт")
    
    # Дополнительная информация
    min_order_amount = models.IntegerField(
        null=True, blank=True, 
        verbose_name="Минимальная сумма заказа (₽)",
        help_text="Минимальная сумма в рублях"
    )
    min_order_quantity = models.IntegerField(
        null=True, blank=True, 
        verbose_name="Минимальный объём (кг/шт)",
        help_text="Минимальное количество в кг или штуках"
    )
    price_info = models.TextField(
        blank=True, 
        verbose_name="Информация о ценах",
        help_text="Примерные цены или прайс-лист"
    )
    delivery_terms = models.TextField(
        blank=True, 
        verbose_name="Условия доставки",
        help_text="Самовывоз, доставка по городу/региону, стоимость"
    )
    has_certificates = models.BooleanField(
        default=False, 
        verbose_name="Наличие сертификатов",
        help_text="Есть ли сертификаты качества, декларации"
    )
    
    # Рейтинг и заметки
    rating = models.FloatField(
        default=0.0, 
        verbose_name="Средний рейтинг",
        help_text="Рассчитывается автоматически из отзывов"
    )
    notes = models.TextField(
        blank=True, 
        verbose_name="Заметки",
        help_text="Внутренние заметки о поставщике"
    )
    
    # Системные поля
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")
    created_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        verbose_name="Кто добавил"
    )
    
    class Meta:
        verbose_name = "Поставщик"
        verbose_name_plural = "Поставщики"
        ordering = ['-rating', 'name']
    
    def __str__(self):
        return self.name
    
    def update_rating(self):
        """Обновление среднего рейтинга"""
        reviews = self.reviews.all()
        if reviews.exists():
            avg = reviews.aggregate(models.Avg('rating'))['rating__avg']
            self.rating = round(avg, 1)
        else:
            self.rating = 0.0
        self.save(update_fields=['rating'])

class SupplierReview(models.Model):
    """Отзывы о поставщике"""
    supplier = models.ForeignKey(
        Supplier, 
        on_delete=models.CASCADE, 
        related_name='reviews',
        verbose_name="Поставщик"
    )
    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        verbose_name="Автор"
    )
    rating = models.IntegerField(
        choices=[(i, f"{i} ★") for i in range(1, 6)], 
        verbose_name="Оценка"
    )
    comment = models.TextField(verbose_name="Комментарий")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата")
    
    class Meta:
        verbose_name = "Отзыв"
        verbose_name_plural = "Отзывы"
        ordering = ['-created_at']
        unique_together = ['supplier', 'user']  # Один отзыв от пользователя на поставщика
    
    def __str__(self):
        return f"{self.supplier.name} - {self.rating}★ от {self.user.username}"
    
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        self.supplier.update_rating()