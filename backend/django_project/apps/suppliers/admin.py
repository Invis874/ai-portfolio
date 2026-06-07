from django.contrib import admin
from .models import SupplierCategory, Supplier, SupplierReview

@admin.register(SupplierCategory)
class SupplierCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'icon']
    search_fields = ['name']

@admin.register(Supplier)
class SupplierAdmin(admin.ModelAdmin):
    list_display = ['name', 'city', 'rating', 'has_certificates', 'created_at']
    list_filter = ['categories', 'city', 'has_certificates']
    search_fields = ['name', 'city', 'phone', 'email']
    filter_horizontal = ['categories']
    readonly_fields = ['rating', 'created_at']

@admin.register(SupplierReview)
class SupplierReviewAdmin(admin.ModelAdmin):
    list_display = ['supplier', 'user', 'rating', 'created_at']
    list_filter = ['rating', 'created_at']
    search_fields = ['supplier__name', 'user__username', 'comment']