from django.contrib import admin
from .models import SalesData, Order

@admin.register(SalesData)
class SalesDataAdmin(admin.ModelAdmin):
    list_display = ['product_name', 'category', 'quantity', 'revenue', 'date', 'created_by']
    list_filter = ['category', 'date']
    search_fields = ['product_name']

class SalesDataInline(admin.TabularInline):
    model = SalesData
    extra = 1
    fields = ['product_name', 'category', 'quantity', 'revenue', 'date']
    
@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'status', 'total_price', 'created_at', 'session_key', 'user']
    list_filter = ['status']
    inlines = [SalesDataInline]
    actions = ['confirm_orders']
    
    def confirm_orders(self, request, queryset):
        queryset.update(status='confirmed')
    confirm_orders.short_description = "Подтвердить выбранные заказы"