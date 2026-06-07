from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SupplierCategoryViewSet, SupplierViewSet, SupplierReviewViewSet

router = DefaultRouter()
router.register(r'categories', SupplierCategoryViewSet, basename='supplier-categories')
router.register(r'suppliers', SupplierViewSet, basename='suppliers')
router.register(r'reviews', SupplierReviewViewSet, basename='supplier-reviews')

urlpatterns = [
    path('', include(router.urls)),
]